import * as THREE from 'three';
const Utils = {};
// 常數
Utils.SCALE = 100.0; // 縮放因子
Utils.TAG_FLAG = 1; // 標誌值，用於比較（總是 >= 標籤值）
Utils.SCULPT_FLAG = 1; // 標誌值，用於雕刻（總是 >= 標籤值）
Utils.STATE_FLAG = 1; // 標誌值，用於狀態（總是 >= 標籤值）
Utils.TRI_INDEX = 4294967295; // 只是一個大的整數，用來標誌無效的正索引
// 滑鼠指標
Utils.cursors = {};
Utils.cursors.dropper = 'url(resources/dropper.png) 5 25, auto'; // 吸管工具的滑鼠指標
// 顏色轉換函數
Utils.linearToSRGB1 = function (x) {
    return x < 0.0031308 ? x * 12.92 : 1.055 * Math.pow(x, 1.0 / 2.4) - 0.055;
};
// 將 sRGB 顏色值轉換為線性空間顏色值
Utils.sRGBToLinear1 = function (x) {
    return x < 0.04045 ? x * (1.0 / 12.92) : Math.pow((x + 0.055) * (1.0 / 1.055), 2.4);
};
// 對象操作函數
Utils.extend = function (dest, src) {
    const keys = Object.keys(src);
    for (let i = 0, l = keys.length; i < l; ++i) {
        const key = keys[i];
        if (dest[key] === undefined)
            dest[key] = src[key];
    }
    return dest;
};
// 反轉對象的鍵值對
Utils.invert = function (obj) {
    const keys = Object.keys(obj);
    const inv = {};
    for (let i = 0, nbkeys = keys.length; i < nbkeys; ++i)
        inv[obj[keys[i]]] = keys[i];
    return inv;
};
// 陣列操作函數
// 替換陣列中的元素
Utils.replaceElement = function (array, oldValue, newValue) {
    for (let i = 0, l = array.length; i < l; ++i) {
        if (array[i] === oldValue) {
            array[i] = newValue;
            return;
        }
    }
};
// 從陣列中移除元素
Utils.removeElement = function (array, remValue) {
    for (let i = 0, l = array.length; i < l; ++i) {
        if (array[i] === remValue) {
            array[i] = array[l - 1];
            array.pop();
            return;
        }
    }
};
// 將兩個陣列合併
Utils.appendArray = function (array1, array2) {
    const nb1 = array1.length;
    const nb2 = array2.length;
    array1.length += nb2;
    for (let i = 0; i < nb2; ++i)
        array1[nb1 + i] = array2[i];
};
// 返回 true 如果數字是二的冪次
Utils.isPowerOfTwo = function (x) {
    return x !== 0 && (x & (x - 1)) === 0;
};
// 返回最接近的二的冪次值
Utils.nextHighestPowerOfTwo = function (x) {
    --x;
    for (let i = 1; i < 32; i <<= 1)
        x = x | (x >> i);
    return x + 1;
};
const sortFunc = function (a, b) {
    return a - b;
};
// 對陣列進行排序並刪除重複值
Utils.tidy = function (array) {
    array.sort(sortFunc);
    const len = array.length;
    let j = 0;
    for (let i = 1; i < len; ++i) {
        if (array[j] !== array[i])
            array[++j] = array[i];
    }
    if (len > 1)
        array.length = j + 1;
};
// 兩個陣列的交集
Utils.intersectionArrays = function (a, b) {
    let ai = 0;
    let bi = 0;
    const result = [];
    const aLen = a.length;
    const bLen = b.length;
    while (ai < aLen && bi < bLen) {
        if (a[ai] < b[bi])
            ai++;
        else if (a[ai] > b[bi])
            bi++;
        else {
            result.push(a[ai]);
            ++ai;
            ++bi;
        }
    }
    return result;
};
// 確定系統是小端序還是大端序
Utils.littleEndian = (function () {
    const buffer = new ArrayBuffer(2);
    new DataView(buffer).setInt16(0, 256, true);
    return new Int16Array(buffer)[0] === 256;
})();
// 獲取字節
Utils.getBytes = function (data, offset) {
    return [
        data[offset].charCodeAt(),
        data[offset + 1].charCodeAt(),
        data[offset + 2].charCodeAt(),
        data[offset + 3].charCodeAt(),
    ];
};
// 讀取二進制 uint32
Utils.getUint32 = function (data, offset) {
    const b = Utils.getBytes(data, offset);
    return (b[0] << 0) | (b[1] << 8) | (b[2] << 16) | (b[3] << 24);
};
// 讀取二進制 float32
Utils.getFloat32 = function (data, offset) {
    const b = Utils.getBytes(data, offset);
    const sign = 1 - 2 * (b[3] >> 7);
    const exponent = ((b[3] << 1) & 0xff) | (b[2] >> 7) - 127;
    const mantissa = ((b[2] & 0x7f) << 16) | (b[1] << 8) | b[0];
    if (exponent === 128) {
        if (mantissa !== 0)
            return NaN;
        else
            return sign * Infinity;
    }
    if (exponent === -127)
        return sign * mantissa * Math.pow(2, -126 - 23);
    return sign * (1 + mantissa * Math.pow(2, -23)) * Math.pow(2, exponent);
};
// 將 ArrayBuffer 轉換為 UTF-8 字符串
Utils.ab2str = function (buf) {
    let str = '';
    const ab = new Uint8Array(buf);
    const chunkSize = 65535;
    for (let off = 0, abLen = ab.length; off < abLen; off += chunkSize) {
        const subab = ab.subarray(off, Math.min(chunkSize, abLen - off));
        str += String.fromCharCode.apply(null, Array.from(subab));
    }
    return str;
};
// 返回至少 nbBytes 長的緩衝區數組
Utils.getMemory = (function () {
    let pool = new ArrayBuffer(100000);
    return function (nbBytes) {
        if (pool.byteLength >= nbBytes)
            return pool;
        pool = new ArrayBuffer(nbBytes);
        return pool;
    };
})();
// 返回當前時間
Utils.now = Date.now || function () {
    return new Date().getTime();
};
// 函數節流
Utils.throttle = function (func, wait) {
    let result;
    const args = [];
    let timeout = null;
    let previous = 0;
    const later = function () {
        previous = Utils.now();
        timeout = null;
        result = func.apply(func, args);
    };
    return function () {
        const now = Utils.now();
        const remaining = wait - (now - previous);
        const nbArgs = (args.length = arguments.length);
        for (let i = 0; i < nbArgs; ++i)
            args[i] = arguments[i];
        if (remaining <= 0 || remaining > wait) {
            window.clearTimeout(timeout);
            timeout = null;
            previous = now;
            result = func.apply(func, args);
        }
        else if (!timeout) {
            timeout = window.setTimeout(later, remaining);
        }
        return result;
    };
};
// 對 Vec3 陣列進行標準化
Utils.normalizeArrayVec3 = function (array, arrayOut = array) {
    for (let i = 0, l = array.length / 3; i < l; ++i) {
        const j = i * 3;
        const nx = array[j];
        const ny = array[j + 1];
        const nz = array[j + 2];
        let len = nx * nx + ny * ny + nz * nz;
        if (len === 0) {
            arrayOut[j] = 1.0;
            continue;
        }
        len = 1.0 / Math.sqrt(len);
        arrayOut[j] = nx * len;
        arrayOut[j + 1] = ny * len;
        arrayOut[j + 2] = nz * len;
    }
    return arrayOut;
};
// 將 Vec3 陣列轉換為 sRGB
Utils.convertArrayVec3toSRGB = function (array, arrayOut = array) {
    for (let i = 0, l = array.length; i < l; ++i) {
        arrayOut[i] = Utils.linearToSRGB1(array[i]);
    }
    return arrayOut;
};
// 將 Vec3 陣列轉換為線性空間
Utils.convertArrayVec3toLinear = function (array, arrayOut = array) {
    for (let i = 0, l = array.length; i < l; ++i) {
        arrayOut[i] = Utils.sRGBToLinear1(array[i]);
    }
    return arrayOut;
};
// 計算世界座標中的頂點位置
Utils.computeWorldVertices = function (mesh, arrayOut) {
    const nbVertices = mesh.getNbVertices();
    const array = mesh.getVertices().subarray(0, nbVertices * 3);
    if (!arrayOut)
        arrayOut = new Float32Array(nbVertices * 3);
    const matrix = new THREE.Matrix4().fromArray(mesh.getMatrix());
    const tmp = new THREE.Vector3();
    for (let i = 0; i < nbVertices; ++i) {
        const id = i * 3;
        tmp.set(array[id], array[id + 1], array[id + 2]);
        tmp.applyMatrix4(matrix);
        arrayOut[id] = tmp.x;
        arrayOut[id + 1] = tmp.y;
        arrayOut[id + 2] = tmp.z;
    }
    return arrayOut;
};
export default Utils;
