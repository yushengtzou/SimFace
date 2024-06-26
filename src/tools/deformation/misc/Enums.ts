import Utils from './Utils';

// Enum 標誌（/!\）不應該改變（在 sgl 文件中序列化）

namespace Enums {
    export enum Action {
        NOTHING = 0,
        MASK_EDIT = 1,
        SCULPT_EDIT = 2,
        CAMERA_ZOOM = 3,
        CAMERA_ROTATE = 4,
        CAMERA_PAN = 5,
        CAMERA_PAN_ZOOM_ALT = 6
    }

    // 雕刻工具
    export enum Tools {
        BRUSH = 0,
        INFLATE = 1,
        TWIST = 2,
        SMOOTH = 3,
        FLATTEN = 4,
        PINCH = 5,
        CREASE = 6,
        DRAG = 7,
        PAINT = 8,
        MOVE = 9,
        MASKING = 10,
        LOCALSCALE = 11,
        TRANSFORM = 12
    }

    // 顯示著色器類型
    export enum Shader {
        PBR = 0, // /!\
        FLAT = 1,
        NORMAL = 2, // /!\
        WIREFRAME = 3,
        UV = 4, // /!\
        MATCAP = 5, // /!\
        SELECTION = 6,
        BACKGROUND = 7,
        MERGE = 8,
        FXAA = 9,
        CONTOUR = 10,
        PAINTUV = 11,
        BLUR = 12
    }

    // 相機投影
    export enum Projection {
        PERSPECTIVE = 0, // /!\
        ORTHOGRAPHIC = 1 // /!\
    }

    // 相機模式
    export enum CameraMode {
        ORBIT = 0, // /!\
        SPHERICAL = 1, // /!\
        PLANE = 2 // /!\
    }

    // 用於多分辨率選擇渲染的多分辨率級別
    export enum MultiState {
        NONE = 0,
        SCULPT = 1,
        CAMERA = 2,
        PICKING = 3
    }

    // 與快捷鍵相關的操作
    // 工具索引必須匹配
    let acc = Object.keys(Tools).length;
    export const KeyAction = Utils.extend({
        INTENSITY: acc++,
        RADIUS: acc++,
        NEGATIVE: acc++,
        PICKER: acc++,
        DELETE: acc++,
        CAMERA_FRONT: acc++,
        CAMERA_TOP: acc++,
        CAMERA_LEFT: acc++,
        CAMERA_RESET: acc++,
        STRIFE_LEFT: acc++,
        STRIFE_RIGHT: acc++,
        STRIFE_UP: acc++,
        STRIFE_DOWN: acc++,
        WIREFRAME: acc++,
        REMESH: acc++
    }, Tools);
}

export default Enums;