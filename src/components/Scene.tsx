import React, { useEffect, useRef, Suspense } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Html } from '@react-three/drei';
import * as THREE from 'three';
import Model from './Model';
import { mat2, vec2, vec3 } from 'gl-matrix';
import { Progress } from "@/components/ui/progress"


interface SceneProps {
    cameraPosition: THREE.Vector3;
    backgroundColor: string;
    modelPaths: { mtl: string; obj: string };

    deformDistance: number;

    // Face Landmarks
    enableFaceLandmarks: boolean;

    // Euclidean Distance
    enableEuclidean: boolean;

    // Rotation
    targetRotation: number; 
    currentRotation: React.MutableRefObject<number>;
}

const Scene: React.FC<SceneProps> = ({ 
    cameraPosition, 
    modelPaths, 

    deformDistance, 

    // Face Landmarks
    enableFaceLandmarks,

    // Euclidean Distance
    enableEuclidean,

    // Rotation
    targetRotation,
    currentRotation 
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
//        // 定義存儲網格頂點和面資料的矩陣
//        let V1, OrigV =
//
//        Eigen::MatrixXd V1, OrigV;
//        Eigen::MatrixXi F1, OrigF;
//
//
//        // 初始化刷子的參數
//        let brushRadius = 1.;
//        let brushType = igl::BrushType::GRAB;
//        let scale = 1;
//        
//        // Create a 2x2 matrix
//        let M = mat2.fromValues(1, 3, 2, 4);
//        console.log("M:", M);
//
//        // Compute the inverse
//        let Minv = mat2.create();
//        mat2.invert(Minv, M);
//        console.log("Minv:", Minv);
//
//        // Example of vector multiplication
//        let v = vec2.fromValues(1, 2);
//        let result = vec2.create();
//        vec2.transformMat2(result, v, M);
//        console.log("M * v:", result);
//
//        // 初始化變形的參數
//        let posStart = vec3.fromValues(0, 0, 0);
//        let posEnd = vec3.create();
//
//        // declare a variable result with the same type as the variable OrigV.
//        decltype(OrigV) result;
//        // To find the minimum value in each column of the matrix V1.
//        auto min_point = V1.colwise().minCoeff();
//        // To find the maximum value in each column of the matrix V1.
//        auto max_point = V1.colwise().maxCoeff();
//        auto brush_strength = (max_point - min_point).norm();
//        Eigen::Matrix3d twist, pinch;
//        twist << 0, 1, -1, -1, 0, 1, 1, -1, 0; // 反對稱矩陣
//        pinch << 0, 1, 1, 1, 0, 1, 1, 1, 0;    // 對稱矩陣
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
                  modelPaths = {modelPaths} 
                  onLoad = {handleModelLoad} 

                  // Face Landmarks
                  enableFaceLandmarks = {enableFaceLandmarks}

                  enableEuclidean = {enableEuclidean}

                  deformDistance = {deformDistance}

                  targetRotation = {targetRotation} 
                  currentRotation = {currentRotation} 
                />
            </Suspense>
            <OrbitControls enableDamping={false} ref={controlsRef} enableZoom={true} minDistance={3} maxDistance={9} zoomSpeed={0.8} />
      </>
    );
};

export default Scene;

