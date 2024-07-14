// 引入相關套件與副程式
import * as THREE from 'three';
import { constructScene } from './scene';
import { elevate } from './tools/deformation/deform';
import { createCurve, onMouseClick, findClosestVertices, findClosestFaces } from './tools/surface';
import Drag from './tools/deformation/SimpleDrag';

// Define the sceneObjects type
interface SceneObjects {
    camera: THREE.PerspectiveCamera;
    scene: THREE.Scene;
    renderer: THREE.WebGLRenderer;
    raycaster: THREE.Raycaster;
    faceMesh: THREE.Object3D;
}

// Declare the sceneObjects variable
let sceneObjects: SceneObjects;

// Main program
export function main() {
    let markedPoints: THREE.Vector3[] = [];

    // Initialize the sceneObjects
    sceneObjects = {
        camera: new THREE.PerspectiveCamera(),
        scene: new THREE.Scene(),
        renderer: new THREE.WebGLRenderer(),
        raycaster: new THREE.Raycaster(),
        faceMesh: new THREE.Object3D(),
    };

    // Declare scene parameters
    const sceneParams = {
        canvasId: 'c',
        cameraPosition: new THREE.Vector3(0, 8, 10),
        backgroundColor: '#f3f4f6',
        modelPaths: {
            mtl: '.././model/lulu/texturedMesh.mtl',
            obj: '.././model/lulu/texturedMesh.obj'
        }
    };

    // Declare curve fitting button
    const fit_curve = document.getElementById('fit-curve') as HTMLButtonElement;

    // Load model callback function
    function onModelLoaded() {
        let fittedCurvePoints: THREE.Vector3[] = [];
        let closestVertices: THREE.Vector3[] = [];
        let closestFaces: number[] = [];

        // Print model info to console
        console.log("Model loaded, faceMesh:", sceneObjects.faceMesh);
        sceneObjects.faceMesh.traverse((child) => {
            if (child instanceof THREE.Mesh) {
                console.log('Mesh:', child);
                console.log('Geometry:', child.geometry);
                console.log('Material:', child.material);
            }
        });

        // Window event listener, mouse click on model, change vertex Z coordinate
        window.addEventListener('click', (event) => elevate(sceneObjects.raycaster, sceneObjects.scene, sceneObjects.camera)(event));
    }

    // Call the constructScene function
    constructScene(sceneParams, sceneObjects, onModelLoaded);
}

// Do not call main() here; it will be called from main.tsx



