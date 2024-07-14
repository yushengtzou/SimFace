import React from 'react';
import { Canvas } from '@react-three/fiber';
import { Vector3 } from 'three';
import Scene from './Scene';

const ThreeCanvas = () => {
  const cameraPosition = new Vector3(0, 8, 10);
  const backgroundColor = '#f3f4f6';
  const modelPaths = {
    mtl: '.././model/lulu/texturedMesh.mtl',
    obj: '.././model/lulu/texturedMesh.obj',
  };

  return (
    <Canvas style={{ flex: 1, background: backgroundColor }}>
      <Scene cameraPosition={cameraPosition} backgroundColor={backgroundColor} modelPaths={modelPaths} />
    </Canvas>
  );
};

export default ThreeCanvas;

