import * as BABYLON from "babylonjs";

import type { ProjectData } from "../core/types";

export function getRoomBasis(project: ProjectData) {
  const inward = BABYLON.Vector3.Zero().subtract(project.position).normalize();
  const right = new BABYLON.Vector3(inward.z, 0, -inward.x);
  const back = inward.scale(-1);
  const yaw = Math.atan2(inward.x, inward.z);
  return { inward, right, back, yaw };
}

