// 引入相關套件與副程式
import * as THREE from 'three';
import { onMouseClick } from './utils/onMouseClick';
import { createCurve } from './utils/createCurve';
import { constructScene } from './scene';


// 全局變數宣告
let markedPoints: THREE.Vector3[] = [];
let sceneObjects = {
    camera: null as unknown as THREE.PerspectiveCamera,
    scene: null as unknown as THREE.Scene,
    renderer: null as unknown as THREE.WebGLRenderer,
    raycaster: new THREE.Raycaster(),
    faceMesh: null as THREE.Object3D | null
};


// 主程式
function main() {

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
    // 曲線擬合按鈕
    const fit_curve = document.getElementById('fit-curve') as HTMLButtonElement;


    // ========================================
    // 呼叫副程式
    // ========================================


    // 建立場景
    constructScene(sceneParams, sceneObjects);
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

}


main();

