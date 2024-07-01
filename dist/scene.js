import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader.js';
/**
 *  建構場景的函數
 *  @param sceneParams 場景參數，包含畫布ID、相機位置、背景顏色、模型路徑
 *  @param sceneObjects 場景物件，包含相機、場景、渲染器、光線投射器、臉部模型
 *  @param onLoadCallback 模型載入完成的回調函數
 */
export function constructScene(sceneParams, sceneObjects, onLoadCallback) {
    // 取得畫布元素
    const canvas = document.querySelector(`#${sceneParams.canvasId}`);
    // 初始化 WebGL 渲染器
    sceneObjects.renderer = new THREE.WebGLRenderer({ antialias: true, canvas });
    // 初始化透視相機
    sceneObjects.camera = new THREE.PerspectiveCamera(45, canvas.clientWidth / canvas.clientHeight, 0.1, 100);
    sceneObjects.camera.position.copy(sceneParams.cameraPosition);
    // 初始化軌道控制器
    const controls = new OrbitControls(sceneObjects.camera, canvas);
    controls.target.set(0, 5, 0);
    controls.update();
    // 建立場景並設置背景顏色
    sceneObjects.scene = new THREE.Scene();
    sceneObjects.scene.background = new THREE.Color(sceneParams.backgroundColor);
    // 設置半球光源
    const hemiLight = new THREE.HemisphereLight(0xB1E1FF, 0xB97A20, 15);
    // 設置方向光源
    const dirLight = new THREE.DirectionalLight(0xFFFFFF, 15);
    dirLight.position.set(5, 10, 2);
    // 設置環境光源
    const ambientLight = new THREE.AmbientLight(0xffffff, 6.0);
    sceneObjects.scene.add(hemiLight, dirLight, dirLight.target, ambientLight);
    // 載入材質並應用到模型
    const mtlLoader = new MTLLoader();
    mtlLoader.load(sceneParams.modelPaths.mtl, (mtl) => {
        mtl.preload(); // 預載材質
        const objLoader = new OBJLoader();
        objLoader.setMaterials(mtl); // 將材質應用到 OBJLoader
        objLoader.load(sceneParams.modelPaths.obj, (loadedRoot) => {
            sceneObjects.faceMesh = loadedRoot; // 將載入的模型賦值給 faceMesh
            sceneObjects.faceMesh.position.set(0, 5.0, 12);
            sceneObjects.faceMesh.scale.set(6.0, 6.0, 6.0);
            sceneObjects.scene.add(sceneObjects.faceMesh);
            onLoadCallback(); // 模型載入完成後呼叫回調函數       
        });
    });
    // 調整渲染器大小
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
    let needsCheck = false;
    let lastMouseEvent = null;
    // 節流函數，避免高頻率事件觸發
    function throttle(fn, limit) {
        let lastFunc;
        let lastRan;
        return function (...args) {
            if (!lastRan) {
                fn(...args);
                lastRan = Date.now();
            }
            else {
                clearTimeout(lastFunc);
                lastFunc = window.setTimeout(function () {
                    if ((Date.now() - lastRan) >= limit) {
                        fn(...args);
                        lastRan = Date.now();
                    }
                }, limit - (Date.now() - lastRan));
            }
        };
    }
    // 添加事件監聽器以根據鼠標位置禁用或啟用控制器
    const checkMouseOverModel = throttle((event) => {
        const mouse = new THREE.Vector2();
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
        sceneObjects.raycaster.setFromCamera(mouse, sceneObjects.camera);
        const intersects = sceneObjects.raycaster.intersectObjects([sceneObjects.faceMesh]);
        controls.enabled = intersects.length === 0;
    }, 200); // 每200毫秒檢查一次
    function onMouseMove(event) {
        lastMouseEvent = event;
        needsCheck = true;
    }
    window.addEventListener('mousemove', onMouseMove);
    // 渲染函數
    // function render() {
    //     if (resizeRendererToDisplaySize(sceneObjects.renderer)) {
    //         const canvas = sceneObjects.renderer.domElement;
    //         sceneObjects.camera.aspect = canvas.clientWidth / canvas.clientHeight;
    //         sceneObjects.camera.updateProjectionMatrix();
    //     }
    //     sceneObjects.renderer.render(sceneObjects.scene, sceneObjects.camera);
    //     requestAnimationFrame(render);
    // }
    function render() {
        if (resizeRendererToDisplaySize(sceneObjects.renderer)) {
            const canvas = sceneObjects.renderer.domElement;
            sceneObjects.camera.aspect = canvas.clientWidth / canvas.clientHeight;
            sceneObjects.camera.updateProjectionMatrix();
        }
        // if (needsCheck && lastMouseEvent) {
        //     checkMouseOverModel(lastMouseEvent);
        //     needsCheck = false;
        // }
        sceneObjects.renderer.render(sceneObjects.scene, sceneObjects.camera);
        requestAnimationFrame(render);
    }
    requestAnimationFrame(render);
}
