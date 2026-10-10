import { useState, useEffect, useRef, Fragment } from 'react'
import './App.css'
import wallImg from './assets/dry-stone-wall.png';
import sheepImg from './assets/sheep.png';
import boarImg from './assets/wild-boar.png';

const OBSTACLE_TYPES = {
    'dry-stone-wall': { width: 105, height: 68, image: wallImg, hitboxWidth: 75, hitboxHeight: 49, offsetX: 14, offsetY: 9 },
    'sheep': { width: 68, height: 62, image: sheepImg, hitboxWidth: 42, hitboxHeight: 34, offsetX: 16, offsetY: 15 },
    'wild-boar': { width: 97, height: 66, image: boarImg, hitboxWidth: 57, hitboxHeight: 38, offsetX: 20, offsetY: 15 },
};

const BRINCADORE_HITBOX = { offsetX: 21, offsetY: 20, width: 28, height: 65 };
const DEBUG_HITBOX = false;

function checkCollision(Rectangle1, Rectangle2) {
    return (
        Rectangle1.x < Rectangle2.x + Rectangle2.width &&
        Rectangle1.x + Rectangle1.width > Rectangle2.x &&
        Rectangle1.y < Rectangle2.y + Rectangle2.height &&
        Rectangle1.y + Rectangle1.height > Rectangle2.y
    );
}

