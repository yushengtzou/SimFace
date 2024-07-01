// import { vec2, vec3, mat3, mat4, quat } from 'gl-matrix';
// import getOptionsURL from '../misc/getOptionsURL';
// import Enums from '../misc/Enums';
// import Utils from '../misc/Utils';
// import Geometry from '../math3d/Geometry';

// const easeOutQuart = (r: number): number => {
//   r = Math.min(1.0, r) - 1.0;
//   return -(r * r * r * r - 1.0);
// };

// const DELAY_SNAP = 200;
// const DELAY_ROTATE = -1;
// const DELAY_TRANSLATE = -1;
// const DELAY_MOVE_TO = 200;

// const _TMP_VEC2: vec2 = [0.0, 0.0];
// const _TMP_VEC3: vec3 = [0.0, 0.0, 0.0];
// const _TMP_VEC3_2: vec3 = [0.0, 0.0, 0.0];
// const _UP: vec3 = [0.0, 1.0, 0.0];
// const _TMP_QUAT: quat = [0.0, 0.0, 0.0, 1.0];
// const _TMP_MAT: mat4 = mat4.create();

// const _sq = Math.SQRT1_2;
// const _d = 0.5;
// const _QUAT_COMP: quat[] = [
//   quat.fromValues(1, 0, 0, 0),
//   quat.fromValues(0, 1, 0, 0),
//   quat.fromValues(0, 0, 1, 0),
//   quat.fromValues(0, 0, 0, 1),
//   quat.fromValues(_sq, _sq, 0, 0),
//   quat.fromValues(_sq, -_sq, 0, 0),
//   quat.fromValues(_sq, 0, _sq, 0),
//   quat.fromValues(_sq, 0, -_sq, 0),
//   quat.fromValues(_sq, 0, 0, _sq),
//   quat.fromValues(_sq, 0, 0, -_sq),
//   quat.fromValues(0, _sq, _sq, 0),
//   quat.fromValues(0, _sq, -_sq, 0),
//   quat.fromValues(0, _sq, 0, _sq),
//   quat.fromValues(0, _sq, 0, -_sq),
//   quat.fromValues(0, 0, _sq, _sq),
//   quat.fromValues(0, 0, _sq, -_sq),
//   quat.fromValues(_d, _d, _d, _d),
//   quat.fromValues(_d, _d, _d, -_d),
//   quat.fromValues(_d, _d, -_d, _d),
//   quat.fromValues(_d, _d, -_d, -_d),
//   quat.fromValues(_d, -_d, _d, _d),
//   quat.fromValues(_d, -_d, _d, -_d),
//   quat.fromValues(_d, -_d, -_d, _d),
//   quat.fromValues(-_d, _d, _d, _d),
// ];

// class Camera {
//   private _main: any;
//   private _mode: Enums.CameraMode;
//   private _projectionType: Enums.Projection;
//   private _quatRot: quat;
//   private _view: mat4;
//   private _proj: mat4;
//   private _viewport: mat4;
//   private _lastNormalizedMouseXY: vec2;
//   private _width: number;
//   private _height: number;
//   private _speed: number;
//   private _fov: number;
//   private _trans: vec3;
//   private _moveX: number;
//   private _moveZ: number;
//   private _usePivot: boolean;
//   private _center: vec3;
//   private _offset: vec3;
//   private _rotX: number;
//   private _rotY: number;
//   private _near: number;
//   private _far: number;
//   private _timers: { [key: string]: number };
//   private _lastBBox?: vec3;

//   constructor(main: any) {
//     this._main = main;

//     const opts = getOptionsURL();
//     this._mode = opts.cameramode || Enums.CameraMode.ORBIT; // SPHERICAL / PLANE
//     this._projectionType = opts.projection || Enums.Projection.PERSPECTIVE; // ORTHOGRAPHIC

//     this._quatRot = quat.create(); // quaternion rotation
//     this._view = mat4.create(); // view matrix
//     this._proj = mat4.create(); // projection matrix
//     this._viewport = mat4.create(); // viewport matrix

//     this._lastNormalizedMouseXY = [0.0, 0.0]; // last mouse position ( 0..1 )
//     this._width = 0.0; // viewport width
//     this._height = 0.0; // viewport height

