import * as BABYLON from "babylonjs";

import { VR_COOKING_ZONE_DEPTH, VR_COOKING_ZONE_WIDTH } from "../core/constants";
import type { ProjectData } from "../core/types";
import {
  createKitchenPendantLight,
  createMaterial,
} from "../scene/builders";
import { getRoomBasis } from "../scene/room-basis";

export function createVrCookingZone(scene: BABYLON.Scene, project: ProjectData) {
  const { right, back, yaw } = getRoomBasis(project);
  const zoneWidth = VR_COOKING_ZONE_WIDTH;
  const zoneDepth = VR_COOKING_ZONE_DEPTH;
  const wallHeight = 4.8;
  const wallThickness = 0.45;
  const entranceHalfWidth = 2.6;
  const toWorld = (x: number, y: number, z: number) =>
    project.position
      .add(right.scale(x))
      .add(back.scale(z))
      .add(new BABYLON.Vector3(0, y, 0));

  const floor = BABYLON.MeshBuilder.CreateBox(
    `${project.id}_kitchenFloor`,
    { width: zoneWidth, height: 0.08, depth: zoneDepth },
    scene
  );
  floor.position = toWorld(0, 0.04, 0);
  floor.rotation.y = yaw;
  floor.checkCollisions = true;
  floor.isPickable = false;
  floor.material = createMaterial(
    scene,
    `${project.id}_kitchenFloorMat`,
    new BABYLON.Color3(0.2, 0.18, 0.15),
    project.color.scale(0.08)
  );

  const ceiling = BABYLON.MeshBuilder.CreateBox(
    `${project.id}_kitchenCeiling`,
    { width: zoneWidth, height: 0.08, depth: zoneDepth },
    scene
  );
  ceiling.position = toWorld(0, wallHeight + 0.04, 0);
  ceiling.rotation.y = yaw;
  ceiling.isPickable = false;
  ceiling.material = createMaterial(
    scene,
    `${project.id}_kitchenCeilingMat`,
    new BABYLON.Color3(0.14, 0.13, 0.12),
    new BABYLON.Color3(0.01, 0.01, 0.012)
  );

  const wallMaterial = createMaterial(
    scene,
    `${project.id}_kitchenWallMat`,
    new BABYLON.Color3(0.82, 0.78, 0.72),
    project.color.scale(0.03)
  );
  const trimMaterial = createMaterial(
    scene,
    `${project.id}_kitchenTrimMat`,
    new BABYLON.Color3(0.26, 0.22, 0.18),
    project.color.scale(0.08)
  );

  const wallSegments = [
    {
      name: "rear",
      size: { width: zoneWidth + wallThickness, height: wallHeight, depth: wallThickness },
      position: { x: 0, z: zoneDepth * 0.5 },
    },
    {
      name: "left",
      size: { width: wallThickness, height: wallHeight, depth: zoneDepth + wallThickness },
      position: { x: -zoneWidth * 0.5, z: 0 },
    },
    {
      name: "right",
      size: { width: wallThickness, height: wallHeight, depth: zoneDepth + wallThickness },
      position: { x: zoneWidth * 0.5, z: 0 },
    },
    {
      name: "frontLeft",
      size: {
        width: zoneWidth * 0.5 - entranceHalfWidth + wallThickness,
        height: wallHeight,
        depth: wallThickness,
      },
      position: {
        x: -(entranceHalfWidth + (zoneWidth * 0.5 - entranceHalfWidth) * 0.5),
        z: -zoneDepth * 0.5,
      },
    },
    {
      name: "frontRight",
      size: {
        width: zoneWidth * 0.5 - entranceHalfWidth + wallThickness,
        height: wallHeight,
        depth: wallThickness,
      },
      position: {
        x: entranceHalfWidth + (zoneWidth * 0.5 - entranceHalfWidth) * 0.5,
        z: -zoneDepth * 0.5,
      },
    },
  ];

  wallSegments.forEach((segment) => {
    const wall = BABYLON.MeshBuilder.CreateBox(
      `${project.id}_kitchenWall_${segment.name}`,
      segment.size,
      scene
    );
    wall.position = toWorld(
      segment.position.x,
      wallHeight * 0.5,
      segment.position.z
    );
    wall.rotation.y = yaw;
    wall.checkCollisions = true;
    wall.isPickable = false;
    wall.material = wallMaterial;

    const trim = BABYLON.MeshBuilder.CreateBox(
      `${project.id}_kitchenTrim_${segment.name}`,
      {
        width: segment.size.width + (segment.size.depth > segment.size.width ? 0 : 0.12),
        height: 0.12,
        depth: segment.size.depth + (segment.size.width > segment.size.depth ? 0 : 0.12),
      },
      scene
    );
    trim.position = wall.position.add(new BABYLON.Vector3(0, wallHeight * 0.5 + 0.07, 0));
    trim.rotation.y = yaw;
    trim.isPickable = false;
    trim.material = trimMaterial;
  });

  const halo = BABYLON.MeshBuilder.CreateDisc(
    `${project.id}_kitchenHalo`,
    { radius: 4.8, tessellation: 64 },
    scene
  );
  halo.position = toWorld(0, 0.05, 0);
  halo.rotation.x = Math.PI / 2;
  halo.isPickable = false;
  halo.material = createMaterial(
    scene,
    `${project.id}_kitchenHaloMat`,
    project.color.scale(0.06),
    project.color.scale(0.18),
    0.26
  );

  const warmFill = new BABYLON.SpotLight(
    `${project.id}_kitchenFill`,
    toWorld(0, wallHeight - 0.5, -0.8),
    new BABYLON.Vector3(0, -1, 0.08),
    Math.PI / 1.65,
    10,
    scene
  );
  warmFill.diffuse = new BABYLON.Color3(1, 0.86, 0.68);
  warmFill.intensity = 0.55;

  for (const offset of [-3.4, 0, 1.95]) {
    createKitchenPendantLight(
      scene,
      `${project.id}_pendant_${offset}`,
      toWorld(offset, wallHeight - 0.08, -0.4),
      project.color
    );
  }
}
