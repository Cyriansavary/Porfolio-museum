import * as BABYLON from "babylonjs";

import {
  PLAYER_HEIGHT,
  SLIME_ARENA_HALF_SIZE,
  SLIME_DIFFICULTY_MAX_TIER,
  SLIME_DIFFICULTY_STEP_SCORE,
  SLIME_ENEMY_CHASE_SPEED_MAX,
  SLIME_ENEMY_CHASE_SPEED_MIN,
  SLIME_ENEMY_FALL_GRAVITY,
  SLIME_ENEMY_MAX,
  SLIME_ENEMY_SPAWN_INTERVAL,
  SLIME_ENEMY_SPAWN_MAX_HEIGHT,
  SLIME_ENEMY_SPAWN_MIN_HEIGHT,
  SLIME_PLAYER_CONTACT_DISTANCE,
  SLIME_PLAYER_HIT_LIMIT,
  SLIME_WEAPON_BOLT_LIFETIME,
  SLIME_WEAPON_COOLDOWN,
  SLIME_WEAPON_RANGE,
  SLIME_WEAPON_SCORE_PER_KILL,
} from "../core/constants";
import type {
  AppLanguage,
  LeaderboardCategory,
  PlayerController,
  ProjectData,
  SlimeEnemy,
  SlimeEnemySystem,
  SlimeRainDropMetadata,
  SlimeRainSystem,
  SlimeWeaponSystem,
  ZoneLockBarrierHandle,
} from "../core/types";
import { createMaterial } from "../scene/builders";
import { getRoomBasis } from "../scene/room-basis";

export type SlimeEnemySystemDeps = {
  awardLeaderboardPoints: (category: LeaderboardCategory, delta: number) => void;
  createZoneLockBarrier: (
    scene: BABYLON.Scene,
    name: string,
    position: BABYLON.Vector3,
    rotationY: number,
    size: { width: number; height: number; depth: number },
    color: BABYLON.Color3,
    getTitle: () => string,
    getSubtitle: () => string
  ) => ZoneLockBarrierHandle;
  getGroundHeight: (localX: number, localZ: number) => number;
  languageState: { readonly currentLanguage: AppLanguage };
  showCombatPopup: (message: string) => void;
  updateStatus: (message: string) => void;
};

export type SlimeWeaponSystemDeps = {
  getIsPointerLocked: () => boolean;
  isLeaderboardOpen: () => boolean;
  isOverviewOpen: () => boolean;
  projectPanel: HTMLDivElement;
};

export function createSlimeRainSystem(
  scene: BABYLON.Scene,
  project: ProjectData
): SlimeRainSystem {
  const { right, back } = getRoomBasis(project);
  const arenaHalfSize = 15.6;
  const toWorld = (x: number, y: number, z: number) =>
    project.position
      .add(right.scale(x))
      .add(back.scale(z))
      .add(new BABYLON.Vector3(0, y, 0));

  const rainSource = BABYLON.MeshBuilder.CreateCylinder(
    `${project.id}_rainSource`,
    { diameter: 0.01, height: 1.3, tessellation: 5 },
    scene
  );
  rainSource.isVisible = false;
  rainSource.isPickable = false;
  rainSource.material = createMaterial(
    scene,
    `${project.id}_rainMat`,
    new BABYLON.Color3(0.76, 0.8, 0.86),
    new BABYLON.Color3(0.05, 0.06, 0.07),
    0.12
  );

  const lines: BABYLON.InstancedMesh[] = [];
  const respawnLine = (line: BABYLON.InstancedMesh) => {
    const localX = (Math.random() - 0.5) * arenaHalfSize * 2.04;
    const localZ = (Math.random() - 0.5) * arenaHalfSize * 2.04;
    const minY = 0.45;
    const startY = 5.2 + Math.random() * 4.6;
    const wind = right
      .scale(-0.02 - Math.random() * 0.014)
      .add(back.scale(0.004 + Math.random() * 0.004));

    line.position.copyFrom(toWorld(localX, startY, localZ));
    line.rotation.x = -0.04;
    line.rotation.z = 0.12;
    line.metadata = {
      assetType: "slimeRainLine",
      minY,
      speed: 0.24 + Math.random() * 0.16,
      wind,
    } satisfies SlimeRainDropMetadata;
  };

  for (let index = 0; index < 220; index += 1) {
    const line = rainSource.createInstance(`${project.id}_rain_${index}`);
    line.isPickable = false;
    respawnLine(line);
    lines.push(line);
  }

  return { lines, respawnLine };
}

