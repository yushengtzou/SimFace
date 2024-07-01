import * as THREE from 'three';

const clickMouse = new THREE.Vector2(); // create once
const vector3 = new THREE.Vector3(); // create once
let MAX_CLICK_DISTANCE = 0.5; // 固定的影響範圍半徑
let deformDistance = 0.1; // 滑動條控制的變形距離
let initialClickPoint: THREE.Vector3 | null = null;
let initialGeometry: THREE.BufferGeometry | null = null;
let targetMesh: THREE.Mesh | null = null;
let deformationNormal: THREE.Vector3 | null = null; // Store the normal at the deformation point

// Function to deform the mesh based on the current slider value
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

// 鼠標點擊於模型上，頂點 Z 座標位置改變
export function elevate(raycaster: THREE.Raycaster, scene: THREE.Scene, camera: THREE.PerspectiveCamera) {
    return function (event: MouseEvent) {
        // THREE 射線投射器
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
            deformationNormal = found[0].face?.normal ? found[0].face.normal.clone() : null;

            if (deformationNormal) {
                // Transform the normal to world space
                deformationNormal.applyMatrix3(new THREE.Matrix3().getNormalMatrix(targetMesh.matrixWorld));
                deformMesh(initialClickPoint, targetMesh, deformationNormal, deformDistance);
            }
        }
    };
}

// Add an event listener to the slider to update deformDistance and deform the mesh
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



// import * as THREE from 'three';

// const clickMouse = new THREE.Vector2(); // create once
// const vector3 = new THREE.Vector3(); // create once
// let MAX_CLICK_DISTANCE = 0.1; // 最大點擊距離
// let initialClickPoint: THREE.Vector3 | null = null;
// let initialGeometry: THREE.BufferGeometry | null = null;
// let targetMesh: THREE.Mesh | null = null;
// let deformationNormal: THREE.Vector3 | null = null; // Store the normal at the deformation point

// // Function to deform the mesh based on the current slider value
// function deformMesh(point: THREE.Vector3, mesh: THREE.Mesh, distance: number, normal: THREE.Vector3) {
//     const geometry = mesh.geometry as THREE.BufferGeometry;
//     const position = geometry.attributes.position;
//     const initialPosition = (initialGeometry as THREE.BufferGeometry).attributes.position;

//     const posArray = position.array;
//     const initPosArray = initialPosition.array;
//     const vector3World = new THREE.Vector3();

//     for (let i = 0; i < position.count; i++) {
//         const ix = i * 3;
//         const iy = ix + 1;
//         const iz = ix + 2;

//         vector3.set(
//             initPosArray[ix],
//             initPosArray[iy],
//             initPosArray[iz]
//         );

//         // Use local to world transformation only once per vertex
//         vector3World.copy(vector3).applyMatrix4(mesh.matrixWorld);
//         const dist = point.distanceTo(vector3World);

//         if (dist < distance) {
//             // Apply deformation along the normal direction
//             posArray[ix] += normal.x * (distance - dist);
//             posArray[iy] += normal.y * (distance - dist);
//             posArray[iz] += normal.z * (distance - dist);
//         }
//     }

//     geometry.computeVertexNormals();
//     position.needsUpdate = true;
// }

// // 鼠標點擊於模型上，頂點 Z 座標位置改變
// export function elevate(raycaster: THREE.Raycaster, scene: THREE.Scene, camera: THREE.PerspectiveCamera) {
//     return function (event: MouseEvent) {
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

//             targetMesh = found[0].object as THREE.Mesh;
//             initialGeometry = (targetMesh.geometry as THREE.BufferGeometry).clone();
//             initialClickPoint = found[0].point.clone();
//             deformationNormal = found[0].face?.normal ? found[0].face.normal.clone() : null;

//             if (deformationNormal) {
//                 // Transform the normal to world space
//                 deformationNormal.applyMatrix3(new THREE.Matrix3().getNormalMatrix(targetMesh.matrixWorld));
//                 deformMesh(initialClickPoint, targetMesh, MAX_CLICK_DISTANCE, deformationNormal);
//             }
//         }
//     };
// }

// // Add an event listener to the slider to update MAX_CLICK_DISTANCE and deform the mesh
// const slider = document.getElementById('distance-slider');
// if (slider) {
//     slider.addEventListener('input', (event) => {
//         const value = (event.target as HTMLInputElement).value;
//         MAX_CLICK_DISTANCE = parseFloat(value) / 100; // Scale the slider value appropriately

//         if (initialClickPoint && targetMesh && deformationNormal) {
//             targetMesh.geometry.copy(initialGeometry as THREE.BufferGeometry); // Reset to initial geometry
//             deformMesh(initialClickPoint, targetMesh, MAX_CLICK_DISTANCE, deformationNormal);
//         }
//     });
// }

