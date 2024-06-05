/*
 * =====================================================================================
 *
 *       Filename:  main.js
 *
 *    Description:  
 *
 *        Version:  1.0
 *        Created:  2024/06/05 14時56分39秒
 *       Revision:  none
 *       Compiler:  
 *
 *         Author:  鄒雨笙 (), 
 *   Organization:  A-TOP Health BIOTECH 
 *
 * =====================================================================================
 */


import * as THREE from 'three';
import { Line2 } from 'three/examples/jsm/lines/Line2.js';
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial.js';
import { LineGeometry } from 'three/examples/jsm/lines/LineGeometry.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader.js';


// 全局變數宣告
let camera, scene, renderer, raycaster, mouse, markedPoints, faceMesh;


/* =====================================================================================
 *                                      副程式
 * =====================================================================================
 */


// onMouseClick() 函式：使用 Raycaster 標記點
function onMouseClick(event) {
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
function createCurve(points) {
    // 使用 CatmullRomCurve3 的 closed 参数創建閉合曲線
    const curve = new THREE.CatmullRomCurve3(points, true);
    const pointsOnCurve = curve.getPoints(50);

    // 將點轉換為浮點數格式
    const positions = new Float32Array(pointsOnCurve.length * 3);
    for (let i = 0; i < pointsOnCurve.length; i++) {
        positions[i * 3] = pointsOnCurve[i].x;
        positions[i * 3 + 1] = pointsOnCurve[i].y;
        positions[i * 3 + 2] = pointsOnCurve[i].z;
    }

    // 創建 LineGeometry
    const geometry = new LineGeometry();
    geometry.setPositions(positions);

    // 創建 LineMaterial 並設置線寬
    const material = new LineMaterial({
        color: 0x3399FF,
        linewidth: 3, // 設置線寬
    });
    material.resolution.set(window.innerWidth, window.innerHeight); // 必須設置分辨率

    // 創建 Line2
    const line = new Line2(geometry, material);
    scene.add(line);

    return pointsOnCurve;
}


// exportToOBJ() 函式：導出OBJ檔
function exportToOBJ(points) {
    let objData = '';
    points.forEach((point, idx) => {
        objData += `v ${point.x} ${point.y} ${point.z}\n`;
        if (idx > 0) {
            objData += `l ${idx} ${idx + 1}\n`;
        }
    });

    // 添加最后一條線段使曲線閉合
    objData += `l ${points.length} 1\n`;

    const blob = new Blob([objData], { type: 'text/plain' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'cheek_surface.obj';
    link.click();
}


// projectCurveToSurface() 函式：將曲線投影到3D面上
function projectCurveToSurface(curvePoints, surfaceMesh) {
    console.log("projectCurveToSurface");
    const projectedPoints = [];

    // 遍歷曲線上的每個點
    curvePoints.forEach(point => {
        // 克隆當前點以避免修改原始點
        const localPoint = point.clone();
        // 將世界座標轉換為局部座標
        surfaceMesh.worldToLocal(localPoint);
        // 將轉換後的點添加到投影點陣列中
        projectedPoints.push(localPoint);
    });

    return projectedPoints;
}


// selectCheekSurface() 函式：選擇並截取臉頰表面
function selectCheekSurface(projectedPoints, surfaceMesh) {
    console.log("selectCheekSurface");
    const cheekGeometry = new THREE.BufferGeometry();

    // 这里假设你已经知道如何从原始面几何体中提取出定义在projectedPoints内的表面
    // 具体实现需要根据具体的应用需求和数据结构来完成
    // 例如，可以使用点在多边形中的算法，选择包含在projectedPoints内的所有面

    // 將幾何體添加到場景中
    const material = new THREE.MeshBasicMaterial({ color: 0xADD8E6, side: THREE.DoubleSide });
    const cheekMesh = new THREE.Mesh(cheekGeometry, material);
    scene.add(cheekMesh);

    return cheekMesh;
}


/* =====================================================================================
 *                                      主程式
 * =====================================================================================
 */


function main() {
    // 初始化全局變數
    raycaster = new THREE.Raycaster();
    mouse = new THREE.Vector2();
    markedPoints = [];

    const canvas = document.querySelector('#c');  
    renderer = new THREE.WebGLRenderer({ antialias: true, canvas });  
    camera = new THREE.PerspectiveCamera(45, 2, 0.1, 100);  
    camera.position.set(0, 8, 10);  

    // 創建控制器允許攝像機繞目標旋轉
    const controls = new OrbitControls(camera, canvas);  
    controls.target.set(0, 5, 0);  
    controls.update();  

    scene = new THREE.Scene();  
    scene.background = new THREE.Color('white');  

    // 創建平面並加載紋理
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

    // 設置環境光和方向光
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

    // 加載和設置模型
    const mtlLoader = new MTLLoader();
    mtlLoader.load('./model/lulu/texturedMesh.mtl', (mtl) => {  
        mtl.preload();  
        const objLoader = new OBJLoader();  
        objLoader.setMaterials(mtl);  
        objLoader.load('./model/lulu/texturedMesh.obj', (loadedRoot) => {  
            faceMesh = loadedRoot;
            faceMesh.position.set(0, 5.5, 12);  
            faceMesh.scale.set(6.0, 6.0, 6.0);  
            scene.add(faceMesh);  

            let totalVertices = 0;
            let totalFaces = 0;
            faceMesh.traverse((child) => {
                if (child.isMesh && child.geometry) {
                    const geometry = child.geometry;
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

    // 調整渲染器大小以適應顯示大小
    function resizeRendererToDisplaySize(renderer) {
        const canvas = renderer.domElement;
        const width = canvas.clientWidth;
        const height = canvas.clientHeight;
        const needResize = canvas.width !== width || canvas.height !== height;
        if (needResize) {
            renderer.setSize(width, height, false);
        }
        return needResize;
    }

    // 渲染循環
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

    // 添加鼠標點擊事件監聽器
    window.addEventListener('click', onMouseClick);

    // 設定按鈕的觸發曲線擬和導出
    const button = document.getElementById('fit-curve');
    button.addEventListener('click', () => {
        if (markedPoints.length > 0) {
            const fittedCurvePoints = createCurve(markedPoints);
            const projectedPoints = projectCurveToSurface(fittedCurvePoints, faceMesh);
            selectCheekSurface(projectedPoints, faceMesh);
            exportToOBJ(fittedCurvePoints);
        } else {
            alert('Please mark some points first!');
        }
    });
}


/* =====================================================================================
 *                                      呼叫主程式
 * =====================================================================================
*/


main();




