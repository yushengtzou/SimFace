import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import { MTLLoader } from 'three/addons/loaders/MTLLoader.js';


// 全局變數宣告
let camera, scene, renderer, raycaster, mouse, markedPoints;


// ==================================== 副程式 ====================================


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
    const curve = new THREE.CatmullRomCurve3(points);
    const pointsOnCurve = curve.getPoints(50);

    const geometry = new THREE.BufferGeometry().setFromPoints(pointsOnCurve);
    const material = new THREE.LineBasicMaterial({ color: 0x3399FF });
    const curveObject = new THREE.Line(geometry, material);

    scene.add(curveObject);
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

    const blob = new Blob([objData], { type: 'text/plain' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'cheek_surface.obj';
    link.click();
}


// ==================================== 主程式 ====================================


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
    let root = new THREE.Group();
    const mtlLoader = new MTLLoader();
    mtlLoader.load('./model/lulu/texturedMesh.mtl', (mtl) => {  
        mtl.preload();  
        const objLoader = new OBJLoader();  
        objLoader.setMaterials(mtl);  
        objLoader.load('./model/lulu/texturedMesh.obj', (loadedRoot) => {  
            root = loadedRoot;
            root.position.set(0, 5.5, 12);  
            root.scale.set(6.0, 6.0, 6.0);  
            scene.add(root);  

            let totalVertices = 0;
            let totalFaces = 0;
            root.traverse((child) => {
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

    // 添加鼠标点击事件监听器
    window.addEventListener('click', onMouseClick);

    // 添加按钮以手动触发曲线拟合和导出
    const button = document.getElementById('fit-curve');

    button.addEventListener('click', () => {
        console.log("Fit curve");
        if (markedPoints.length > 0) {
            const fittedCurvePoints = createCurve(markedPoints);
            exportToOBJ(fittedCurvePoints);
        } else {
            alert('Please mark some points first!');
        }
    });

}


main();



