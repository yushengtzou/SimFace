import React, { useState, useCallback, useRef } from 'react';
import Navbar from './Navbar';
import ThreeCanvas from './ThreeCanvas';
import Panel from './Panel';

const App: React.FC = () => {
    const [deformDistance, setDeformDistance] = useState(10);
    const [targetRotation, setTargetRotation] = useState(0);
    const currentRotation = useRef(0);

    const handleSliderChange = useCallback((value: number) => {
        setDeformDistance(value);
    }, []);

    const handleRotateFront = useCallback(() => {
        setTargetRotation(0);
    }, []);

    const handleRotateLeft = useCallback(() => {
        setTargetRotation(-Math.PI / 2); // -90 degrees in radians
    }, []);

    const handleRotateRight = useCallback(() => {
        setTargetRotation(Math.PI / 2); // 90 degrees in radians
    }, []);

    return (
        <div className="h-full flex flex-col">
            <Navbar />
            <ThreeCanvas 
                deformDistance={deformDistance} 
                targetRotation={targetRotation}
                currentRotation={currentRotation}
            />
            <Panel 
                value={deformDistance} 
                onChange={handleSliderChange}
                onRotateFront={handleRotateFront}
                onRotateLeft={handleRotateLeft}
                onRotateRight={handleRotateRight}
            />
        </div>
    );
};

export default App;

