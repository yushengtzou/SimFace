import Utils from './Utils';
// Enum 標誌（/!\）不應該改變（在 sgl 文件中序列化）
var Enums;
(function (Enums) {
    let Action;
    (function (Action) {
        Action[Action["NOTHING"] = 0] = "NOTHING";
        Action[Action["MASK_EDIT"] = 1] = "MASK_EDIT";
        Action[Action["SCULPT_EDIT"] = 2] = "SCULPT_EDIT";
        Action[Action["CAMERA_ZOOM"] = 3] = "CAMERA_ZOOM";
        Action[Action["CAMERA_ROTATE"] = 4] = "CAMERA_ROTATE";
        Action[Action["CAMERA_PAN"] = 5] = "CAMERA_PAN";
        Action[Action["CAMERA_PAN_ZOOM_ALT"] = 6] = "CAMERA_PAN_ZOOM_ALT";
    })(Action = Enums.Action || (Enums.Action = {}));
    // 雕刻工具
    let Tools;
    (function (Tools) {
        Tools[Tools["BRUSH"] = 0] = "BRUSH";
        Tools[Tools["INFLATE"] = 1] = "INFLATE";
        Tools[Tools["TWIST"] = 2] = "TWIST";
        Tools[Tools["SMOOTH"] = 3] = "SMOOTH";
        Tools[Tools["FLATTEN"] = 4] = "FLATTEN";
        Tools[Tools["PINCH"] = 5] = "PINCH";
        Tools[Tools["CREASE"] = 6] = "CREASE";
        Tools[Tools["DRAG"] = 7] = "DRAG";
        Tools[Tools["PAINT"] = 8] = "PAINT";
        Tools[Tools["MOVE"] = 9] = "MOVE";
        Tools[Tools["MASKING"] = 10] = "MASKING";
        Tools[Tools["LOCALSCALE"] = 11] = "LOCALSCALE";
        Tools[Tools["TRANSFORM"] = 12] = "TRANSFORM";
    })(Tools = Enums.Tools || (Enums.Tools = {}));
    // 顯示著色器類型
    let Shader;
    (function (Shader) {
        Shader[Shader["PBR"] = 0] = "PBR";
        Shader[Shader["FLAT"] = 1] = "FLAT";
        Shader[Shader["NORMAL"] = 2] = "NORMAL";
        Shader[Shader["WIREFRAME"] = 3] = "WIREFRAME";
        Shader[Shader["UV"] = 4] = "UV";
        Shader[Shader["MATCAP"] = 5] = "MATCAP";
        Shader[Shader["SELECTION"] = 6] = "SELECTION";
        Shader[Shader["BACKGROUND"] = 7] = "BACKGROUND";
        Shader[Shader["MERGE"] = 8] = "MERGE";
        Shader[Shader["FXAA"] = 9] = "FXAA";
        Shader[Shader["CONTOUR"] = 10] = "CONTOUR";
        Shader[Shader["PAINTUV"] = 11] = "PAINTUV";
        Shader[Shader["BLUR"] = 12] = "BLUR";
    })(Shader = Enums.Shader || (Enums.Shader = {}));
    // 相機投影
    let Projection;
    (function (Projection) {
        Projection[Projection["PERSPECTIVE"] = 0] = "PERSPECTIVE";
        Projection[Projection["ORTHOGRAPHIC"] = 1] = "ORTHOGRAPHIC"; // /!\
    })(Projection = Enums.Projection || (Enums.Projection = {}));
    // 相機模式
    let CameraMode;
    (function (CameraMode) {
        CameraMode[CameraMode["ORBIT"] = 0] = "ORBIT";
        CameraMode[CameraMode["SPHERICAL"] = 1] = "SPHERICAL";
        CameraMode[CameraMode["PLANE"] = 2] = "PLANE"; // /!\
    })(CameraMode = Enums.CameraMode || (Enums.CameraMode = {}));
    // 用於多分辨率選擇渲染的多分辨率級別
    let MultiState;
    (function (MultiState) {
        MultiState[MultiState["NONE"] = 0] = "NONE";
        MultiState[MultiState["SCULPT"] = 1] = "SCULPT";
        MultiState[MultiState["CAMERA"] = 2] = "CAMERA";
        MultiState[MultiState["PICKING"] = 3] = "PICKING";
    })(MultiState = Enums.MultiState || (Enums.MultiState = {}));
    // 與快捷鍵相關的操作
    // 工具索引必須匹配
    let acc = Object.keys(Tools).length;
    Enums.KeyAction = Utils.extend({
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
})(Enums || (Enums = {}));
export default Enums;
