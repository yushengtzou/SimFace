import * as THREE from 'three';

// 宣告並初始化相關變數

const clickMouse = new THREE.Vector2(); // create once 
const vector3 = new THREE.Vector3(); // create once 

let MAX_CLICK_DISTANCE = 0.5; // 固定的影響範圍半徑 
let deformDistance = 0.1; // 滑動條控制的變形距離 

let initialClickPoint: THREE.Vector3 | null = null;
let initialGeometry: THREE.BufferGeometry | null = null;
let targetMesh: THREE.Mesh | null = null;
let deformationNormal: THREE.Vector3 | null = null; // 儲存鼠標點擊位置的法向量 

// 形變網格的函式
function deformMesh(point: THREE.Vector3, mesh: THREE.Mesh, normal: THREE.Vector3, deformDist: number) {

  const geometry = mesh.geometry as THREE.BufferGeometry;
  const position = geometry.attributes.position;
  const initialPosition = (initialGeometry as THREE.BufferGeometry).attributes.position;

  const posArray = position.array;
  const initPosArray = initialPosition.array;
  const vector3World = new THREE.Vector3();

  for (let i = 0; i < position.count; i++) {
    const ix = i * 3;
    const iy = ix + 1;
    const iz = ix + 2;

    vector3.set(
      initPosArray[ix],
      initPosArray[iy],
      initPosArray[iz]
    );

    // Use local to world transformation only once per vertex
    vector3World.copy(vector3).applyMatrix4(mesh.matrixWorld);
    const dist = point.distanceTo(vector3World);

    if (dist < MAX_CLICK_DISTANCE) {
        const influence = (1 - (dist / MAX_CLICK_DISTANCE)) * deformDist;
        // Apply deformation along the normal direction
        posArray[ix] = initPosArray[ix] + normal.x * influence;
        posArray[iy] = initPosArray[iy] + normal.y * influence;
        posArray[iz] = initPosArray[iz] + normal.z * influence;
    }
  }

  geometry.computeVertexNormals();
  position.needsUpdate = true;
}

// 形變網目計算的函式
export function elevate(raycaster: THREE.Raycaster, scene: THREE.Scene, camera: THREE.PerspectiveCamera) {

  return function (event: MouseEvent) {
    clickMouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    clickMouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(clickMouse, camera); // THREE 射線投射器
    const found = raycaster.intersectObjects(scene.children);

    if (found.length > 0 && (found[0].object as THREE.Mesh).geometry) {
      targetMesh = found[0].object as THREE.Mesh;
      initialGeometry = (targetMesh.geometry as THREE.BufferGeometry).clone();
      initialClickPoint = found[0].point.clone();
      deformationNormal = found[0].face?.normal ? found[0].face.normal.clone() : null;

      if (deformationNormal) {
        // Transform the normal to world space
        deformationNormal.applyMatrix3(new THREE.Matrix3().getNormalMatrix(targetMesh.matrixWorld));
        deformMesh(initialClickPoint, targetMesh, deformationNormal, deformDistance);
      }
    }
  };
}

// 更新 deformDistance 的值來形變網目
const slider = document.getElementById('distance-slider');
if (slider) {
    slider.addEventListener('input', (event) => {
        const value = (event.target as HTMLInputElement).value;
        deformDistance = parseFloat(value) / 100; // Scale the slider value appropriately

        if (initialClickPoint && targetMesh && deformationNormal) {
            targetMesh.geometry.copy(initialGeometry as THREE.BufferGeometry); // Reset to initial geometry
            deformMesh(initialClickPoint, targetMesh, deformationNormal, deformDistance);
        }
    });
}