export function createSlimeEnemySystem(
  scene: BABYLON.Scene,
  project: ProjectData,
  camera: BABYLON.UniversalCamera,
  playerController: PlayerController,
  deps: SlimeEnemySystemDeps
): SlimeEnemySystem {
  const {
    awardLeaderboardPoints,
    createZoneLockBarrier,
    getGroundHeight,
    languageState,
    showCombatPopup,
    updateStatus,
  } = deps;
  const { right, back, yaw } = getRoomBasis(project);
  const toWorld = (x: number, y: number, z: number) =>
    project.position
      .add(right.scale(x))
      .add(back.scale(z))
      .add(new BABYLON.Vector3(0, y, 0));
  const toLocal = (worldPosition: BABYLON.Vector3) => {
    const offset = worldPosition.subtract(project.position);
    return new BABYLON.Vector3(
      BABYLON.Vector3.Dot(offset, right),
      offset.y,
      BABYLON.Vector3.Dot(offset, back)
    );
  };
  const isInsideArena = (worldPosition: BABYLON.Vector3, margin = 0.8) => {
    const local = toLocal(worldPosition);
    return (
      Math.abs(local.x) <= SLIME_ARENA_HALF_SIZE - margin &&
      local.z >= -SLIME_ARENA_HALF_SIZE + margin &&
      local.z <= SLIME_ARENA_HALF_SIZE - margin
    );
  };

  const bodyMaterial = createMaterial(
    scene,
    `${project.id}_enemyBodyMat`,
    new BABYLON.Color3(0.08, 0.19, 0.1),
    new BABYLON.Color3(0.12, 0.58, 0.22),
    0.96
  );
  bodyMaterial.specularColor = new BABYLON.Color3(0.96, 1, 0.98);
  bodyMaterial.specularPower = 188;

  const shellMaterial = createMaterial(
    scene,
    `${project.id}_enemyShellMat`,
    new BABYLON.Color3(0.12, 0.28, 0.12),
    new BABYLON.Color3(0.12, 0.78, 0.26),
    0.24
  );

  const shadowMaterial = createMaterial(
    scene,
    `${project.id}_enemyShadowMat`,
    new BABYLON.Color3(0.05, 0.11, 0.06),
    new BABYLON.Color3(0.03, 0.12, 0.06),
    0.16
  );

  const entranceBarrier = createZoneLockBarrier(
    scene,
    `${project.id}_lockBarrier`,
    toWorld(0, 1.42, -SLIME_ARENA_HALF_SIZE + 1.98),
    yaw,
    { width: 6.1, height: 2.84, depth: 0.32 },
    project.color,
    () =>
      languageState.currentLanguage === "fr" ? "QUARANTAINE" : "QUARANTINED",
    () =>
      languageState.currentLanguage === "fr"
        ? "4 impacts subis - acces bloque"
        : "4 hits taken - area locked"
  );

  const enemies: SlimeEnemy[] = [];
  let spawnTimer = 0;
  let score = 0;
  let playerHitCount = 0;
  let locked = false;
  let difficultyTier = 1;

  const getComputedDifficultyTier = () =>
    Math.min(
      SLIME_DIFFICULTY_MAX_TIER,
      1 + Math.floor(score / SLIME_DIFFICULTY_STEP_SCORE)
    );
  const getEnemyCap = () => SLIME_ENEMY_MAX + Math.max(0, difficultyTier - 1);
  const getSpawnDelay = () =>
    SLIME_ENEMY_SPAWN_INTERVAL *
    Math.max(0.45, 1 - Math.max(0, difficultyTier - 1) * 0.08);

  function disposeEnemy(enemy: SlimeEnemy) {
    if (enemy.shadow.material && enemy.shadow.material !== shadowMaterial) {
      enemy.shadow.material.dispose();
    }
    enemy.body.dispose();
    enemy.shell.dispose();
    enemy.shadow.dispose();
    enemy.root.dispose();
  }

  function disposeAll() {
    while (enemies.length > 0) {
      const enemy = enemies.pop();
      if (enemy) {
        disposeEnemy(enemy);
      }
    }
    spawnTimer = 0;
  }

  function lockArena() {
    if (locked) {
      return;
    }

    locked = true;
    entranceBarrier.setEnabled(true);
    disposeAll();
    showCombatPopup(
      languageState.currentLanguage === "fr" ? "Arene perdue" : "Arena failed"
    );
    updateStatus(
      languageState.currentLanguage === "fr"
        ? "Survivor Slime verrouille : 4 slimes t'ont touche."
        : "Survivor Slime locked: 4 slimes reached you."
    );
    playerController.syncPosition(
      toWorld(0, PLAYER_HEIGHT, -SLIME_ARENA_HALF_SIZE - 1.8)
    );
  }

  function spawnEnemy() {
    const playerLocal = toLocal(camera.position);
    let localX = 0;
    let localZ = 0;
    let attempts = 0;

    do {
      localX = (Math.random() - 0.5) * (SLIME_ARENA_HALF_SIZE - 1.2) * 2;
      localZ = (Math.random() - 0.5) * (SLIME_ARENA_HALF_SIZE - 1.8) * 2;
      attempts += 1;
    } while (
      attempts < 10 &&
      Math.sqrt(
        Math.pow(localX - playerLocal.x, 2) + Math.pow(localZ - playerLocal.z, 2)
      ) < 5.5
    );

    const radius = 0.34 + Math.random() * 0.16;
    const speedFactor = 1 + Math.max(0, difficultyTier - 1) * 0.08;
    const baseScale = new BABYLON.Vector3(
      1.02 + Math.random() * 0.08,
      0.74 + Math.random() * 0.08,
      1.0 + Math.random() * 0.08
    );
    const groundY = getGroundHeight(localX, localZ);
    const root = new BABYLON.TransformNode(
      `${project.id}_enemyRoot_${performance.now().toFixed(3)}_${enemies.length}`,
      scene
    );
    root.position = toWorld(
      localX,
      groundY +
        SLIME_ENEMY_SPAWN_MIN_HEIGHT +
        Math.random() *
          (SLIME_ENEMY_SPAWN_MAX_HEIGHT - SLIME_ENEMY_SPAWN_MIN_HEIGHT),
      localZ
    );

    const body = BABYLON.MeshBuilder.CreateSphere(
      `${root.name}_body`,
      { diameter: radius * 2, segments: 20 },
      scene
    );
    body.parent = root;
    body.position.y = radius * baseScale.y;
    body.scaling = baseScale.clone();
    body.isPickable = true;
    body.metadata = { assetType: "slimeEnemyBody" };
    body.material = bodyMaterial;

    const shell = BABYLON.MeshBuilder.CreateSphere(
      `${root.name}_shell`,
      { diameter: radius * 2.1, segments: 18 },
      scene
    );
    shell.parent = root;
    shell.position.y = body.position.y + radius * 0.04;
    shell.scaling = baseScale.multiply(new BABYLON.Vector3(1.05, 0.94, 1.05));
    shell.isPickable = false;
    shell.material = shellMaterial;

    const shadow = BABYLON.MeshBuilder.CreateDisc(
      `${root.name}_shadow`,
      { radius: radius * 1.12, tessellation: 34 },
      scene
    );
    shadow.position = toWorld(localX, groundY + 0.02, localZ);
    shadow.rotation.x = Math.PI / 2;
    shadow.isPickable = false;
    shadow.material =
      shadowMaterial.clone(`${root.name}_shadowMat`) ?? shadowMaterial;

    enemies.push({
      root,
      body,
      shell,
      shadow,
      localX,
      localZ,
      radius,
      groundY,
      velocityY: -1.2 - Math.random() * 1.4,
      state: "falling",
      moveSpeed:
        (SLIME_ENEMY_CHASE_SPEED_MIN +
          Math.random() *
            (SLIME_ENEMY_CHASE_SPEED_MAX - SLIME_ENEMY_CHASE_SPEED_MIN)) *
        speedFactor,
      phase: Math.random() * Math.PI * 2,
      baseScale,
    });
  }

  return {
    disposeAll,
    shoot(origin, direction) {
      const normalizedDirection = direction.clone();
      if (normalizedDirection.lengthSquared() < 0.0001) {
        normalizedDirection.copyFrom(
          camera.getForwardRay(SLIME_WEAPON_RANGE).direction
        );
      }
      normalizedDirection.normalize();

      const ray = new BABYLON.Ray(
        origin.clone(),
        normalizedDirection,
        SLIME_WEAPON_RANGE
      );
      const enemyPick = scene.pickWithRay(
        ray,
        (mesh) => enemies.some((enemy) => enemy.body === mesh)
      );
      const worldPick = scene.pickWithRay(
        ray,
        (mesh) => mesh.checkCollisions && mesh.isEnabled()
      );

      const enemyDistance = enemyPick?.hit
        ? enemyPick.distance
        : Number.POSITIVE_INFINITY;
      const worldDistance = worldPick?.hit
        ? worldPick.distance
        : Number.POSITIVE_INFINITY;

      let targetPoint = origin.add(normalizedDirection.scale(SLIME_WEAPON_RANGE));
      let scoreDelta = 0;
      let hit = false;

      if (
        enemyPick?.hit &&
        enemyPick.pickedPoint &&
        enemyDistance <= worldDistance + 0.02
      ) {
        targetPoint = enemyPick.pickedPoint.clone();
        const enemy = enemies.find((entry) => entry.body === enemyPick.pickedMesh);
        if (enemy) {
          disposeEnemy(enemy);
          const enemyIndex = enemies.indexOf(enemy);
          if (enemyIndex >= 0) {
            enemies.splice(enemyIndex, 1);
          }
          scoreDelta = SLIME_WEAPON_SCORE_PER_KILL;
          score += scoreDelta;
          awardLeaderboardPoints("slime", scoreDelta);
          hit = true;
        }
      } else if (worldPick?.hit && worldPick.pickedPoint) {
        targetPoint = worldPick.pickedPoint.clone();
      }

      return {
        targetPoint,
        hit,
        scoreDelta,
        totalScore: score,
      };
    },
    isPlayerInsideArena() {
      return isInsideArena(camera.position);
    },
    getScore() {
      return score;
    },
    getEnemyCount() {
      return enemies.length;
    },
    getDifficultyTier() {
      return difficultyTier;
    },
    isLocked() {
      return locked;
    },
    getPlayerHitCount() {
      return playerHitCount;
    },
    update() {
      const dt = Math.min(scene.getEngine().getDeltaTime() / 1000, 0.05);
      if (dt <= 0) {
        return;
      }

      if (locked) {
        if (enemies.length > 0) {
          disposeAll();
        }
        return;
      }

      if (!isInsideArena(camera.position)) {
        if (enemies.length > 0) {
          disposeAll();
        }
        return;
      }

      const nextDifficultyTier = getComputedDifficultyTier();
      if (nextDifficultyTier !== difficultyTier) {
        difficultyTier = nextDifficultyTier;
        showCombatPopup(
          languageState.currentLanguage === "fr"
            ? `Menace niveau ${difficultyTier}`
            : `Threat tier ${difficultyTier}`
        );
      }

      spawnTimer -= dt;
      if (spawnTimer <= 0 && enemies.length < getEnemyCap()) {
        spawnEnemy();
        spawnTimer = getSpawnDelay() * (0.82 + Math.random() * 0.48);
      }

      const playerLocal = toLocal(camera.position);
      for (const enemy of enemies) {
        enemy.groundY = getGroundHeight(enemy.localX, enemy.localZ);

        if (enemy.state === "falling") {
          enemy.velocityY -= SLIME_ENEMY_FALL_GRAVITY * dt;
          enemy.root.position.y += enemy.velocityY * dt;
          if (enemy.root.position.y <= enemy.groundY) {
            enemy.root.position.y = enemy.groundY;
            enemy.velocityY = 0;
            enemy.state = "chasing";
          }
        } else {
          const toPlayerX = playerLocal.x - enemy.localX;
          const toPlayerZ = playerLocal.z - enemy.localZ;
          const distance = Math.sqrt(toPlayerX * toPlayerX + toPlayerZ * toPlayerZ);
          if (distance <= SLIME_PLAYER_CONTACT_DISTANCE) {
            playerHitCount += 1;
            showCombatPopup(
              languageState.currentLanguage === "fr"
                ? `Impact ${playerHitCount}/${SLIME_PLAYER_HIT_LIMIT}`
                : `Hit ${playerHitCount}/${SLIME_PLAYER_HIT_LIMIT}`
            );
            const enemyIndex = enemies.indexOf(enemy);
            disposeEnemy(enemy);
            if (enemyIndex >= 0) {
              enemies.splice(enemyIndex, 1);
            }
            if (playerHitCount >= SLIME_PLAYER_HIT_LIMIT) {
              lockArena();
            }
            continue;
          }
          if (distance > 1.1) {
            const step = Math.min(enemy.moveSpeed * dt, distance - 0.95);
            enemy.localX += (toPlayerX / distance) * step;
            enemy.localZ += (toPlayerZ / distance) * step;
          }

          enemy.localX = Math.max(
            -SLIME_ARENA_HALF_SIZE + 0.95,
            Math.min(SLIME_ARENA_HALF_SIZE - 0.95, enemy.localX)
          );
          enemy.localZ = Math.max(
            -SLIME_ARENA_HALF_SIZE + 0.95,
            Math.min(SLIME_ARENA_HALF_SIZE - 0.95, enemy.localZ)
          );
          enemy.groundY = getGroundHeight(enemy.localX, enemy.localZ);
          enemy.root.position.copyFrom(
            toWorld(enemy.localX, enemy.groundY, enemy.localZ)
          );
        }

        const pulse = Math.sin(performance.now() * 0.004 + enemy.phase) * 0.5 + 0.5;
        const fallStretch =
          enemy.state === "falling"
            ? Math.min(0.26, Math.abs(enemy.velocityY) * 0.012)
            : 0;
        const scaleY =
          enemy.baseScale.y *
          (enemy.state === "falling" ? 1.02 + fallStretch : 0.92 + pulse * 0.16);
        const scaleX =
          enemy.baseScale.x *
          (enemy.state === "falling" ? 1.02 - fallStretch * 0.35 : 1.05 - pulse * 0.05);
        const scaleZ =
          enemy.baseScale.z *
          (enemy.state === "falling" ? 1.02 - fallStretch * 0.32 : 1.04 - pulse * 0.04);

        enemy.body.scaling.set(scaleX, scaleY, scaleZ);
        enemy.body.position.y = enemy.radius * scaleY;
        enemy.shell.scaling.set(scaleX * 1.05, scaleY * 0.94, scaleZ * 1.05);
        enemy.shell.position.y = enemy.body.position.y + enemy.radius * 0.04;

        enemy.shadow.position.copyFrom(
          toWorld(enemy.localX, enemy.groundY + 0.02, enemy.localZ)
        );
        const shadowScale =
          enemy.state === "falling"
            ? 0.56 +
              Math.max(0.18, 1 - (enemy.root.position.y - enemy.groundY) * 0.08)
            : 0.96 + pulse * 0.08;
        enemy.shadow.scaling.x = shadowScale;
        enemy.shadow.scaling.y = shadowScale * 0.92;
        if (enemy.shadow.material instanceof BABYLON.StandardMaterial) {
          enemy.shadow.material.alpha =
            enemy.state === "falling"
              ? 0.08 + shadowScale * 0.06
              : 0.14 + pulse * 0.04;
        }
      }
    },
  };
}

