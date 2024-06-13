import * as THREE from 'three';
import { Line2 } from 'three/examples/jsm/lines/Line2.js';
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial.js';
import { LineGeometry } from 'three/examples/jsm/lines/LineGeometry.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader.js';
import { placeCutter, activateCutter, moveCutter, deactivateCutter, Mesh, createVertex, sliceModel } from './cutter';

// 全局變數宣告

// 宣告相機物件
let camera: THREE.PerspectiveCamera;
// 宣告場景物件
let scene: THREE.Scene;
// 宣告彩現物件
let renderer: THREE.WebGLRenderer;
// 宣告光線追蹤物件
let raycaster: THREE.Raycaster;
// 宣告游標二維陣列
let mouse: THREE.Vector2;
// 宣告標記點三維陣列
let markedPoints: THREE.Vector3[] = [];
// 宣告人臉模型物件
let faceMesh: THREE.Object3D | null = null;
// 宣告切割工具
let cutter: any;
let mesh: Mesh = { faces: [], adjacencyList: new Map() }; // 初始化一個空的網格


/*
  onMouseClick() 函式介面定義
  目的：Annotation and Selection
  功能：
  - Capture user clicks to annotate points on the 3D model.
  - Store these points in an array "markedPoints".
*/
function onMouseClick(event: MouseEvent) {
    // 取得游標座標
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

        if (!cutter) {
            cutter = placeCutter(mesh, createVertex(intersect.point.x, intersect.point.y, intersect.point.z));
            activateCutter(cutter);
        } else {
            moveCutter(mesh, cutter, createVertex(intersect.point.x, intersect.point.y, intersect.point.z));
        }
    }
}


/*
  createCurve() 函式介面定義
  目的：進行曲線擬合
  功能：
  - Use a curve-fitting algorithm, CatmullRomCurve3 to create a closed curve from the annotated points 
*/
function createCurve(points: THREE.Vector3[]): THREE.Vector3[] {
    // 建立 Catmull-Rom 曲線
    const curve = new THREE.CatmullRomCurve3(points, true);
    // 取得曲線上的 50 個點
    const pointsOnCurve = curve.getPoints(50);

    // 創建包含點座標的 Float32Array
    const positions = new Float32Array(pointsOnCurve.length * 3);
    for (let i = 0; i < pointsOnCurve.length; i++) {
        positions[i * 3] = pointsOnCurve[i].x;
        positions[i * 3 + 1] = pointsOnCurve[i].y;
        positions[i * 3 + 2] = pointsOnCurve[i].z;
    }

    // 建立線條的幾何體
    const geometry = new LineGeometry();
    geometry.setPositions(positions);

    // 設置線條材質
    const material = new LineMaterial({
        color: 0x3399FF,  // 設置線條顏色
        linewidth: 3,     // 設置線條寬度
    });
    material.resolution.set(window.innerWidth, window.innerHeight);

    // 創建並添加線條到場景中
    const line = new Line2(geometry, material);
    scene.add(line);

    // 返回曲線上的點
    return pointsOnCurve;
}


// 以下函式未實作


/* 
  regionSlicing() 函式介面定義
  目的：區域切割
  功能：
  - Project the curve onto the model and segment the mesh. 
*/
function sliceModelAndSeparate(curvePoints: THREE.Vector3[]) {
    if (!faceMesh) {
        console.error('Face mesh not loaded');
        return;
    }

    const [slicedRegion, remainingModel] = sliceModel(faceMesh as THREE.Mesh, curvePoints);

    // Move sliced region away from the original model
    const offset = new THREE.Vector3(10, 0, 0);
    slicedRegion.translateX(offset.x);
    slicedRegion.translateY(offset.y);
    slicedRegion.translateZ(offset.z);

    // Add the separated regions to the scene
    scene.add(slicedRegion);
    scene.add(remainingModel);
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
                sliceModelAndSeparate(fittedCurvePoints);
            }
        } else {
            alert('Please mark some points first!');
        }
    });
}

main();



