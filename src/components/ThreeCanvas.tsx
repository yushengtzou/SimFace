import React from 'react';
import { Canvas } from '@react-three/fiber';
import { Vector3 } from 'three';
import Scene from './Scene';

interface ThreeCanvasProps {
  deformDistance: number;
}

/**
 *
 * @description the ThreeCanvas() function aims at render the Three.js scene at the Canvas object.
 * @return The function returns a Canvas object.
 * @todo After clicking the "Upload" button in the navbar, the file uploaded can be set to modelPaths. 
 *
 */
const ThreeCanvas: React.FC<ThreeCanvasProps> = ({ deformDistance }) => {
    const cameraPosition = new Vector3(-1, 6, 6);
    const backgroundColor = '#f3f4f6';
    const modelPaths = {
        mtl: '.././model/lulu/texturedMesh.mtl',
        obj: '.././model/lulu/texturedMesh.obj',
    };
  
    return (
        <Canvas style={{ flex: 1, background: backgroundColor }}>
            <Scene 
              cameraPosition={cameraPosition} 
              backgroundColor={backgroundColor} 
              modelPaths={modelPaths} 
              deformDistance={deformDistance} 
            />
        </Canvas>
    );
};

export default ThreeCanvas;

