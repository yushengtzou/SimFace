import * as THREE from 'three';
// Define the Drag class
class Drag {
    constructor(sceneObjects) {
        this.sceneObjects = sceneObjects;
        this._main = { _mouseX: 0, _mouseY: 0 };
        this.dragDir = new THREE.Vector3(0, 0, 1); // Initial direction
    }
    sculptStroke() {
        const { raycaster, scene, camera } = this.sceneObjects;
        const clickMouse = new THREE.Vector2();
        clickMouse.x = (this._main._mouseX / window.innerWidth) * 2 - 1;
        clickMouse.y = -(this._main._mouseY / window.innerHeight) * 2 + 1;
        raycaster.setFromCamera(clickMouse, camera);
        const found = raycaster.intersectObjects(scene.children);
        if (found.length > 0) {
            const mesh = found[0].object;
            if (mesh.geometry) {
                const geometry = mesh.geometry;
                const point = found[0].point;
                const center = new THREE.Vector3().copy(point);
                const radiusSquared = 0.1 * 0.1; // Assuming MAX_CLICK_DISTANCE is 0.1
                for (let i = 0; i < geometry.attributes.position.count; i++) {
                    const vector3 = new THREE.Vector3(geometry.attributes.position.getX(i), geometry.attributes.position.getY(i), geometry.attributes.position.getZ(i));
                    const toWorld = mesh.localToWorld(vector3.clone());
                    const distance = point.distanceTo(toWorld);
                    if (distance < 0.1) { // Assuming MAX_CLICK_DISTANCE is 0.1
                        const dx = vector3.x - center.x;
                        const dy = vector3.y - center.y;
                        const dz = vector3.z - center.z;
                        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz) / Math.sqrt(radiusSquared);
                        let fallOff = dist * dist;
                        fallOff = 3.0 * fallOff * fallOff - 4.0 * fallOff * dist + 1.0;
                        fallOff *= 1; // Assuming mAr[ind + 2] * picking.getAlpha(vx, vy, vz) is 1 for simplicity
                        // Use dynamic dragDir
                        geometry.attributes.position.setXYZ(i, vector3.x + this.dragDir.x * fallOff, vector3.y + this.dragDir.y * fallOff, vector3.z + this.dragDir.z * fallOff);
                    }
                }
                geometry.computeVertexNormals();
                geometry.attributes.position.needsUpdate = true;
            }
            else {
                console.warn('Mesh geometry is null or undefined.');
            }
        }
        else {
            console.warn('No intersected objects found.');
        }
    }
}
export default Drag;
