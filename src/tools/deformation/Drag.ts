import * as THREE from 'three';
import SculptBase from './SculptBase';

class Drag extends SculptBase {
    private _dragDir: THREE.Vector3;
    private _dragDirSym: THREE.Vector3;
    private _idAlpha: number;

    constructor(main: any) {
        super(main);

        this._dragDir = new THREE.Vector3(0.0, 0.0, 0.0);
        this._dragDirSym = new THREE.Vector3(0.0, 0.0, 0.0);
        this._idAlpha = 0;
    }

    /**
     * 進行雕刻筆劃操作
     * 根據滑鼠的移動進行雕刻的筆劃操作，並更新模型
     */
    sculptStroke(): void {
        const main = this._main;
        const mesh = this.getMesh();
        const picking = main.getPicking();
        const pickingSym = main.getSculptManager().getSymmetry() ? main.getPickingSymmetry() : null;

        const dx = main._mouseX - this._lastMouseX;
        const dy = main._mouseY - this._lastMouseY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const minSpacing = 0.15 * this._radius;

        const step = 1.0 / Math.floor(dist / minSpacing);
        let mouseX = this._lastMouseX;
        let mouseY = this._lastMouseY;

        if (!picking.getMesh()) return;
        picking._mesh = mesh;
        if (pickingSym) {
            pickingSym._mesh = mesh;
            pickingSym.getIntersectionPoint().copy(picking.getIntersectionPoint());
            this.mirrorPoint(pickingSym.getIntersectionPoint(), mesh.getSymmetryOrigin(), mesh.getSymmetryNormal());
        }

        for (let i = 0.0; i < 1.0; i += step) {
            if (!this.makeStroke(mouseX, mouseY, picking, pickingSym)) break;
            mouseX += dx;
            mouseY += dy;
        }

        this.updateRender();

        this._lastMouseX = main._mouseX;
        this._lastMouseY = main._mouseY;
    }

    /**
     * 進行筆劃操作
     * 
     * @param mouseX - 滑鼠 X 坐標
     * @param mouseY - 滑鼠 Y 坐標
     * @param picking - 採樣物件
     * @param pickingSym - 對稱採樣物件
     * @returns 是否成功進行筆劃
     */
    makeStroke(mouseX: number, mouseY: number, picking: any, pickingSym: any): boolean {
        const mesh = this.getMesh();
        this.updateDragDir(picking, mouseX, mouseY);
        picking.pickVerticesInSphere(picking.getLocalRadius2());
        picking.computePickedNormal();

        if (mesh.isDynamic) this.stroke(picking, false);

        if (pickingSym) {
            this.updateDragDir(pickingSym, mouseX, mouseY, true);
            pickingSym.setLocalRadius2(picking.getLocalRadius2());
            pickingSym.pickVerticesInSphere(pickingSym.getLocalRadius2());
        }

        if (!mesh.isDynamic) this.stroke(picking, false);
        if (pickingSym) this.stroke(pickingSym, true);
        return true;
    }

    /**
     * 進行雕刻筆劃操作
     * 
     * @param picking - 採樣物件
     * @param sym - 是否對稱
     */
    stroke(picking: any, sym: boolean): void {
        let iVertsInRadius = picking.getPickedVertices();
        this._main.getStateManager().pushVertices(iVertsInRadius);
        iVertsInRadius = this.dynamicTopology(picking);

        picking.updateAlpha(this._lockPosition);
        picking.setIdAlpha(this._idAlpha);
        this.drag(iVertsInRadius, picking.getIntersectionPoint(), picking.getLocalRadius2(), sym, picking);

        const mesh = this.getMesh();
        mesh.updateGeometry(mesh.getFacesFromVertices(iVertsInRadius), iVertsInRadius);
    }

