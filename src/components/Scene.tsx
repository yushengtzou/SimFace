import React, { useEffect, useRef, Suspense } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Html } from '@react-three/drei';
import * as THREE from 'three';
import Model from './Model';

interface SceneProps {
    cameraPosition: THREE.Vector3;
    backgroundColor: string;
    modelPaths: { mtl: string; obj: string };
    deformDistance: number;
    targetRotation: number; // Changed from rotation to targetRotation
    currentRotation: React.MutableRefObject<number>; // Added this prop
}

const Scene: React.FC<SceneProps> = ({ 
    cameraPosition, 
    backgroundColor, 
    modelPaths, 
    deformDistance, 
    targetRotation, // Changed from rotation to targetRotation
    currentRotation // Added this prop
}) => {
    const { camera, gl } = useThree();
    const controlsRef = useRef<any>(null);
  
    useEffect(() => {
        const perspectiveCamera = camera as THREE.PerspectiveCamera;
        perspectiveCamera.position.copy(cameraPosition);
        if (controlsRef.current) {
            controlsRef.current.target.set(0, 5, 0);
            controlsRef.current.update();
        }
    }, []);
  
    useFrame(() => {
        gl.setSize(window.innerWidth, window.innerHeight);
        (camera as THREE.PerspectiveCamera).aspect = window.innerWidth / window.innerHeight;
        (camera as THREE.PerspectiveCamera).updateProjectionMatrix();
    });
  
    const handleModelLoad = () => {
        console.log('載入模型後，列印模型資訊：');
    };
  
    return (
      <>
          <hemisphereLight intensity={15} color={0xB1E1FF} groundColor={0xB97A20} />
          <directionalLight intensity={15} position={[5, 10, 2]} />
          <ambientLight intensity={6.0} />
          <Suspense
              fallback={
                <Html center>
                  <div style={{ color: 'black', fontSize: '24px' }}>Loading...</div>
                </Html>
              }
          >
              <Model 
                modelPaths={modelPaths} 
                onLoad={handleModelLoad} 
                deformDistance={deformDistance}
                targetRotation={targetRotation} 
                currentRotation={currentRotation} 
              />
          </Suspense>
          <OrbitControls enableDamping={false} ref={controlsRef} enableZoom={true} minDistance={3} maxDistance={9} zoomSpeed={0.8} />
      </>
    );
};

export default Scene;

