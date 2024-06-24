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


export function constructScene(
    sceneParams: { canvasId: string, cameraPosition: THREE.Vector3, backgroundColor: string, modelPaths: { mtl: string, obj: string } }, 
    sceneObjects: { camera: THREE.PerspectiveCamera, scene: THREE.Scene, renderer: THREE.WebGLRenderer, raycaster: THREE.Raycaster, faceMesh: THREE.Object3D }, 
    onLoadCallback: () => void ) {

    // 取得畫布元素
    const canvas = document.querySelector(`#${sceneParams.canvasId}`) as HTMLCanvasElement;
    
    // 初始化 WebGL 渲染器
    sceneObjects.renderer = new THREE.WebGLRenderer({ antialias: true, canvas });
    
    // 初始化透視相機
    sceneObjects.camera = new THREE.PerspectiveCamera(45, 2, 0.1, 100);
    sceneObjects.camera.position.copy(sceneParams.cameraPosition);

    // 初始化軌道控制器
    const controls = new OrbitControls(sceneObjects.camera, canvas);
    controls.target.set(0, 5, 0);
    controls.update();

    // 建立場景並設置背景顏色
    sceneObjects.scene = new THREE.Scene();
    sceneObjects.scene.background = new THREE.Color(sceneParams.backgroundColor);

    // 設置地面
    // const planeSize = 40;
    // const loader = new THREE.TextureLoader();
    // const texture = loader.load('https://threejs.org/manual/examples/resources/images/checker.png');
    // texture.colorSpace = THREE.SRGBColorSpace;
    // texture.wrapS = THREE.RepeatWrapping;
    // texture.wrapT = THREE.RepeatWrapping;
    // texture.magFilter = THREE.NearestFilter;
    // texture.repeat.set(planeSize / 2, planeSize / 2);

    // const planeGeo = new THREE.PlaneGeometry(planeSize, planeSize);
    // const planeMat = new THREE.MeshPhongMaterial({ map: texture, side: THREE.DoubleSide });
    // const planeMesh = new THREE.Mesh(planeGeo, planeMat);
    // planeMesh.rotation.x = Math.PI * -0.5;
    // sceneObjects.scene.add(planeMesh); // 如有需要可添加地面

    // 設置半球光源
    const skyColor = 0xB1E1FF;
    const groundColor = 0xB97A20;
    const intensity = 15;
    const hemiLight = new THREE.HemisphereLight(skyColor, groundColor, intensity);
    sceneObjects.scene.add(hemiLight);

    // 設置方向光源
    const dirLight = new THREE.DirectionalLight(0xFFFFFF, intensity);
    dirLight.position.set(5, 10, 2);
    sceneObjects.scene.add(dirLight);
    sceneObjects.scene.add(dirLight.target);

    // 設置環境光源
    const ambientLight = new THREE.AmbientLight(0xffffff, 6.0);
    sceneObjects.scene.add(ambientLight);

    // 載入材質並應用到模型
    const mtlLoader = new MTLLoader();
    mtlLoader.load(sceneParams.modelPaths.mtl, (mtl) => {
        mtl.preload(); // 預載材質
        const objLoader = new OBJLoader();
        objLoader.setMaterials(mtl); // 將材質應用到 OBJLoader

        // 載入 OBJ 模型
        objLoader.load(sceneParams.modelPaths.obj, (loadedRoot) => {
            sceneObjects.faceMesh = loadedRoot; // 將載入的模型賦值給 faceMesh
            sceneObjects.faceMesh.position.set(0, 5.0, 12);
            sceneObjects.faceMesh.scale.set(6.0, 6.0, 6.0);
            
            // 旋轉模型 10 度（順時針方向，沿 Y 軸）
            // sceneObjects.faceMesh.rotation.y = THREE.MathUtils.degToRad(10);

            sceneObjects.scene.add(sceneObjects.faceMesh);
            onLoadCallback(); // 模型載入完成後呼叫回調函數

            // 遍歷模型以計算頂點和面的總數
            let totalVertices = 0;
            let totalFaces = 0;
            sceneObjects.faceMesh.traverse((child) => {
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

            // 如有需要可打印總頂點數和總面數
            // console.log(`Total vertices: ${totalVertices}`);
            // console.log(`Total faces: ${totalFaces}`);
        });
    });

    // 調整渲染器大小
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

    // 渲染函數
    function render() {
        if (resizeRendererToDisplaySize(sceneObjects.renderer)) {
            const canvas = sceneObjects.renderer.domElement;
            sceneObjects.camera.aspect = canvas.clientWidth / canvas.clientHeight;
            sceneObjects.camera.updateProjectionMatrix();
        }
        sceneObjects.renderer.render(sceneObjects.scene, sceneObjects.camera);
        requestAnimationFrame(render);
    }
    requestAnimationFrame(render);
}