    /**
     * 拖動變形
     * 
     * @param iVerts - 頂點索引數組
     * @param center - 中心點 [x, y, z]
     * @param radiusSquared - 半徑平方
     * @param sym - 是否對稱
     * @param picking - 採樣物件
     */
    drag(
        iVerts: number[],
        center: THREE.Vector3,
        radiusSquared: number,
        sym: boolean,
        picking: any
    ): void {
        const mesh = this.getMesh();
        const vAr = mesh.getVertices();
        const mAr = mesh.getMaterials();
        const radius = Math.sqrt(radiusSquared);
        const [cx, cy, cz] = [center.x, center.y, center.z];
        const dir = sym ? this._dragDirSym : this._dragDir;
        const [dirx, diry, dirz] = [dir.x, dir.y, dir.z];

        for (let i = 0, l = iVerts.length; i < l; ++i) {
            const ind = iVerts[i] * 3;
            const vx = vAr[ind];
            const vy = vAr[ind + 1];
            const vz = vAr[ind + 2];
            const dx = vx - cx;
            const dy = vy - cy;
            const dz = vz - cz;
            const dist = Math.sqrt(dx * dx + dy * dy + dz * dz) / radius;
            let fallOff = dist * dist;
            fallOff = 3.0 * fallOff * fallOff - 4.0 * fallOff * dist + 1.0;
            fallOff *= mAr[ind + 2] * picking.getAlpha(vx, vy, vz);
            vAr[ind] = vx + dirx * fallOff;
            vAr[ind + 1] = vy + diry * fallOff;
            vAr[ind + 2] = vz + dirz * fallOff;
        }
    }

    /**
     * 設定拖動方向資訊
     * 
     * @param picking - 採樣物件
     * @param mouseX - 滑鼠 X 坐標
     * @param mouseY - 滑鼠 Y 坐標
     * @param useSymmetry - 是否使用對稱
     */
    updateDragDir(picking: any, mouseX: number, mouseY: number, useSymmetry?: boolean): void {
        const mesh = this.getMesh();
        const vNear = picking.unproject(mouseX, mouseY, 0.0);
        const vFar = picking.unproject(mouseX, mouseY, 0.1);
        const matInverse = new THREE.Matrix4().getInverse(mesh.getMatrixWorld());
        vNear.applyMatrix4(matInverse);
        vFar.applyMatrix4(matInverse);
        let dir = this._dragDir;
        if (useSymmetry) {
            dir = this._dragDirSym;
            const ptPlane = mesh.getSymmetryOrigin();
            const nPlane = mesh.getSymmetryNormal();
            this.mirrorPoint(vNear, ptPlane, nPlane);
            this.mirrorPoint(vFar, ptPlane, nPlane);
        }
        const center = picking.getIntersectionPoint();
        picking.setIntersectionPoint(this.vertexOnLine(center, vNear, vFar));
        dir.copy(picking.getIntersectionPoint()).sub(center);
        picking._mesh = mesh;
        picking.updateLocalAndWorldRadius2();
        const eyeDir = picking.getEyeDirection();
        eyeDir.copy(vFar).sub(vNear).normalize();
    }

    /**
     * 鏡像點
     * 
     * @param point - 被鏡像的點
     * @param origin - 對稱原點
     * @param normal - 對稱法線
     */
    mirrorPoint(point: THREE.Vector3, origin: THREE.Vector3, normal: THREE.Vector3): void {
        const toPoint = new THREE.Vector3().subVectors(point, origin);
        const distance = toPoint.dot(normal);
        point.sub(normal.clone().multiplyScalar(2 * distance));
    }

    /**
     * 計算點在線上的位置
     * 
     * @param start - 線段起點
     * @param end - 線段終點
     * @param point - 欲投影的點
     * @returns 投影點
     */
    vertexOnLine(start: THREE.Vector3, end: THREE.Vector3, point: THREE.Vector3): THREE.Vector3 {
        const line = new THREE.Vector3().subVectors(end, start);
        const projected = new THREE.Vector3().subVectors(point, start).projectOnVector(line);
        return projected.add(start);
    }
}

export default Drag; 