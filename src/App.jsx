import { useState, useEffect, useRef } from 'react'
import './App.css'

function App() {
    const initialGroundOffset = 5;
    const groundOffsetRef = useRef(initialGroundOffset);
    const [gameState, setGameState] = useState({
        groundOffset: initialGroundOffset,
        velocity: 0,
        score: 0
    });

    function keyDownHandler(e) {
        console.log("KeyDown");
        if ((e.key === "Enter" || e.key === " " || e.key === "ArrowUp") && groundOffsetRef.current === initialGroundOffset) {
            e.preventDefault();
            setGameState(prevState => ({ ...prevState, velocity: 18 }));
            console.log("Enter or space");
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
                // 1. calculate the new velocity by subtracting gravity from the previous velocity
                let velocity = prev.velocity - gravity;
                // 2. calculate the new groundOffset by adding the updated velocity
                let groundOffset = prev.groundOffset + velocity;
                // 3. if the new groundOffset is below groundLevel, "clamp" it to groundLevel and reset velocity
                if (groundOffset < groundLevel) {
                    groundOffset = groundLevel;
                    velocity = 0;
                }
                // 4. return the new state object with spread operator + the updated properties
                return { ...prev, groundOffset, velocity };
            });
        }, 20); // every 20ms

        return () => clearInterval(intervalId);
    }, []);

    return (
        <div id="game-area">
            <div id="brincadore" style={{ bottom: `${gameState.groundOffset}px` }}>
            </div>
        </div>
    )
}

export default App