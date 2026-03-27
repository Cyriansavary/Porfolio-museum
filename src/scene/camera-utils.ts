import * as BABYLON from "babylonjs";

export function lookAtTarget(
  camera: BABYLON.UniversalCamera,
  target: BABYLON.Vector3
) {
  const direction = target.subtract(camera.position);
  const distanceXZ = Math.sqrt(direction.x * direction.x + direction.z * direction.z);
  camera.rotation.y = Math.atan2(direction.x, direction.z);
  camera.rotation.x = -Math.atan2(direction.y, distanceXZ);
}
