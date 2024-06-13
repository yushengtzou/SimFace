// cutter.ts

import * as THREE from 'three';

export interface Vertex {
  x: number;
  y: number;
  z: number;
}

export interface Face {
  vertices: Vertex[];
}

export interface Mesh {
  faces: Face[];
  adjacencyList: Map<Vertex, Vertex[]>;
}

export interface Cutter {
  position: Vertex;
  direction: Vertex;
}

export function createVertex(x: number, y: number, z: number): Vertex {
  return { x, y, z };
}

export function createFace(vertices: Vertex[]): Face {
  return { vertices };
}

export function placeCutter(mesh: Mesh, startVertex: Vertex): Cutter {
  const cutter: Cutter = {
    position: startVertex,
    direction: calculateFaceNormal(mesh.faces.find(face => face.vertices.includes(startVertex))!)
  };
  return cutter;
}

export function activateCutter(cutter: Cutter): any {
  return calculateTangentPlane(cutter.position, cutter.direction);
}

export function moveCutter(mesh: Mesh, cutter: Cutter, newPosition: Vertex): void {
  const projectedPosition = projectOntoTangentPlane(newPosition, cutter.position, cutter.direction);
  cutter.position = projectedPosition;

  const currentFace = findCurrentFace(mesh, cutter.position);
  if (currentFace) {
    const intersectionResult = testEdgeIntersection(currentFace, cutter.position);
    if (intersectionResult) {
      retriangulateMesh(mesh, currentFace, intersectionResult);
    }
  }
}

export function deactivateCutter(): void {
  // Implementation of cutter deactivation
}

function calculateFaceNormal(face: Face): Vertex {
  const v1 = face.vertices[0];
  const v2 = face.vertices[1];
  const v3 = face.vertices[2];
  const edge1 = { x: v2.x - v1.x, y: v2.y - v1.y, z: v2.z - v1.z };
  const edge2 = { x: v3.x - v1.x, y: v3.y - v1.y, z: v3.z - v1.z };
  const normal = {
    x: edge1.y * edge2.z - edge1.z * edge2.y,
    y: edge1.z * edge2.x - edge1.x * edge2.z,
    z: edge1.x * edge2.y - edge1.y * edge2.x
  };
  const length = Math.sqrt(normal.x * normal.x + normal.y * normal.y + normal.z * normal.z);
  return { x: normal.x / length, y: normal.y / length, z: normal.z / length };
}

function calculateTangentPlane(position: Vertex, normal: Vertex): any {
  // Placeholder function to calculate tangent plane
  return {};
}

function projectOntoTangentPlane(newPosition: Vertex, currentPosition: Vertex, normal: Vertex): Vertex {
  // Placeholder function to project a position onto a tangent plane
  return newPosition;
}

function findCurrentFace(mesh: Mesh, position: Vertex): Face | null {
  return mesh.faces.find(face => face.vertices.includes(position)) || null;
}

function testEdgeIntersection(face: Face, position: Vertex): any | null {
  // Placeholder function to test edge intersection
  return null;
}

function retriangulateMesh(mesh: Mesh, face: Face, intersectionResult: any): void {
  // Placeholder function to retriangulate the mesh based on intersection results
}

export function sliceModel(mesh: THREE.Mesh, curvePoints: THREE.Vector3[]): THREE.Mesh[] {
  // Example mesh slicing logic
  const geometry1 = new THREE.BufferGeometry();
  const geometry2 = new THREE.BufferGeometry();
  const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });

  const slicedRegion = new THREE.Mesh(geometry1, material);
  const remainingModel = new THREE.Mesh(geometry2, material);

  // Implement actual slicing logic here

  return [slicedRegion, remainingModel];
}



