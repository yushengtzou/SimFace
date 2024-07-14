import React, { useEffect, useRef, Suspense } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import Model from './Model';
import { Html, useProgress } from '@react-three/drei';
import Loader from './Loader';

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
 * @description Aims at constructing the scene.
 * @argument cameraPosition, backgroundColor, modelPaths
 *
 */
const Scene = ({ cameraPosition, backgroundColor, modelPaths }: SceneProps) => {
    const { camera, gl } = useThree();
    const controlsRef = useRef<any>(null);
  
    useEffect(() => {
        const perspectiveCamera = camera as THREE.PerspectiveCamera;
        perspectiveCamera.position.copy(cameraPosition);
        if (controlsRef.current) {
          controlsRef.current.target.set(0, 5, 0);
          controlsRef.current.update();
        }
    }, [camera, cameraPosition]);
  
    useFrame(() => {
        gl.setSize(window.innerWidth, window.innerHeight);
        (camera as THREE.PerspectiveCamera).aspect = window.innerWidth / window.innerHeight;
        (camera as THREE.PerspectiveCamera).updateProjectionMatrix();
    });
  
    const handleModelLoad = () => {
        console.log('The information of the loaded model:');
    };
  
    return (
        <>
            <hemisphereLight intensity={15} color={0xB1E1FF} groundColor={0xB97A20} />
            <directionalLight intensity={15} position={[5, 10, 2]} />
            <ambientLight intensity={6.0} />
            <Suspense fallback={
                <Html center>
                  <div style={{ color: 'black', fontSize: '24px' }}>Loading...</div>
                </Html>
            }>
                <Model modelPaths={modelPaths} onLoad={handleModelLoad} />
            </Suspense>
  
            <OrbitControls
                ref={controlsRef}
                enableZoom={true}
                minDistance={3}
                maxDistance={9}
            />
        </>
    );
};

export default Scene;

