import * as THREE from 'three';
// 宣告變數並定義變數型別
const clickMouse = new THREE.Vector2(); // create once
const vector3 = new THREE.Vector3(); // create once
let MAX_CLICK_DISTANCE = 0.5; // 固定的影響範圍半徑
let deformDistance = 0.1; // 滑動條控制的變形距離
let initialClickPoint = null;
let initialGeometry = null;
let targetMesh = null;
let deformationNormal = null; // 儲存鼠標點擊位置的法向量
// 依據滑桿值來形變網目的函式
function deformMesh(point, mesh, normal, deformDist) {
    const geometry = mesh.geometry;
    const position = geometry.attributes.position;
    const initialPosition = initialGeometry.attributes.position;
    const posArray = position.array;
    const initPosArray = initialPosition.array;
    const vector3World = new THREE.Vector3();
    for (let i = 0; i < position.count; i++) {
        const ix = i * 3;
        const iy = ix + 1;
        const iz = ix + 2;
        vector3.set(initPosArray[ix], initPosArray[iy], initPosArray[iz]);
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
export function elevate(raycaster, scene, camera) {
    return function (event) {
        var _a;
        // THREE 射線投射器
        clickMouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        clickMouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
        raycaster.setFromCamera(clickMouse, camera);
        const found = raycaster.intersectObjects(scene.children);
        if (found.length > 0 && found[0].object.geometry) {
            const panel = document.getElementById('panel');
            if (panel) {
                panel.classList.remove('hidden');
                panel.classList.add('flex');
            }
            targetMesh = found[0].object;
            initialGeometry = targetMesh.geometry.clone();
            initialClickPoint = found[0].point.clone();
            deformationNormal = ((_a = found[0].face) === null || _a === void 0 ? void 0 : _a.normal) ? found[0].face.normal.clone() : null;
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
        const value = event.target.value;
        deformDistance = parseFloat(value) / 100; // Scale the slider value appropriately
        if (initialClickPoint && targetMesh && deformationNormal) {
            targetMesh.geometry.copy(initialGeometry); // Reset to initial geometry
            deformMesh(initialClickPoint, targetMesh, deformationNormal, deformDistance);
        }
    });
}
