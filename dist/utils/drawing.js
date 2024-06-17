"use strict";
// import * as THREE from 'three';
// let isDrawing = false;
// let currentCurvePoints: any[] = [];
// let lines = []; // Array to store the line objects
// export function onMouseDown(event: MouseEvent, scene: THREE.Scene, camera: THREE.PerspectiveCamera, raycaster: THREE.Raycaster) {
//     isDrawing = true;
//     currentCurvePoints = [];
//     addPoint(event, scene, camera, raycaster);
// }
// export function onMouseMove(event: MouseEvent, scene: THREE.Scene, camera: THREE.PerspectiveCamera, raycaster: THREE.Raycaster) {
//     if (isDrawing) {
//         addPoint(event, scene, camera, raycaster);
//     }
// }
// export function onMouseUp(event: MouseEvent, scene: THREE.Scene, camera: THREE.PerspectiveCamera, raycaster: THREE.Raycaster) {
//     isDrawing = false;
//     if (currentCurvePoints.length > 1) {
//         drawCurve(currentCurvePoints, scene);
//     }
// }
// function addPoint(event: MouseEvent, scene: THREE.Scene, camera: THREE.PerspectiveCamera, raycaster: THREE.Raycaster) {
//     const mouse = new THREE.Vector2();
//     mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
//     mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;
//     raycaster.setFromCamera(mouse, camera);
//     const intersects = raycaster.intersectObjects(scene.children, true);
//     if (intersects.length > 0) {
//         const intersect = intersects[0];
//         currentCurvePoints.push(intersect.point);
//         const sphere = new THREE.SphereGeometry(0.02, 32, 32);
//         const material = new THREE.MeshBasicMaterial({ color: 0x3399FF });
//         const marker = new THREE.Mesh(sphere, material);
//         marker.position.copy(intersect.point);
//         scene.add(marker);
//         if (currentCurvePoints.length > 1) {
//             const start = currentCurvePoints[currentCurvePoints.length - 2];
//             const end = currentCurvePoints[currentCurvePoints.length - 1];
//             drawLine(start, end, scene);
//         }
//     }
// }
// function drawLine(start: THREE.Vector3, end: THREE.Vector3, scene: THREE.Scene) {
//     const material = new THREE.LineBasicMaterial({ color: 0xFF0000 });
//     const geometry = new THREE.BufferGeometry().setFromPoints([start, end]);
//     const line = new THREE.Line(geometry, material);
//     lines.push(line);
//     scene.add(line);
// }
// function drawCurve(points: THREE.Vector3[], scene: THREE.Scene) {
//     const material = new THREE.LineBasicMaterial({ color: 0xFF0000 });
//     const geometry = new THREE.BufferGeometry().setFromPoints(points);
//     const line = new THREE.Line(geometry, material);
//     lines.push(line);
//     scene.add(line);
// }