// import * as THREE from 'three';
// import { Line2 } from 'three/examples/jsm/lines/Line2.js';
// import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial.js';
// import { LineGeometry } from 'three/examples/jsm/lines/LineGeometry.js';
// import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
// import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
// import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader.js';
// import { placeCutter, activateCutter, moveCutter, deactivateCutter, Mesh, createVertex, sliceModel } from './cutter';
//
//
// // 全局變數宣告
//
//
// // 宣告相機物件
// let camera: THREE.PerspectiveCamera;
// // 宣告場景物件
// let scene: THREE.Scene;
// // 宣告彩現物件
// let renderer: THREE.WebGLRenderer;
// // 宣告光線追蹤物件
// let raycaster: THREE.Raycaster;
// // 宣告游標二維陣列
// let mouse: THREE.Vector2;
// // 宣告標記點三維陣列
// let markedPoints: THREE.Vector3[] = [];
// // 宣告人臉模型物件
// let faceMesh: THREE.Object3D | null = null;
// // 宣告切割工具
// let cutter: any;
// let mesh: Mesh = { faces: [], adjacencyList: new Map() }; // 初始化一個空的網格
//
//
// /*
//   onMouseClick() 函式介面定義
//   目的：Annotation and Selection
//   功能：
//   - Capture user clicks to annotate points on the 3D model.
//   - Store these points in an array "markedPoints".
// */
// function onMouseClick(event: MouseEvent) {
//     // 取得游標座標
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
//
//         if (!cutter) {
//             cutter = placeCutter(mesh, createVertex(intersect.point.x, intersect.point.y, intersect.point.z));
//             activateCutter(cutter);
//         } else {
//             moveCutter(mesh, cutter, createVertex(intersect.point.x, intersect.point.y, intersect.point.z));
//         }
//     }
// }
//
//
// /*
//   createCurve() 函式介面定義
//   目的：進行曲線擬合
//   功能：
//   - Use a curve-fitting algorithm, CatmullRomCurve3 to create a closed curve from the annotated points 
// */
// function createCurve(points: THREE.Vector3[]): THREE.Vector3[] {
//     // 建立 Catmull-Rom 曲線
//     const curve = new THREE.CatmullRomCurve3(points, true);
//     // 取得曲線上的 50 個點
//     const pointsOnCurve = curve.getPoints(50);
//
//     // 創建包含點座標的 Float32Array
//     const positions = new Float32Array(pointsOnCurve.length * 3);
//     for (let i = 0; i < pointsOnCurve.length; i++) {
//         positions[i * 3] = pointsOnCurve[i].x;
//         positions[i * 3 + 1] = pointsOnCurve[i].y;
//         positions[i * 3 + 2] = pointsOnCurve[i].z;
//     }
//
//     // 建立線條的幾何體
//     const geometry = new LineGeometry();
//     geometry.setPositions(positions);
//
//     // 設置線條材質
//     const material = new LineMaterial({
//         color: 0x3399FF,  // 設置線條顏色
//         linewidth: 3,     // 設置線條寬度
//     });
//     material.resolution.set(window.innerWidth, window.innerHeight);
//
//     // 創建並添加線條到場景中
//     const line = new Line2(geometry, material);
//     scene.add(line);
//
//     // 返回曲線上的點
//     return pointsOnCurve;
// }
//
//
// // 以下函式未實作
//
//
// /* 
//   regionSlicing() 函式介面定義
//   目的：區域切割
//   功能：
//   - Project the curve onto the model and segment the mesh. 
// */
// function sliceModelAndSeparate(curvePoints: THREE.Vector3[]) {
//     if (!faceMesh) {
//         console.error('Face mesh not loaded');
//         return;
//     }
//
//     const [slicedRegion, remainingModel] = sliceModel(faceMesh as THREE.Mesh, curvePoints);
//
//     // Move sliced region away from the original model
//     const offset = new THREE.Vector3(10, 0, 0);
//     slicedRegion.translate(offset.x, offset.y, offset.z);
//
//     // Add the separated regions to the scene
//     scene.add(slicedRegion);
//     scene.add(remainingModel);
// }
//
//
// function main() {
//     raycaster = new THREE.Raycaster();
//     mouse = new THREE.Vector2();
//
//     const canvas = document.querySelector('#c') as HTMLCanvasElement;
//     renderer = new THREE.WebGLRenderer({ antialias: true, canvas });
//     camera = new THREE.PerspectiveCamera(45, 2, 0.1, 100);
//     camera.position.set(0, 8, 10);
//
//     const controls = new OrbitControls(camera, canvas);
//     controls.target.set(0, 5, 0);
//     controls.update();
//
//     scene = new THREE.Scene();
//     scene.background = new THREE.Color('white');
//
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
//                 if ((child as THREE.Mesh).isMesh && (child as THREE.Mesh).geometry) {
//                     const geometry = (child as THREE.Mesh).geometry;
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
//     function resizeRendererToDisplaySize(renderer: THREE.WebGLRenderer) {
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
//     window.addEventListener('click', onMouseClick);
//
//     const button = document.getElementById('fit-curve') as HTMLButtonElement;
//     button.addEventListener('click', () => {
//         if (markedPoints.length > 0) {
//             const fittedCurvePoints = createCurve(markedPoints);
//             if (faceMesh) {
//                 sliceModelAndSeparate(fittedCurvePoints);
//             }
//         } else {
//             alert('Please mark some points first!');
//         }
//     });
// }
//
// main();
//
//
//
// // import * as THREE from 'three';
// // import { Line2 } from 'three/examples/jsm/lines/Line2.js';
// // import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial.js';
// // import { LineGeometry } from 'three/examples/jsm/lines/LineGeometry.js';
// // import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
// // import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
// // import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader.js';
// // import { placeCutter, activateCutter, moveCutter, deactivateCutter, Mesh, createVertex } from './cutter';
// //
// // // 全局變數宣告
// //
// // // 宣告相機物件
// // let camera: THREE.PerspectiveCamera;
// // // 宣告場景物件
// // let scene: THREE.Scene;
// // // 宣告彩現物件
// // let renderer: THREE.WebGLRenderer;
// // // 宣告光線追蹤物件
// // let raycaster: THREE.Raycaster;
// // // 宣告游標二維陣列
// // let mouse: THREE.Vector2;
// // // 宣告標記點三維陣列
// // let markedPoints: THREE.Vector3[] = [];
// // // 宣告人臉模型物件
// // let faceMesh: THREE.Object3D | null = null;
// // // 宣告切割工具
// // let cutter: any;
// // // 初始化一個空的網格
// // let mesh: Mesh = { faces: [], adjacencyList: new Map() }; 
// //
// //
// // /*
// //   onMouseClick() 函式介面定義
// //   目的：Annotation and Selection
// //   功能：
// //   - Capture user clicks to annotate points on the 3D model.
// //   - Store these points in an array "markedPoints".
// // */
// // function onMouseClick(event: MouseEvent) {
// //     // 取得游標座標
// //     mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
// //     mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;
// //
// //     raycaster.setFromCamera(mouse, camera);
// //     const intersects = raycaster.intersectObjects(scene.children, true);
// //
// //     if (intersects.length > 0) {
// //         const intersect = intersects[0];
// //         markedPoints.push(intersect.point);
// //
// //         const sphere = new THREE.SphereGeometry(0.02, 32, 32);
// //         const material = new THREE.MeshBasicMaterial({ color: 0x3399FF });
// //         const marker = new THREE.Mesh(sphere, material);
// //         marker.position.copy(intersect.point);
// //         scene.add(marker);
// //
// //         if (!cutter) {
// //             cutter = placeCutter(mesh, createVertex(intersect.point.x, intersect.point.y, intersect.point.z));
// //             activateCutter(cutter);
// //         } else {
// //             moveCutter(mesh, cutter, createVertex(intersect.point.x, intersect.point.y, intersect.point.z));
// //         }
// //     }
// // }
// //
// //
// // /*
// //   createCurve() 函式介面定義
// //   目的：進行曲線擬合
// //   功能：
// //   - Use a curve-fitting algorithm, CatmullRomCurve3 to create a closed curve from the annotated points 
// // */
// // function createCurve(points: THREE.Vector3[]): THREE.Vector3[] {
// //     // 建立 Catmull-Rom 曲線
// //     const curve = new THREE.CatmullRomCurve3(points, true);
// //     // 取得曲線上的 50 個點
// //     const pointsOnCurve = curve.getPoints(50);
// //
// //     // 創建包含點座標的 Float32Array
// //     const positions = new Float32Array(pointsOnCurve.length * 3);
// //     for (let i = 0; i < pointsOnCurve.length; i++) {
// //         positions[i * 3] = pointsOnCurve[i].x;
// //         positions[i * 3 + 1] = pointsOnCurve[i].y;
// //         positions[i * 3 + 2] = pointsOnCurve[i].z;
// //     }
// //
// //     // 建立線條的幾何體
// //     const geometry = new LineGeometry();
// //     geometry.setPositions(positions);
// //
// //     // 設置線條材質
// //     const material = new LineMaterial({
// //         color: 0x3399FF,  // 設置線條顏色
// //         linewidth: 3,     // 設置線條寬度
// //     });
// //     material.resolution.set(window.innerWidth, window.innerHeight);
// //
// //     // 創建並添加線條到場景中
// //     const line = new Line2(geometry, material);
// //     scene.add(line);
// //
// //     // 返回曲線上的點
// //     return pointsOnCurve;
// // }
// //
// //
// // // 以下函式未實作
// //
// //
// // /* 
// //   regionSlicing() 函式介面定義
// //   目的：區域切割
// //   功能：
// //   - Project the curve onto the model and segment the mesh. 
// // */
// // // function sliceModel(model: THREE.Mesh, curve: THREE.Curve): THREE.Mesh[] {
// // //     // Implement mesh slicing logic here
// // //     // This might involve using boolean operations or custom mesh segmentation algorithms
// // //
// // //     const slicedRegion = ...; // The region inside the closed curve
// // //     const remainingModel = ...; // The rest of the model
// // //
// // //     return [slicedRegion, remainingModel];
// // // }
// //
// //
// // /* 
// //   regionSeparator() 函式介面定義
// //   目的：Region Separation
// //   功能：
// //   - Move the sliced region away from the original model. 
// // */
// // // function regionSeparator() {
// // //     // Implement mesh separation logic here
// // //     const offset = new THREE.Vector3(10, 0, 0); // Example offset
// // //     slicedRegion.position.add(offset);
// // //
// // //
// // //     return [slicedRegion, remainingModel];
// // // }
// //
// //
// //
// //
// //
// //
// //
// //
// //
// //
// //
// //
// //
// //
// //
// //
// //
// //
// //
// //
// //
// //
// //
// //
// //
// //
// //
// //
// // // // exportToOBJ() 函式：導出OBJ檔
// // // function exportToOBJ(points: THREE.Vector3[]) {
// // //     let objData = '';
// // //     points.forEach((point, idx) => {
// // //         objData += `v ${point.x} ${point.y} ${point.z}\n`;
// // //         if (idx > 0) {
// // //             objData += `l ${idx} ${idx + 1}\n`;
// // //         }
// // //     });
// // //
// // //     objData += `l ${points.length} 1\n`;
// // //
// // //     const blob = new Blob([objData], { type: 'text/plain' });
// // //     const link = document.createElement('a');
// // //     link.href = URL.createObjectURL(blob);
// // //     link.download = 'cheek_surface.obj';
// // //     link.click();
// // // }
// //
// // // // projectCurveToSurface() 函式：將曲線投影到3D面上
// // // function projectCurveToSurface(curvePoints: THREE.Vector3[], surfaceMesh: THREE.Object3D): THREE.Vector3[] {
// // //     const projectedPoints: THREE.Vector3[] = [];
// // //
// // //     curvePoints.forEach(point => {
// // //         const localPoint = point.clone();
// // //         (surfaceMesh as THREE.Mesh).worldToLocal(localPoint);
// // //         projectedPoints.push(localPoint);
// // //     });
// // //
// // //     return projectedPoints;
// // // }
// // //
// // // // Helper class for Point
// // // class Point {
// // //     x: number;
// // //     y: number;
// // //     z: number;
// // //
// // //     constructor(x: number, y: number, z: number = 0) {
// // //         this.x = x;
// // //         this.y = y;
// // //         this.z = z;
// // //     }
// // // }
// // //
// // // // Helper function to determine if a 3D point is inside the polygon projected onto a 2D plane
// // // function point_in_polygon(point: Point, polygon: Point[]): boolean {
// // //     const num_vertices = polygon.length;
// // //     const x = point.x;
// // //     const y = point.y;
// // //     let inside = false;
// // //
// // //     let p1 = polygon[0];
// // //     let p2;
// // //
// // //     for (let i = 1; i <= num_vertices; i++) {
// // //         p2 = polygon[i % num_vertices];
// // //
// // //         if (y > Math.min(p1.y, p2.y)) {
// // //             if (y <= Math.max(p1.y, p2.y)) {
// // //                 if (x <= Math.max(p1.x, p2.x)) {
// // //                     const x_intersection = ((y - p1.y) * (p2.x - p1.x)) / (p2.y - p1.y) + p1.x;
// // //
// // //                     if (p1.x === p2.x || x <= x_intersection) {
// // //                         inside = !inside;
// // //                     }
// // //                 }
// // //             }
// // //         }
// // //
// // //         p1 = p2;
// // //     }
// // //
// // //     return inside;
// // // }
// // //
// // // // selectCheekSurface 函式：
// // // function selectCheekSurface(projectedPoints: THREE.Vector3[], surfaceMesh: THREE.Mesh): THREE.Mesh | null {
// // //     if (!surfaceMesh || !surfaceMesh.geometry) {
// // //         console.error("surfaceMesh 或其 geometry 屬性未正確初始化");
// // //         return null;
// // //     }
// // //
// // //     const polygon2D = projectedPoints.map(p => new Point(p.x, p.y));
// // //
// // //     const cheekGeometry = new THREE.BufferGeometry();
// // //     const vertices: number[] = [];
// // //     const indices: number[] = [];
// // //
// // //     const position = surfaceMesh.geometry.attributes.position;
// // //     const faces = (surfaceMesh.geometry.index as THREE.BufferAttribute).array;
// // //     const numFaces = faces.length / 3;
// // //
// // //     for (let i = 0; i < numFaces; i++) {
// // //         const a = faces[i * 3];
// // //         const b = faces[i * 3 + 1];
// // //         const c = faces[i * 3 + 2];
// // //
// // //         const vA = new THREE.Vector3().fromBufferAttribute(position, a);
// // //         const vB = new THREE.Vector3().fromBufferAttribute(position, b);
// // //         const vC = new THREE.Vector3().fromBufferAttribute(position, c);
// // //
// // //         const pointA2D = new Point(vA.x, vA.y);
// // //         const pointB2D = new Point(vB.x, vB.y);
// // //         const pointC2D = new Point(vC.x, vC.y);
// // //
// // //         if (point_in_polygon(pointA2D, polygon2D) && point_in_polygon(pointB2D, polygon2D) && point_in_polygon(pointC2D, polygon2D)) {
// // //             const indexOffset = vertices.length / 3;
// // //             vertices.push(vA.x, vA.y, vA.z);
// // //             vertices.push(vB.x, vB.y, vB.z);
// // //             vertices.push(vC.x, vC.y, vC.z);
// // //             indices.push(indexOffset, indexOffset + 1, indexOffset + 2);
// // //         }
// // //     }
// // //
// // //     cheekGeometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
// // //     cheekGeometry.setIndex(indices);
// // //
// // //     const material = new THREE.MeshBasicMaterial({ color: 0xADD8E6, side: THREE.DoubleSide });
// // //     const cheekMesh = new THREE.Mesh(cheekGeometry, material);
// // //
// // //     scene.add(cheekMesh);
// // //
// // //     return cheekMesh;
// // // }
// //
// //
// // function main() {
// //     raycaster = new THREE.Raycaster();
// //     mouse = new THREE.Vector2();
// //
// //     const canvas = document.querySelector('#c') as HTMLCanvasElement;
// //     renderer = new THREE.WebGLRenderer({ antialias: true, canvas });
// //     camera = new THREE.PerspectiveCamera(45, 2, 0.1, 100);
// //     camera.position.set(0, 8, 10);
// //
// //     const controls = new OrbitControls(camera, canvas);
// //     controls.target.set(0, 5, 0);
// //     controls.update();
// //
// //     scene = new THREE.Scene();
// //     scene.background = new THREE.Color('white');
// //
// //     const planeSize = 40;
// //     const loader = new THREE.TextureLoader();
// //     const texture = loader.load('https://threejs.org/manual/examples/resources/images/checker.png');
// //     texture.colorSpace = THREE.SRGBColorSpace;
// //     texture.wrapS = THREE.RepeatWrapping;
// //     texture.wrapT = THREE.RepeatWrapping;
// //     texture.magFilter = THREE.NearestFilter;
// //     texture.repeat.set(planeSize / 2, planeSize / 2);
// //
// //     const planeGeo = new THREE.PlaneGeometry(planeSize, planeSize);
// //     const planeMat = new THREE.MeshPhongMaterial({ map: texture, side: THREE.DoubleSide });
// //     const planeMesh = new THREE.Mesh(planeGeo, planeMat);
// //     planeMesh.rotation.x = Math.PI * -0.5;
// //     // scene.add(planeMesh);  // 如果需要顯示平面則添加
// //
// //     const skyColor = 0xB1E1FF;
// //     const groundColor = 0xB97A20;
// //     const intensity = 3;
// //     const hemiLight = new THREE.HemisphereLight(skyColor, groundColor, intensity);
// //     scene.add(hemiLight);
// //
// //     const dirLight = new THREE.DirectionalLight(0xFFFFFF, intensity);
// //     dirLight.position.set(5, 10, 2);
// //     scene.add(dirLight);
// //     scene.add(dirLight.target);
// //
// //     const ambientLight = new THREE.AmbientLight(0xffffff, 6.0);
// //     scene.add(ambientLight);
// //
// //     const mtlLoader = new MTLLoader();
// //     mtlLoader.load('.././model/lulu/texturedMesh.mtl', (mtl) => {
// //         mtl.preload();
// //         const objLoader = new OBJLoader();
// //         objLoader.setMaterials(mtl);
// //         objLoader.load('.././model/lulu/texturedMesh.obj', (loadedRoot) => {
// //             faceMesh = loadedRoot;
// //             faceMesh.position.set(0, 5.5, 12);
// //             faceMesh.scale.set(6.0, 6.0, 6.0);
// //             scene.add(faceMesh);
// //
// //             let totalVertices = 0;
// //             let totalFaces = 0;
// //             faceMesh.traverse((child) => {
// //                 if ((child as THREE.Mesh).isMesh && (child as THREE.Mesh).geometry) {
// //                     const geometry = (child as THREE.Mesh).geometry;
// //                     totalVertices += geometry.attributes.position ? geometry.attributes.position.count : 0;
// //                     if (geometry.index) {
// //                         totalFaces += geometry.index.count / 3;
// //                     } else {
// //                         totalFaces += geometry.attributes.position.count / 3;
// //                     }
// //                 }
// //             });
// //
// //             console.log(`Total vertices: ${totalVertices}`);
// //             console.log(`Total faces: ${totalFaces}`);
// //         });
// //     });
// //
// //     function resizeRendererToDisplaySize(renderer: THREE.WebGLRenderer) {
// //         const canvas = renderer.domElement;
// //         const width = canvas.clientWidth;
// //         const height = canvas.clientHeight;
// //         const needResize = canvas.width !== width || canvas.height !== height;
// //         if (needResize) {
// //             renderer.setSize(width, height, false);
// //         }
// //         return needResize;
// //     }
// //
// //     function render() {
// //         if (resizeRendererToDisplaySize(renderer)) {
// //             const canvas = renderer.domElement;
// //             camera.aspect = canvas.clientWidth / canvas.clientHeight;
// //             camera.updateProjectionMatrix();
// //         }
// //         renderer.render(scene, camera);
// //         requestAnimationFrame(render);
// //     }
// //     requestAnimationFrame(render);
// //
// //
// //
// //
// //
// //
// //
// //     window.addEventListener('click', onMouseClick);
// //
// //     const button = document.getElementById('fit-curve') as HTMLButtonElement;
// //     button.addEventListener('click', () => {
// //         if (markedPoints.length > 0) {
// //             const fittedCurvePoints = createCurve(markedPoints);
// //             if (faceMesh) {
// //                 // const projectedPoints = projectCurveToSurface(fittedCurvePoints, faceMesh as THREE.Mesh);
// //                 // selectCheekSurface(projectedPoints, faceMesh as THREE.Mesh);
// //             }
// //             // exportToOBJ(fittedCurvePoints);
// //         } else {
// //             alert('Please mark some points first!');
// //         }
// //     });
// // }
// //
// // main();
// //
// //
// //
