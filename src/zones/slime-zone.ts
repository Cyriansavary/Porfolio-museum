import * as BABYLON from "babylonjs";

import { SLIME_ARENA_SIZE, SLIME_TERRAIN_Y_OFFSET } from "../core/constants";
import type { ProjectData } from "../core/types";
import { createMaterial } from "../scene/builders";
import { getRoomBasis } from "../scene/room-basis";

export type SlimeZoneDeps = {
  createDetailedRockMesh: (
    scene: BABYLON.Scene,
    name: string,
    material: BABYLON.PBRMaterial,
    seed: number,
    radius: number
  ) => BABYLON.Mesh;
  getOrCreateRockMaterial: (
    scene: BABYLON.Scene,
    color: BABYLON.Color3
  ) => BABYLON.PBRMaterial;
  hashNoise2D: (x: number, y: number, seed: number) => number;
  sampleHeight: (x: number, z: number) => number;
  saturate: (value: number) => number;
};

function applyHeightFieldToTerrain(
  mesh: BABYLON.Mesh,
  sampleHeight: (x: number, z: number) => number
) {
  const positions = mesh.getVerticesData(BABYLON.VertexBuffer.PositionKind);
  const indices = mesh.getIndices();
  const normals = mesh.getVerticesData(BABYLON.VertexBuffer.NormalKind);
  if (!positions || !indices || !normals) {
    return;
  }

  for (let index = 0; index < positions.length; index += 3) {
    const x = positions[index];
    const z = positions[index + 2];
    positions[index + 1] = sampleHeight(x, z);
  }

  mesh.updateVerticesData(BABYLON.VertexBuffer.PositionKind, positions);
  BABYLON.VertexData.ComputeNormals(positions, indices, normals);
  mesh.updateVerticesData(BABYLON.VertexBuffer.NormalKind, normals);
  mesh.refreshBoundingInfo();
}

function applyTerrainColorRamp(
  mesh: BABYLON.Mesh,
  maxHeight: number,
  saturate: (value: number) => number
) {
  const terrainPositions = mesh.getVerticesData(BABYLON.VertexBuffer.PositionKind);
  const terrainNormals = mesh.getVerticesData(BABYLON.VertexBuffer.NormalKind);
  if (!terrainPositions || !terrainNormals) {
    return;
  }

  const colors: number[] = [];
  const lowColor = new BABYLON.Color3(0.13, 0.17, 0.15);
  const midColor = new BABYLON.Color3(0.27, 0.36, 0.3);
  const highColor = new BABYLON.Color3(0.6, 0.72, 0.65);

  for (let index = 0; index < terrainPositions.length; index += 3) {
    const height = terrainPositions[index + 1];
    const normalY = saturate(terrainNormals[index + 1]);
    const heightBlend = saturate(height / maxHeight);

    let color = BABYLON.Color3.Lerp(
      lowColor,
      midColor,
      saturate(heightBlend * 1.18)
    );
    color = BABYLON.Color3.Lerp(color, highColor, Math.pow(heightBlend, 1.5));

    const contourShade =
      0.9 + Math.sin(height * 6.2 + terrainPositions[index] * 0.08) * 0.1;
    const slopeShade = 0.74 + normalY * 0.26;
    color = color.scale(contourShade * slopeShade);

    colors.push(color.r, color.g, color.b, 1);
  }

  mesh.setVerticesData(BABYLON.VertexBuffer.ColorKind, colors, true);
  mesh.useVertexColors = true;
}

