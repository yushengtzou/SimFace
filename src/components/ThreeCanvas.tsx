import React from 'react';
import { Canvas } from '@react-three/fiber';
import { Perf } from 'r3f-perf'
import { Vector3 } from 'three';
import Scene from './Scene';

interface ThreeCanvasProps {
    deformDistance: number;
    targetRotation: number; // Changed from rotation to targetRotation
    currentRotation: React.MutableRefObject<number>; // Added this prop
}

/**
 *
 * @description the ThreeCanvas() function aims at render the Three.js scene at the Canvas object.
 * @return The function returns a Canvas object.
 * @todo After clicking the "Upload" button in the navbar, the file uploaded can be set to modelPaths. 
 *
 */
const ThreeCanvas: React.FC<ThreeCanvasProps> = ({ deformDistance, targetRotation, currentRotation }) => {
    const cameraPosition = new Vector3(-1, 6, 6);
    const backgroundColor = '#f3f4f6';
    const modelPaths = {
        mtl: '.././model/lulu/texturedMesh.mtl',
        obj: '.././model/lulu/texturedMesh.obj',
    };
  
    return (
        <Canvas style={{ flex: 1, background: backgroundColor }}>
            {/* <Perf position="bottom-right" /> */}
            <Scene 
              cameraPosition={cameraPosition} 
              backgroundColor={backgroundColor} 
              modelPaths={modelPaths} 
              deformDistance={deformDistance} 
              targetRotation={targetRotation} // Changed from rotation to targetRotation
              currentRotation={currentRotation} // Added this prop
            />
        </Canvas>
    );
};

export default ThreeCanvas;