function App() {
    const initialGroundOffset = 5;
    const groundOffsetRef = useRef(initialGroundOffset);
    const statusRef = useRef("idle");
    const nextObstacleId = useRef(0); // change this to useRef to persist the value across renders
    const [gameState, setGameState] = useState({
        groundOffset: initialGroundOffset,
        velocity: 0,
        score: 0,
        obstacles: [],
        frameCount: 0,
        lastSpawnFrame: 0,
        spawnThreshold: 100, // frames between spawns   
        status: "idle" 
    });



    function keyDownHandler(e) {

        if (e.key === "Enter" && statusRef.current === "gameOver") {
            e.preventDefault();
            restartGame();
        }

        if (e.key === "Enter" && statusRef.current === "idle") {
            e.preventDefault();
            setGameState(prevState => ({ ...prevState, status: "running" }));
        }

        if ((e.key === " " || e.key === "ArrowUp") && groundOffsetRef.current === initialGroundOffset && statusRef.current === "running") {
            e.preventDefault();
            setGameState(prevState => ({ ...prevState, velocity: 18 }));

        }


    }

    function touchHandler() {

        if (statusRef.current === "gameOver") {
            restartGame();
        } else if (statusRef.current === "idle") {
            setGameState(prevState => ({ ...prevState, status: "running" }));
        } else if (groundOffsetRef.current === initialGroundOffset && statusRef.current === "running") {
            setGameState(prevState => ({ ...prevState, velocity: 18 }));
        }

    }

    useEffect(() => {
        groundOffsetRef.current = gameState.groundOffset;
        statusRef.current = gameState.status;

    }, [gameState]);

    useEffect(() => {
        document.addEventListener("keydown", keyDownHandler);
        document.addEventListener("touchstart", touchHandler);

        return () => {
            document.removeEventListener("keydown", keyDownHandler);
            document.removeEventListener("touchstart", touchHandler);
        };
    }, []);



    function restartGame() {

        setGameState({
            groundOffset: initialGroundOffset,
            velocity: 0,
            score: 0,
            obstacles: [],
            frameCount: 0,
            lastSpawnFrame: 0,
            spawnThreshold: 100, // frames between spawns
            status: "running"
        });
        nextObstacleId.current = 0; // reset the obstacle ID counter
    }

    useEffect(() => {
        const gravity = 1;      // how much the velocity decreases each tick
        const groundLevel = initialGroundOffset;

        const intervalId = setInterval(() => {
            setGameState(prev => {
                if (prev.status !== "running") {
                    return prev; // Update only while actually running
                }

                let velocity = prev.velocity - gravity;
                let groundOffset = prev.groundOffset + velocity;
                let frameCount = prev.frameCount + 1;
                let lastSpawnFrame = prev.lastSpawnFrame;
                let spawnThreshold = prev.spawnThreshold;
                let score = prev.score + 1; // Increment score every tick

                let obstacles = prev.obstacles.map(obstacle => ({ ...obstacle, x: obstacle.x - 5 }));
                obstacles = obstacles.filter(obstacle => obstacle.x > -50);

                let brincadoreRectangle = { x: 50 + BRINCADORE_HITBOX.offsetX, y: groundOffset + BRINCADORE_HITBOX.offsetY, width: BRINCADORE_HITBOX.width, height: BRINCADORE_HITBOX.height }; // Brincadore

                const collisionDetected = obstacles.some(obstacle => {
                    const { hitboxWidth, hitboxHeight, offsetX, offsetY } = OBSTACLE_TYPES[obstacle.type];
                    // Offsets are explicit, not centered: they follow where the body mass really is
                    let obstacleRectangle = { x: obstacle.x + offsetX, y: groundLevel + offsetY, width: hitboxWidth, height: hitboxHeight };
                    const hit = checkCollision(brincadoreRectangle, obstacleRectangle);
                    if (hit) {
                        console.log('COLLISION type:', obstacle.type);
                        console.log('brincadore rect:', brincadoreRectangle);
                        console.log('obstacle rect:', obstacleRectangle);
                    }
                    return hit;
                });

                if (collisionDetected) {
                    return { ...prev, groundOffset, obstacles, status: "gameOver" };
                }


                if (groundOffset < groundLevel) {
                    groundOffset = groundLevel;
                    velocity = 0;
                }

                if (frameCount - prev.lastSpawnFrame >= spawnThreshold) {
                    nextObstacleId.current += 1;
                    let nextObstacleType = Math.floor(Math.random() * Object.keys(OBSTACLE_TYPES).length);
                    nextObstacleType = Object.keys(OBSTACLE_TYPES)[nextObstacleType];
                    obstacles.push({ id: nextObstacleId.current, x: 800, type: nextObstacleType });
                    lastSpawnFrame = frameCount;
                    spawnThreshold = Math.floor(Math.random() * (150 - 80)) + 80; // random threshold between 80 and 150 frames
                }

                return { ...prev, groundOffset, velocity, frameCount, obstacles, lastSpawnFrame, spawnThreshold, score };
            });
        }, 20); // every 20ms

        return () => clearInterval(intervalId);
    }, []);





    return (
        <div id="game-area">
            <div id="brincadore" style={{ bottom: `${gameState.groundOffset}px`, backgroundPositionX: `${-72 * (Math.floor(gameState.frameCount / 5) % 4)}px` }}>
            </div>
            {DEBUG_HITBOX && (
                <div id="brincadore-hitbox" style={{ position: 'absolute', bottom: `${gameState.groundOffset + BRINCADORE_HITBOX.offsetY}px`, left: `${50 + BRINCADORE_HITBOX.offsetX}px`, width: `${BRINCADORE_HITBOX.width}px`, height: `${BRINCADORE_HITBOX.height}px`, border: "1px solid red", pointerEvents: "none", zIndex: 3 }} />
            )}

            {gameState.status === "running" && gameState.score > 0 && (
                <div id="score">
                    PUNTOS: {gameState.score}
                </div>
            )}
            {gameState.obstacles.map(obstacle => {
                    const { width, height, image, hitboxWidth, hitboxHeight, offsetX, offsetY } = OBSTACLE_TYPES[obstacle.type];
                    return (
                        <Fragment key={obstacle.id}>
                            <div className={`obstacle ${obstacle.type}`} style={{
                                backgroundImage: `url(${image})`,
                                left: `${obstacle.x}px`,
                                width: `${width}px`,
                                height: `${height}px`
                            }} />
                            {DEBUG_HITBOX && (
                                <div style={{
                                    position: 'absolute',
                                    border: '1px solid red',
                                    left: `${obstacle.x + offsetX}px`,       // same offsets used in the collision check
                                    bottom: `${initialGroundOffset + offsetY}px`,
                                    width: `${hitboxWidth}px`,
                                    height: `${hitboxHeight}px`,
                                    pointerEvents: 'none'
                                }} />
                            )}
                        </Fragment>
                    );
             })}
           

            {gameState.status === "gameOver" && (
                <div id="game-over">
                    <h1>Finiu cun {gameState.score} puntos</h1>
                    <h2>Ses ruttu!</h2>
                    <button onClick={() => restartGame()}>Incumintza de nou</button>
                </div>
            )}
        </div>
    )
}

export default App