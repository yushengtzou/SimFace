import React, { useEffect, useRef } from 'react';
import { useLoader, useThree, useFrame, ThreeEvent } from '@react-three/fiber';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader';
import * as THREE from 'three';
import { elevate } from '../tools/deformation/deform';
import onEuclideanDistance from './util';

/**
 *
 * @description ModelProps 介面的參數型別 
 *
 */
interface ModelProps {
    modelPaths: { 
        mtl: string; 
        obj: string; 
    };
    onLoad: () => void;

    deformDistance: number;

    // 轉動
    targetRotation: number;
    currentRotation: React.MutableRefObject<number>;

    // 歐氏距離 Euclidean Distance
    enableEuclidean: boolean;
}

/**
 *
 * @description 載入模型、建構場景、設置相機、改變相機視角、形變 
 *
 */
const Model: React.FC<ModelProps> = ({ 
        modelPaths, 
        onLoad, 

        deformDistance, 

        // 轉動
        targetRotation, 
        currentRotation, 

        // 歐氏距離 Euclidean Distance
        enableEuclidean
    }) => {

    // --------------------------------------------------------------
    // 狀態變數宣告
    // --------------------------------------------------------------

    // mesh 的參照
    const meshRef = useRef<THREE.Object3D | null>(null);
    // group 的參照
    const groupRef = useRef<THREE.Group>(null);
    // raycaster 的參照
    const raycaster = useRef(new THREE.Raycaster());
    const { scene, camera: defaultCamera } = useThree();
    
    // 載入模型的紋理 
    const mtl = useLoader(MTLLoader, modelPaths.mtl);
    // 載入模型 
    const obj = useLoader(OBJLoader, modelPaths.obj, (loader: OBJLoader) => {
        loader.setMaterials(mtl);
    });

    // Set the defaultCamera as perspective camera
    const camera = defaultCamera as THREE.PerspectiveCamera;
    // Load the imported "elevate" function as clickToDeformModel function
    const clickToDeformModel = elevate(raycaster.current, scene, camera);


    // --------------------------------------------------------------
    // 函式宣告與實作
    // --------------------------------------------------------------


    // 列印模型資訊 
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

    // 轉換相機視角 
    useFrame((state, delta) => {
        if (groupRef.current) {
            // Smooth rotation
            currentRotation.current += (targetRotation - currentRotation.current) * 0.1;
            groupRef.current.rotation.y = currentRotation.current;
        }
    });

    // 形變網目 
    const onPointerDown = (pointEvent: React.PointerEvent) => {
        console.log('Model clicked');
        clickToDeformModel(pointEvent.nativeEvent);
    };


    let handleOnPointerDown = () => {
        return onEuclideanDistance() ? enableEuclidean : onPointerDown();

    }

    // 回傳 model 和 group
    return (
        <group ref={groupRef}>
            <primitive
                ref={meshRef}
                object={obj}
                scale={[6, 6, 6]}
                position={[0, 5, 12]}
                onPointerDown={handleOnPointerDown}
            />
        </group>
    );
};

export default Model;
