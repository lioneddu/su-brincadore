import { useState, useEffect, useRef } from 'react'
import './App.css'

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
            console.log("Game over");
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

    function checkCollision(Rectangle1, Rectangle2) {
        return (
            Rectangle1.x < Rectangle2.x + Rectangle2.width &&
            Rectangle1.x + Rectangle1.width > Rectangle2.x &&
            Rectangle1.y < Rectangle2.y + Rectangle2.height &&
            Rectangle1.y + Rectangle1.height > Rectangle2.y
        );
    }

    function restartGame() {

        setGameState({
            groundOffset: initialGroundOffset,
            velocity: 0,
            score: 0,
            obstacles: [],
            frameCount: 0,
            lastSpawnFrame: 0,
            spawnThreshold: 100, // frames between spawns
            status: "idle"
        });
        nextObstacleId.current = 0; // reset the obstacle ID counter
    }

    useEffect(() => {
        const gravity = 1;      // how much the velocity decreases each tick
        const groundLevel = initialGroundOffset;

        const intervalId = setInterval(() => {
            setGameState(prev => {
                if (prev.status === "gameOver") {
                    return prev; // Stop updating if game is over
                }   

                let velocity = prev.velocity - gravity;
                let groundOffset = prev.groundOffset + velocity;
                let frameCount = prev.frameCount + 1;
                let lastSpawnFrame = prev.lastSpawnFrame;
                let spawnThreshold = prev.spawnThreshold;

                let obstacles = prev.obstacles.map(obstacle => ({ ...obstacle, x: obstacle.x - 5 }));
                obstacles = obstacles.filter(obstacle => obstacle.x > -50);

                let brincadoreRectangle = { x: 50, y: groundOffset, width:  60, height:  60 }; // Brincadore

                const collisionDetected = obstacles.some(obstacle => {
                    let obstacleRectangle = { x: obstacle.x, y: groundLevel, width: 50, height: 70 };
                    return checkCollision(brincadoreRectangle, obstacleRectangle);
                });

                if (collisionDetected) {
                    return { ...prev, status: "gameOver" }; // Collision detected
                }


                if (groundOffset < groundLevel) {
                    groundOffset = groundLevel;
                    velocity = 0;
                }

                if (frameCount - prev.lastSpawnFrame >= spawnThreshold) {
                    nextObstacleId.current += 1;
                    obstacles.push({ id: nextObstacleId.current, x: 800, type: 'dry-stone-wall' });
                    lastSpawnFrame = frameCount;
                    spawnThreshold = Math.floor(Math.random() * (150 - 80)) + 80; // random threshold between 80 and 150 frames
                }

                return { ...prev, groundOffset, velocity, frameCount, obstacles, lastSpawnFrame, spawnThreshold };
            });
        }, 20); // every 20ms

        return () => clearInterval(intervalId);
    }, []);





    return (
        <div id="game-area">
            <div id="brincadore" style={{ bottom: `${gameState.groundOffset}px` }}>
            </div>
            {gameState.obstacles.map(obstacle => (
                <div
                    key={obstacle.id}
                    className={`obstacle ${obstacle.type}`}
                    style={{ left: `${obstacle.x}px` }}
                />
            ))}

            {gameState.status === "gameOver" && (
                <div id="game-over">
                    <h1>Finiu</h1>
                    <h2>Ses ruttu!</h2>
                    <button onClick={() => restartGame()}>Restart</button>
                </div>
            )}
        </div>
    )
}

export default App