//     this._speed = 0.0; // solve scale issue
//     this._fov = Math.min(opts.fov, 150); // vertical field of view

//     // translation stuffs
//     this._trans = [0.0, 0.0, 30.0];
//     this._moveX = 0; // free look (strafe), possible values: -1, 0, 1
//     this._moveZ = 0; // free look (strafe), possible values: -1, 0, 1

//     // pivot stuffs
//     this._usePivot = opts.pivot; // if rotation is centered around the picked point
//     this._center = [0.0, 0.0, 0.0]; // center of rotation
//     this._offset = [0.0, 0.0, 0.0];

//     // orbit camera
//     this._rotX = 0.0; // x rot for orbit camera
//     this._rotY = 0.0; // y rot for orbit camera

//     // near far
//     this._near = 0.05;
//     this._far = 5000.0;

//     this._timers = {}; // animation timers

//     this.resetView();
//   }

//   setProjectionType(type: Enums.Projection): void {
//     this._projectionType = type;
//     this.updateProjection();
//     this.updateView();
//   }

//   setMode(mode: Enums.CameraMode): void {
//     this._mode = mode;
//     if (mode === Enums.CameraMode.ORBIT) this.resetViewFront();
//   }

//   setFov(fov: number): void {
//     this._fov = fov;
//     this.updateView();
//     this.optimizeNearFar();
//   }

//   setUsePivot(usePivot: boolean): void {
//     this._usePivot = usePivot;
//   }

//   toggleUsePivot(): void {
//     this._usePivot = !this._usePivot;
//   }

//   getView(): mat4 {
//     return this._view;
//   }

//   getProjection(): mat4 {
//     return this._proj;
//   }

//   getProjectionType(): Enums.Projection {
//     return this._projectionType;
//   }

//   isOrthographic(): boolean {
//     return this._projectionType === Enums.Projection.ORTHOGRAPHIC;
//   }

//   getMode(): Enums.CameraMode {
//     return this._mode;
//   }

//   getFov(): number {
//     return this._fov;
//   }

//   getUsePivot(): boolean {
//     return this._usePivot;
//   }

//   getConstantScreen(): number {
//     const cwidth = this._main.getCanvas().clientWidth;
//     if (this._projectionType === Enums.Projection.ORTHOGRAPHIC) return cwidth / this.getOrthoZoom();
//     return cwidth * this._proj[0];
//   }

//   start(mouseX: number, mouseY: number): void {
//     this._lastNormalizedMouseXY = Geometry.normalizedMouse(mouseX, mouseY, this._width, this._height);
//     if (!this._usePivot) return;
//     const main = this._main;
//     const picking = main.getPicking();
//     picking.intersectionMouseMeshes(main.getMeshes(), mouseX, mouseY);
//     if (picking.getMesh()) {
//       vec3.transformMat4(_TMP_VEC3, picking.getIntersectionPoint(), picking.getMesh().getMatrix());
//       this.setPivot(_TMP_VEC3);
//     }
//   }

//   setPivot(pivot: vec3): void {
//     vec3.transformQuat(this._offset, this._offset, quat.invert(_TMP_QUAT, this._quatRot));
//     vec3.sub(this._offset, this._offset, this._center);

//     // set new pivot
//     vec3.copy(this._center, pivot);
//     vec3.add(this._offset, this._offset, this._center);
//     vec3.transformQuat(this._offset, this._offset, this._quatRot);

//     // adjust zoom
//     if (this._projectionType === Enums.Projection.PERSPECTIVE) {
//       const oldZoom = this.getTransZ();
//       this._trans[2] = vec3.dist(this.computePosition(), this._center) * this._fov / 45;
//       this._offset[2] += this.getTransZ() - oldZoom;
//     } else {
//       this._offset[2] = 0.0;
//     }
//   }

//   /** Compute rotation values (by updating the quaternion) */
//   rotate(mouseX: number, mouseY: number): void {
//     const axisRot = _TMP_VEC3;
//     const diff = _TMP_VEC2;

