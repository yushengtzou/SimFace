"use strict";
// import * as THREE from 'three';
// import Utils from '../../misc/Utils'; // Ensure the correct path to Utils.js
// import Picking from '../../math3d/Picking'; // Ensure the correct path to Picking.js
// import Mesh from '../../mesh/Mesh'; // Ensure the correct path to Mesh.js
// import Geometry from '../mesh/Geometry'; // Ensure the correct path to Geometry.js
// import SculptBase from './SculptBase'; // Ensure the correct path to SculptBase.js
// class Drag  {
//     // Drag 類別的屬性型別定義
//     private _main: any; 
//     private _lastMouseX: number;
//     private _lastMouseY: number;
//     private _forceToolMesh: any;
//     private _lockPosition: boolean;
//     private _radius: number;
//     private _dragDir: THREE.Vector3;
//     private _dragDirSym: THREE.Vector3;
//     private _idAlpha: number;
//     constructor(main: any) {
//         this._main = main;
//         this._lastMouseX = 0.0;
//         this._lastMouseY = 0.0;
//         this._forceToolMesh = null;
//         this._lockPosition = false;
//         this._radius = 1;
//         // 為 THREE.Vector3 的物件分配記憶體空間
//         this._dragDir = new THREE.Vector3(0.0, 0.0, 0.0);
//         this._dragDirSym = new THREE.Vector3(0.0, 0.0, 0.0);
//         this._idAlpha = 0;
//     }
//     /**
//      * 
//      * 進行雕刻筆劃操作
//      * 根據滑鼠的移動進行雕刻的筆劃操作，並更新模型 
//      **/ 
//     sculptStroke(): void {
//         console.log("sculptStroke called");
//         const main = this._main;
//         const mesh = this.getMesh();
//         const picking = main.getPicking();
//         const pickingSym = false;
//         // const pickingSym = main.getSculptManager().getSymmetry() ? main.getPickingSymmetry() : null;
//         const dx = main._mouseX - this._lastMouseX;
//         const dy = main._mouseY - this._lastMouseY;
//         const dist = Math.sqrt(dx * dx + dy * dy);
//         const minSpacing = 0.15 * this._radius;
//         const step = 1.0 / Math.floor(dist / minSpacing);
//         let mouseX = this._lastMouseX;
//         let mouseY = this._lastMouseY;
//         // if (!picking.getMesh()) return;
//         if (!picking || typeof picking.getMesh !== 'function' || !picking.getMesh()) {
//             return;
//         }
//         picking._mesh = mesh;
//         if (pickingSym) {
//             // pickingSym._mesh = mesh;
//             // pickingSym.getIntersectionPoint().copy(picking.getIntersectionPoint());
//             // this.mirrorPoint(pickingSym.getIntersectionPoint(), mesh.getSymmetryOrigin(), mesh.getSymmetryNormal());
//         }
//         for (let i = 0.0; i < 1.0; i += step) {
//             if (!this.makeStroke(mouseX, mouseY, picking, pickingSym)) break;
//             mouseX += dx;
//             mouseY += dy;
//         }
//         this.updateRender();
//         this._lastMouseX = main._mouseX;
//         this._lastMouseY = main._mouseY;
//     }
//     /**
//      * 進行筆劃操作
//      * 
//      * @param mouseX - 滑鼠 X 坐標
//      * @param mouseY - 滑鼠 Y 坐標
//      * @param picking - 採樣物件
//      * @param pickingSym - 對稱採樣物件
//      * @returns 是否成功進行筆劃
//      */
//     makeStroke(mouseX: number, mouseY: number, picking: any, pickingSym: any): boolean {
//         const mesh = this.getMesh();
//         this.updateDragDir(picking, mouseX, mouseY);
//         picking.pickVerticesInSphere(picking.getLocalRadius2());
//         picking.computePickedNormal();
//         if (mesh.isDynamic) this.stroke(picking, false);
//         if (pickingSym) {
//             this.updateDragDir(pickingSym, mouseX, mouseY, true);
//             pickingSym.setLocalRadius2(picking.getLocalRadius2());
//             pickingSym.pickVerticesInSphere(pickingSym.getLocalRadius2());
//         }
//         if (!mesh.isDynamic) this.stroke(picking, false);
//         if (pickingSym) this.stroke(pickingSym, true);
//         return true;
//     }
//     /**
//      * 進行雕刻筆劃操作
//      * 
//      * @param picking - 採樣物件
//      * @param sym - 是否對稱
//      */
//     stroke(picking: any, sym: boolean): void {
//         let iVertsInRadius = picking.getPickedVertices();
//         this._main.getStateManager().pushVertices(iVertsInRadius);
//         iVertsInRadius = this.dynamicTopology(picking);
//         picking.updateAlpha(this._lockPosition);
//         picking.setIdAlpha(this._idAlpha);
//         this.drag(iVertsInRadius, picking.getIntersectionPoint(), picking.getLocalRadius2(), sym, picking);
//         const mesh = this.getMesh();
//         mesh.updateGeometry(mesh.getFacesFromVertices(iVertsInRadius), iVertsInRadius);
//     }
//     /**
//      * 拖動變形
//      * 
//      * @param iVerts - 頂點索引數組
//      * @param center - 中心點 [x, y, z]
//      * @param radiusSquared - 半徑平方
//      * @param sym - 是否對稱
//      * @param picking - 採樣物件
//      */
//     drag(
//         iVerts: number[],
//         center: THREE.Vector3,
//         radiusSquared: number,
//         sym: boolean,
//         picking: any
//     ): void {
//         const mesh = this.getMesh();
//         const vAr = mesh.getVertices();
//         const mAr = mesh.getMaterials();
//         const radius = Math.sqrt(radiusSquared);
//         const [cx, cy, cz] = [center.x, center.y, center.z];
//         const dir = sym ? this._dragDirSym : this._dragDir;
//         const [dirx, diry, dirz] = [dir.x, dir.y, dir.z];
//         for (let i = 0, l = iVerts.length; i < l; ++i) {
//             const ind = iVerts[i] * 3;
//             const vx = vAr[ind];
//             const vy = vAr[ind + 1];
//             const vz = vAr[ind + 2];
//             const dx = vx - cx;
//             const dy = vy - cy;
//             const dz = vz - cz;
//             const dist = Math.sqrt(dx * dx + dy * dy + dz * dz) / radius;
//             let fallOff = dist * dist;
//             fallOff = 3.0 * fallOff * fallOff - 4.0 * fallOff * dist + 1.0;
//             fallOff *= mAr[ind + 2] * picking.getAlpha(vx, vy, vz);
//             vAr[ind] = vx + dirx * fallOff;
//             vAr[ind + 1] = vy + diry * fallOff;
//             vAr[ind + 2] = vz + dirz * fallOff;
//         }
//     }
//     /**
//      * 設定拖動方向資訊
//      * 
//      * @param picking - 採樣物件
//      * @param mouseX - 滑鼠 X 坐標
//      * @param mouseY - 滑鼠 Y 坐標
//      * @param useSymmetry - 是否使用對稱
//      */
//     updateDragDir(picking: any, mouseX: number, mouseY: number, useSymmetry?: boolean): void {
//         const mesh = this.getMesh();
//         const vNear = picking.unproject(mouseX, mouseY, 0.0);
//         const vFar = picking.unproject(mouseX, mouseY, 0.1);
//         const matInverse = new THREE.Matrix4().getInverse(mesh.getMatrixWorld());
//         vNear.applyMatrix4(matInverse);
//         vFar.applyMatrix4(matInverse);
//         let dir = this._dragDir;
//         if (useSymmetry) {
//             dir = this._dragDirSym;
//             const ptPlane = mesh.getSymmetryOrigin();
//             const nPlane = mesh.getSymmetryNormal();
//             this.mirrorPoint(vNear, ptPlane, nPlane);
//             this.mirrorPoint(vFar, ptPlane, nPlane);
//         }
//         const center = picking.getIntersectionPoint();
//         picking.setIntersectionPoint(this.vertexOnLine(center, vNear, vFar));
//         dir.copy(picking.getIntersectionPoint()).sub(center);
//         picking._mesh = mesh;
//         picking.updateLocalAndWorldRadius2();
//         const eyeDir = picking.getEyeDirection();
//         eyeDir.copy(vFar).sub(vNear).normalize();
//     }
//     /**
//      * 鏡像點
//      * 
//      * @param point - 被鏡像的點
//      * @param origin - 對稱原點
//      * @param normal - 對稱法線
//      */
//     mirrorPoint(point: THREE.Vector3, origin: THREE.Vector3, normal: THREE.Vector3): void {
//         const toPoint = new THREE.Vector3().subVectors(point, origin);
//         const distance = toPoint.dot(normal);
//         point.sub(normal.clone().multiplyScalar(2 * distance));
//     }
//     /**
//      * 計算點在線上的位置
//      * 
//      * @param start - 線段起點
//      * @param end - 線段終點
//      * @param point - 欲投影的點
//      * @returns 投影點
//      */
//     vertexOnLine(start: THREE.Vector3, end: THREE.Vector3, point: THREE.Vector3): THREE.Vector3 {
//         const line = new THREE.Vector3().subVectors(end, start);
//         const projected = new THREE.Vector3().subVectors(point, start).projectOnVector(line);
//         return projected.add(start);
//     }
//     // 回傳引入的 BufferGeometry
//     getMesh(): any {
//         // return this._forceToolMesh || this._main.getMesh();
//         return this._forceToolMesh;
//     }
//     updateRender(): void {
//         this.updateMeshBuffers();
//         this._main.render();
//     }
//     dynamicTopology(picking: any): Uint32Array {
//         const mesh = this.getMesh();
//         let iVerts = picking.getPickedVertices();
//         if (!mesh.isDynamic) return iVerts;
//         const subFactor = mesh.getSubdivisionFactor();
//         const decFactor = mesh.getDecimationFactor();
//         if (subFactor === 0.0 && decFactor === 0.0) return iVerts;
//         if (iVerts.length === 0) {
//             iVerts = mesh.getVerticesFromFaces([picking.getPickedFace()]);
//             this._main.getStateManager().pushVertices(iVerts); // undo-redo
//         }
//         let iFaces = mesh.getFacesFromVertices(iVerts);
//         const radius2 = picking.getLocalRadius2();
//         const center = picking.getIntersectionPoint();
//         const d2Max = radius2 * (1.1 - subFactor) * 0.2;
//         const d2Min = (d2Max / 4.2025) * decFactor;
//         this._main.getStateManager().pushFaces(iFaces); // undo-redo
//         if (subFactor) {
//             iFaces = mesh.subdivide(iFaces, center, radius2, d2Max, this._main.getStateManager());
//         }
//         if (decFactor) {
//             iFaces = mesh.decimate(iFaces, center, radius2, d2Min, this._main.getStateManager());
//         }
//         iVerts = mesh.getVerticesFromFaces(iFaces);
//         const nbVerts = iVerts.length;
//         const sculptFlag = Utils.SCULPT_FLAG;
//         const vscf = mesh.getVerticesSculptFlags();
//         let iVertsInRadius = new Uint32Array(Utils.getMemory(nbVerts * 4), 0, nbVerts);
//         let acc = 0;
//         for (let i = 0; i < nbVerts; ++i) {
//             const iVert = iVerts[i];
//             if (vscf[iVert] === sculptFlag) iVertsInRadius[acc++] = iVert;
//         }
//         iVertsInRadius = new Uint32Array(iVertsInRadius.subarray(0, acc));
//         mesh.updateTopology(iFaces, iVerts);
//         mesh.updateGeometry(iFaces, iVerts);
//         return iVertsInRadius;
//     }
//     updateMeshBuffers(): void {
//         const mesh = this.getMesh();
//         if (mesh.isDynamic) {
//             mesh.updateBuffers();
//         } else {
//             mesh.updateGeometryBuffers();
//         }
//     }
// }
// export default Drag; 
