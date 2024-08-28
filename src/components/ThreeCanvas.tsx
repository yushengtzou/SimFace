import React from 'react';
import { Canvas } from '@react-three/fiber';
import { Perf } from 'r3f-perf'
import { Vector3 } from 'three';
import Scene from './Scene';

interface ThreeCanvasProps {
  // Rotation
  deformDistance: number;
  targetRotation: number; // Changed from rotation to targetRotation
  currentRotation: React.MutableRefObject<number>; // Added this prop

  // Euclidean Distance
  enableEuclidean: boolean;
}

/**
 *
 * @description 渲染 Three.js 場景於 Canvas 物件
 * @return 此函式回傳 Canvas 物件
 * @todo After clicking the "Upload" button in the navbar, the file uploaded can be set to modelPaths. 
 *
 */
const ThreeCanvas: React.FC<ThreeCanvasProps> = ({ 
    deformDistance, 

    // Rotation
    targetRotation, 
    currentRotation, 

    // Euclidean Distance
    enableEuclidean
}) => {
    const cameraPosition = new Vector3(-1, 6, 6);
    const backgroundColor = '#f3f4f6';
    const modelPaths = {
        mtl: '.././model/lulu/texturedMesh.mtl',
        obj: '.././model/lulu/texturedMesh.obj',
//        mtl: '.././model/wes/texturedMesh.mtl',
//        obj: '.././model/wes/texturedMesh.obj',
    };
  
    return (
        <Canvas style={{ flex: 1, background: backgroundColor }}>
            {/* <Perf position="bottom-right" /> */}
            <Scene 
              cameraPosition = {cameraPosition} 
              backgroundColor = {backgroundColor} 
              modelPaths = {modelPaths} 

              deformDistance = {deformDistance} 

              // Rotation 
              targetRotation = {targetRotation} 
              currentRotation = {currentRotation} 

              // Euclidean Distance
              enableEuclidean = {enableEuclidean}
            />
        </Canvas>
    );
};

export default ThreeCanvas;
