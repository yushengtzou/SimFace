import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader.js';
export function constructScene(sceneParams, sceneObjects) {
    const canvas = document.querySelector(`#${sceneParams.canvasId}`);
    sceneObjects.renderer = new THREE.WebGLRenderer({ antialias: true, canvas });
    sceneObjects.camera = new THREE.PerspectiveCamera(45, 2, 0.1, 100);
    sceneObjects.camera.position.copy(sceneParams.cameraPosition);
    const controls = new OrbitControls(sceneObjects.camera, canvas);
    controls.target.set(0, 5, 0);
    controls.update();
    sceneObjects.scene = new THREE.Scene();
    sceneObjects.scene.background = new THREE.Color(sceneParams.backgroundColor);
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
    // sceneObjects.scene.add(planeMesh); // Add the plane if needed
    const skyColor = 0xB1E1FF;
    const groundColor = 0xB97A20;
    const intensity = 3;
    const hemiLight = new THREE.HemisphereLight(skyColor, groundColor, intensity);
    sceneObjects.scene.add(hemiLight);
    const dirLight = new THREE.DirectionalLight(0xFFFFFF, intensity);
    dirLight.position.set(5, 10, 2);
    sceneObjects.scene.add(dirLight);
    sceneObjects.scene.add(dirLight.target);
    const ambientLight = new THREE.AmbientLight(0xffffff, 6.0);
    sceneObjects.scene.add(ambientLight);
    const mtlLoader = new MTLLoader();
    mtlLoader.load(sceneParams.modelPaths.mtl, (mtl) => {
        mtl.preload();
        const objLoader = new OBJLoader();
        objLoader.setMaterials(mtl);
        objLoader.load(sceneParams.modelPaths.obj, (loadedRoot) => {
            sceneObjects.faceMesh = loadedRoot;
            sceneObjects.faceMesh.position.set(0, 5.5, 12);
            sceneObjects.faceMesh.scale.set(6.0, 6.0, 6.0);
            sceneObjects.scene.add(sceneObjects.faceMesh);
            let totalVertices = 0;
            let totalFaces = 0;
            sceneObjects.faceMesh.traverse((child) => {
                if (child.isMesh && child.geometry) {
                    const geometry = child.geometry;
                    totalVertices += geometry.attributes.position ? geometry.attributes.position.count : 0;
                    if (geometry.index) {
                        totalFaces += geometry.index.count / 3;
                    }
                    else {
                        totalFaces += geometry.attributes.position.count / 3;
                    }
                }
            });
            console.log(`Total vertices: ${totalVertices}`);
            console.log(`Total faces: ${totalFaces}`);
        });
    });
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
