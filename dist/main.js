// 引入相關套件與副程式
import * as THREE from 'three';
import { constructScene } from './scene';
import { createCurve, onMouseClick, findClosestFaces } from './utils/surface';
// 主程式
function main() {
    let markedPoints = [];
    // 宣告場景物件
    let sceneObjects = {
        camera: null,
        scene: null,
        renderer: null,
        raycaster: new THREE.Raycaster(),
        faceMesh: new THREE.Object3D
    };
    // 宣告場景變數
    const sceneParams = {
        canvasId: 'c',
        cameraPosition: new THREE.Vector3(0, 8, 10),
        backgroundColor: 'white',
        modelPaths: {
            mtl: '.././model/lulu/texturedMesh.mtl',
            obj: '.././model/lulu/texturedMesh.obj'
        }
    };
    // 宣告曲線擬合按鈕
    const fit_curve = document.getElementById('fit-curve');
    // ========================================
    // 呼叫副程式
    // ========================================
    // 載入模型後要呼叫的函式
    function onModelLoaded() {
        let fittedCurvePoints = [];
        let closestVertices = [];
        let closestFaces = [];
        // 列印模型資訊於主控台
        console.log("列印模型資訊於主控台：");
        console.log('Model loaded, faceMesh:', sceneObjects.faceMesh);
        sceneObjects.faceMesh.traverse((child) => {
            if (child instanceof THREE.Mesh) {
                console.log('Mesh:', child);
                console.log('Geometry:', child.geometry);
                console.log('Material:', child.material);
            }
        });
        // 視窗事件監聽，鼠標點擊，標記點於模型上
        window.addEventListener('click', (event) => onMouseClick(event, sceneObjects.scene, sceneObjects.camera, sceneObjects.raycaster, markedPoints));
        // 視窗事件監聽，鼠標點擊於模型上，頂點Z座標位置改變
        // window.addEventListener('click', elevate(sceneObjects.raycaster, sceneObjects.scene, sceneObjects.camera));
        // 視窗事件監聽，曲線擬合按鈕點擊
        fit_curve.addEventListener('click', () => {
            console.log("視窗事件監聽，曲線擬合按鈕點擊");
            if (markedPoints.length > 5) {
                fittedCurvePoints = createCurve(markedPoints, sceneObjects.scene, new THREE.Color(0xFF0000));
                //0x3399FF 0xFF0000
                console.log(fittedCurvePoints.length);
                console.log(sceneObjects.faceMesh.children.length);
                console.log(sceneObjects.faceMesh.children);
                // 檢查點
                // console.log("檢查點");
                // sceneObjects.faceMesh.children.forEach(child => {
                //     if ((child as THREE.Mesh).isMesh) {
                //         console.log('This child is a Mesh:', child);
                //         console.log((child as THREE.Mesh).geometry);
                //     } else {
                //         console.log('This child is not a Mesh:', child);
                //     }
                // });
                // 找出曲線每個點最靠近的模型 face 
                if (sceneObjects.faceMesh && sceneObjects.faceMesh.children.length > 0) {
                    console.log("找出曲線每個點最靠近的模型 face");
                    const mesh = sceneObjects.faceMesh.children[0];
                    let geometry = mesh.geometry;
                    console.log(geometry);
                    closestFaces = findClosestFaces(fittedCurvePoints, geometry);
                    console.log('Closest faces:', closestFaces);
                    // closestVertices = findClosestVertices(fittedCurvePoints, geometry);
                    // Do something with the closest vertices, like drawing the new curve
                    // console.log('Closest vertices:', closestVertices);
                    // createCurve(closestVertices, sceneObjects.scene, new THREE.Color(0xFF0000));
                }
            }
            else {
                alert('Please mark some points first!');
            }
        });
        // 將這兩筆資料輸入到 cutSurface() 函式
        // 輸出截取出的曲面模型和截取曲面
        // 渲染這兩個曲面在視窗中
        // 可以用鼠標移動截取出的曲面模型
    }
    // 呼叫建立場景的副程式
    constructScene(sceneParams, sceneObjects, onModelLoaded);
}
main();
