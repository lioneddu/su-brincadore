import { useState, useEffect, useRef } from 'react'
import './App.css'

function App() {
    const initialGroundOffset = 5;
    const groundOffsetRef = useRef(initialGroundOffset);
    const [score, setScore] = useState(0);
    const [groundOffset, setGroundOffset] = useState(initialGroundOffset);
    const [velocity, setVelocity] = useState(0);

    function keyDownHandler(e) {
        console.log("KeyDown");
        if ((e.key === "Enter" || e.key === " ") && groundOffsetRef.current === initialGroundOffset) {
            e.preventDefault();
            setVelocity(10);
            console.log("Enter or space");
        }
    }

    useEffect(() => {
        groundOffsetRef.current = groundOffset;
    }, [groundOffset]);

    useEffect(() => {
        document.addEventListener("keydown", keyDownHandler);

        return () => {
            document.removeEventListener("keydown", keyDownHandler);
        };
    }, []);

    return (
        <div id="game-area">
            <div id="brincadore" style={{ bottom: `${groundOffset}px` }}>
            </div>
        </div>
    )
}

export default App