//     const normalizedMouseXY = Geometry.normalizedMouse(mouseX, mouseY, this._width, this._height);
//     if (this._mode === Enums.CameraMode.ORBIT) {
//       vec2.sub(diff, normalizedMouseXY, this._lastNormalizedMouseXY);
//       this.setOrbit(this._rotX - diff[1] * 2, this._rotY + diff[0] * 2);

//       this.rotateDelay([-diff[1] * 6, diff[0] * 6], DELAY_ROTATE);

//     } else if (this._mode === Enums.CameraMode.PLANE) {
//       const length = vec2.dist(this._lastNormalizedMouseXY, normalizedMouseXY);
//       vec2.sub(diff, normalizedMouseXY, this._lastNormalizedMouseXY);
//       vec3.normalize(axisRot, vec3.set(axisRot, -diff[1], diff[0], 0.0));
//       quat.mul(this._quatRot, quat.setAxisAngle(_TMP_QUAT, axisRot, length * 2.0), this._quatRot);

//       this.rotateDelay([axisRot[0], axisRot[1], axisRot[2], length * 6], DELAY_ROTATE);

//     } else if (this._mode === Enums.CameraMode.SPHERICAL) {
//       const mouseOnSphereBefore = Geometry.mouseOnUnitSphere(this._lastNormalizedMouseXY);
//       const mouseOnSphereAfter = Geometry.mouseOnUnitSphere(normalizedMouseXY);
//       const angle = Math.acos(Math.min(1.0, vec3.dot(mouseOnSphereBefore, mouseOnSphereAfter)));
//       vec3.normalize(axisRot, vec3.cross(axisRot, mouseOnSphereBefore, mouseOnSphereAfter));
//       quat.mul(this._quatRot, quat.setAxisAngle(_TMP_QUAT, axisRot, angle * 2.0), this._quatRot);

//       this.rotateDelay([axisRot[0], axisRot[1], axisRot[2], angle * 6], DELAY_ROTATE);
//     }

//     this._lastNormalizedMouseXY = normalizedMouseXY;
//     this.updateView();
//   }

//   setOrbit(rx: number, ry: number): void {
//     const radLimit = Math.PI * 0.49;
//     this._rotX = Math.max(Math.min(rx, radLimit), -radLimit);
//     this._rotY = ry;
//     const qrt = this._quatRot;
//     quat.identity(qrt);
//     quat.rotateX(qrt, qrt, this._rotX);
//     quat.rotateY(qrt, qrt, this._rotY);
//   }

//   getTransZ(): number {
//     return this._projectionType === Enums.Projection.PERSPECTIVE ? this._trans[2] * 45 / this._fov : 1000.0;
//   }

//   updateView(): void {
//     const center = _TMP_VEC3;

//     const view = this._view;
//     const tx = this._trans[0];
//     const ty = this._trans[1];

//     const off = this._offset;
//     vec3.set(_TMP_VEC3_2, tx - off[0], ty - off[1], this.getTransZ() - off[2]);
//     vec3.set(center, tx - off[0], ty - off[1], -off[2]);
//     mat4.lookAt(view, _TMP_VEC3_2, center, _UP);

//     mat4.mul(view, view, mat4.fromQuat(_TMP_MAT, this._quatRot));
//     mat4.translate(view, view, vec3.negate(_TMP_VEC3, this._center));
//   }

//   optimizeNearFar(bb?: vec3): void {
//     if (!bb) bb = this._lastBBox;
//     if (!bb) return;
//     this._lastBBox = bb;

//     const eye = this.computePosition(_TMP_VEC3_2);
//     const boxCenter = vec3.set(_TMP_VEC3, (bb[0] + bb[3]) * 0.5, (bb[1] + bb[4]) * 0.5, (bb[2] + bb[5]) * 0.5);
//     const distToBoxCenter = vec3.dist(eye, boxCenter);

//     const boxRadius = 0.5 * vec3.dist(bb, vec3.set(_TMP_VEC3, bb[3], bb[4], bb[5]));
//     this._near = Math.max(0.01, distToBoxCenter - boxRadius);
//     this._far = boxRadius + distToBoxCenter;
//     this.updateProjection();
//   }

