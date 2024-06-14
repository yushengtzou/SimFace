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


function main() {
    const sceneParams = {
        canvasId: 'c',
        cameraPosition: new THREE.Vector3(0, 8, 10),
        backgroundColor: 'white',
        modelPaths: {
            mtl: '.././model/lulu/texturedMesh.mtl',
            obj: '.././model/lulu/texturedMesh.obj'
        }
    };

    constructScene(sceneParams, sceneObjects);

    window.addEventListener('click', (event) => onMouseClick(event, sceneObjects.scene, sceneObjects.camera, sceneObjects.raycaster, markedPoints));

    const button = document.getElementById('fit-curve') as HTMLButtonElement;
    button.addEventListener('click', () => {
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

