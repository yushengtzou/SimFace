import * as THREE from 'three';

const clickMouse = new THREE.Vector2(); // create once
const vector3 = new THREE.Vector3(); // create once
let MAX_CLICK_DISTANCE = 0.1; // 最大點擊距離
let initialClickPoint: THREE.Vector3 | null = null;
let initialGeometry: THREE.BufferGeometry | null = null;
let targetMesh: THREE.Mesh | null = null;

// Function to deform the mesh based on the current slider value
function deformMesh(point: THREE.Vector3, mesh: THREE.Mesh, distance: number) {
    const geometry = mesh.geometry as THREE.BufferGeometry;
    const position = geometry.attributes.position;
    const initialPosition = (initialGeometry as THREE.BufferGeometry).attributes.position;

    for (let i = 0; i < position.count; i++) {
        vector3.set(
            initialPosition.getX(i),
            initialPosition.getY(i),
            initialPosition.getZ(i)
        );

        const toWorld = mesh.localToWorld(vector3.clone());
        const dist = point.distanceTo(toWorld);
        if (dist < distance) {
            position.setZ(i, initialPosition.getZ(i) + (distance - dist));
        }
    }
    geometry.computeVertexNormals();
    geometry.attributes.position.needsUpdate = true;
}

// 鼠標點擊於模型上，頂點 Z 座標位置改變
export function elevate(raycaster: THREE.Raycaster, scene: THREE.Scene, camera: THREE.PerspectiveCamera) {
    return function (event: MouseEvent) {
        // THREE 射線檢測器
        clickMouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        clickMouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
        raycaster.setFromCamera(clickMouse, camera);
        const found = raycaster.intersectObjects(scene.children);

        if (found.length > 0 && (found[0].object as THREE.Mesh).geometry) {
            const panel = document.getElementById('panel');
            if (panel) {
                panel.classList.remove('hidden');
                panel.classList.add('flex');
            }

            targetMesh = found[0].object as THREE.Mesh;
            initialGeometry = (targetMesh.geometry as THREE.BufferGeometry).clone();
            initialClickPoint = found[0].point.clone();

            deformMesh(initialClickPoint, targetMesh, MAX_CLICK_DISTANCE);
        }
    };
}

// Add an event listener to the slider to update MAX_CLICK_DISTANCE and deform the mesh
const slider = document.getElementById('distance-slider');
if (slider) {
    slider.addEventListener('input', (event) => {
        const value = (event.target as HTMLInputElement).value;
        MAX_CLICK_DISTANCE = parseFloat(value) / 100; // Scale the slider value appropriately

        if (initialClickPoint && targetMesh) {
            targetMesh.geometry.copy(initialGeometry as THREE.BufferGeometry); // Reset to initial geometry
            deformMesh(initialClickPoint, targetMesh, MAX_CLICK_DISTANCE);
        }
    });
}



// import * as THREE from 'three';

// const clickMouse = new THREE.Vector2(); // create once
// const vector3 = new THREE.Vector3(); // create once
// let MAX_CLICK_DISTANCE = 0.1; // 最大點擊距離

// // 鼠標點擊於模型上，頂點 Z 座標位置改變
// export function elevate(raycaster: THREE.Raycaster, scene: THREE.Scene, camera: THREE.PerspectiveCamera) {
//     return function (event: MouseEvent) {

//         const slider = document.getElementById('distance-slider');
//         if (slider) {
//             slider.addEventListener('input', (event) => {
//                 const value = (event.target as HTMLInputElement).value;
//                 MAX_CLICK_DISTANCE = parseFloat(value) / 100; // Scale the slider value appropriately
//             });
//         }

//         // THREE 射線檢測器
//         clickMouse.x = (event.clientX / window.innerWidth) * 2 - 1;
//         clickMouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
//         raycaster.setFromCamera(clickMouse, camera);
//         const found = raycaster.intersectObjects(scene.children);

//         if (found.length > 0 && (found[0].object as THREE.Mesh).geometry) {
//             const panel = document.getElementById('panel');
//             if (panel) {
//                 panel.classList.remove('hidden');
//                 panel.classList.add('flex');
//             }
//             const mesh = found[0].object as THREE.Mesh;
//             const geometry = mesh.geometry as THREE.BufferGeometry;
//             const point = found[0].point;
//             for (let i = 0; i < geometry.attributes.position.count; i++) {
//                 // 設置 vector3 的位置為當前頂點的位置
//                 vector3.setX(geometry.attributes.position.getX(i));
//                 vector3.setY(geometry.attributes.position.getY(i));
//                 vector3.setZ(geometry.attributes.position.getZ(i));
//                 // 將頂點位置轉換為世界座標
//                 const toWorld = mesh.localToWorld(vector3);
//                 // 計算點與頂點之間的距離
//                 const distance = point.distanceTo(toWorld);
//                 // 如果距離小於最大點擊距離，則提高頂點的 Z 座標
//                 if (distance < MAX_CLICK_DISTANCE) {
//                     geometry.attributes.position.setZ(i, geometry.attributes.position.getZ(i) + (MAX_CLICK_DISTANCE - distance));
//                 }
//             }
//             // 重新計算頂點法線
//             geometry.computeVertexNormals();
//             // 標記位置屬性需要更新
//             geometry.attributes.position.needsUpdate = true;
//         }
//     };
// }



