import React, { useEffect, useRef, useState } from 'react';
import { useLoader, useThree } from '@react-three/fiber';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader';
import * as THREE from 'three';
import { elevate, deformMesh } from '../tools/deformation/deform';

interface ModelProps {
  modelPaths: { mtl: string; obj: string };
  onLoad: () => void;
  deformDistance: number;
}

/**
 *
 * @description Use MTLLoader and OBJLoader to load the 3D model then return it through an object container "primitive".
 * @todo Add hook to implement the onclick function through useFrame? useState?
 * @returns object, scale, position, onPointerDown, onPointerDownCapture
 *
 */
const Model: React.FC<ModelProps> = ({ modelPaths, onLoad, deformDistance }) => {
    const { scene, camera: defaultCamera } = useThree();
    const raycaster = useRef(new THREE.Raycaster());
    const initialClickPoint = useRef<THREE.Vector3 | null>(null);
    const initialGeometry = useRef<THREE.BufferGeometry | null>(null);
    const targetMesh = useRef<THREE.Mesh | null>(null);
    const deformationNormal = useRef<THREE.Vector3 | null>(null);
  
    const mtl = useLoader(MTLLoader, modelPaths.mtl);
    const obj = useLoader(OBJLoader, modelPaths.obj, (loader: any) => {
        (loader as OBJLoader).setMaterials(mtl);
    });
  
    const camera = defaultCamera as THREE.PerspectiveCamera;
  
    const handleClick = elevate(raycaster.current, scene, camera);
  
    useEffect(() => {
        if (obj) {
            onLoad(); // Print model info to console
            obj.traverse((child) => {
                if (child instanceof THREE.Mesh) {
                    console.log('Mesh:', child);
                    console.log('Geometry:', child.geometry);
                    console.log('Material:', child.material);
                }
            });
        }
    }, [obj]);

    useEffect(() => {
        console.log('useEffect of deformation triggered:', { 
            deformDistance, 
            initialClickPoint: initialClickPoint.current, 
            targetMesh: targetMesh.current, 
            deformationNormal: deformationNormal.current 
        });

        if (
            initialClickPoint.current &&
            targetMesh.current &&
            deformationNormal.current
        ) {
            console.log('Applying deformation:', deformDistance);

            // Apply deformation
            deformMesh(
                initialClickPoint.current, 
                targetMesh.current, 
                deformationNormal.current, 
                deformDistance / 100
            );
            
            targetMesh.current.geometry.attributes.position.needsUpdate = true; // Ensure geometry update
        } else {
            console.warn('Deformation skipped due to missing data:', { 
                initialClickPoint: initialClickPoint.current, 
                targetMesh: targetMesh.current, 
                deformationNormal: deformationNormal.current 
            });
        }
    }, [deformDistance]);

  
    return (
      <>
        <primitive
            object={obj}
            scale={[6, 6, 6]}
            position={[0, 5, 12]}
            onPointerDown={(event: React.PointerEvent) => {
                console.log('Model clicked');
                handleClick(event.nativeEvent);
            }}
            onPointerDownCapture={(event: React.PointerEvent) => {
                if (raycaster.current) {
                    const intersects = raycaster.current.intersectObject(obj, true);
                    if (intersects.length > 0) {
                        const intersect = intersects[0];
                        targetMesh.current = intersect.object as THREE.Mesh;
                        initialGeometry.current = targetMesh.current.geometry.clone();
                        initialClickPoint.current = intersect.point.clone();
                        deformationNormal.current = intersect.face?.normal.clone() || null;
                        if (deformationNormal.current) {
                            deformationNormal.current.applyMatrix3(
                              new THREE.Matrix3().getNormalMatrix(targetMesh.current.matrixWorld)
                            );
                        }
                    }
                }
            }}
        />
      </>
    );
};

export default Model;

