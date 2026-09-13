import { useState, useEffect, useRef } from 'react'
import './App.css'

function App() {
    const initialGroundOffset = 5;
    const groundOffsetRef = useRef(initialGroundOffset);
    const nextObstacleId = useRef(0); // change this to useRef to persist the value across renders
    const [gameState, setGameState] = useState({
        groundOffset: initialGroundOffset,
        velocity: 0,
        score: 0,
        obstacles: [],
        frameCount: 0,
        lastSpawnFrame: 0,
        spawnThreshold: 100, // frames between spawns    
    });

    function keyDownHandler(e) {

        if ((e.key === "Enter" || e.key === " " || e.key === "ArrowUp") && groundOffsetRef.current === initialGroundOffset) {
            e.preventDefault();
            setGameState(prevState => ({ ...prevState, velocity: 18 }));

        }
    }

    useEffect(() => {
        groundOffsetRef.current = gameState.groundOffset;
    }, [gameState]);

    useEffect(() => {
        document.addEventListener("keydown", keyDownHandler);

        return () => {
            document.removeEventListener("keydown", keyDownHandler);
        };
    }, []);

    useEffect(() => {
        const gravity = 1;      // how much the velocity decreases each tick
        const groundLevel = initialGroundOffset;

        const intervalId = setInterval(() => {
            setGameState(prev => {

                let velocity = prev.velocity - gravity;
                let groundOffset = prev.groundOffset + velocity;
                let frameCount = prev.frameCount + 1;
                let lastSpawnFrame = prev.lastSpawnFrame;
                let spawnThreshold = prev.spawnThreshold;

                let obstacles = prev.obstacles.map(obstacle => ({ ...obstacle, x: obstacle.x - 5 }));
                obstacles = obstacles.filter(obstacle => obstacle.x > -50);

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
        </div>
    )
}

export default App