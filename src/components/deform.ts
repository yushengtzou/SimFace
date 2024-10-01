import * as THREE from 'three';

// 宣告並初始化相關變數
const clickMouse = new THREE.Vector2(); // 創建滑鼠點擊位置向量
const vector3 = new THREE.Vector3(); // 創建通用三維向量
let deformDistance = 0.1; // 變形強度，可由滑動條控制
let initialClickPoint: THREE.Vector3 | null = null; // 初始點擊位置
let initialGeometry: THREE.BufferGeometry | null = null; // 初始幾何體
let targetMesh: THREE.Mesh | null = null; // 目標網格
let deformationNormal: THREE.Vector3 | null = null; // 變形法向量

/**
 * 形變網格的函式
 * @param point 點擊位置
 * @param mesh 目標網格
 * @param normal 變形法向量
 * @param deformDist 變形強度
 * @param radius 變形影響半徑
 */
function deformMesh(point: THREE.Vector3, mesh: THREE.Mesh, normal: THREE.Vector3, deformDist: number, radius: number) {
  const geometry = mesh.geometry as THREE.BufferGeometry;
  const position = geometry.attributes.position;
  const initialPosition = (initialGeometry as THREE.BufferGeometry).attributes.position;
  const posArray = position.array as Float32Array;
  const initPosArray = initialPosition.array as Float32Array;
  const vector3World = new THREE.Vector3();

  // 遍歷所有頂點
  for (let i = 0; i < position.count; i++) {
    const ix = i * 3;
    const iy = ix + 1;
    const iz = ix + 2;

    // 設置當前頂點位置
    vector3.set(
      initPosArray[ix],
      initPosArray[iy],
      initPosArray[iz]
    );

    // 將頂點轉換到世界坐標系
    vector3World.copy(vector3).applyMatrix4(mesh.matrixWorld);

    // 計算頂點到點擊位置的距離
    const dist = point.distanceTo(vector3World);

    // 如果距離在影響半徑內，進行變形
    if (dist < radius) {
      const influence = (1 - (dist / radius)) * deformDist;
      
      // 沿法向量方向應用變形
      posArray[ix] = initPosArray[ix] + normal.x * influence;
      posArray[iy] = initPosArray[iy] + normal.y * influence;
      posArray[iz] = initPosArray[iz] + normal.z * influence;
    }
  }

  // 重新計算頂點法線並更新幾何體
  geometry.computeVertexNormals();
  position.needsUpdate = true;
}

/**
 * 形變網格計算的主函式
 * @param raycaster Three.js的射線投射器
 * @param scene 場景
 * @param camera 相機
 * @param radius 變形影響半徑
 */
export function elevate(raycaster: THREE.Raycaster, scene: THREE.Scene, camera: THREE.PerspectiveCamera, radius: number) {
  return function (event: MouseEvent) {
    // 計算滑鼠在標準化設備坐標中的位置
    clickMouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    clickMouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    // 設置射線投射器
    raycaster.setFromCamera(clickMouse, camera);

    // 進行射線投射並獲取相交物體
    const found = raycaster.intersectObjects(scene.children);

    // 如果有相交物體且為網格
    if (found.length > 0 && (found[0].object as THREE.Mesh).geometry) {
      targetMesh = found[0].object as THREE.Mesh;
      initialGeometry = (targetMesh.geometry as THREE.BufferGeometry).clone();
      initialClickPoint = found[0].point.clone();
      deformationNormal = found[0].face?.normal ? found[0].face.normal.clone() : null;

      if (deformationNormal) {
        // 將法向量轉換到世界坐標系
        deformationNormal.applyMatrix3(new THREE.Matrix3().getNormalMatrix(targetMesh.matrixWorld));
        
        // 執行變形
        deformMesh(initialClickPoint, targetMesh, deformationNormal, deformDistance, radius);
      }
    }
  };
}

// 獲取滑動條元素
const slider = document.getElementById('distance-slider');

// 如果滑動條存在，添加事件監聽器
if (slider) {
  slider.addEventListener('input', (event) => {
    // 獲取滑動條的值並轉換為變形強度
    const value = (event.target as HTMLInputElement).value;
    deformDistance = parseFloat(value) / 100; // 適當縮放滑動條的值

    // 如果所有必要的變形參數都存在，重新應用變形
    if (initialClickPoint && targetMesh && deformationNormal) {
      // 重置為初始幾何體
      targetMesh.geometry.copy(initialGeometry as THREE.BufferGeometry);
      
      // 重新應用變形
      deformMesh(initialClickPoint, targetMesh, deformationNormal, deformDistance, radius);
    }
  });
}


