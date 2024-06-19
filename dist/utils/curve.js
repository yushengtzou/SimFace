import * as THREE from 'three';
import { Line2 } from 'three/examples/jsm/lines/Line2.js';
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial.js';
import { LineGeometry } from 'three/examples/jsm/lines/LineGeometry.js';
export function onMouseClick(event, scene, camera, raycaster, markedPoints) {
    const mouse = new THREE.Vector2();
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(scene.children, true);
    if (intersects.length > 0) {
        const intersect = intersects[0];
        markedPoints.push(intersect.point);
        const sphere = new THREE.SphereGeometry(0.02, 32, 32);
        const material = new THREE.MeshBasicMaterial({ color: 0x3399FF });
        const marker = new THREE.Mesh(sphere, material);
        marker.position.copy(intersect.point);
        scene.add(marker);
    }
}
export function createCurve(points, scene) {
    const curve = new THREE.CatmullRomCurve3(points, true);
    const pointsOnCurve = curve.getPoints(10000);
    const positions = new Float32Array(pointsOnCurve.length * 3);
    for (let i = 0; i < pointsOnCurve.length; i++) {
        positions[i * 3] = pointsOnCurve[i].x;
        positions[i * 3 + 1] = pointsOnCurve[i].y;
        positions[i * 3 + 2] = pointsOnCurve[i].z;
    }
    const geometry = new LineGeometry();
    geometry.setPositions(positions);
    const material = new LineMaterial({
        color: 0x3399FF,
        linewidth: 3,
    });
    material.resolution.set(window.innerWidth, window.innerHeight);
    const line = new Line2(geometry, material);
    scene.add(line);
    return pointsOnCurve;
}
// Extract Vertices: The getVerticesFromGeometry function extracts vertices from BufferGeometry
function getVerticesFromGeometry(geometry) {
    const vertices = [];
    const positionAttribute = geometry.getAttribute('position');
    for (let i = 0; i < positionAttribute.count; i++) {
        const vertex = new THREE.Vector3();
        vertex.fromBufferAttribute(positionAttribute, i);
        vertices.push(vertex);
    }
    return vertices;
}
// Find Closest Vertex: The findClosestVertex function finds the closest vertex to a given point.
function findClosestVertex(point, vertices) {
    let closestVertex = vertices[0];
    let minDistance = point.distanceTo(vertices[0]);
    for (const vertex of vertices) {
        const distance = point.distanceTo(vertex);
        if (distance < minDistance) {
            minDistance = distance;
            closestVertex = vertex;
        }
    }
    return closestVertex;
}
// Find Closest Vertices for Curve: The findClosestVerticesOnMesh function iterates over each point on the drawn curve and finds the closest vertex on the mesh.
export function findClosestVerticesOnMesh(curvePoints, meshGeometry) {
    console.log("findClosestVerticesOnMesh() being called");
    const meshVertices = getVerticesFromGeometry(meshGeometry);
    console.log('Mesh vertices:', meshVertices);
    const closestVertices = [];
    // for (const point of curvePoints) {
    //     const closestVertex = findClosestVertex(point, meshVertices);
    //     closestVertices.push(closestVertex);
    // }
    return closestVertices;
}
const clickMouse = new THREE.Vector2(); // create once
const vector3 = new THREE.Vector3(); // create once
const MAX_CLICK_DISTANCE = 0.1; // 最大點擊距離
export function elevate(raycaster, scene, camera) {
    return function (event) {
        // THREE 射線檢測器
        clickMouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        clickMouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
        raycaster.setFromCamera(clickMouse, camera);
        const found = raycaster.intersectObjects(scene.children);
        if (found.length > 0 && found[0].object.geometry) {
            const mesh = found[0].object;
            const geometry = mesh.geometry;
            const point = found[0].point;
            for (let i = 0; i < geometry.attributes.position.count; i++) {
                // 設置 vector3 的位置為當前頂點的位置
                vector3.setX(geometry.attributes.position.getX(i));
                vector3.setY(geometry.attributes.position.getY(i));
                vector3.setZ(geometry.attributes.position.getZ(i));
                // 將頂點位置轉換為世界座標
                const toWorld = mesh.localToWorld(vector3);
                // 計算點與頂點之間的距離
                const distance = point.distanceTo(toWorld);
                // 如果距離小於最大點擊距離，則提高頂點的 Z 座標
                if (distance < MAX_CLICK_DISTANCE) {
                    geometry.attributes.position.setZ(i, geometry.attributes.position.getZ(i) + (MAX_CLICK_DISTANCE - distance));
                }
            }
            // 重新計算頂點法線
            geometry.computeVertexNormals();
            // 標記位置屬性需要更新
            geometry.attributes.position.needsUpdate = true;
        }
    };
}
