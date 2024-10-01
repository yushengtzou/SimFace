import { vec3, mat4 } from 'gl-matrix';
import Geometry from 'math3d/Geometry';

// Overview sculpt :
// start (check if we hit the mesh, start state stack) -> startSculpt
// startSculpt (init stuffs specific to the tool) -> sculptStroke

// sculptStroke (handle sculpt stroke by throttling/smoothing stroke) -> makeStroke
// makeStroke (handle symmetry and picking before sculping) -> stroke
// stroke (tool specific, move vertices, etc)

// update -> sculptStroke

class Drag {

  _lastMouseX: Number;
  _lastMouseY: Number;
  _radius: Number;
  _dragDir: Array<Number>;
  _dragDirSym: Array<Number>;
  _idAlpha: Number;

  constructor() {
    this._lastMouseX = 0.0;
    this._lastMouseY = 0.0;

    this._radius = 150;
    this._dragDir = [0.0, 0.0, 0.0];
    this._dragDirSym = [0.0, 0.0, 0.0];
    this._idAlpha = 0;
  }

  sculptStroke() {
    let main = this._main;
    let mesh = this.getMesh();
    let picking = main.getPicking();

    let dx = main._mouseX - this._lastMouseX;
    let dy = main._mouseY - this._lastMouseY;
    let dist = Math.sqrt(dx * dx + dy * dy);
    let minSpacing = 0.15 * this._radius;

    let step = 1.0 / Math.floor(dist / minSpacing);
    dx *= step;
    dy *= step;
    let mouseX = this._lastMouseX;
    let mouseY = this._lastMouseY;

    if (!picking.getMesh())
      return;
    picking._mesh = mesh;

    for (let i = 0.0; i < 1.0; i += step) {
      if (!this.makeStroke(mouseX, mouseY, picking, pickingSym))
        break;
      mouseX += dx;
      mouseY += dy;
    }

    this.updateRender();

    this._lastMouseX = main._mouseX;
    this._lastMouseY = main._mouseY;
  }

  makeStroke(mouseX, mouseY, picking, pickingSym) {
    var mesh = this.getMesh();
    this.updateDragDir(picking, mouseX, mouseY);
    picking.pickVerticesInSphere(picking.getLocalRadius2());
    picking.computePickedNormal();
    // if dyn topo, we need to the picking and the sculpting altogether
    if (mesh.isDynamic)
      this.stroke(picking, false);

    if (pickingSym) {
      this.updateDragDir(pickingSym, mouseX, mouseY, true);
      pickingSym.setLocalRadius2(picking.getLocalRadius2());
      pickingSym.pickVerticesInSphere(pickingSym.getLocalRadius2());
    }

    if (!mesh.isDynamic) this.stroke(picking, false);
    if (pickingSym) this.stroke(pickingSym, true);
    return true;
  }

  /** On stroke */
  stroke(picking, sym) {
    var iVertsInRadius = picking.getPickedVertices();

    // undo-redo
    this._main.getStateManager().pushVertices(iVertsInRadius);
    iVertsInRadius = this.dynamicTopology(picking);

    picking.updateAlpha(this._lockPosition);
    picking.setIdAlpha(this._idAlpha);
    this.drag(iVertsInRadius, picking.getIntersectionPoint(), picking.getLocalRadius2(), sym, picking);

    var mesh = this.getMesh();
    mesh.updateGeometry(mesh.getFacesFromVertices(iVertsInRadius), iVertsInRadius);
  }

  /** Drag deformation */
  drag(iVerts, center, radiusSquared, sym, picking) {
    var mesh = this.getMesh();
    var vAr = mesh.getVertices();
    var mAr = mesh.getMaterials();
    var radius = Math.sqrt(radiusSquared);
    var cx = center[0];
    var cy = center[1];
    var cz = center[2];
    var dir = sym ? this._dragDirSym : this._dragDir;
    var dirx = dir[0];
    var diry = dir[1];
    var dirz = dir[2];
    for (var i = 0, l = iVerts.length; i < l; ++i) {
      var ind = iVerts[i] * 3;
      var vx = vAr[ind];
      var vy = vAr[ind + 1];
      var vz = vAr[ind + 2];
      var dx = vx - cx;
      var dy = vy - cy;
      var dz = vz - cz;
      var dist = Math.sqrt(dx * dx + dy * dy + dz * dz) / radius;
      var fallOff = dist * dist;
      fallOff = 3.0 * fallOff * fallOff - 4.0 * fallOff * dist + 1.0;
      fallOff *= mAr[ind + 2] * picking.getAlpha(vx, vy, vz);
      vAr[ind] = vx + dirx * fallOff;
      vAr[ind + 1] = vy + diry * fallOff;
      vAr[ind + 2] = vz + dirz * fallOff;
    }
  }

  /** Set a few infos that will be needed for the drag function afterwards */
  updateDragDir(picking, mouseX, mouseY, useSymmetry) {
    let mesh = this.getMesh(); // 取得網格
    let vNear = picking.unproject(mouseX, mouseY, 0.0); // 近平面投影的 3D 點
    let vFar = picking.unproject(mouseX, mouseY, 0.1); // 遠平面投影的 3D 點
    let matInverse = mat4.create(); // 4x4 反矩陣
    mat4.invert(matInverse, mesh.getMatrix()); // 4x4 矩陣反運算
    vec3.transformMat4(vNear, vNear, matInverse); // 近平面點的座標轉換
    vec3.transformMat4(vFar, vFar, matInverse); // 遠平面點的座標轉換
    let dir = this._dragDir; // 儲存拖拉方向的陣列，型別是 vec3
    if (useSymmetry) {
      dir = this._dragDirSym;
      let ptPlane = mesh.getSymmetryOrigin();
      let nPlane = mesh.getSymmetryNormal();
      Geometry.mirrorPoint(vNear, ptPlane, nPlane);
      Geometry.mirrorPoint(vFar, ptPlane, nPlane);
    }
    let center = picking.getIntersectionPoint(); // 儲存點擊位置座標的陣列，型別是 vec3
    picking.setIntersectionPoint(Geometry.vertexOnLine(center, vNear, vFar));
    vec3.sub(dir, picking.getIntersectionPoint(), center);
    picking._mesh = mesh;
    picking.updateLocalAndWorldRadius2();
    let eyeDir = picking.getEyeDirection();
    vec3.sub(eyeDir, vFar, vNear);
    vec3.normalize(eyeDir, eyeDir);
  }
}

export default Drag;


  /** 
  *
  *
  *
  * Project the mouse coordinate into the world coordinate at a given z 
  unproject(mouseX, mouseY, z) {
    var out = [0.0, 0.0, 0.0];
    mat4.invert(_TMP_MAT, this.computeWorldToScreenMatrix(_TMP_MAT));
    return vec3.transformMat4(out, vec3.set(out, mouseX, this._height - mouseY, z), _TMP_MAT);
  *
  *
  * Project a vertex onto the screen 
  project(vector) {
    var out = [0.0, 0.0, 0.0];
    vec3.transformMat4(out, vector, this.computeWorldToScreenMatrix(_TMP_MAT));
    out[1] = this._height - out[1];
  *
  *
  *
  */


