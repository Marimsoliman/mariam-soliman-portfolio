"use client";

import * as THREE from "three";

/**
 * Projects a 3D world position to 2D canvas coordinates (normalized device coordinates)
 * Returns { x, y } in range [-1, 1] where (-1,-1) is bottom-left, (1,1) is top-right
 */
export function projectToNDC(
  worldPosition: THREE.Vector3,
  camera: THREE.Camera
): { x: number; y: number } {
  const projected = worldPosition.clone().project(camera);
  return { x: projected.x, y: projected.y };
}

/**
 * Converts NDC coordinates to canvas pixel coordinates
 */
export function ndcToCanvas(
  ndc: { x: number; y: number },
  canvasWidth: number,
  canvasHeight: number
): { x: number; y: number } {
  return {
    x: (ndc.x * 0.5 + 0.5) * canvasWidth,
    y: (-ndc.y * 0.5 + 0.5) * canvasHeight,
  };
}

/**
 * Projects a 3D world position directly to canvas pixel coordinates
 */
export function projectToCanvas(
  worldPosition: THREE.Vector3,
  camera: THREE.Camera,
  canvasWidth: number,
  canvasHeight: number
): { x: number; y: number } {
  const ndc = projectToNDC(worldPosition, camera);
  return ndcToCanvas(ndc, canvasWidth, canvasHeight);
}

/**
 * Gets the world-space bounding box of a mesh and projects its corners to canvas
 * Returns { minX, minY, maxX, maxY } in canvas pixels
 */
export function getMeshScreenBounds(
  mesh: THREE.Mesh,
  camera: THREE.Camera,
  canvasWidth: number,
  canvasHeight: number
): { minX: number; minY: number; maxX: number; maxY: number } {
  const box = new THREE.Box3().setFromObject(mesh);
  const corners = [
    new THREE.Vector3(box.min.x, box.min.y, box.min.z),
    new THREE.Vector3(box.min.x, box.min.y, box.max.z),
    new THREE.Vector3(box.min.x, box.max.y, box.min.z),
    new THREE.Vector3(box.min.x, box.max.y, box.max.z),
    new THREE.Vector3(box.max.x, box.min.y, box.min.z),
    new THREE.Vector3(box.max.x, box.min.y, box.max.z),
    new THREE.Vector3(box.max.x, box.max.y, box.min.z),
    new THREE.Vector3(box.max.x, box.max.y, box.max.z),
  ];

  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

  corners.forEach((corner) => {
    mesh.localToWorld(corner);
    const canvas = projectToCanvas(corner, camera, canvasWidth, canvasHeight);
    minX = Math.min(minX, canvas.x);
    minY = Math.min(minY, canvas.y);
    maxX = Math.max(maxX, canvas.x);
    maxY = Math.max(maxY, canvas.y);
  });

  return { minX, minY, maxX, maxY };
}

/**
 * Checks if a 3D point is in front of the camera (positive z in view space)
 */
export function isInFrontOfCamera(
  worldPosition: THREE.Vector3,
  camera: THREE.Camera
): boolean {
  const viewVector = new THREE.Vector3();
  camera.getWorldDirection(viewVector);
  const toPoint = worldPosition.clone().sub(camera.position);
  return toPoint.dot(viewVector) > 0;
}

/**
 * Gets the distance from camera to a world position
 */
export function getCameraDistance(
  worldPosition: THREE.Vector3,
  camera: THREE.Camera
): number {
  return camera.position.distanceTo(worldPosition);
}