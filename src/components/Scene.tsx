import React, { useEffect, useRef } from 'react';
import { Canvas, useFrame, useThree, useLoader } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader';
import { Vector3 } from 'three';

/**
 *
 * @description Define the type of the variables, i.e. cameraPosition, backgroundColor and modelPaths.
 *
 */
interface SceneProps {
    cameraPosition: THREE.Vector3;
    backgroundColor: string;
    modelPaths: { mtl: string; obj: string };
}

/**
 *
 * @description Model() function aims at loading the material and geometry of the 3D model.
 * @argument modelPaths, onLoad
 *
 */
const Model = ({ modelPaths, onLoad }: { 
        modelPaths: { mtl: string; obj: string }; 
        onLoad: () => void 
        }) => {
            const mtl = useLoader(MTLLoader, modelPaths.mtl);
            const obj = useLoader(OBJLoader, modelPaths.obj, (loader: any) => {
              (loader as OBJLoader).setMaterials(mtl);
            });
          
            useEffect(() => {
              onLoad();
            }, [obj, onLoad]);
          
            return <primitive object={obj} scale={[6, 6, 6]} position={[0, 5, 12]} />;
        };

/**
 *
 * @description Scene() function aims at constructing the scene. 
 * @argument cameraPosition, backgroundColor, modelPaths
 *
 */
const Scene = ({ cameraPosition, backgroundColor, modelPaths }: SceneProps) => {
    const { camera, gl } = useThree();
    const raycaster = useRef(new THREE.Raycaster());
  
    useEffect(() => {
      (camera as THREE.PerspectiveCamera).position.copy(cameraPosition);
    }, [camera, cameraPosition]);
  
    useFrame(() => {
      gl.setSize(window.innerWidth, window.innerHeight);
      (camera as THREE.PerspectiveCamera).aspect = window.innerWidth / window.innerHeight;
      (camera as THREE.PerspectiveCamera).updateProjectionMatrix();
    });
  
    const handleModelLoad = () => {
      console.log('Model loaded');
    };
  
    return (
      <>
        <hemisphereLight intensity={15} color={0xB1E1FF} groundColor={0xB97A20} />
        <directionalLight intensity={15} position={[5, 10, 2]} />
        <ambientLight intensity={6.0} />
        <Model modelPaths={modelPaths} onLoad={handleModelLoad} />
        <OrbitControls />
      </>
    );
};

export default Scene;
