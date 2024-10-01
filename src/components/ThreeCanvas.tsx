import React from 'react';
import { Canvas } from '@react-three/fiber';
import { Perf } from 'r3f-perf'
import { Vector3 } from 'three';
import Scene from './Scene';

interface ThreeCanvasProps {
  // 1. Face Landmarks
  enableFaceLandmarks: boolean;

  // 2. Euclidean Distance
  enableEuclidean: boolean;

  // 3. Face Sculptor 
  enableTzouBrush: boolean;
  radius: number;

  // 4. Rotation
  targetRotation: number; // Changed from rotation to targetRotation
  currentRotation: React.MutableRefObject<number>; // Added this prop

}

/**
 *
 * @description 渲染 Three.js 場景於 Canvas 物件
 * @return 此函式回傳 Canvas 物件
 * @todo After clicking the "Upload" button in the navbar, the file uploaded can be set to modelPaths. 
 *
 */
const ThreeCanvas: React.FC<ThreeCanvasProps> = ({ 
    // 1. Face Landmarks
    enableFaceLandmarks,

    // 2. Euclidean Distance
    enableEuclidean,

    // 3. Face Sculptor
    enableTzouBrush,
    radius,

    // 4. Rotation
    targetRotation, 
    currentRotation 
}) => {
    const cameraPosition = new Vector3(-1, 6, 6);
    const backgroundColor = '#f3f4f6';
    const modelPaths = {
       mtl: '.././model/lulu/rescale/texturedMesh.mtl',
       obj: '.././model/lulu/rescale/texturedMesh.obj',
//       mtl: '.././model/wes/texturedMesh.mtl',
//       obj: '.././model/wes/texturedMesh.obj',
    };
  
    return (
        <Canvas style={{ flex: 1, background: backgroundColor }}>
            {/* <Perf position="bottom-right" /> */}
            <Scene 
              cameraPosition = {cameraPosition} 
              backgroundColor = {backgroundColor} 
              modelPaths = {modelPaths} 

              // 1. Face Landmarks
              enableFaceLandmarks = {enableFaceLandmarks}

              // 2. Euclidean Distance
              enableEuclidean = {enableEuclidean}

              // 3. Face Sculptor
              enableTzouBrush = {enableTzouBrush}
              radius = {radius}

              // 4. Rotation 
              targetRotation = {targetRotation} 
              currentRotation = {currentRotation} 
            />
        </Canvas>
    );
};

export default ThreeCanvas;