// // cutter.ts
// import * as THREE from 'three';
//
//
// export interface Vertex {
//   x: number;
//   y: number;
//   z: number;
// }
//
// export interface Face {
//   vertices: Vertex[];
// }
//
// export interface Mesh {
//   faces: Face[];
//   adjacencyList: Map<Vertex, Vertex[]>;
// }
//
// export interface Cutter {
//   position: Vertex;
//   direction: Vertex;
// }
//
// export function createVertex(x: number, y: number, z: number): Vertex {
//   return { x, y, z };
// }
//
// export function createFace(vertices: Vertex[]): Face {
//   return { vertices };
// }
//
// export function placeCutter(mesh: Mesh, startVertex: Vertex): Cutter {
//   const cutter: Cutter = {
//     position: startVertex,
//     direction: calculateFaceNormal(mesh.faces.find(face => face.vertices.includes(startVertex))!)
//   };
//   return cutter;
// }
//
// export function activateCutter(cutter: Cutter): any {
//   return calculateTangentPlane(cutter.position, cutter.direction);
// }
//
// export function moveCutter(mesh: Mesh, cutter: Cutter, newPosition: Vertex): void {
//   const projectedPosition = projectOntoTangentPlane(newPosition, cutter.position, cutter.direction);
//   cutter.position = projectedPosition;
//
//   const currentFace = findCurrentFace(mesh, cutter.position);
//   if (currentFace) {
//     const intersectionResult = testEdgeIntersection(currentFace, cutter.position);
//     if (intersectionResult) {
//       retriangulateMesh(mesh, currentFace, intersectionResult);
//     }
//   }
// }
//
// export function deactivateCutter(): void {
//   // Implementation of cutter deactivation
// }
//
// function calculateFaceNormal(face: Face): Vertex {
//   const v1 = face.vertices[0];
//   const v2 = face.vertices[1];
//   const v3 = face.vertices[2];
//   const edge1 = { x: v2.x - v1.x, y: v2.y - v1.y, z: v2.z - v1.z };
//   const edge2 = { x: v3.x - v1.x, y: v3.y - v1.y, z: v3.z - v1.z };
//   const normal = {
//     x: edge1.y * edge2.z - edge1.z * edge2.y,
//     y: edge1.z * edge2.x - edge1.x * edge2.z,
//     z: edge1.x * edge2.y - edge1.y * edge2.x
//   };
//   const length = Math.sqrt(normal.x * normal.x + normal.y * normal.y + normal.z * normal.z);
//   return { x: normal.x / length, y: normal.y / length, z: normal.z / length };
// }
//
// function calculateTangentPlane(position: Vertex, normal: Vertex): any {
//   // Placeholder function to calculate tangent plane
//   return {};
// }
//
// function projectOntoTangentPlane(newPosition: Vertex, currentPosition: Vertex, normal: Vertex): Vertex {
//   // Placeholder function to project a position onto a tangent plane
//   return newPosition;
// }
//
// function findCurrentFace(mesh: Mesh, position: Vertex): Face | null {
//   return mesh.faces.find(face => face.vertices.includes(position)) || null;
// }
//
// function testEdgeIntersection(face: Face, position: Vertex): any | null {
//   // Placeholder function to test edge intersection
//   return null;
// }
//
// function retriangulateMesh(mesh: Mesh, face: Face, intersectionResult: any): void {
//   // Placeholder function to retriangulate the mesh based on intersection results
// }
//
// export function sliceModel(mesh: THREE.Mesh, curvePoints: THREE.Vector3[]): [THREE.Mesh, THREE.Mesh] {
//   // Implement mesh slicing logic here
//   const material = new THREE.MeshBasicMaterial({ color: 0xFFFFFF }); // Placeholder material
//
//   // Placeholder geometries
//   const slicedGeometry = new THREE.BufferGeometry();
//   const remainingGeometry = new THREE.BufferGeometry();
//
//   const slicedRegion = new THREE.Mesh(slicedGeometry, material);
//   const remainingModel = new THREE.Mesh(remainingGeometry, material);
//
//   // Example logic to split the mesh using curve points
//   // This logic would need to be expanded to actually modify the mesh geometry
//   // and separate it into two different regions
//
//   return [slicedRegion, remainingModel];
// }
//
//
//
// // // cutter.ts
// //
// // export interface Vertex {
// //   x: number;
// //   y: number;
// //   z: number;
// // }
// //
// // export interface Face {
// //   vertices: Vertex[];
// // }
// //
// // export interface Mesh {
// //   faces: Face[];
// //   adjacencyList: Map<Vertex, Vertex[]>;
// // }
// //
// // export interface Cutter {
// //   position: Vertex;
// //   direction: Vertex;
// // }
// //
// // export function createVertex(x: number, y: number, z: number): Vertex {
// //   return { x, y, z };
// // }
// //
// // export function createFace(vertices: Vertex[]): Face {
// //   return { vertices };
// // }
// //
// // export function placeCutter(mesh: Mesh, startVertex: Vertex): Cutter {
// //   const cutter: Cutter = {
// //     position: startVertex,
// //     direction: calculateFaceNormal(mesh.faces.find(face => face.vertices.includes(startVertex))!)
// //   };
// //   return cutter;
// // }
// //
// // export function activateCutter(cutter: Cutter): any {
// //   return calculateTangentPlane(cutter.position, cutter.direction);
// // }
// //
// // export function moveCutter(mesh: Mesh, cutter: Cutter, newPosition: Vertex): void {
// //   const projectedPosition = projectOntoTangentPlane(newPosition, cutter.position, cutter.direction);
// //   cutter.position = projectedPosition;
// //
// //   const currentFace = findCurrentFace(mesh, cutter.position);
// //   if (currentFace) {
// //     const intersectionResult = testEdgeIntersection(currentFace, cutter.position);
// //     if (intersectionResult) {
// //       retriangulateMesh(mesh, currentFace, intersectionResult);
// //     }
// //   }
// // }
// //
// // export function deactivateCutter(): void {
// //   // Implementation of cutter deactivation
// // }
// //
// // function calculateFaceNormal(face: Face): Vertex {
// //   const v1 = face.vertices[0];
// //   const v2 = face.vertices[1];
// //   const v3 = face.vertices[2];
// //   const edge1 = { x: v2.x - v1.x, y: v2.y - v1.y, z: v2.z - v1.z };
// //   const edge2 = { x: v3.x - v1.x, y: v3.y - v1.y, z: v3.z - v1.z };
// //   const normal = {
// //     x: edge1.y * edge2.z - edge1.z * edge2.y,
// //     y: edge1.z * edge2.x - edge1.x * edge2.z,
// //     z: edge1.x * edge2.y - edge1.y * edge2.x
// //   };
// //   const length = Math.sqrt(normal.x * normal.x + normal.y * normal.y + normal.z * normal.z);
// //   return { x: normal.x / length, y: normal.y / length, z: normal.z / length };
// // }
// //
// // function calculateTangentPlane(position: Vertex, normal: Vertex): any {
// //   // Placeholder function to calculate tangent plane
// //   return {};
// // }
// //
// // function projectOntoTangentPlane(newPosition: Vertex, currentPosition: Vertex, normal: Vertex): Vertex {
// //   // Placeholder function to project a position onto a tangent plane
// //   return newPosition;
// // }
// //
// // function findCurrentFace(mesh: Mesh, position: Vertex): Face | null {
// //   return mesh.faces.find(face => face.vertices.includes(position)) || null;
// // }
// //
// // function testEdgeIntersection(face: Face, position: Vertex): any | null {
// //   // Placeholder function to test edge intersection
// //   return null;
// // }
// //
// // function retriangulateMesh(mesh: Mesh, face: Face, intersectionResult: any): void {
// //   // Placeholder function to retriangulate the mesh based on intersection results
// // }
// //
// //