function createSlimeArenaRockScatter(
  scene: BABYLON.Scene,
  project: ProjectData,
  toWorld: (x: number, y: number, z: number) => BABYLON.Vector3,
  deps: SlimeZoneDeps
) {
  const {
    createDetailedRockMesh,
    getOrCreateRockMaterial,
    hashNoise2D,
    sampleHeight,
  } = deps;
  const rockMaterial = getOrCreateRockMaterial(scene, project.color);
  let placed = 0;

  for (let index = 0; index < 72 && placed < 24; index += 1) {
    const localX =
      (hashNoise2D(index * 0.83, project.position.x * 0.19, 431) - 0.5) * 24;
    const localZ =
      (hashNoise2D(index * 1.21, project.position.z * 0.23, 463) - 0.5) * 24;
    const radial = Math.sqrt(localX * localX + localZ * localZ);

    if (radial < 4.8) {
      continue;
    }

    if (localZ < -9.2 && Math.abs(localX) < 4.6) {
      continue;
    }

    if (Math.abs(localX) < 6.6 && localZ > 2.5) {
      continue;
    }

    const terrainHeight = sampleHeight(localX, localZ);
    if (terrainHeight < 0.12) {
      continue;
    }

    const radiusNoise = hashNoise2D(index * 1.37, localX * 0.23, 509);
    const heightNoise = hashNoise2D(index * 1.63, localZ * 0.29, 541);
    const scaleNoiseA = hashNoise2D(index * 1.91, localX * 0.11, 577);
    const scaleNoiseB = hashNoise2D(index * 2.17, localZ * 0.07, 619);
    const scaleNoiseC = hashNoise2D(
      index * 2.41,
      localX * 0.13 - localZ * 0.09,
      661
    );
    const rotationNoiseX = hashNoise2D(index * 2.73, localX * 0.05, 701);
    const rotationNoiseY = hashNoise2D(index * 3.07, localZ * 0.05, 743);
    const rotationNoiseZ = hashNoise2D(
      index * 3.39,
      localX * 0.04 - localZ * 0.03,
      787
    );

    const radius = 0.3 + radiusNoise * 0.46;
    const rock = createDetailedRockMesh(
      scene,
      `${project.id}_arenaRock_${placed}`,
      rockMaterial,
      311 + index * 17,
      radius
    );
    rock.position = toWorld(
      localX,
      terrainHeight + radius * (0.34 + heightNoise * 0.24),
      localZ
    );
    rock.rotation = new BABYLON.Vector3(
      rotationNoiseX * Math.PI,
      rotationNoiseY * Math.PI,
      rotationNoiseZ * Math.PI
    );
    rock.scaling = new BABYLON.Vector3(
      0.74 + scaleNoiseA * 0.96,
      0.56 + scaleNoiseB * 0.7,
      0.72 + scaleNoiseC * 0.92
    );

    placed += 1;
  }
}

