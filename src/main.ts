import * as THREE from 'three';
import { Line2 } from 'three/examples/jsm/lines/Line2.js';
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial.js';
import { LineGeometry } from 'three/examples/jsm/lines/LineGeometry.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader.js';


// 全局變數宣告
let camera: THREE.PerspectiveCamera;
let scene: THREE.Scene;
let renderer: THREE.WebGLRenderer;
let raycaster: THREE.Raycaster;
let mouse: THREE.Vector2;
let markedPoints: THREE.Vector3[] = [];
let faceMesh: THREE.Object3D | null = null;


// onMouseClick() 函式：使用 Raycaster 標記點
function onMouseClick(event: MouseEvent) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;

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

// createCurve() 函式：進行曲線擬合
function createCurve(points: THREE.Vector3[]): THREE.Vector3[] {
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
        color: 0x3399FF,
        linewidth: 3,
    });
    material.resolution.set(window.innerWidth, window.innerHeight);

    const line = new Line2(geometry, material);
    scene.add(line);

    return pointsOnCurve;
}

// exportToOBJ() 函式：導出OBJ檔
function exportToOBJ(points: THREE.Vector3[]) {
    let objData = '';
    points.forEach((point, idx) => {
        objData += `v ${point.x} ${point.y} ${point.z}\n`;
        if (idx > 0) {
            objData += `l ${idx} ${idx + 1}\n`;
        }
    });

    objData += `l ${points.length} 1\n`;

    const blob = new Blob([objData], { type: 'text/plain' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'cheek_surface.obj';
    link.click();
}

// projectCurveToSurface() 函式：將曲線投影到3D面上
function projectCurveToSurface(curvePoints: THREE.Vector3[], surfaceMesh: THREE.Object3D): THREE.Vector3[] {
    const projectedPoints: THREE.Vector3[] = [];

    curvePoints.forEach(point => {
        const localPoint = point.clone();
        (surfaceMesh as THREE.Mesh).worldToLocal(localPoint);
        projectedPoints.push(localPoint);
    });

    return projectedPoints;
}

// Helper class for Point
class Point {
    x: number;
    y: number;
    z: number;

    constructor(x: number, y: number, z: number = 0) {
        this.x = x;
        this.y = y;
        this.z = z;
    }
}

// Helper function to determine if a 3D point is inside the polygon projected onto a 2D plane
function point_in_polygon(point: Point, polygon: Point[]): boolean {
    const num_vertices = polygon.length;
    const x = point.x;
    const y = point.y;
    let inside = false;

    let p1 = polygon[0];
    let p2;

    for (let i = 1; i <= num_vertices; i++) {
        p2 = polygon[i % num_vertices];

        if (y > Math.min(p1.y, p2.y)) {
            if (y <= Math.max(p1.y, p2.y)) {
                if (x <= Math.max(p1.x, p2.x)) {
                    const x_intersection = ((y - p1.y) * (p2.x - p1.x)) / (p2.y - p1.y) + p1.x;

                    if (p1.x === p2.x || x <= x_intersection) {
                        inside = !inside;
                    }
                }
            }
        }

        p1 = p2;
    }

    return inside;
}

// selectCheekSurface 函式：
function selectCheekSurface(projectedPoints: THREE.Vector3[], surfaceMesh: THREE.Mesh): THREE.Mesh | null {
    if (!surfaceMesh || !surfaceMesh.geometry) {
        console.error("surfaceMesh 或其 geometry 屬性未正確初始化");
        return null;
    }

    const polygon2D = projectedPoints.map(p => new Point(p.x, p.y));

    const cheekGeometry = new THREE.BufferGeometry();
    const vertices: number[] = [];
    const indices: number[] = [];

    const position = surfaceMesh.geometry.attributes.position;
    const faces = (surfaceMesh.geometry.index as THREE.BufferAttribute).array;
    const numFaces = faces.length / 3;

    for (let i = 0; i < numFaces; i++) {
        const a = faces[i * 3];
        const b = faces[i * 3 + 1];
        const c = faces[i * 3 + 2];

        const vA = new THREE.Vector3().fromBufferAttribute(position, a);
        const vB = new THREE.Vector3().fromBufferAttribute(position, b);
        const vC = new THREE.Vector3().fromBufferAttribute(position, c);

        const pointA2D = new Point(vA.x, vA.y);
        const pointB2D = new Point(vB.x, vB.y);
        const pointC2D = new Point(vC.x, vC.y);

        if (point_in_polygon(pointA2D, polygon2D) && point_in_polygon(pointB2D, polygon2D) && point_in_polygon(pointC2D, polygon2D)) {
            const indexOffset = vertices.length / 3;
            vertices.push(vA.x, vA.y, vA.z);
            vertices.push(vB.x, vB.y, vB.z);
            vertices.push(vC.x, vC.y, vC.z);
            indices.push(indexOffset, indexOffset + 1, indexOffset + 2);
        }
    }

    cheekGeometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    cheekGeometry.setIndex(indices);

    const material = new THREE.MeshBasicMaterial({ color: 0xADD8E6, side: THREE.DoubleSide });
    const cheekMesh = new THREE.Mesh(cheekGeometry, material);

    scene.add(cheekMesh);

    return cheekMesh;
}

function main() {
    raycaster = new THREE.Raycaster();
    mouse = new THREE.Vector2();

    const canvas = document.querySelector('#c') as HTMLCanvasElement;
    renderer = new THREE.WebGLRenderer({ antialias: true, canvas });
    camera = new THREE.PerspectiveCamera(45, 2, 0.1, 100);
    camera.position.set(0, 8, 10);

    const controls = new OrbitControls(camera, canvas);
    controls.target.set(0, 5, 0);
    controls.update();

    scene = new THREE.Scene();
    scene.background = new THREE.Color('white');

    const planeSize = 40;
    const loader = new THREE.TextureLoader();
    const texture = loader.load('https://threejs.org/manual/examples/resources/images/checker.png');
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.magFilter = THREE.NearestFilter;
    texture.repeat.set(planeSize / 2, planeSize / 2);

    const planeGeo = new THREE.PlaneGeometry(planeSize, planeSize);
    const planeMat = new THREE.MeshPhongMaterial({ map: texture, side: THREE.DoubleSide });
    const planeMesh = new THREE.Mesh(planeGeo, planeMat);
    planeMesh.rotation.x = Math.PI * -0.5;
    // scene.add(planeMesh);  // 如果需要顯示平面則添加

    const skyColor = 0xB1E1FF;
    const groundColor = 0xB97A20;
    const intensity = 3;
    const hemiLight = new THREE.HemisphereLight(skyColor, groundColor, intensity);
    scene.add(hemiLight);

    const dirLight = new THREE.DirectionalLight(0xFFFFFF, intensity);
    dirLight.position.set(5, 10, 2);
    scene.add(dirLight);
    scene.add(dirLight.target);

    const ambientLight = new THREE.AmbientLight(0xffffff, 6.0);
    scene.add(ambientLight);

    const mtlLoader = new MTLLoader();
    mtlLoader.load('.././model/lulu/texturedMesh.mtl', (mtl) => {
        mtl.preload();
        const objLoader = new OBJLoader();
        objLoader.setMaterials(mtl);
        objLoader.load('.././model/lulu/texturedMesh.obj', (loadedRoot) => {
            faceMesh = loadedRoot;
            faceMesh.position.set(0, 5.5, 12);
            faceMesh.scale.set(6.0, 6.0, 6.0);
            scene.add(faceMesh);

            let totalVertices = 0;
            let totalFaces = 0;
            faceMesh.traverse((child) => {
                if ((child as THREE.Mesh).isMesh && (child as THREE.Mesh).geometry) {
                    const geometry = (child as THREE.Mesh).geometry;
                    totalVertices += geometry.attributes.position ? geometry.attributes.position.count : 0;
                    if (geometry.index) {
                        totalFaces += geometry.index.count / 3;
                    } else {
                        totalFaces += geometry.attributes.position.count / 3;
                    }
                }
            });

            console.log(`Total vertices: ${totalVertices}`);
            console.log(`Total faces: ${totalFaces}`);
        });
    });

    function resizeRendererToDisplaySize(renderer: THREE.WebGLRenderer) {
        const canvas = renderer.domElement;
        const width = canvas.clientWidth;
        const height = canvas.clientHeight;
        const needResize = canvas.width !== width || canvas.height !== height;
        if (needResize) {
            renderer.setSize(width, height, false);
        }
        return needResize;
    }

    function render() {
        if (resizeRendererToDisplaySize(renderer)) {
            const canvas = renderer.domElement;
            camera.aspect = canvas.clientWidth / canvas.clientHeight;
            camera.updateProjectionMatrix();
        }
        renderer.render(scene, camera);
        requestAnimationFrame(render);
    }
    requestAnimationFrame(render);

    window.addEventListener('click', onMouseClick);

    const button = document.getElementById('fit-curve') as HTMLButtonElement;
    button.addEventListener('click', () => {
        if (markedPoints.length > 0) {
            const fittedCurvePoints = createCurve(markedPoints);
            if (faceMesh) {
                const projectedPoints = projectCurveToSurface(fittedCurvePoints, faceMesh as THREE.Mesh);
                selectCheekSurface(projectedPoints, faceMesh as THREE.Mesh);
            }
            exportToOBJ(fittedCurvePoints);
        } else {
            alert('Please mark some points first!');
        }
    });
}

main();









//
// /*
//  * =====================================================================================
//  *
//  *       Filename:  main.js
//  *
//  *    Description:  
//  *
//  *        Version:  1.0
//  *        Created:  2024/06/05 14時56分39秒
//  *       Revision:  none
//  *       Compiler:  
//  *
//  *         Author:  鄒雨笙 (), 
//  *   Organization:  A-TOP Health BIOTECH 
//  *
//  * =====================================================================================
//  */
//
//
// import * as THREE from 'three';
// import { Line2 } from 'three/examples/jsm/lines/Line2.js';
// import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial.js';
// import { LineGeometry } from 'three/examples/jsm/lines/LineGeometry.js';
// import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
// import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
// import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader.js';
//
//
// // 全局變數宣告
// let camera, scene, renderer, raycaster, mouse, markedPoints, faceMesh;
//
//
// /* =====================================================================================
//  *                                      副程式
//  * =====================================================================================
//  */
//
//
// // onMouseClick() 函式：使用 Raycaster 標記點
// function onMouseClick(event) {
//     mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
//     mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;
//
//     raycaster.setFromCamera(mouse, camera);
//     const intersects = raycaster.intersectObjects(scene.children, true);
//
//     if (intersects.length > 0) {
//         const intersect = intersects[0];
//         markedPoints.push(intersect.point);
//
//         const sphere = new THREE.SphereGeometry(0.02, 32, 32);
//         const material = new THREE.MeshBasicMaterial({ color: 0x3399FF });
//         const marker = new THREE.Mesh(sphere, material);
//         marker.position.copy(intersect.point);
//         scene.add(marker);
//     }
// }
//
//
// // createCurve() 函式：進行曲線擬合
// function createCurve(points) {
//     // 使用 CatmullRomCurve3 的 closed 参数創建閉合曲線
//     const curve = new THREE.CatmullRomCurve3(points, true);
//     const pointsOnCurve = curve.getPoints(50);
//
//     // 將點轉換為浮點數格式
//     const positions = new Float32Array(pointsOnCurve.length * 3);
//     for (let i = 0; i < pointsOnCurve.length; i++) {
//         positions[i * 3] = pointsOnCurve[i].x;
//         positions[i * 3 + 1] = pointsOnCurve[i].y;
//         positions[i * 3 + 2] = pointsOnCurve[i].z;
//     }
//
//     // 創建 LineGeometry
//     const geometry = new LineGeometry();
//     geometry.setPositions(positions);
//
//     // 創建 LineMaterial 並設置線寬
//     const material = new LineMaterial({
//         color: 0x3399FF,
//         linewidth: 3, // 設置線寬
//     });
//     material.resolution.set(window.innerWidth, window.innerHeight); // 必須設置分辨率
//
//     // 創建 Line2
//     const line = new Line2(geometry, material);
//     scene.add(line);
//
//     return pointsOnCurve;
// }
//
//
// // exportToOBJ() 函式：導出OBJ檔
// function exportToOBJ(points) {
//     let objData = '';
//     points.forEach((point, idx) => {
//         objData += `v ${point.x} ${point.y} ${point.z}\n`;
//         if (idx > 0) {
//             objData += `l ${idx} ${idx + 1}\n`;
//         }
//     });
//
//     // 添加最后一條線段使曲線閉合
//     objData += `l ${points.length} 1\n`;
//
//     const blob = new Blob([objData], { type: 'text/plain' });
//     const link = document.createElement('a');
//     link.href = URL.createObjectURL(blob);
//     link.download = 'cheek_surface.obj';
//     link.click();
// }
//
//
// // projectCurveToSurface() 函式：將曲線投影到3D面上
// function projectCurveToSurface(curvePoints, surfaceMesh) {
//     console.log("projectCurveToSurface() called");
//     const projectedPoints = [];
//
//     // 遍歷曲線上的每個點
//     curvePoints.forEach(point => {
//         // 克隆當前點以避免修改原始點
//         const localPoint = point.clone();
//         // 將世界座標轉換為局部座標
//         surfaceMesh.worldToLocal(localPoint);
//         // 將轉換後的點添加到投影點陣列中
//         projectedPoints.push(localPoint);
//     });
//
//     return projectedPoints;
// }
//
//
// // Helper class for Point
// class Point {
//     constructor(x, y, z) {
//         this.x = x;
//         this.y = y;
//         this.z = z;
//     }
// }
//
//
// // Helper function to determine if a 3D point is inside the polygon projected onto a 2D plane
// function point_in_polygon(point, polygon) {
//     const num_vertices = polygon.length;
//     const x = point.x;
//     const y = point.y;
//     let inside = false;
//
//     let p1 = polygon[0];
//     let p2;
//
//     for (let i = 1; i <= num_vertices; i++) {
//         p2 = polygon[i % num_vertices];
//
//         if (y > Math.min(p1.y, p2.y)) {
//             if (y <= Math.max(p1.y, p2.y)) {
//                 if (x <= Math.max(p1.x, p2.x)) {
//                     const x_intersection = ((y - p1.y) * (p2.x - p1.x)) / (p2.y - p1.y) + p1.x;
//
//                     if (p1.x === p2.x || x <= x_intersection) {
//                         inside = !inside;
//                     }
//                 }
//             }
//         }
//
//         p1 = p2;
//     }
//
//     return inside;
// }
//
//
// // selectCheekSurface 函式：
// function selectCheekSurface(projectedPoints, surfaceMesh) {
//     console.log("selectCheekSurface() called");
//
//     // 檢查 surfaceMesh 是否具有幾何屬性
//     if (!surfaceMesh || !surfaceMesh.geometry) {
//         console.error("surfaceMesh 或其 geometry 屬性未正確初始化");
//         return null;
//     }
//
//     // 將投影點轉換為 2D 點
//     const polygon2D = projectedPoints.map(p => new Point(p.x, p.y));
//
//     // 創建一個空的臉頰幾何體
//     const cheekGeometry = new THREE.BufferGeometry();
//     const vertices = [];
//     const indices = [];
//
//     // 獲取 surfaceMesh 幾何體的位置屬性
//     const position = surfaceMesh.geometry.attributes.position;
//     const faces = surfaceMesh.geometry.index.array;
//     const numFaces = faces.length / 3;
//
//     // 遍歷 surfaceMesh 的每個面
//     for (let i = 0; i < numFaces; i++) {
//         const a = faces[i * 3];
//         const b = faces[i * 3 + 1];
//         const c = faces[i * 3 + 2];
//
//         const vA = new THREE.Vector3().fromBufferAttribute(position, a);
//         const vB = new THREE.Vector3().fromBufferAttribute(position, b);
//         const vC = new THREE.Vector3().fromBufferAttribute(position, c);
//
//         // 將 3D 點轉換為 2D 以進行點在多邊形內檢查
//         const pointA2D = new Point(vA.x, vA.y);
//         const pointB2D = new Point(vB.x, vB.y);
//         const pointC2D = new Point(vC.x, vC.y);
//
//         // 檢查面上的所有頂點是否在投影的多邊形內
//         if (point_in_polygon(pointA2D, polygon2D) && point_in_polygon(pointB2D, polygon2D) && point_in_polygon(pointC2D, polygon2D)) {
//             // 將頂點和索引添加到臉頰幾何體中
//             const indexOffset = vertices.length / 3;
//             vertices.push(vA.x, vA.y, vA.z);
//             vertices.push(vB.x, vB.y, vB.z);
//             vertices.push(vC.x, vC.y, vC.z);
//             indices.push(indexOffset, indexOffset + 1, indexOffset + 2);
//         }
//     }
//
//     // 設置臉頰幾何體的頂點和索引
//     cheekGeometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
//     cheekGeometry.setIndex(indices);
//
//     // 為臉頰創建材質和網格
//     const material = new THREE.MeshBasicMaterial({ color: 0xADD8E6, side: THREE.DoubleSide });
//     const cheekMesh = new THREE.Mesh(cheekGeometry, material);
//
//     // 將臉頰網格添加到場景中
//     scene.add(cheekMesh);
//
//     return cheekMesh;
// }
//
//
// /* =====================================================================================
//  *                                      主程式
//  * =====================================================================================
//  */
//
//
// function main() {
//     // 初始化全局變數
//     raycaster = new THREE.Raycaster();
//     mouse = new THREE.Vector2();
//     markedPoints = [];
//
//     const canvas = document.querySelector('#c');  
//     renderer = new THREE.WebGLRenderer({ antialias: true, canvas });  
//     camera = new THREE.PerspectiveCamera(45, 2, 0.1, 100);  
//     camera.position.set(0, 8, 10);  
//
//     // 創建控制器允許攝像機繞目標旋轉
//     const controls = new OrbitControls(camera, canvas);  
//     controls.target.set(0, 5, 0);  
//     controls.update();  
//
//     scene = new THREE.Scene();  
//     scene.background = new THREE.Color('white');  
//
//     // 創建平面並加載紋理
//     const planeSize = 40;  
//     const loader = new THREE.TextureLoader();  
//     const texture = loader.load('https://threejs.org/manual/examples/resources/images/checker.png');  
//     texture.colorSpace = THREE.SRGBColorSpace;  
//     texture.wrapS = THREE.RepeatWrapping;  
//     texture.wrapT = THREE.RepeatWrapping;  
//     texture.magFilter = THREE.NearestFilter;  
//     texture.repeat.set(planeSize / 2, planeSize / 2);  
//
//     const planeGeo = new THREE.PlaneGeometry(planeSize, planeSize);  
//     const planeMat = new THREE.MeshPhongMaterial({ map: texture, side: THREE.DoubleSide });
//     const planeMesh = new THREE.Mesh(planeGeo, planeMat);  
//     planeMesh.rotation.x = Math.PI * -0.5;  
//     // scene.add(planeMesh);  // 如果需要顯示平面則添加
//
//     // 設置環境光和方向光
//     const skyColor = 0xB1E1FF;
//     const groundColor = 0xB97A20;
//     const intensity = 3;
//     const hemiLight = new THREE.HemisphereLight(skyColor, groundColor, intensity);
//     scene.add(hemiLight);
//
//     const dirLight = new THREE.DirectionalLight(0xFFFFFF, intensity);
//     dirLight.position.set(5, 10, 2);
//     scene.add(dirLight);
//     scene.add(dirLight.target);
//
//     const ambientLight = new THREE.AmbientLight(0xffffff, 6.0);
//     scene.add(ambientLight);
//
//     // 加載和設置模型
//     const mtlLoader = new MTLLoader();
//     mtlLoader.load('.././model/lulu/texturedMesh.mtl', (mtl) => {  
//         mtl.preload();  
//         const objLoader = new OBJLoader();  
//         objLoader.setMaterials(mtl);  
//         objLoader.load('.././model/lulu/texturedMesh.obj', (loadedRoot) => {  
//             faceMesh = loadedRoot;
//             faceMesh.position.set(0, 5.5, 12);  
//             faceMesh.scale.set(6.0, 6.0, 6.0);  
//             scene.add(faceMesh);  
//
//             let totalVertices = 0;
//             let totalFaces = 0;
//             faceMesh.traverse((child) => {
//                 if (child.isMesh && child.geometry) {
//                     const geometry = child.geometry;
//                     totalVertices += geometry.attributes.position ? geometry.attributes.position.count : 0;
//                     if (geometry.index) {
//                         totalFaces += geometry.index.count / 3;
//                     } else {
//                         totalFaces += geometry.attributes.position.count / 3; 
//                     }
//                 }
//             });
//
//             console.log(`Total vertices: ${totalVertices}`);
//             console.log(`Total faces: ${totalFaces}`);
//         });
//     });
//
//     // 調整渲染器大小以適應顯示大小
//     function resizeRendererToDisplaySize(renderer) {
//         const canvas = renderer.domElement;
//         const width = canvas.clientWidth;
//         const height = canvas.clientHeight;
//         const needResize = canvas.width !== width || canvas.height !== height;
//         if (needResize) {
//             renderer.setSize(width, height, false);
//         }
//         return needResize;
//     }
//
//     // 渲染循環
//     function render() {
//         if (resizeRendererToDisplaySize(renderer)) {
//             const canvas = renderer.domElement;
//             camera.aspect = canvas.clientWidth / canvas.clientHeight;
//             camera.updateProjectionMatrix();
//         }
//         renderer.render(scene, camera);  
//         requestAnimationFrame(render);  
//     }
//     requestAnimationFrame(render);  
//
//     // 添加鼠標點擊事件監聽器
//     window.addEventListener('click', onMouseClick);
//
//     // 設定按鈕的觸發曲線擬和導出
//     const button = document.getElementById('fit-curve');
//     button.addEventListener('click', () => {
//         if (markedPoints.length > 0) {
//             const fittedCurvePoints = createCurve(markedPoints);
//             const projectedPoints = projectCurveToSurface(fittedCurvePoints, faceMesh);
//             selectCheekSurface(projectedPoints, faceMesh);
//             exportToOBJ(fittedCurvePoints);
//         } else {
//             alert('Please mark some points first!');
//         }
//     });
// }
//
//
// /* =====================================================================================
//  *                                      呼叫主程式
//  * =====================================================================================
// */
//
//
// main();
//
//
//
//
