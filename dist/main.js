// 引入相關套件與副程式
import * as THREE from 'three';
import { constructScene } from './scene';
import { elevate } from './tools/deformation/deform';
let sceneObjects;
function sendImageToServer(imageData) {
    fetch('/detect_keypoints', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ image: imageData }),
    })
        .then(response => response.json())
        .then(data => {
        const keypoints = data.keypoints;
        placeKeyPointsOn3DModel(keypoints);
    })
        .catch(error => {
        console.error('Error:', error);
    });
}
function placeKeyPointsOn3DModel(keypoints) {
    keypoints.forEach((point) => {
        const [x, y] = point;
        const vertex = new THREE.Vector3(x, y, 0); // Approximation, you will need to map it back to 3D properly
        const sphere = new THREE.Mesh(new THREE.SphereGeometry(0.1), new THREE.MeshBasicMaterial({ color: 0xff0000 }));
        sphere.position.copy(vertex);
        sceneObjects.scene.add(sphere);
    });
}
// Function to capture image from the renderer
function captureImage(renderer, scene, camera) {
    renderer.render(scene, camera);
    const canvas = renderer.domElement;
    return canvas.toDataURL('image/png');
}
// 主程式
function main() {
    let markedPoints = [];
    // 宣告場景物件
    sceneObjects = {
        camera: null,
        scene: null,
        renderer: null,
        raycaster: new THREE.Raycaster(),
        faceMesh: new THREE.Object3D(),
    };
    // 宣告場景變數
    const sceneParams = {
        canvasId: 'c',
        cameraPosition: new THREE.Vector3(0, 8, 10),
        backgroundColor: '#f3f4f6',
        // backgroundColor: '#f9fafb',
        modelPaths: {
            mtl: '.././model/lulu/texturedMesh.mtl',
            obj: '.././model/lulu/texturedMesh.obj'
        }
    };
    // 宣告曲線擬合按鈕
    const fit_curve = document.getElementById('fit-curve');
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
        // 視窗事件監聽，鼠標點擊於模型上，頂點Z座標位置改變
        window.addEventListener('click', (event) => elevate(sceneObjects.raycaster, sceneObjects.scene, sceneObjects.camera)(event));
        // Automatically capture and send the image at regular intervals
        // setInterval(() => {
        //     const imageData = captureImage(sceneObjects.renderer, sceneObjects.scene, sceneObjects.camera);
        //     sendImageToServer(imageData);
        // }, 5000); // Capture and send the image every 5 seconds
        // 視窗事件監聽，曲線擬合按鈕點擊
        // fit_curve.addEventListener('click', () => {
        //     console.log("視窗事件監聽，曲線擬合按鈕點擊");
        //     if (markedPoints.length > 5) {
        //         fittedCurvePoints = createCurve(markedPoints, sceneObjects.scene, new THREE.Color(0xFF0000));
        //         //0x3399FF 0xFF0000
        //         console.log(fittedCurvePoints.length);
        //         console.log(sceneObjects.faceMesh.children.length);
        //         console.log(sceneObjects.faceMesh.children);
        //         // 找出曲線每個點最靠近的模型 face 
        //         if (sceneObjects.faceMesh && sceneObjects.faceMesh.children.length > 0) {
        //             console.log("找出曲線每個點最靠近的模型 face");
        //             const mesh = sceneObjects.faceMesh.children[0] as THREE.Mesh;
        //             let geometry = mesh.geometry as THREE.BufferGeometry;
        //             console.log(geometry);
        //             closestFaces = findClosestFaces(fittedCurvePoints, geometry);
        //             console.log('Closest faces:', closestFaces);
        //             closestVertices = findClosestVertices(fittedCurvePoints, geometry);
        //             // Do something with the closest vertices, like drawing the new curve
        //             console.log('Closest vertices:', closestVertices);
        //             createCurve(closestVertices, sceneObjects.scene, new THREE.Color(0xFF0000));
        //         }
        //     } else {
        //         alert('Please mark some points first!');
        //     }
        // });
    }
    // 呼叫建立場景的副程式
    constructScene(sceneParams, sceneObjects, onModelLoaded);
}
main();
