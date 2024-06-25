import * as THREE from 'three';
import { Line2 } from 'three/examples/jsm/lines/Line2.js';
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial.js';
import { LineGeometry } from 'three/examples/jsm/lines/LineGeometry.js';
import { kdTree } from 'kd-tree-javascript';


let navbarHeight: number = 0;

interface KdTree<T> {
    root: Node<T> | null;
    countNodes: () => number;
    unorderedTraversal: () => T[];
    isBalanced: () => boolean;
    isValid: () => boolean;
}


interface Node<T> {
    obj: T;
    left: Node<T> | null;
    right: Node<T> | null;
    parent: Node<T> | null;
    dimension: number;
}


// 鼠標點擊，標記點於模型上
export function onMouseClick(event: MouseEvent, scene: THREE.Scene, camera: THREE.PerspectiveCamera, raycaster: THREE.Raycaster, markedPoints: THREE.Vector3[]) {
    const mouse = new THREE.Vector2();
    const navbar = document.querySelector('nav');
    // let navbarHeight = 44;
    
    console.log("onMouseClick() being called");

    // if (navbar) {
    //     navbarHeight = navbar.offsetHeight;
    //     console.log("Navbar height:", navbarHeight);
    // } else {
    //     console.error('Navbar element not found');
    // }

    // Subtract navbarHeight from clientY to get correct position relative to the canvas
    console.log("event.clientY: ", event.clientY);
    // const adjustedClientY = event.clientY - navbarHeight;
    // console.log("adjustedClientY: ", adjustedClientY);

    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    console.log("Mouse coordinates:", mouse.x, mouse.y);

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(scene.children, true);

    if (intersects.length > 0) {
        const intersect = intersects[0];
        markedPoints.push(intersect.point);

        console.log("Intersection point:", intersect.point);

        const sphere = new THREE.SphereGeometry(0.02, 32, 32);
        const material = new THREE.MeshBasicMaterial({ color: 0x3399FF });
        const marker = new THREE.Mesh(sphere, material);
        marker.position.copy(intersect.point);
        scene.add(marker);
    } else {
        console.log("No intersections found.");
    }
}


// 曲線擬合
export function createCurve(points: THREE.Vector3[], scene: THREE.Scene, colors: THREE.Color ): THREE.Vector3[] {
    const curve = new THREE.CatmullRomCurve3(points, true);
    const pointsOnCurve = curve.getPoints(50);

    const positions = new Float32Array(pointsOnCurve.length * 3);
    for (let i = 0; i < pointsOnCurve.length; i++) {
        positions[i * 3] = pointsOnCurve[i].x;
        positions[i * 3 + 1] = pointsOnCurve[i].y;
        positions[i * 3 + 2] = pointsOnCurve[i].z;
    }

    const geometry = new LineGeometry();
    geometry.setPositions(positions);

    const material = new LineMaterial({
        color: colors,
        linewidth: 3,
    });
    material.resolution.set(window.innerWidth, window.innerHeight);

    const line = new Line2(geometry, material);
    scene.add(line);

    return pointsOnCurve;
}



// Extract Vertices: The getVerticesFromGeometry function extracts vertices from BufferGeometry
function getVerticesFromGeometry(geometry: THREE.BufferGeometry): THREE.Vector3[] {
    const vertices: THREE.Vector3[] = [];
    const positionAttribute = geometry.getAttribute('position') as THREE.BufferAttribute;
    
    for (let i = 0; i < positionAttribute.count; i++) {
        const vertex = new THREE.Vector3();
        vertex.fromBufferAttribute(positionAttribute, i);
        vertices.push(vertex);
    }
    return vertices;
}


// Find Closest Vertex: The findClosestVertex function finds the closest vertex to a given point.
// function findClosestVertex(point: THREE.Vector3, vertices: THREE.Vector3[]): THREE.Vector3 {
//     let closestVertex = vertices[0];
//     let minDistance = point.distanceTo(vertices[0]);

//     for (const vertex of vertices) {
//         const distance = point.distanceTo(vertex);
//         if (distance < minDistance) {
//             minDistance = distance;
//             closestVertex = vertex;
//         }
//     }
//     return closestVertex;
// }


// Find Closest Vertices for Curve: The findClosestVerticesOnMesh function iterates over each point on the drawn curve and finds the closest vertex on the mesh.
// export function findClosestVerticesOnMesh(curvePoints: THREE.Vector3[], meshGeometry: THREE.BufferGeometry): THREE.Vector3[] {
//     console.log("findClosestVerticesOnMesh() being called");

//     const meshVertices = getVerticesFromGeometry(meshGeometry);
//     console.log('Mesh vertices:', meshVertices);

//     const closestVertices: THREE.Vector3[] = [];

    // for (const point of curvePoints) {
    //     const closestVertex = findClosestVertex(point, meshVertices);
    //     closestVertices.push(closestVertex);
    // }
//     return closestVertices;
// }