function createSlimeArenaWalls(
  scene: BABYLON.Scene,
  project: ProjectData,
  toWorld: (x: number, y: number, z: number) => BABYLON.Vector3,
  yaw: number
) {
  const wallHeight = 2.8;
  const wallThickness = 0.7;
  const arenaHalfSize = 15.4;
  const entranceHalfWidth = 3.2;
  const wallMaterial = createMaterial(
    scene,
    `${project.id}_arenaWallMat`,
    new BABYLON.Color3(0.1, 0.11, 0.13),
    new BABYLON.Color3(0.006, 0.008, 0.01)
  );
  const trimMaterial = createMaterial(
    scene,
    `${project.id}_arenaWallTrimMat`,
    new BABYLON.Color3(0.18, 0.2, 0.22),
    project.color.scale(0.08)
  );

  const wallSegments = [
    {
      name: "rear",
      size: {
        width: arenaHalfSize * 2 + wallThickness,
        height: wallHeight,
        depth: wallThickness,
      },
      position: { x: 0, z: arenaHalfSize },
    },
    {
      name: "left",
      size: {
        width: wallThickness,
        height: wallHeight,
        depth: arenaHalfSize * 2 + wallThickness,
      },
      position: { x: -arenaHalfSize, z: 0 },
    },
    {
      name: "right",
      size: {
        width: wallThickness,
        height: wallHeight,
        depth: arenaHalfSize * 2 + wallThickness,
      },
      position: { x: arenaHalfSize, z: 0 },
    },
    {
      name: "frontLeft",
      size: {
        width: arenaHalfSize - entranceHalfWidth + wallThickness,
        height: wallHeight,
        depth: wallThickness,
      },
      position: {
        x: -(entranceHalfWidth + (arenaHalfSize - entranceHalfWidth) * 0.5),
        z: -arenaHalfSize,
      },
    },
    {
      name: "frontRight",
      size: {
        width: arenaHalfSize - entranceHalfWidth + wallThickness,
        height: wallHeight,
        depth: wallThickness,
      },
      position: {
        x: entranceHalfWidth + (arenaHalfSize - entranceHalfWidth) * 0.5,
        z: -arenaHalfSize,
      },
    },
  ];

  wallSegments.forEach((segment) => {
    const wall = BABYLON.MeshBuilder.CreateBox(
      `${project.id}_arenaWall_${segment.name}`,
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

    const topTrim = BABYLON.MeshBuilder.CreateBox(
      `${project.id}_arenaWallTrim_${segment.name}`,
      {
        width:
          segment.size.width + (segment.size.depth > segment.size.width ? 0 : 0.18),
        height: 0.12,
        depth:
          segment.size.depth + (segment.size.width > segment.size.depth ? 0 : 0.18),
      },
      scene
    );
    topTrim.position = wall.position.add(
      new BABYLON.Vector3(0, wallHeight * 0.5 + 0.07, 0)
    );
    topTrim.rotation.y = yaw;
    topTrim.isPickable = false;
    topTrim.material = trimMaterial;
  });

  for (const [index, corner] of [
    { x: -arenaHalfSize, z: -arenaHalfSize },
    { x: arenaHalfSize, z: -arenaHalfSize },
    { x: -arenaHalfSize, z: arenaHalfSize },
    { x: arenaHalfSize, z: arenaHalfSize },
  ].entries()) {
    const pylon = BABYLON.MeshBuilder.CreateBox(
      `${project.id}_arenaPylon_${index}`,
      { width: 0.72, height: wallHeight + 0.55, depth: 0.72 },
      scene
    );
    pylon.position = toWorld(corner.x, (wallHeight + 0.55) * 0.5, corner.z);
    pylon.rotation.y = yaw;
    pylon.checkCollisions = true;
    pylon.isPickable = false;
    pylon.material = trimMaterial;
  }
}

export function createDesertTerrain(
  scene: BABYLON.Scene,
  project: ProjectData,
  deps: SlimeZoneDeps
) {
  const { sampleHeight, saturate } = deps;
  const { right, back, yaw } = getRoomBasis(project);
  const arenaSize = SLIME_ARENA_SIZE;
  const terrainYOffset = SLIME_TERRAIN_Y_OFFSET;
  const toWorld = (x: number, y: number, z: number) =>
    project.position
      .add(right.scale(x))
      .add(back.scale(z))
      .add(new BABYLON.Vector3(0, y, 0));

  const collisionGround = BABYLON.MeshBuilder.CreateGround(
    `${project.id}_terrainCollision`,
    { width: arenaSize, height: arenaSize, subdivisions: 140, updatable: true },
    scene
  );
  collisionGround.position = project.position.add(
    new BABYLON.Vector3(0, terrainYOffset, 0)
  );
  collisionGround.rotation.y = yaw;
  collisionGround.checkCollisions = true;
  collisionGround.isVisible = false;
  collisionGround.isPickable = false;

  const terrain = BABYLON.MeshBuilder.CreateGround(
    `${project.id}_terrain`,
    { width: arenaSize, height: arenaSize, subdivisions: 140, updatable: true },
    scene
  );
  terrain.position = project.position.add(
    new BABYLON.Vector3(0, terrainYOffset, 0)
  );
  terrain.rotation.y = yaw;
  terrain.isPickable = false;

  applyHeightFieldToTerrain(collisionGround, sampleHeight);
  applyHeightFieldToTerrain(terrain, sampleHeight);
  applyTerrainColorRamp(terrain, 3.1, saturate);

  const terrainMaterial = new BABYLON.StandardMaterial(
    `${project.id}_terrainMat`,
    scene
  );
  terrainMaterial.diffuseColor = BABYLON.Color3.White();
  terrainMaterial.specularColor = new BABYLON.Color3(0.06, 0.08, 0.07);
  terrainMaterial.specularPower = 20;
  terrainMaterial.emissiveColor = new BABYLON.Color3(0.012, 0.016, 0.014);
  terrain.material = terrainMaterial;

  createSlimeArenaRockScatter(scene, project, toWorld, deps);
  createSlimeArenaWalls(scene, project, toWorld, yaw);

  return terrain;
}

export function applyWetLookToSlimeZone(
  scene: BABYLON.Scene,
  project: ProjectData
) {
  const processedMaterials = new Set<BABYLON.Material>();
  const standExclusionTokens = [
    "_halo",
    "_beam",
    "_orb",
    "_ring",
    "_display",
    "_label",
    "_base",
    "_pedestal",
  ];

  scene.meshes.forEach((mesh) => {
    if (!mesh.name.startsWith(`${project.id}_`)) {
      return;
    }

    if (standExclusionTokens.some((token) => mesh.name.includes(token))) {
      return;
    }

    const material = mesh.material;
    if (
      !material ||
      processedMaterials.has(material) ||
      !(
        material instanceof BABYLON.StandardMaterial ||
        material instanceof BABYLON.PBRMaterial
      )
    ) {
      return;
    }
    processedMaterials.add(material);

    if (material instanceof BABYLON.StandardMaterial) {
      material.diffuseColor = BABYLON.Color3.Lerp(
        material.diffuseColor,
        new BABYLON.Color3(0.16, 0.2, 0.19),
        0.16
      );
      material.specularColor = BABYLON.Color3.Lerp(
        material.specularColor,
        new BABYLON.Color3(0.46, 0.52, 0.56),
        0.52
      );
      material.specularPower = Math.max(material.specularPower, 110);
      material.emissiveColor = material.emissiveColor.scale(0.94);
    } else {
      material.roughness = Math.min(material.roughness ?? 1, 0.46);
      material.metallic = Math.max(material.metallic ?? 0, 0.05);
      material.environmentIntensity = Math.max(
        material.environmentIntensity ?? 0,
        0.9
      );
      material.directIntensity = Math.max(material.directIntensity ?? 0, 1.05);
    }
  });
}
