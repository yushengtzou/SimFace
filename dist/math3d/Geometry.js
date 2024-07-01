"use strict";
// import { vec3 } from 'gl-matrix';
// type Vec3 = [number, number, number];
// const Geometry: any = {};
// /** Normalize coordinate mouse between -1 and 1 */
// Geometry.normalizedMouse = function (mouseX: number, mouseY: number, width: number, height: number): [number, number] {
//   return [(2.0 * mouseX / width) - 1.0, 1.0 - (2.0 * mouseY / height)];
// };
// /** Projection of mouse coordinate on sphere unit */
// Geometry.mouseOnUnitSphere = function (mouseXY: [number, number]): Vec3 {
//   const mouseX = mouseXY[0];
//   const mouseY = mouseXY[1];
//   const tempZ = 1.0 - mouseX * mouseX - mouseY * mouseY;
//   const mouseZ = tempZ > 0.0 ? Math.sqrt(tempZ) : 0.0;
//   const sourisSphere: Vec3 = [mouseX, mouseY, mouseZ];
//   return vec3.normalize(sourisSphere, sourisSphere);
// };
// /** Compute intersection between a ray and a triangle. Returns the distance to the triangle if a hit occurs. */
// Geometry.intersectionRayTriangleEdges = (function () {
//   const EPSILON = 1E-15;
//   const ONE_PLUS_EPSILON = 1.0 + EPSILON;
//   const ZERO_MINUS_EPSILON = 0.0 - EPSILON;
//   const pvec: Vec3 = [0.0, 0.0, 0.0];
//   const tvec: Vec3 = [0.0, 0.0, 0.0];
//   const qvec: Vec3 = [0.0, 0.0, 0.0];
//   return function (
//     orig: vec3,
//     dir: vec3,
//     edge1: vec3,
//     edge2: vec3,
//     v1: vec3,
//     vertInter?: vec3
//   ): number {
//     // moller trumbore intersection algorithm
//     vec3.cross(pvec, dir, edge2);
//     const det = vec3.dot(edge1, pvec);
//     if (det > -EPSILON && det < EPSILON) return -1.0;
//     const invDet = 1.0 / det;
//     vec3.sub(tvec, orig, v1);
//     const u = vec3.dot(tvec, pvec) * invDet;
//     if (u < ZERO_MINUS_EPSILON || u > ONE_PLUS_EPSILON) return -1.0;
//     vec3.cross(qvec, tvec, edge1);
//     const v = vec3.dot(dir, qvec) * invDet;
//     if (v < ZERO_MINUS_EPSILON || u + v > ONE_PLUS_EPSILON) return -1.0;
//     const t = vec3.dot(edge2, qvec) * invDet;
//     if (t < ZERO_MINUS_EPSILON) return -1.0;
//     if (vertInter) vec3.scaleAndAdd(vertInter, orig, dir, t);
//     return t;
//   };
// })();
// /** Compute intersection between a ray and a triangle. Returns the distance to the triangle if a hit occurs. */
// Geometry.intersectionRayTriangle = (function () {
//   const edge1: Vec3 = [0.0, 0.0, 0.0];
//   const edge2: Vec3 = [0.0, 0.0, 0.0];
//   return function (
//     orig: vec3,
//     dir: vec3,
//     v1: vec3,
//     v2: vec3,
//     v3: vec3,
//     vertInter?: vec3
//   ): number {
//     vec3.sub(edge1, v2, v1);
//     vec3.sub(edge2, v3, v1);
//     return Geometry.intersectionRayTriangleEdges(orig, dir, edge1, edge2, v1, vertInter);
//   };
// })();
// /** Compute distance between a point and a triangle. */
// Geometry.distance2PointTriangleEdges = (function () {
//   const diff: Vec3 = [0.0, 0.0, 0.0];
//   return function (
//     point: vec3,
//     edge1: vec3,
//     edge2: vec3,
//     v1: vec3,
//     a00: number,
//     a01: number,
//     a11: number,
//     closest?: vec3
//   ): number {
//     vec3.sub(diff, v1, point);
//     const b0 = vec3.dot(diff, edge1);
//     const b1 = vec3.dot(diff, edge2);
//     const c = vec3.sqrLen(diff);
//     const det = Math.abs(a00 * a11 - a01 * a01);
//     let s = a01 * b1 - a11 * b0;
//     let t = a01 * b0 - a00 * b1;
//     let sqrDistance;
//     let zone = 4;
//     if (s + t <= det) {
//       if (s < 0.0) {
//         if (t < 0.0) { // region 4
//           zone = 4;
//           if (b0 < 0.0) {
//             t = 0.0;
//             if (-b0 >= a00) {
//               s = 1.0;
//               sqrDistance = a00 + 2.0 * b0 + c;
//             } else {
//               s = -b0 / a00;
//               sqrDistance = b0 * s + c;
//             }
//           } else {
//             s = 0.0;
//             if (b1 >= 0.0) {
//               t = 0.0;
//               sqrDistance = c;
//             } else if (-b1 >= a11) {
//               t = 1.0;
//               sqrDistance = a11 + 2.0 * b1 + c;
//             } else {
//               t = -b1 / a11;
//               sqrDistance = b1 * t + c;
//             }
//           }
//         } else { // region 3
//           zone = 3;
//           s = 0.0;
//           if (b1 >= 0.0) {
//             t = 0.0;
//             sqrDistance = c;
//           } else if (-b1 >= a11) {
//             t = 1.0;
//             sqrDistance = a11 + 2.0 * b1 + c;
//           } else {
//             t = -b1 / a11;
//             sqrDistance = b1 * t + c;
//           }
//         }
//       } else if (t < 0.0) { // region 5
//         zone = 5;
//         t = 0.0;
//         if (b0 >= 0.0) {
//           s = 0.0;
//           sqrDistance = c;
//         } else if (-b0 >= a00) {
//           s = 1.0;
//           sqrDistance = a00 + 2.0 * b0 + c;
//         } else {
//           s = -b0 / a00;
//           sqrDistance = b0 * s + c;
//         }
//       } else { // region 0
//         zone = 0;
//         // minimum at interior point
//         const invDet = 1.0 / det;
//         s *= invDet;
//         t *= invDet;
//         sqrDistance = s * (a00 * s + a01 * t + 2.0 * b0) + t * (a01 * s + a11 * t + 2.0 * b1) + c;
//       }
//     } else {
//       let tmp0, tmp1, numer, denom;
//       if (s < 0.0) { // region 2
//         zone = 2;
//         tmp0 = a01 + b0;
//         tmp1 = a11 + b1;
//         if (tmp1 > tmp0) {
//           numer = tmp1 - tmp0;
//           denom = a00 - 2.0 * a01 + a11;
//           if (numer >= denom) {
//             s = 1.0;
//             t = 0.0;
//             sqrDistance = a00 + 2.0 * b0 + c;
//           } else {
//             s = numer / denom;
//             t = 1.0 - s;
//             sqrDistance = s * (a00 * s + a01 * t + 2.0 * b0) + t * (a01 * s + a11 * t + 2.0 * b1) + c;
//           }
//         } else {
//           s = 0.0;
//           if (tmp1 <= 0.0) {
//             t = 1.0;
//             sqrDistance = a11 + 2.0 * b1 + c;
//           } else if (b1 >= 0.0) {
//             t = 0.0;
//             sqrDistance = c;
//           } else {
//             t = -b1 / a11;
//             sqrDistance = b1 * t + c;
//           }
//         }
//       } else if (t < 0.0) { // region 6
//         zone = 6;
//         tmp0 = a01 + b1;
//         tmp1 = a00 + b0;
//         if (tmp1 > tmp0) {
//           numer = tmp1 - tmp0;
//           denom = a00 - 2.0 * a01 + a11;
//           if (numer >= denom) {
//             t = 1.0;
//             s = 0.0;
//             sqrDistance = a11 + 2.0 * b1 + c;
//           } else {
//             t = numer / denom;
//             s = 1.0 - t;
//             sqrDistance = s * (a00 * s + a01 * t + 2.0 * b0) + t * (a01 * s + a11 * t + 2.0 * b1) + c;
//           }
//         } else {
//           t = 0.0;
//           if (tmp1 <= 0.0) {
//             s = 1.0;
//             sqrDistance = a00 + 2.0 * b0 + c;
//           } else if (b0 >= 0.0) {
//             s = 0.0;
//             sqrDistance = c;
//           } else {
//             s = -b0 / a00;
//             sqrDistance = b0 * s + c;
//           }
//         }
//       } else { // region 1
//         zone = 1;
//         numer = a11 + b1 - a01 - b0;
//         if (numer <= 0.0) {
//           s = 0.0;
//           t = 1.0;
//           sqrDistance = a11 + 2.0 * b1 + c;
//         } else {
//           denom = a00 - 2.0 * a01 + a11;
//           if (numer >= denom) {
//             s = 1.0;
//             t = 0.0;
//             sqrDistance = a00 + 2.0 * b0 + c;
//           } else {
//             s = numer / denom;
//             t = 1.0 - s;
//             sqrDistance = s * (a00 * s + a01 * t + 2.0 * b0) + t * (a01 * s + a11 * t + 2.0 * b1) + c;
//           }
//         }
//       }
//     }
//     // Account for numerical round-off error.
//     if (sqrDistance < 0.0) sqrDistance = 0.0;
//     if (closest) {
//       closest[0] = v1[0] + s * edge1[0] + t * edge2[0];
//       closest[1] = v1[1] + s * edge1[1] + t * edge2[1];
//       closest[2] = v1[2] + s * edge1[2] + t * edge2[2];
//       closest[3] = zone;
//     }
//     return sqrDistance;
//   };
// })();
// /** Compute distance between a point and a triangle. */
// Geometry.distance2PointTriangle = (function () {
//   const edge1: Vec3 = [0.0, 0.0, 0.0];
//   const edge2: Vec3 = [0.0, 0.0, 0.0];
//   return function (
//     point: vec3,
//     v1: vec3,
//     v2: vec3,
//     v3: vec3,
//     closest?: vec3
//   ): number {
//     vec3.sub(edge1, v2, v1);
//     vec3.sub(edge2, v3, v1);
//     const a00 = vec3.sqrLen(edge1);
//     const a01 = vec3.dot(edge1, edge2);
//     const a11 = vec3.sqrLen(edge2);
//     return Geometry.distance2PointTriangleEdges(point, edge1, edge2, v1, a00, a01, a11, closest);
//   };
// })();
// /** If point is inside the triangle, test the sum of the areas */
// Geometry.pointInsideTriangle = (function () {
//   const vec1: Vec3 = [0.0, 0.0, 0.0];
//   const vec2: Vec3 = [0.0, 0.0, 0.0];
//   const vecP1: Vec3 = [0.0, 0.0, 0.0];
//   const vecP2: Vec3 = [0.0, 0.0, 0.0];
//   const temp: Vec3 = [0.0, 0.0, 0.0];
//   return function (point: vec3, v1: vec3, v2: vec3, v3: vec3): boolean {
//     vec3.sub(vec1, v1, v2);
//     vec3.sub(vec2, v1, v3);
//     vec3.sub(vecP1, point, v2);
//     vec3.sub(vecP2, point, v3);
//     const total = vec3.len(vec3.cross(temp, vec1, vec2));
//     const area1 = vec3.len(vec3.cross(temp, vec1, vecP1));
//     const area2 = vec3.len(vec3.cross(temp, vec2, vecP2));
//     const area3 = vec3.len(vec3.cross(temp, vecP1, vecP2));
//     return Math.abs(total - (area1 + area2 + area3)) < 1E-20;
//   };
// })();
// /** If a sphere intersects a triangle */
// Geometry.triangleInsideSphere = function (
//   point: vec3,
//   radiusSq: number,
//   v1: vec3,
//   v2: vec3,
//   v3: vec3
// ): boolean {
//   if (Geometry.distanceSqToSegment(point, v1, v2) < radiusSq) return true;
//   if (Geometry.distanceSqToSegment(point, v2, v3) < radiusSq) return true;
//   if (Geometry.distanceSqToSegment(point, v1, v3) < radiusSq) return true;
//   return false;
// };
// /** Minimum squared distance to a segment */
// Geometry.distanceSqToSegment = (function () {
//   const pt: Vec3 = [0.0, 0.0, 0.0];
//   const v2v1: Vec3 = [0.0, 0.0, 0.0];
//   return function (point: vec3, v1: vec3, v2: vec3): number {
//     vec3.sub(pt, point, v1);
//     vec3.sub(v2v1, v2, v1);
//     const len = vec3.sqrLen(v2v1);
//     const t = vec3.dot(pt, v2v1) / len;
//     if (t < 0.0) return vec3.sqrLen(pt);
//     if (t > 1.0) return vec3.sqrLen(vec3.sub(pt, point, v2));
//     pt[0] = point[0] - v1[0] - t * v2v1[0];
//     pt[1] = point[1] - v1[1] - t * v2v1[1];
//     pt[2] = point[2] - v1[2] - t * v2v1[2];
//     return vec3.sqrLen(pt);
//   };
// })();
// /** Sign angle between two 2d vectors in radians */
// Geometry.signedAngle2d = function (v1: [number, number], v2: [number, number]): number {
//   const v1x = v1[0],
//     v1y = v1[1],
//     v2x = v2[0],
//     v2y = v2[1];
//   return Math.atan2(v1x * v2y - v1y * v2x, v1x * v2x + v1y * v2y);
// };
// /** Distance from a vertex and a plane */
// Geometry.pointPlaneDistance = (function () {
//   const temp: Vec3 = [0.0, 0.0, 0.0];
//   return function (v: vec3, ptPlane: vec3, nPlane: vec3): number {
//     return vec3.dot(vec3.sub(temp, v, ptPlane), nPlane);
//   };
// })();
// /** Mirror a vertex according to a plane */
// Geometry.mirrorPoint = (function () {
//   const temp: Vec3 = [0.0, 0.0, 0.0];
//   return function (v: vec3, ptPlane: vec3, nPlane: vec3): vec3 {
//     return vec3.sub(v, v, vec3.scale(temp, nPlane, Geometry.pointPlaneDistance(v, ptPlane, nPlane) * 2.0));
//   };
// })();
// /** Compute the projection of a vertex on a line */
// Geometry.vertexOnLine = (function () {
//   const ab: Vec3 = [0.0, 0.0, 0.0];
//   return function (vertex: vec3, vNear: vec3, vFar: vec3): vec3 {
//     vec3.sub(ab, vFar, vNear);
//     const proj: Vec3 = [0.0, 0.0, 0.0];
//     const dot = vec3.dot(ab, vec3.sub(proj, vertex, vNear));
//     return vec3.scaleAndAdd(proj, vNear, ab, dot / vec3.sqrLen(ab));
//   };
// })();
// /** Return the intersection between a ray and a plane */
// Geometry.intersectLinePlane = function (
//   s1: vec3,
//   s2: vec3,
//   origin: vec3,
//   normal: vec3,
//   out: vec3
// ): vec3 {
//   const dist1 = vec3.dot(vec3.sub(out, s1, origin), normal);
//   const dist2 = vec3.dot(vec3.sub(out, s2, origin), normal);
//   // ray coplanar to triangle
//   if (dist1 === dist2) return s2;
//   // intersection between ray and triangle
//   const val = -dist1 / (dist2 - dist1);
//   return vec3.scaleAndAdd(out, s1, vec3.sub(out, s2, s1), val);
// };
// /** Return any perpendicular vector to another (normalized) vector */
// Geometry.getPerpendicularVector = function (vec: vec3): vec3 {
//   const perp: Vec3 = [0.0, 0.0, 0.0];
//   if (vec[0] === 0.0) perp[0] = 1.0;
//   else if (vec[1] === 0.0) perp[1] = 1.0;
//   else if (vec[2] === 0.0) perp[2] = 1.0;
//   else {
//     perp[0] = vec[2];
//     perp[1] = vec[2];
//     perp[2] = -vec[0] - vec[1];
//     vec3.normalize(perp, perp);
//   }
//   return perp;
// };
// export default Geometry;
