// src/cutter.ts
import * as THREE from 'three';
import { SUBTRACTION, Brush, Evaluator } from 'three-bvh-csg/build/index.module.js';

export function sliceModel(mesh: THREE.Mesh, curvePoints: THREE.Vector2[]): [THREE.Mesh, THREE.Mesh] {
  const material = new THREE.MeshBasicMaterial({ color: 0xFFFFFF });

  const meshBrush = new Brush(mesh.geometry as THREE.BufferGeometry);
  const curveShape = new THREE.Shape(curvePoints);
  const curveGeometry = new THREE.ExtrudeGeometry(curveShape, { depth: 0.1, bevelEnabled: false });
  const curveBrush = new Brush(curveGeometry as THREE.BufferGeometry);

  const evaluator = new Evaluator();
  const slicedGeometryCSG = evaluator.evaluate(meshBrush, curveBrush, SUBTRACTION).geometry;

  const slicedRegion = new THREE.Mesh(slicedGeometryCSG, material);
  const remainingModel = new THREE.Mesh(mesh.geometry, material);

  return [slicedRegion, remainingModel];
}