// Helper function to compare points with a tolerance
function arePointsEqual(p1: THREE.Vector3, p2: THREE.Vector3, tolerance: number = 1e-6): boolean {
    return Math.abs(p1.x - p2.x) < tolerance &&
        Math.abs(p1.y - p2.y) < tolerance &&
        Math.abs(p1.z - p2.z) < tolerance;
}


// Function to check if a point is in the mesh vertices
function isPointInMeshVertices(point: THREE.Vector3, meshVertices: THREE.Vector3[]): boolean {
    return meshVertices.some(vertex => arePointsEqual(point, vertex));
}


// 用 K-D Tree 儲存網目頂點資料，以搜尋最近的頂點
export function findClosestVertices(curvePoints: THREE.Vector3[], meshGeometry: THREE.BufferGeometry): THREE.Vector3[] {
    console.log("findClosestVertices() being called");

    const meshVertices = getVerticesFromGeometry(meshGeometry);
    console.log('Mesh vertices:', meshVertices);
    
    // Convert vertices to an array of points
    const points = meshVertices.map(v => [v.x, v.y, v.z]);

    // Distance function for KD-Tree
    function distance(a: number[], b: number[]) {
        return Math.pow(a[0] - b[0], 2) + Math.pow(a[1] - b[1], 2) + Math.pow(a[2] - b[2], 2);
    }

    // Create the KD-Tree
    const kdTreeInstance = new kdTree(points, distance, [0, 1, 2]);
    console.log(kdTreeInstance);


    if (kdTreeInstance.root) {
        console.log('KDTree is built properly. Root exists.');
        console.log(kdTreeInstance.root);
    } else {
        console.error('KDTree is not built properly. Root does not exist.');
    }

    // Find the closest vertices
    const closestVertices = curvePoints.map(point => {
        const nearest = kdTreeInstance.nearest([point.x, point.y, point.z], 1)[0][0];
        const nearestVector = new THREE.Vector3(nearest[0], nearest[1], nearest[2]);

        if (isPointInMeshVertices(nearestVector, meshVertices)) {
            console.log('Found point is in mesh vertices:', nearestVector);
        } else {
            console.log('Found point is NOT in mesh vertices:', nearestVector);
        }

        return nearestVector;
    });


    return closestVertices;
}


// Helper function to extract face centroids from BufferGeometry
function getFaceCentroidsFromGeometry(geometry: THREE.BufferGeometry): THREE.Vector3[] {
    const centroids: THREE.Vector3[] = [];
    const positionAttribute = geometry.getAttribute('position');

    for (let i = 0; i < positionAttribute.count; i += 3) {
        const v0 = new THREE.Vector3(
            positionAttribute.getX(i),
            positionAttribute.getY(i),
            positionAttribute.getZ(i)
        );
        const v1 = new THREE.Vector3(
            positionAttribute.getX(i + 1),
            positionAttribute.getY(i + 1),
            positionAttribute.getZ(i + 1)
        );
        const v2 = new THREE.Vector3(
            positionAttribute.getX(i + 2),
            positionAttribute.getY(i + 2),
            positionAttribute.getZ(i + 2)
        );

        const centroid = new THREE.Vector3()
            .add(v0)
            .add(v1)
            .add(v2)
            .divideScalar(3);

        centroids.push(centroid);
    }

    return centroids;
}


// Main function to find closest faces
export function findClosestFaces(curvePoints: THREE.Vector3[], meshGeometry: THREE.BufferGeometry | null): number[] {
    if (!meshGeometry) {
        console.error('meshGeometry is null');
        return [];
    }

    console.log("findClosestFaces() being called");

    const faceCentroids = getFaceCentroidsFromGeometry(meshGeometry);
    console.log('Face centroids:', faceCentroids);

    // Convert centroids to an array of points for KD-Tree
    const points = faceCentroids.map(c => [c.x, c.y, c.z]);

    // Distance function for KD-Tree
    function distance(a: number[], b: number[]) {
        return Math.pow(a[0] - b[0], 2) + Math.pow(a[1] - b[1], 2) + Math.pow(a[2] - b[2], 2);
    }

    // Create the KD-Tree
    const kdTreeInstance = new kdTree(points, distance, [0, 1, 2]);
    console.log(kdTreeInstance);

    if (kdTreeInstance.root) {
        console.log('KDTree is built properly. Root exists.');
        console.log(kdTreeInstance.root);
    } else {
        console.error('KDTree is not built properly. Root does not exist.');
    }

    // Find the closest faces
    const closestFaceIndices: number[] = curvePoints.map(point => {
        const nearest = kdTreeInstance.nearest([point.x, point.y, point.z], 1)[0][0];
        const nearestVector = new THREE.Vector3(nearest[0], nearest[1], nearest[2]);

        // Find the face index that has this centroid
        for (let i = 0; i < faceCentroids.length; i++) {
            if (faceCentroids[i].equals(nearestVector)) {
                return Math.floor(i / 3);
            }
        }
        return -1; // Return -1 if no matching face is found (should not happen)
    }).filter(index => index !== -1); // Filter out invalid indices

    return closestFaceIndices;
}