//   updateProjection(): void {
//     if (this._projectionType === Enums.Projection.PERSPECTIVE) {
//       mat4.perspective(this._proj, this._fov * Math.PI / 180.0, this._width / this._height, this._near, this._far);
//       this._proj[10] = -1.0;
//       this._proj[14] = -2 * this._near;
//     } else {
//       this.updateOrtho();
//     }
//   }

//   updateTranslation(): void {
//     const trans = this._trans;
//     trans[0] += this._moveX * this._speed * trans[2] / 50 / 400.0;
//     trans[2] = Math.max(0.00001, trans[2] + this._moveZ * this._speed / 400.0);
//     if (this._projectionType === Enums.Projection.ORTHOGRAPHIC) this.updateOrtho();
//     this.updateView();
//   }

//   translate(dx: number, dy: number): void {
//     const factor = this._speed * this._trans[2] / 54;
//     const delta: vec3 = [-dx * factor, dy * factor, 0.0];
//     this.setTrans(vec3.add(this._trans, this._trans, delta));

//     vec3.scale(delta, delta, 5);
//     this.translateDelay(delta, DELAY_TRANSLATE);
//   }

//   zoom(df: number): void {
//     const delta: vec3 = [0.0, 0.0, 0.0];
//     vec3.sub(delta, this._offset, this._trans);
//     vec3.scale(delta, delta, df * this._speed / 54);
//     if (df < 0.0) delta[0] = delta[1] = 0.0;
//     this.setTrans(vec3.add(this._trans, this._trans, delta));

//     vec3.scale(delta, delta, 5);
//     this.translateDelay(delta, DELAY_TRANSLATE);
//   }

//   setAndFocusOnPivot(pivot: vec3, zoom: number): void {
//     this.setPivot(pivot);
//     this.moveToDelay(this._offset[0], this._offset[1], this._offset[2] + zoom);
//   }

//   moveToDelay(x: number, y: number, z: number): void {
//     const delta: vec3 = [x, y, z];
//     this.translateDelay(vec3.sub(delta, delta, this._trans), DELAY_MOVE_TO);
//   }

//   setTrans(trans: vec3): void {
//     vec3.copy(this._trans, trans);
//     if (this._projectionType === Enums.Projection.ORTHOGRAPHIC) this.updateOrtho();
//     this.updateView();
//   }

//   getOrthoZoom(): number {
//     return Math.abs(this._trans[2]) * 0.00055;
//   }

//   updateOrtho(): void {
//     const delta = this.getOrthoZoom();
//     const w = this._width * delta;
//     const h = this._height * delta;
//     mat4.ortho(this._proj, -w, w, -h, h, -this._near, this._far);
//   }

//   computePosition(out: vec3 = [0, 0, 0]): vec3 {
//     const view = this._view;
//     vec3.set(out, -view[12], -view[13], -view[14]);

//     mat3.fromMat4(_TMP_MAT, view);
//     mat3.transpose(_TMP_MAT, _TMP_MAT);
//     return vec3.transformMat3(out, out, _TMP_MAT);
//   }

//   resetView(): void {
//     this._speed = Utils.SCALE * 1.5;
//     this.centerDelay([0.0, 0.0, 0.0], DELAY_MOVE_TO);
//     this.offsetDelay([0.0, 0.0, 0.0], DELAY_MOVE_TO);
//     const delta: vec3 = [0.0, 0.0, 30.0 + this._speed / 3.0];
//     vec3.sub(delta, delta, this._trans);
//     this.translateDelay(delta, DELAY_MOVE_TO);
//     this.quatDelay([0.0, 0.0, 0.0, 1.0], DELAY_MOVE_TO);
//   }

//   resetViewFront(): void {
//     this.quatDelay([0.0, 0.0, 0.0, 1.0], DELAY_SNAP);
//   }

//   resetViewBack(): void {
//     this.quatDelay([0.0, 1.0, 0.0, 0.0], DELAY_SNAP);
//   }

//   resetViewTop(): void {
//     this.quatDelay([Math.SQRT1_2, 0.0, 0.0, Math.SQRT1_2], DELAY_SNAP);
//   }

