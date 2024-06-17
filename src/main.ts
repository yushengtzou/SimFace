// 引入相關套件與副程式
import * as THREE from 'three';
import { constructScene } from './scene';
import { onMouseClick } from './utils/onMouseClick';
import { createCurve } from './utils/createCurve';



// 主程式
function main() {

    let markedPoints: THREE.Vector3[] = [];

    // 宣告場景物件
    let sceneObjects = {
        camera: null as unknown as THREE.PerspectiveCamera,
        scene: null as unknown as THREE.Scene,
        renderer: null as unknown as THREE.WebGLRenderer,
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
    const fit_curve = document.getElementById('fit-curve') as HTMLButtonElement;


    // ========================================
    // 呼叫副程式
    // ========================================


    // 建立場景
    constructScene(sceneParams, sceneObjects, () => {
        // 檢查
        console.log('Model loaded, faceMesh:', sceneObjects.faceMesh);
        sceneObjects.faceMesh.traverse((child) => {
            if (child instanceof THREE.Mesh) {
                console.log('Mesh:', child);
                console.log('Geometry:', child.geometry);
                console.log('Material:', child.material);
            }
        });
    }
    )




    // 視窗事件監聽，鼠標點擊
    window.addEventListener('click', (event) => onMouseClick(event, sceneObjects.scene, sceneObjects.camera, sceneObjects.raycaster, markedPoints));


    // 視窗事件監聽，曲線擬合按鈕點擊
    fit_curve.addEventListener('click', () => {
        if (markedPoints.length > 0) {
            const fittedCurvePoints = createCurve(markedPoints, sceneObjects.scene);
            if (sceneObjects.faceMesh) {
                // sliceModelAndSeparate(fittedCurvePoints); // Uncomment and implement this function as needed
            }
        } else {
            alert('Please mark some points first!');
        }
    });


    // 取得模型和曲線的資料


    // 將這兩筆資料輸入到 cutSurface() 函式


    // 輸出截取出的曲面模型和截取曲面


    // 渲染這兩個曲面在視窗中


    // 可以用鼠標移動截取出的曲面模型



}


main();
