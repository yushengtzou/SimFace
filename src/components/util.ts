import * as THREE from 'three';

// create once
const clickMouse = new THREE.Vector2(); 

// 計算 Ray Tracing 在三維空間中兩點的歐氏距離
let onEuclideanDistance = (raycaster: THREE.Raycaster, scene: THREE.Scene, camera: THREE.PerspectiveCamera): any => {
    return function (event: MouseEvent) {
        // THREE 射線投射器
        clickMouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        clickMouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
        raycaster.setFromCamera(clickMouse, camera);
        const found = raycaster.intersectObjects(scene.children);

        if (found.length > 0 && (found[0].object as THREE.Mesh).geometry) {
            let initialClickPoint = found[0].point.clone();

        }
    }
}


// 計算 Ray Tracing 在三維空間中兩點的歐氏距離
let calculateDistance = (point1: THREE.Vector3, point2: THREE.Vector3): number => {
    let distance = point1.distanceTo(point2);

    console.log("Euclidean Distance: ", distance);

    return distance;
}

export default onEuclideanDistance;