export function createSlimeWeaponSystem(
  scene: BABYLON.Scene,
  camera: BABYLON.UniversalCamera,
  project: ProjectData,
  enemySystem: SlimeEnemySystem,
  deps: SlimeWeaponSystemDeps
): SlimeWeaponSystem {
  const {
    getIsPointerLocked,
    isLeaderboardOpen,
    isOverviewOpen,
    projectPanel,
  } = deps;
  const root = new BABYLON.TransformNode(`${project.id}_weaponRoot`, scene);
  root.parent = camera;

  const muzzle = new BABYLON.TransformNode(`${project.id}_weaponMuzzle`, scene);
  muzzle.parent = root;
  muzzle.position = new BABYLON.Vector3(0.36, 0.02, 1.08);

  const bodyMaterial = createMaterial(
    scene,
    `${project.id}_weaponBodyMat`,
    new BABYLON.Color3(0.18, 0.21, 0.26),
    new BABYLON.Color3(0.01, 0.014, 0.018)
  );
  const coilMaterial = createMaterial(
    scene,
    `${project.id}_weaponCoilMat`,
    new BABYLON.Color3(0.1, 0.32, 0.26),
    project.color.scale(0.74),
    0.78
  );
  const boltMaterial = createMaterial(
    scene,
    `${project.id}_weaponBoltMat`,
    new BABYLON.Color3(0.38, 0.92, 0.82),
    new BABYLON.Color3(0.48, 1, 0.9),
    0.9
  );
  const impactMaterial = createMaterial(
    scene,
    `${project.id}_weaponImpactMat`,
    new BABYLON.Color3(0.46, 1, 0.86),
    new BABYLON.Color3(0.42, 0.94, 0.76),
    0.72
  );

  const body = BABYLON.MeshBuilder.CreateBox(
    `${project.id}_weaponBody`,
    { width: 0.28, height: 0.2, depth: 0.92 },
    scene
  );
  body.parent = root;
  body.position = new BABYLON.Vector3(0.18, -0.08, 0.38);
  body.rotation = new BABYLON.Vector3(-0.08, -0.18, 0);
  body.material = bodyMaterial;
  body.isPickable = false;

  const barrel = BABYLON.MeshBuilder.CreateCylinder(
    `${project.id}_weaponBarrel`,
    { diameter: 0.12, height: 0.76, tessellation: 18 },
    scene
  );
  barrel.parent = root;
  barrel.position = new BABYLON.Vector3(0.22, -0.05, 0.72);
  barrel.rotation = new BABYLON.Vector3(Math.PI / 2 - 0.12, -0.18, 0);
  barrel.material = bodyMaterial;
  barrel.isPickable = false;

  const grip = BABYLON.MeshBuilder.CreateBox(
    `${project.id}_weaponGrip`,
    { width: 0.12, height: 0.34, depth: 0.16 },
    scene
  );
  grip.parent = root;
  grip.position = new BABYLON.Vector3(0.12, -0.26, 0.22);
  grip.rotation = new BABYLON.Vector3(0.18, 0, 0.18);
  grip.material = bodyMaterial;
  grip.isPickable = false;

  const coil = BABYLON.MeshBuilder.CreateTorus(
    `${project.id}_weaponCoil`,
    { diameter: 0.2, thickness: 0.036, tessellation: 26 },
    scene
  );
  coil.parent = root;
  coil.position = new BABYLON.Vector3(0.26, -0.02, 0.88);
  coil.rotation = new BABYLON.Vector3(Math.PI / 2, 0.18, 0.12);
  coil.material = coilMaterial;
  coil.isPickable = false;

  const coilBand = BABYLON.MeshBuilder.CreateCylinder(
    `${project.id}_weaponCoilBand`,
    { diameter: 0.07, height: 0.3, tessellation: 14 },
    scene
  );
  coilBand.parent = root;
  coilBand.position = new BABYLON.Vector3(0.28, -0.01, 0.94);
  coilBand.rotation = new BABYLON.Vector3(Math.PI / 2, 0.2, 0);
  coilBand.material = coilMaterial;
  coilBand.isPickable = false;

  type WeaponEffect = {
    meshes: BABYLON.AbstractMesh[];
    light: BABYLON.PointLight | null;
    expiresAt: number;
  };

  const effects: WeaponEffect[] = [];
  let cooldown = 0;
  let recoil = 0;
  let targetingEnemy = false;
  let firingFeedbackUntil = 0;
  let hitFeedbackUntil = 0;

  const getAimData = () => {
    const ray = camera.getForwardRay(SLIME_WEAPON_RANGE);
    const shotDirection = ray.direction.clone().normalize();
    const shootOrigin = camera.position.add(shotDirection.scale(0.08));
    const centerStart = camera.position.add(shotDirection.scale(0.72));
    return {
      ray,
      shotDirection,
      shootOrigin,
      centerStart,
    };
  };

  const hasEnemyInSight = () => {
    const { shootOrigin, shotDirection } = getAimData();
    const sightRay = new BABYLON.Ray(
      shootOrigin.clone(),
      shotDirection.clone(),
      SLIME_WEAPON_RANGE
    );
    const enemyPick = scene.pickWithRay(
      sightRay,
      (mesh) => mesh.metadata?.assetType === "slimeEnemyBody"
    );
    const worldPick = scene.pickWithRay(
      sightRay,
      (mesh) => mesh.checkCollisions && mesh.isEnabled()
    );
    const enemyDistance = enemyPick?.hit
      ? enemyPick.distance
      : Number.POSITIVE_INFINITY;
    const worldDistance = worldPick?.hit
      ? worldPick.distance
      : Number.POSITIVE_INFINITY;
    return Boolean(enemyPick?.hit && enemyDistance <= worldDistance + 0.02);
  };

  const buildLightningPath = (start: BABYLON.Vector3, end: BABYLON.Vector3) => {
    const direction = end.subtract(start);
    const distance = direction.length();
    if (distance <= 0.001) {
      return [start.clone(), end.clone()];
    }

    const forward = direction.scale(1 / distance);
    let side = BABYLON.Vector3.Cross(forward, BABYLON.Vector3.Up());
    if (side.lengthSquared() < 0.0001) {
      side = BABYLON.Vector3.Cross(forward, BABYLON.Vector3.Right());
    }
    side.normalize();
    const up = BABYLON.Vector3.Cross(side, forward).normalize();
    const amplitude = Math.min(0.32, distance * 0.035);
    const path = [start.clone()];

    for (let step = 1; step <= 4; step += 1) {
      const t = step / 5;
      const basePoint = BABYLON.Vector3.Lerp(start, end, t);
      const edgeFade = 1 - Math.abs(t - 0.5) * 1.8;
      const jitter = side
        .scale((Math.random() - 0.5) * amplitude * edgeFade * 2)
        .add(up.scale((Math.random() - 0.5) * amplitude * edgeFade));
      path.push(basePoint.add(jitter));
    }

    path.push(end.clone());
    return path;
  };

  const spawnLightning = (
    start: BABYLON.Vector3,
    end: BABYLON.Vector3,
    hit: boolean,
    options?: {
      radiusScale?: number;
      showImpact?: boolean;
      lifetimeMs?: number;
    }
  ) => {
    const radiusScale = options?.radiusScale ?? 1;
    const bolt = BABYLON.MeshBuilder.CreateTube(
      `${project.id}_weaponBolt_${performance.now().toFixed(3)}`,
      {
        path: buildLightningPath(start, end),
        radius: (hit ? 0.028 : 0.022) * radiusScale,
        tessellation: 6,
        cap: BABYLON.Mesh.NO_CAP,
      },
      scene
    );
    bolt.material = boltMaterial;
    bolt.isPickable = false;

    const effectMeshes: BABYLON.AbstractMesh[] = [bolt];
    let flash: BABYLON.PointLight | null = null;

    if (options?.showImpact !== false) {
      const impact = BABYLON.MeshBuilder.CreateSphere(
        `${project.id}_weaponImpact_${performance.now().toFixed(3)}`,
        { diameter: (hit ? 0.24 : 0.14) * radiusScale, segments: 12 },
        scene
      );
      impact.position = end.clone();
      impact.isPickable = false;
      impact.material = impactMaterial;
      effectMeshes.push(impact);

      flash = new BABYLON.PointLight(
        `${project.id}_weaponFlash_${performance.now().toFixed(3)}`,
        end.clone(),
        scene
      );
      flash.diffuse = new BABYLON.Color3(0.46, 1, 0.88);
      flash.intensity = hit ? 2.2 : 1.3;
      flash.range = hit ? 4.2 : 2.6;
    }

    effects.push({
      meshes: effectMeshes,
      light: flash,
      expiresAt:
        performance.now() + (options?.lifetimeMs ?? SLIME_WEAPON_BOLT_LIFETIME),
    });
  };

  const isCombatVisible = () =>
    enemySystem.isPlayerInsideArena() &&
    projectPanel.classList.contains("hidden") &&
    !isOverviewOpen() &&
    !isLeaderboardOpen();

  const isArmed = () => isCombatVisible() && getIsPointerLocked();

  root.setEnabled(false);

  return {
    tryShoot() {
      if (!isArmed() || cooldown > 0) {
        return null;
      }

      cooldown = SLIME_WEAPON_COOLDOWN;
      recoil = 1;
      firingFeedbackUntil = performance.now() + 120;

      const muzzleStart = muzzle.getAbsolutePosition();
      const { shotDirection, shootOrigin, centerStart } = getAimData();
      const result = enemySystem.shoot(shootOrigin, shotDirection);
      spawnLightning(centerStart, result.targetPoint, result.hit);
      spawnLightning(muzzleStart, centerStart, false, {
        radiusScale: 0.55,
        showImpact: false,
        lifetimeMs: 90,
      });
      if (result.hit) {
        hitFeedbackUntil = performance.now() + 220;
      }
      return result;
    },
    isArmed,
    getCrosshairState() {
      const now = performance.now();
      return {
        armed: isArmed(),
        targeting: targetingEnemy,
        coolingDown: cooldown > 0.035,
        firing: now < firingFeedbackUntil,
        hit: now < hitFeedbackUntil,
      };
    },
    update() {
      const dt = Math.min(scene.getEngine().getDeltaTime() / 1000, 0.05);
      const enabled = isArmed();
      root.setEnabled(enabled);

      cooldown = Math.max(0, cooldown - dt);
      recoil = BABYLON.Scalar.Lerp(recoil, 0, 1 - Math.exp(-18 * dt));

      const now = performance.now();
      for (let index = effects.length - 1; index >= 0; index -= 1) {
        const effect = effects[index];
        if (now < effect.expiresAt) {
          continue;
        }

        effect.meshes.forEach((mesh) => mesh.dispose());
        effect.light?.dispose();
        effects.splice(index, 1);
      }

      if (!enabled) {
        targetingEnemy = false;
        return;
      }

      targetingEnemy = hasEnemyInSight();

      const time = performance.now() * 0.001;
      root.position = new BABYLON.Vector3(
        0.44 + Math.sin(time * 6.2) * 0.008,
        -0.42 + Math.sin(time * 12.4) * 0.006 + recoil * 0.06,
        0.82 - recoil * 0.12
      );
      root.rotation = new BABYLON.Vector3(
        -0.12 - recoil * 0.22,
        -0.22,
        -0.08 - recoil * 0.08
      );

      if (coil.material instanceof BABYLON.StandardMaterial) {
        coil.material.emissiveColor = project.color.scale(0.56 + recoil * 0.7);
      }
      if (coilBand.material instanceof BABYLON.StandardMaterial) {
        coilBand.material.emissiveColor = project.color.scale(0.44 + recoil * 0.54);
      }
    },
    dispose() {
      effects.forEach((effect) => {
        effect.meshes.forEach((mesh) => mesh.dispose());
        effect.light?.dispose();
      });
      effects.length = 0;
      root.dispose();
    },
  };
}
