import React, { useEffect, useRef } from 'react';
import { useLoader, useThree, useFrame, ThreeEvent } from '@react-three/fiber';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader';
import * as THREE from 'three';
import { elevate } from '../tools/deformation/deform';

/**
 *
 * @description Type Argument for the React.FC "ModelProps". 
 *
 */
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

/**
 *
 * @description The functional components for loading the model, constructing the scene, setting the camera and containing hooks for transforming the model view and doing deformation. 
 *
 */
const Model: React.FC<ModelProps> = ({ 
        modelPaths, 
        onLoad, 
        deformDistance, 
        targetRotation, 
        currentRotation 
    }) => {
    // Declare "meshRef" variable: the reference for mesh.
    const meshRef = useRef<THREE.Object3D | null>(null);
    // Declare "groupRef" variable: the reference for group.
    const groupRef = useRef<THREE.Group>(null);
    // Declare "raycaster" variable: the reference for raycaster.
    const raycaster = useRef(new THREE.Raycaster());
    const { scene, camera: defaultCamera } = useThree();
    
    // Declare "mtl" variable: to load the textures of the model.
    const mtl = useLoader(MTLLoader, modelPaths.mtl);
    // Declare "obj" variable: to load the geometry of the model and paint the loaded textures on it.
    const obj = useLoader(OBJLoader, modelPaths.obj, (loader: OBJLoader) => {
        loader.setMaterials(mtl);
    });

    // Declare "camera" variable: to set the defaultCamera as perspective camera.
    const camera = defaultCamera as THREE.PerspectiveCamera;
    // Declare "clickToDeformModel" variable: to load the imported "elevate" function as clickToDeformModel function.
    const clickToDeformModel = elevate(raycaster.current, scene, camera);

    // Declare the hook function: to print out the model info when the model was loaded.
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

    // Declare the hook function: to transform the model views.
    useFrame((state, delta) => {
        if (groupRef.current) {
            // Smooth rotation
            currentRotation.current += (targetRotation - currentRotation.current) * 0.1;
            groupRef.current.rotation.y = currentRotation.current;
        }
    });

    // Declare the "onPointerDown" arrow function: to deform the model when the mouse click on it.
    const onPointerDown = (pointEvent: React.PointerEvent) => {
        console.log('Model clicked');
        clickToDeformModel(pointEvent.nativeEvent);
    };

    // Return the "model" and the "group".
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
