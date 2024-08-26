import React, { useState, useCallback, useRef } from 'react';
import Navbar from './Navbar';
import ThreeCanvas from './ThreeCanvas';

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
            <Navbar 
                onRotateFront={handleRotateFront}
                onRotateLeft={handleRotateLeft}
                onRotateRight={handleRotateRight}
                targetRotation={targetRotation}
            />
            <ThreeCanvas 
                deformDistance={deformDistance} 
                targetRotation={targetRotation}
                currentRotation={currentRotation}
            />
        </div>
    );
};

export default App;

