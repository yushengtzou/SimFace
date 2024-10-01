import React, { useEffect, useRef, Suspense } from 'react';
import { GridHelper } from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Html } from '@react-three/drei';
import * as THREE from 'three';
import Model from './Model';
import { mat2, vec2, vec3 } from 'gl-matrix';
import { Progress } from "@/components/ui/progress"

// 定義 Scene 組件的 props 介面
interface SceneProps {
    // 0. 基本設置
    cameraPosition: THREE.Vector3;  // 相機位置
    backgroundColor: string;        // 背景顏色
    modelPaths: { mtl: string; obj: string };  // 模型文件路徑

    // 1. 面部特徵點
    enableFaceLandmarks: boolean;   // 是否啟用面部特徵點

    // 2. 歐幾里得距離
    enableEuclidean: boolean;       // 是否啟用歐幾里得距離計算

    // 3. 面部雕刻工具
    enableTzouBrush: boolean;       // 是否啟用 Tzou 筆刷
    radius: number;                 // 筆刷半徑

    // 4. 旋轉
    targetRotation: number;         // 目標旋轉角度
    currentRotation: React.MutableRefObject<number>;  // 當前旋轉角度的 ref
}


const Scene: React.FC<SceneProps> = ({ 
    cameraPosition, 
    modelPaths, 
    enableFaceLandmarks,
    enableEuclidean,
    enableTzouBrush,
    radius,
    targetRotation,
    currentRotation, 
}) => {
    const { camera, gl, scene } = useThree();
    const cameraRef = useRef<THREE.PerspectiveCamera>(null);

    // 相機位置
    useEffect(() => {
      camera.position.set(0, 0, 24);
    }, [camera]);

    // 相機參數設置
    useEffect(() => {
        const newCamera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
        newCamera.position.copy(cameraPosition);
        cameraRef.current = newCamera;
        scene.camera = newCamera;
    }, [scene, cameraPosition]);

    // 每幀更新函式
    useFrame(() => {
        gl.setSize(window.innerWidth, window.innerHeight);
        if (cameraRef.current) {
            cameraRef.current.aspect = window.innerWidth / window.innerHeight;
            cameraRef.current.updateProjectionMatrix();
        }
    });

    const handleModelLoad = (loadedModel: THREE.Group) => {
        console.log('載入模型後，列印模型資訊：');
    };

    return (
        <>
            <hemisphereLight intensity={15} color={0xB1E1FF} groundColor={0xB97A20} />
            <ambientLight intensity={6.0} />
            <Suspense fallback={
                <Html center>
                    <div style={{ color: 'black', fontSize: '24px' }}>Loading...</div>
                </Html>
            }>
                <Model 
                    modelPaths={modelPaths} 
                    onLoad={handleModelLoad} 
                    enableFaceLandmarks={enableFaceLandmarks}
                    enableEuclidean={enableEuclidean}
                    enableTzouBrush={enableTzouBrush}
                    radius={radius}
                    targetRotation={targetRotation} 
                    currentRotation={currentRotation} 
                />
            </Suspense>
            <OrbitControls 
                enableDamping={false} 
                enableZoom={true} 
                zoomSpeed={1} 
            />
        </>
    );
};

export default Scene;

