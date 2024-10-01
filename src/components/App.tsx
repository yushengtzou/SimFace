import React, { useState, useCallback, useRef } from 'react';
import Navbar from './Navbar';
import ThreeCanvas from './ThreeCanvas';
import * as THREE from 'three';

const App: React.FC = () => {
    // --------------------------------------------------------------
    // 狀態變數宣告
    // --------------------------------------------------------------
    
    // 1. 面部特徵點所需要的啟動狀態變數 enableFaceLandmarks State
    const [enableFaceLandmarks, setFaceLandmarks] = useState(false);

    // 2. 計算歐氏距離所需要的啟動狀態變數 enableEuclidean State
    const [enableEuclidean, setEuclidean] = useState(false);

    // 3. Face Sculptor
    const [enableTzouBrush, setTzouBrush] = useState(false);
    // Range Slider Value
    const [radius, setRadius] = useState(5);
    const handleRadiusChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        setRadius(Number(event.target.value));
    }, []);

    // 4. 轉動模型所需要的狀態變數 Rotation State
    const [targetRotation, setTargetRotation] = useState(0);
    const currentRotation = useRef(0);

    // --------------------------------------------------------------
    // 函式宣告與實作
    // --------------------------------------------------------------

    // 1. Face Landmarks
    const handleFaceLandmarks = useCallback(() => {
      setFaceLandmarks(prevState => !prevState);
      if (!enableFaceLandmarks) {
        console.log("onFaceLandmarks() enabled: ", !enableFaceLandmarks);
      }
    }, []);


    // 2. 處理 Euclidean Distance 狀態的函式 handleEuclideanClick() 
    const handleEuclideanClick = useCallback(() => {
      setEuclidean(prevState => !prevState);
      if (!enableEuclidean) {
        console.log("onEuclideanDistance() enabled: ", !enableEuclidean);
      }
    }, []);


    // 3. Face Sculptor 
    const handleTzouBrush = useCallback(() => {
      setTzouBrush(prevState => !prevState);
      if (!enableTzouBrush) {
        console.log("onTzouBrush() enabled: ", !enableTzouBrush);
      }
    }, []);


    // 4. 轉動模型的回調函式 Rotation useCallback() function 
    const degrees = 77;
    const radians = THREE.MathUtils.degToRad(degrees);

    const handleRotateFront = useCallback(() => {
        setTargetRotation(0);
    }, []);
    const handleRotateLeft = useCallback(() => {
        setTargetRotation(-radians); // -90 degrees in radians
    }, []);
    const handleRotateRight = useCallback(() => {
        setTargetRotation(radians); // 90 degrees in radians
    }, []);


    return (
        <div className="h-full flex flex-col">
            <Navbar 
                // 1. Face Landmarks
                enableFaceLandmarks = {enableFaceLandmarks}
                handleFaceLandmarks = {handleFaceLandmarks} 

                // 2. Euclidean Distance
                enableEuclidean = {enableEuclidean}
                handleEuclideanDistance = {handleEuclideanClick} 

                // 3. Face Sculptor
                enableTzouBrush = {enableTzouBrush}
                handleTzouBrush = {handleTzouBrush}
                // The Slider Bar Part
                radius = {radius}
                handleRadiusChange = {handleRadiusChange}

                // 4. Rotation
                onRotateFront = {handleRotateFront}
                onRotateLeft = {handleRotateLeft}
                onRotateRight = {handleRotateRight}
                targetRotation = {targetRotation}
            />
            <ThreeCanvas 
                // 1. Face Landmarks
                enableFaceLandmarks = {enableFaceLandmarks}

                // 2. Euclidean Distance
                enableEuclidean = {enableEuclidean}

                // 3. Deformation
                enableTzouBrush = {enableTzouBrush}
                radius = {radius}

                // 4. Rotation
                targetRotation={targetRotation}
                currentRotation={currentRotation}
            />
        </div>
    );
};

export default App;

