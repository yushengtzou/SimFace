import React, { useEffect, useRef, useState } from 'react';
import { useLoader, useThree } from '@react-three/fiber';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader';
import * as THREE from 'three';
import { elevate, deformMesh } from '../tools/deformation/deform';

/**
 * 型別介面宣告
 * 定義 ModelProps 介面，用於描述模型組件的屬性
 */
interface ModelProps {
    /**
     * 模型文件路徑
     * 包含材質文件 (mtl) 和幾何文件 (obj) 的路徑
     */
    modelPaths: { 
        mtl: string; 
        obj: string; 
    };

    /**
     * 加載完成的回調函數
     * 當模型加載完成後會被調用
     */
    onLoad: () => void;

    /**
     * 形變距離
     * 用於定義模型形變的距離參數
     */
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

    /**
     *
     * 宣告並初始化相關變數
     *
     */

    // 引入 THREE.js 庫中的場景 (scene) 和預設相機 (defaultCamera)
    const { scene, camera: defaultCamera } = useThree();
    // 創建射線投射器 (Raycaster) 的引用，用於光線投射操作
    const raycaster = useRef(new THREE.Raycaster());

    // 用於存儲初始點擊位置的引用
    const initialClickPoint = useRef<THREE.Vector3 | null>(null);
    // 用於存儲初始幾何的引用
    const initialGeometry = useRef<THREE.BufferGeometry | null>(null);
    // 用於存儲目標模型的引用
    const targetMesh = useRef<THREE.Mesh | null>(null);
    // 用於存儲形變法向量的引用
    const deformationNormal = useRef<THREE.Vector3 | null>(null);

    // 使用 MTLLoader 載入模型的材質文件
    const mtl = useLoader(MTLLoader, modelPaths.mtl);
    // 使用 OBJLoader 載入模型的幾何，並設置材質
    const obj = useLoader(OBJLoader, modelPaths.obj, (loader: OBJLoader) => {
        loader.setMaterials(mtl);
    });

    // 將默認相機設定為透視相機
    const camera = defaultCamera as THREE.PerspectiveCamera;

    const clickToDeformModel = elevate(raycaster.current, scene, camera);

    /**
     *
     * Model 元件的 Hook 函式
     * 該函式負責初始化並管理 Model 元件在應用程式中的狀態和生命周期。
     *
     */

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
            object = {obj}
            scale = {[6, 6, 6]}
            position = {[0, 5, 12]}
        />
      </>
    );
};

export default Model;


//            onPointerDown = {(event: React.PointerEvent) => {
//                    console.log('Model clicked');
//                    clickToDeformModel(event.nativeEvent);
//                }
//            }
//            onPointerDownCapture = {(event: React.PointerEvent) => {
//                    if (raycaster.current) {
//                        const intersects = raycaster.current.intersectObject(obj, true);
//                        if (intersects.length > 0) {
//                            const intersect = intersects[0];
//                            targetMesh.current = intersect.object as THREE.Mesh;
//                            initialGeometry.current = targetMesh.current.geometry.clone();
//                            initialClickPoint.current = intersect.point.clone();
//                            deformationNormal.current = intersect.face?.normal.clone() || null;
//                            if (deformationNormal.current) {
//                                deformationNormal.current.applyMatrix3(
//                                    new THREE.Matrix3().getNormalMatrix(targetMesh.current.matrixWorld)
//                                );
//                            }
//                        }
//                    }
//                }
//            }
