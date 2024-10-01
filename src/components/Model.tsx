import React, { useState, useEffect, useRef, useCallback} from 'react';
import { useLoader, useThree, useFrame } from '@react-three/fiber';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader';
import * as THREE from 'three';
import { elevate } from './deform';
import { ThreeEvent } from '@react-three/fiber';

/**
 * @description ModelProps 介面的參數型別
 */
interface ModelProps {
  // 0. Setup
    modelPaths: { 
    mtl: string;  // 材質檔案的路徑
    obj: string;  // 3D 模型檔案的路徑
  };
  onLoad: () => void;  // 當模型載入完成後呼叫的回調函式

  // 1. FacelandMark
  enableFaceLandmarks: boolean;  // 是否啟用臉部標記功能

  // 2. ASSESSMENT
  enableEuclidean: boolean;  // 是否啟用歐氏距離測量功能
  
  // 3. FACE SCULPTOR
  enableTzouBrush: boolean;
  radius: number;  // 用於形變操作的距離參數

  // 4. CAMERA
  targetRotation: number;  // 目標旋轉角度
  currentRotation: React.MutableRefObject<number>;  // 當前旋轉角度的參照
}

/**
 * @description 載入模型、建構場景、設置相機、改變相機視角、形變
 */
const Model: React.FC<ModelProps> = ({ 
  // 0. Setup
  modelPaths, 
  onLoad, 

  // 1. FacelandMark
  enableFaceLandmarks,

  // 2. ASSESSMENT
  enableEuclidean,

  // 3. FACE SCULPTOR
  enableTzouBrush,
  radius,

  // 4. CAMERA
  targetRotation, 
  currentRotation,
}) => {

  // 定義 mesh 的參照，用於訪問和操作 3D 模型
  const meshRef = useRef<THREE.Object3D | null>(null); 
  // 定義 group 的參照，用於群組控制
  const groupRef = useRef<THREE.Group>(null); 
  // 定義 raycaster 的參照，用於實現滑鼠射線投射
  const raycaster = useRef(new THREE.Raycaster()); 
  // 使用 useThree Hook 取得場景和相機的控制權
  const { scene, camera: defaultCamera, gl } = useThree(); 

  const mtl = useLoader(MTLLoader, modelPaths.mtl); // 載入模型的材質檔案
  // 載入 3D 模型，並應用已載入的材質
  const obj = useLoader(OBJLoader, modelPaths.obj, (loader: OBJLoader) => { 
    loader.setMaterials(mtl);
  });

  const camera = defaultCamera as THREE.PerspectiveCamera; // 將相機設定為透視相機
  // 使用預先定義的 elevate 函式來實作模型的形變操作
  const clickToDeformModel = elevate(raycaster.current, scene, camera, radius/3);
  const [isPointerDown, setIsPointerDown] = useState(false);
  // 定義狀態變數來儲存使用者選擇的點
  const [selectedPoints, setSelectedPoints] = useState<THREE.Vector3[]>([]); 
  // 定義狀態變數來儲存計算得到的歐氏距離
  const [euclideanDistance, setEuclideanDistance] = useState<number | null>(null); 
  // 定義直線的參照，用於在場景中繪製和管理連接點的線段
  const lineRef = useRef<THREE.Line | null>(null); 
  // 定義文本精靈的參照，用於在場景中顯示距離文本
  const textRef = useRef<THREE.Sprite | null>(null); 

  /**
   * @description 計算兩個點之間的歐氏距離
   * @param point1 第一個點的 3D 座標
   * @param point2 第二個點的 3D 座標
   * @returns 兩點之間的距離
   */
  const calculateEuclideanDistance = (point1: THREE.Vector3, point2: THREE.Vector3): number => {
    return point1.distanceTo(point2);
  };

  /**
   * @description 創建顯示距離文本的精靈
   * @param message 要顯示的文本內容
   * @returns 顯示文本的 Sprite 精靈
   */
  const createTextSprite = (message: string): THREE.Sprite => {
    const fontSize = 10;                                        // 設定文字大小
    const canvas = document.createElement('canvas');            // 創建畫布元素
    const context = canvas.getContext('2d');                    // 取得 2D 繪圖上下文
    context.font = `${fontSize}px Arial`;                       // 設定字型和大小
    const textWidth = context.measureText(message).width;       // 測量文本寬度
    canvas.width = textWidth;                                   // 設定畫布寬度為文本寬度
    canvas.height = fontSize;                                   // 設定畫布高度為字型大小

    // 設定背景透明，文字為黑色
    context.fillStyle = 'rgba(255, 255, 255, 0.0)';
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = 'rgba(0, 0, 0, 1.0)';
    context.fillText(message, 0, fontSize);                     // 在畫布上繪製文字

    // 創建材質並將其應用到精靈上
    const texture = new THREE.CanvasTexture(canvas);
    const spriteMaterial = new THREE.SpriteMaterial({
      map: texture,
      depthTest: false,
    });

    const sprite = new THREE.Sprite(spriteMaterial);
    sprite.scale.set(1, 0.5, 1);                                // 設定精靈的縮放比例
    return sprite;
  };

  // 引入 THREE.TubeGeometry 所需的路径创建工具
  const createTubeGeometry = (points: THREE.Vector3[], radius: number) => {
    const path = new THREE.CatmullRomCurve3(points);
    const geometry = new THREE.TubeGeometry(path, 20, radius, 8, false);
    return geometry;
  };

  /**
   * @description 處理滑鼠點擊事件，計算兩點之間的歐氏距離，並顯示直線和距離
   * @param event 滑鼠點擊事件
   */
  const handleClickEuclideanDistance = (event: ThreeEvent<PointerEvent>) => {
    if (!enableEuclidean) return;

    const { clientX, clientY } = event.nativeEvent;

    const mouse = new THREE.Vector2(
      (clientX / window.innerWidth) * 2 - 1,
      -(clientY / window.innerHeight) * 2 + 1
    );

    raycaster.current.setFromCamera(mouse, camera);
    const intersects = raycaster.current.intersectObject(obj, true);

    if (intersects.length > 0) {
      const newPoint = intersects[0].point;

      selectedPoints.forEach(point => {
        const sphere = scene.getObjectByName(`sphere-${point.x}-${point.y}-${point.z}`);
        if (sphere) {
            scene.remove(sphere);
        }
      });

      setSelectedPoints((prevPoints) => {
        const updatedPoints = [newPoint];

        if (prevPoints.length > 0) {
          updatedPoints.unshift(prevPoints[0]);
        }

        if (updatedPoints.length === 2) {
          const distance = calculateEuclideanDistance(updatedPoints[0], updatedPoints[1]);
          setEuclideanDistance(distance);

          // 移除先前繪製的直線和文字精靈（如有）
          if (lineRef.current) {
            scene.remove(lineRef.current);
            lineRef.current.geometry.dispose();
            lineRef.current.material.dispose();
            lineRef.current = null;
          }
          if (textRef.current) {
            scene.remove(textRef.current);
            textRef.current.material.dispose();
            textRef.current = null;
          }

          // 使用 TubeGeometry 创建粗线条
          const geometry = createTubeGeometry(updatedPoints, 0.025); // 0.05 是管道的半径，可調整此值
          const material = new THREE.MeshBasicMaterial({ 
            color: 0x00FF00, 
            depthTest: false              // 確保線條總是在最前面顯示
          });
          const line = new THREE.Mesh(geometry, material);
          line.renderOrder = 1;           // 設置線條的渲染順序，保證它在模型之後渲染
          scene.add(line);                // 將直線添加到場景中
          lineRef.current = line;

          const midPoint = new THREE.Vector3().addVectors(updatedPoints[0], updatedPoints[1]).multiplyScalar(0.5);
          const sprite = createTextSprite((distance.toFixed(2)) + ' cm ');
          sprite.position.copy(midPoint);
          scene.add(sprite);
          textRef.current = sprite;

          return [];
        }

        updatedPoints.forEach(point => {
          const sphere = new THREE.Mesh(
            new THREE.SphereGeometry(0.07),
            new THREE.MeshBasicMaterial({ color: 0xff0000 })
          );
          sphere.position.copy(point);
          sphere.name = `sphere-${point.x}-${point.y}-${point.z}`;
          scene.add(sphere);
        });

        return updatedPoints;
      });
    }
  };

  const handlePointerDown = useCallback((event: ThreeEvent<PointerEvent>) => {
    if (enableTzouBrush) {
      clickToDeformModel(event);
    } else {
      handleClickEuclideanDistance(event);
    }
  }, [enableFaceLandmarks, clickToDeformModel, handleClickEuclideanDistance]);

  // 在模型載入後執行回調，並列印模型資訊
  useEffect(() => {
    if (obj) {
      onLoad();
      obj.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          console.log('Mesh:', child);                      // 列印網格物件資訊
          console.log('Geometry:', child.geometry);         // 列印幾何資訊
          console.log('Material:', child.material);         // 列印材質資訊
        }
      });
    }
  }, [obj, onLoad]);

  // 在每一幀中更新群組的旋轉
  useFrame((state, delta) => {
    if (groupRef.current) {
      currentRotation.current += (targetRotation - currentRotation.current) * 0.1;
      groupRef.current.rotation.y = currentRotation.current;
    }
  });

  return (
    <group ref={groupRef}>
      <primitive
        ref={meshRef}
        object={obj}
        scale={[1, 1, 1]}
        position={[0, 2, 65]}
//          onPointerDown={handlePointerDown} 
//          onPointerMove={handlePointerMove} 
//          onPointerUp={handlePointerUp}
        onPointerDown={handlePointerDown}  // 根據是否啟用臉部標記功能決定使用哪個函式
      />
    </group>
  );
};

export default Model;


/**
 *
 *
 *
    const handlePointerDown = useCallback((event: ThreeEvent<PointerEvent>) => {
         setIsPointerDown(true);
         if (enableFaceLandmarks) {
             elevate(raycaster.current, scene, camera)(event.nativeEvent);
         } else {
             handleClickEuclideanDistance(event);
         }
     }, [enableFaceLandmarks, scene, camera, handleClickEuclideanDistance]);
 
     const handlePointerMove = useCallback((event: ThreeEvent<PointerEvent>) => {
         if (isPointerDown && enableFaceLandmarks) {
             elevate(raycaster.current, scene, camera)(event.nativeEvent);
         }
     }, [isPointerDown, enableFaceLandmarks, scene, camera]);
 
     const handlePointerUp = useCallback(() => {
         setIsPointerDown(false);
     }, []);
 *
 *
 *
 */
