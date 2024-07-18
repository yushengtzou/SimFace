import React, { useEffect, useRef } from 'react';
import { useLoader, useThree, useFrame } from '@react-three/fiber';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader';
import * as THREE from 'three';
import { elevate } from '../tools/deformation/deform';

interface ModelProps {
    modelPaths: { 
        mtl: string; 
        obj: string; 
    };
    onLoad: () => void;
    deformDistance: number;
    targetRotation: number;
    currentRotation: React.MutableRefObject<number>;
}

const Model: React.FC<ModelProps> = ({ 
    modelPaths, 
    onLoad, 
    deformDistance, 
    targetRotation, 
    currentRotation 
}) => {
    const meshRef = useRef<THREE.Object3D | null>(null);
    const groupRef = useRef<THREE.Group>(null);
    const { scene, camera: defaultCamera } = useThree();
    const raycaster = useRef(new THREE.Raycaster());
    
    const mtl = useLoader(MTLLoader, modelPaths.mtl);
    const obj = useLoader(OBJLoader, modelPaths.obj, (loader: OBJLoader) => {
        loader.setMaterials(mtl);
    });

    const camera = defaultCamera as THREE.PerspectiveCamera;
    const clickToDeformModel = elevate(raycaster.current, scene, camera);

    useEffect(() => {
        if (obj) {
            onLoad();
            obj.traverse((child) => {
                if (child instanceof THREE.Mesh) {
                    console.log('Mesh:', child);
                    console.log('Geometry:', child.geometry);
                    console.log('Material:', child.material);
                }
            });
        }
    }, [obj, onLoad]);

    useFrame((state, delta) => {
        if (groupRef.current) {
            // Smooth rotation
            currentRotation.current += (targetRotation - currentRotation.current) * 0.1;
            groupRef.current.rotation.y = currentRotation.current;
        }
    });

    const onPointerDown = (pointEvent: React.PointerEvent) => {
        console.log('Model clicked');
        clickToDeformModel(pointEvent.nativeEvent);
    };

    return (
        <group ref={groupRef}>
          <primitive
            ref={meshRef}
            object={obj}
            scale={[6, 6, 6]}
            position={[0, 5, 12]}
            onPointerDown={onPointerDown}
          />
        </group>
    );
};

export default Model;
