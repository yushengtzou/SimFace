import React, { useState, useCallback, useRef } from 'react';
import Navbar from './Navbar';
import ThreeCanvas from './ThreeCanvas';

const App: React.FC = () => {
    // --------------------------------------------------------------
    // 狀態變數宣告
    // --------------------------------------------------------------
    
    const [deformDistance, setDeformDistance] = useState(10);

    // 轉動模型所需要的狀態變數 Rotation State
    const [targetRotation, setTargetRotation] = useState(0);
    const currentRotation = useRef(0);

    // 計算歐氏距離所需要的啟動狀態變數 enableEuclidean State
    const [enableEuclidean, setEuclidean] = useState(false);

    // --------------------------------------------------------------
    // 函式宣告與實作
    // --------------------------------------------------------------

    // Deformation slider change useCallback() function 
    const handleSliderChange = useCallback((value: number) => {
        setDeformDistance(value);
    }, []);


    // 轉動模型的回調函式 Rotation useCallback() function 
    const handleRotateFront = useCallback(() => {
        setTargetRotation(0);
    }, []);
    const handleRotateLeft = useCallback(() => {
        setTargetRotation(-Math.PI / 2); // -90 degrees in radians
    }, []);
    const handleRotateRight = useCallback(() => {
        setTargetRotation(Math.PI / 2); // 90 degrees in radians
    }, []);


    // 處理 Euclidean Distance 狀態的函式 handleEuclideanClick() 
    const handleEuclideanClick = useCallback(() => {
      setEuclidean(prevState => !prevState);
      if (!enableEuclidean) {
        console.log("onEuclideanDistance() enabled: ", !enableEuclidean);
      }
    }, []);




    return (
        <div className="h-full flex flex-col">
            <Navbar 
                // Rotation
                onRotateFront = {handleRotateFront}
                onRotateLeft = {handleRotateLeft}
                onRotateRight = {handleRotateRight}
                targetRotation = {targetRotation}

                // Euclidean Distance
                enableEuclidean = {enableEuclidean}
                handleEuclideanDistance = {handleEuclideanClick} 
            />
            <ThreeCanvas 
                // Rotation
                targetRotation={targetRotation}
                currentRotation={currentRotation}

                // Euclidean Distance
                enableEuclidean = {enableEuclidean}

                // Deformation
                deformDistance={deformDistance} 
            />
        </div>
    );
};

export default App;

