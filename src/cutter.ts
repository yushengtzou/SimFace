import * as THREE from 'three';
import { SUBTRACTION, Brush, Evaluator } from 'three-bvh-csg/build/index.module.js';

export function sliceModel(mesh: THREE.Mesh, curvePoints: THREE.Vector2[]): [THREE.Mesh, THREE.Mesh] {
  const material = new THREE.MeshBasicMaterial({ color: 0xFFFFFF });

  // Create the Brush from the mesh geometry
  const meshBrush = new Brush(mesh.geometry as THREE.BufferGeometry);

  // Create the shape and extrude it to create geometry
  const curveShape = new THREE.Shape(curvePoints);
  const curveGeometry = new THREE.ExtrudeGeometry(curveShape, { depth: 0.1, bevelEnabled: false });

  // Create a THREE.Mesh for the curve geometry to update its properties
  const curveMesh = new THREE.Mesh(curveGeometry, material);
  curveMesh.position.y = 0.5;
  curveMesh.updateMatrixWorld(true);

  // Create the Brush from the updated curve geometry
  const curveBrush = new Brush(curveMesh.geometry as THREE.BufferGeometry);

  const evaluator = new Evaluator();
  const slicedGeometryCSG = evaluator.evaluate(meshBrush, curveBrush, SUBTRACTION).geometry;

  const slicedRegion = new THREE.Mesh(slicedGeometryCSG, material);
  const remainingModel = new THREE.Mesh(mesh.geometry, material);

  return [slicedRegion, remainingModel];
}