//   resetViewBottom(): void {
//     this.quatDelay([-Math.SQRT1_2, 0.0, 0.0, Math.SQRT1_2], DELAY_SNAP);
//   }

//   resetViewLeft(): void {
//     this.quatDelay([0.0, -Math.SQRT1_2, 0.0, Math.SQRT1_2], DELAY_SNAP);
//   }

//   resetViewRight(): void {
//     this.quatDelay([0.0, Math.SQRT1_2, 0.0, Math.SQRT1_2], DELAY_SNAP);
//   }

//   toggleViewFront(): void {
//     if (Math.abs(this._quatRot[3]) > 0.99) this.resetViewBack();
//     else this.resetViewFront();
//   }

//   toggleViewTop(): void {
//     const dot = this._quatRot[0] * Math.SQRT1_2 + this._quatRot[3] * Math.SQRT1_2;
//     if (dot * dot > 0.99) this.resetViewBottom();
//     else this.resetViewTop();
//   }

//   toggleViewLeft(): void {
//     const dot = -this._quatRot[1] * Math.SQRT1_2 + this._quatRot[3] * Math.SQRT1_2;
//     if (dot * dot > 0.99) this.resetViewRight();
//     else this.resetViewLeft();
//   }

//   computeWorldToScreenMatrix(mat?: mat4): mat4 {
//     mat = mat || mat4.create();
//     return mat4.mul(mat, mat4.mul(mat, this._viewport, this._proj), this._view);
//   }

//   /** Project the mouse coordinate into the world coordinate at a given z */
//   unproject(mouseX: number, mouseY: number, z: number): vec3 {
//     const out: vec3 = [0.0, 0.0, 0.0];
//     mat4.invert(_TMP_MAT, this.computeWorldToScreenMatrix(_TMP_MAT));
//     return vec3.transformMat4(out, vec3.set(out, mouseX, this._height - mouseY, z), _TMP_MAT);
//   }

//   /** Project a vertex onto the screen */
//   project(vector: vec3): vec3 {
//     const out: vec3 = [0.0, 0.0, 0.0];
//     vec3.transformMat4(out, vector, this.computeWorldToScreenMatrix(_TMP_MAT));
//     out[1] = this._height - out[1];
//     return out;
//   }

//   onResize(width: number, height: number): void {
//     this._width = width;
//     this._height = height;

//     const vp = this._viewport;
//     mat4.identity(vp);
//     mat4.scale(vp, vp, vec3.set(_TMP_VEC3, 0.5 * width, 0.5 * height, 0.5));
//     mat4.translate(vp, vp, vec3.set(_TMP_VEC3, 1.0, 1.0, 1.0));

//     this.updateProjection();
//   }

//   snapClosestRotation(): void {
//     const qrot = this._quatRot;
//     let min = Infinity;
//     let id = 0;
//     const nbQComp = _QUAT_COMP.length;
//     for (let i = 0; i < nbQComp; ++i) {
//       const dot = quat.dot(qrot, _QUAT_COMP[i]);
//       const dotDiff = 1 - dot * dot;
//       if (min < dotDiff) continue;
//       min = dotDiff;
//       id = i;
//     }
//     this.quatDelay(_QUAT_COMP[id], DELAY_SNAP);
//   }

//   clearTimerN(n: string): void {
//     window.clearInterval(this._timers[n]);
//     this._timers[n] = 0;
//   }

//   delay(cb: (dr: number, r?: number) => void, duration: number, name?: string): void {
//     const nTimer = name || 'default';
//     if (this._timers[nTimer]) this.clearTimerN(nTimer);

//     if (duration === 0.0) return cb(1.0);
//     else if (duration < 0.0) return;

//     let lastR = 0;
//     const tStart = new Date().getTime();
//     this._timers[nTimer] = window.setInterval(() => {
//       let r = (new Date().getTime() - tStart) / duration;
//       r = easeOutQuart(r);
//       cb(r - lastR, r);
//       lastR = r;
//       if (r >= 1.0) this.clearTimerN(nTimer);
//     }, 16.6);
//   }

