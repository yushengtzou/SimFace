// types/three-bvh-csg.d.ts
declare module 'three-bvh-csg/build/index.module.js' {
    import * as THREE from 'three';
  
    export const SUBTRACTION: string;
    export class Brush {
      constructor(geometry: THREE.BufferGeometry);
      subtract(brush: Brush): Brush;
      intersect(brush: Brush): Brush;
      union(brush: Brush): Brush;
      geometry: THREE.BufferGeometry;
    }
    
    export class Evaluator {
      constructor();
      evaluate(brush1: Brush, brush2: Brush, operation: string): Brush;
    }
  }
  