//   _translateDelta(delta: vec3, dr: number): void {
//     const trans = this._trans;
//     vec3.scaleAndAdd(trans, trans, delta, dr);
//     this.setTrans(trans);
//     this._main.render();
//   }

//   translateDelay(delta: vec3, duration: number): void {
//     const cb = this._translateDelta.bind(this, delta);
//     this.delay(cb, duration, 'translate');
//   }

//   _rotDelta(delta: vec3, dr: number): void {
//     if (this._mode === Enums.CameraMode.ORBIT) {
//       const rx = this._rotX + delta[0] * dr;
//       const ry = this._rotY + delta[1] * dr;
//       this.setOrbit(rx, ry);
//     } else {
//       quat.mul(this._quatRot, quat.setAxisAngle(_TMP_QUAT, delta, delta[3] * dr), this._quatRot);
//     }
//     this.updateView();
//     this._main.render();
//   }

//   rotateDelay(delta: vec3, duration: number): void {
//     const cb = this._rotDelta.bind(this, delta);
//     this.delay(cb, duration, 'rotate');
//   }

//   _quatDelta(qDelta: quat, dr: number): void {
//     quat.identity(_TMP_QUAT);
//     quat.slerp(_TMP_QUAT, _TMP_QUAT, qDelta, dr);
//     const qrt = this._quatRot;
//     quat.mul(this._quatRot, this._quatRot, _TMP_QUAT);

//     if (this._mode === Enums.CameraMode.ORBIT) {
//       const qx = qrt[0];
//       const qy = qrt[1];
//       const qz = qrt[2];
//       const qw = qrt[3];
//       // find back euler values
//       this._rotY = Math.atan2(2 * (qw * qy + qz * qx), 1 - 2 * (qy * qy + qz * qz));
//       this._rotX = Math.atan2(2 * (qw * qx + qy * qz), 1 - 2 * (qz * qz + qx * qx));
//     }

//     this.updateView();
//     this._main.render();
//   }

//   quatDelay(target: quat, duration: number): void {
//     const qDelta: quat = quat.create();
//     quat.conjugate(qDelta, this._quatRot);
//     quat.mul(qDelta, qDelta, target);
//     quat.normalize(qDelta, qDelta);

//     const cb = this._quatDelta.bind(this, qDelta);
//     this.delay(cb, duration, 'quat');
//   }

//   _centerDelta(delta: vec3, dr: number): void {
//     vec3.scaleAndAdd(this._center, this._center, delta, dr);
//     this.updateView();
//     this._main.render();
//   }

//   centerDelay(target: vec3, duration: number): void {
//     const delta: vec3 = [0.0, 0.0, 0.0];
//     vec3.sub(delta, target, this._center);
//     const cb = this._centerDelta.bind(this, delta);
//     this.delay(cb, duration, 'center');
//   }

//   _offsetDelta(delta: vec3, dr: number): void {
//     vec3.scaleAndAdd(this._offset, this._offset, delta, dr);
//     this.updateView();
//     this._main.render();
//   }

//   offsetDelay(target: vec3, duration: number): void {
//     const delta: vec3 = [0.0, 0.0, 0.0];
//     vec3.sub(delta, target, this._offset);
//     const cb = this._offsetDelta.bind(this, delta);
//     this.delay(cb, duration, 'offset');
//   }

//   computeFrustumFit(): number {
//     const near = this._near;
//     let x: number;

//     if (this._projectionType === Enums.Projection.ORTHOGRAPHIC) {
//       x = Math.min(this._width, this._height) / near * 0.5;
//       return Math.sqrt(1.0 + x * x) / x;
//     }

//     const proj = this._proj;
//     const left = near * (proj[8] - 1.0) / proj[0];
//     const right = near * (1.0 + proj[8]) / proj[0];
//     const top = near * (1.0 + proj[9]) / proj[5];
//     const bottom = near * (proj[9] - 1.0) / proj[5];
//     const vertical2 = Math.abs(right - left);
//     const horizontal2 = Math.abs(top - bottom);

//     x = Math.min(horizontal2, vertical2) / near * 0.5;
//     return (this._fov / 45.0) * Math.sqrt(1.0 + x * x) / x;
//   }
// }

// export default Camera;
