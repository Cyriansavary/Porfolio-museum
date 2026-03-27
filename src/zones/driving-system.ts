import * as BABYLON from "babylonjs";

import {
  DRIVING_ACCELERATION,
  DRIVING_BRAKE_DECELERATION,
  DRIVING_COAST_DECELERATION,
  DRIVING_INTERACTION_DISTANCE,
  DRIVING_MAX_FORWARD_SPEED,
  DRIVING_MAX_REVERSE_SPEED,
  DRIVING_REVERSE_ACCELERATION,
  DRIVING_STEER_RESPONSE,
  DRIVING_TURN_RATE,
  DRIVING_ZONE_DEPTH,
  DRIVING_ZONE_NAV_MARGIN,
  DRIVING_ZONE_WIDTH,
  PLAYER_HEIGHT,
  WALK_FOV,
} from "../core/constants";
import { isEditableTarget } from "../core/dom-utils";
import { moveToward } from "../core/math-utils";
import type {
  AppLanguage,
  DrivingInteractableMetadata,
  DrivingInteractionId,
  DrivingSimSystem,
  PlayerController,
  ProjectData,
} from "../core/types";
import { createMaterial, enableCollisions } from "../scene/builders";
import { lookAtTarget } from "../scene/camera-utils";
import { getRoomBasis } from "../scene/room-basis";

export type DrivingSimSystemDeps = {
  canvas: HTMLCanvasElement;
  drivingHint: HTMLParagraphElement;
  drivingHud: HTMLDivElement;
  drivingMode: HTMLSpanElement;
  drivingSpeed: HTMLSpanElement;
  getCurrentUiText: () => { drivingModeOnFoot: string };
  getFreeRoamStatusMessage: () => string;
  getIsPointerLocked: () => boolean;
  isLeaderboardOpen: () => boolean;
  isOverviewOpen: () => boolean;
  languageState: { readonly currentLanguage: AppLanguage };
  projectPanel: HTMLDivElement;
  setIsDrivingVehicle: (value: boolean) => void;
  syncCrosshairVisibility: () => void;
  updateStatus: (message: string) => void;
};
export function getDrivingRoadRects() {
  return [
    { name: "entrySouth", minX: -5.1, maxX: 5.1, minZ: -38, maxZ: -23.2 },
    { name: "mainAvenue", minX: -5.8, maxX: 5.8, minZ: -23.2, maxZ: 35.6 },
    { name: "westAvenue", minX: -29.4, maxX: -18.2, minZ: -23.2, maxZ: 30.8 },
    { name: "eastAvenue", minX: 18.2, maxX: 29.4, minZ: -23.2, maxZ: 30.8 },
    { name: "southStreet", minX: -35, maxX: 35, minZ: -23.2, maxZ: -12.2 },
    { name: "marketStreet", minX: -35, maxX: 35, minZ: -3.6, maxZ: 7.2 },
    { name: "northStreet", minX: -35, maxX: 35, minZ: 15.6, maxZ: 26.6 },
    { name: "westConnector", minX: -19.2, maxX: -5.2, minZ: 6.2, maxZ: 17.8 },
    { name: "eastConnector", minX: 5.2, maxX: 19.2, minZ: 6.2, maxZ: 17.8 },
  ];
}

function isInsideDrivingRoad(
  roadRects: ReturnType<typeof getDrivingRoadRects>,
  x: number,
  z: number
) {
  return roadRects.some(
    (rect) =>
      x >= rect.minX - DRIVING_ZONE_NAV_MARGIN &&
      x <= rect.maxX + DRIVING_ZONE_NAV_MARGIN &&
      z >= rect.minZ - DRIVING_ZONE_NAV_MARGIN &&
      z <= rect.maxZ + DRIVING_ZONE_NAV_MARGIN
  );
}

export function createDrivingCar(
  scene: BABYLON.Scene,
  project: ProjectData,
  position: BABYLON.Vector3,
  rotationY: number,
  options?: {
    bodyColor?: BABYLON.Color3;
    interactive?: boolean;
    scale?: number;
  }
) {
  const bodyColor =
    options?.bodyColor ?? new BABYLON.Color3(0.64, 0.12, 0.12);
  const interactive = options?.interactive ?? true;
  const root = new BABYLON.TransformNode(`${project.id}_carRoot`, scene);
  root.position = position.clone();
  root.rotation.y = rotationY;
  if (options?.scale) {
    root.scaling = new BABYLON.Vector3(options.scale, options.scale, options.scale);
  }

  const bodyMaterial = createMaterial(
    scene,
    `${project.id}_carBodyMat`,
    bodyColor,
    project.color.scale(0.2)
  );
  bodyMaterial.specularColor = new BABYLON.Color3(0.34, 0.34, 0.36);
  bodyMaterial.specularPower = 78;

  const trimMaterial = createMaterial(
    scene,
    `${project.id}_carTrimMat`,
    new BABYLON.Color3(0.08, 0.09, 0.1),
    new BABYLON.Color3(0.01, 0.01, 0.012)
  );
  const glassMaterial = createMaterial(
    scene,
    `${project.id}_carGlassMat`,
    new BABYLON.Color3(0.16, 0.22, 0.28),
    project.color.scale(0.12),
    0.9
  );
  glassMaterial.specularColor = new BABYLON.Color3(0.26, 0.3, 0.34);

  const chassis = BABYLON.MeshBuilder.CreateBox(
    `${project.id}_carChassis`,
    { width: 1.92, height: 0.46, depth: 4.2 },
    scene
  );
  chassis.parent = root;
  chassis.position.y = 0.58;
  chassis.isPickable = false;
  chassis.material = bodyMaterial;

  const cabin = BABYLON.MeshBuilder.CreateBox(
    `${project.id}_carCabin`,
    { width: 1.54, height: 0.62, depth: 1.96 },
    scene
  );
  cabin.parent = root;
  cabin.position = new BABYLON.Vector3(0, 1.02, -0.14);
  cabin.isPickable = false;
  cabin.material = glassMaterial;

  const hood = BABYLON.MeshBuilder.CreateBox(
    `${project.id}_carHood`,
    { width: 1.78, height: 0.18, depth: 1.18 },
    scene
  );
  hood.parent = root;
  hood.position = new BABYLON.Vector3(0, 0.77, 1.26);
  hood.isPickable = false;
  hood.material = bodyMaterial;

  const trunk = BABYLON.MeshBuilder.CreateBox(
    `${project.id}_carTrunk`,
    { width: 1.72, height: 0.14, depth: 0.92 },
    scene
  );
  trunk.parent = root;
  trunk.position = new BABYLON.Vector3(0, 0.74, -1.58);
  trunk.isPickable = false;
  trunk.material = bodyMaterial;

  const frontBumper = BABYLON.MeshBuilder.CreateBox(
    `${project.id}_carBumperFront`,
    { width: 1.86, height: 0.18, depth: 0.16 },
    scene
  );
  frontBumper.parent = root;
  frontBumper.position = new BABYLON.Vector3(0, 0.42, 2.08);
  frontBumper.isPickable = false;
  frontBumper.material = trimMaterial;

  const rearBumper = frontBumper.clone(`${project.id}_carBumperRear`);
  rearBumper.parent = root;
  rearBumper.position.z = -2.08;

  const dashboard = BABYLON.MeshBuilder.CreateBox(
    `${project.id}_carDashboard`,
    { width: 1.34, height: 0.18, depth: 0.42 },
    scene
  );
  dashboard.parent = root;
  dashboard.position = new BABYLON.Vector3(0, 1.07, 0.62);
  dashboard.isPickable = false;
  dashboard.material = trimMaterial;

  const steeringWheel = BABYLON.MeshBuilder.CreateTorus(
    `${project.id}_steeringWheel`,
    { diameter: 0.38, thickness: 0.04, tessellation: 22 },
    scene
  );
  steeringWheel.parent = root;
  steeringWheel.position = new BABYLON.Vector3(-0.32, 0.98, 0.42);
  steeringWheel.rotation.x = Math.PI / 2.8;
  steeringWheel.rotation.z = -0.18;
  steeringWheel.isPickable = false;
  steeringWheel.material = trimMaterial;

  const cockpitAnchor = new BABYLON.TransformNode(
    `${project.id}_carCockpitAnchor`,
    scene
  );
  cockpitAnchor.parent = root;
  cockpitAnchor.position = new BABYLON.Vector3(-0.24, 1.08, 0.54);

  for (const side of [-1, 1]) {
    const headlight = BABYLON.MeshBuilder.CreateBox(
      `${project.id}_headlight_${side}`,
      { width: 0.34, height: 0.1, depth: 0.08 },
      scene
    );
    headlight.parent = root;
    headlight.position = new BABYLON.Vector3(0.58 * side, 0.68, 2.02);
    headlight.isPickable = false;
    headlight.material = createMaterial(
      scene,
      `${project.id}_headlightMat_${side}`,
      new BABYLON.Color3(0.96, 0.94, 0.88),
      new BABYLON.Color3(0.28, 0.24, 0.16)
    );

    const taillight = BABYLON.MeshBuilder.CreateBox(
      `${project.id}_taillight_${side}`,
      { width: 0.3, height: 0.1, depth: 0.08 },
      scene
    );
    taillight.parent = root;
    taillight.position = new BABYLON.Vector3(0.58 * side, 0.66, -2.02);
    taillight.isPickable = false;
    taillight.material = createMaterial(
      scene,
      `${project.id}_taillightMat_${side}`,
      new BABYLON.Color3(0.72, 0.12, 0.08),
      new BABYLON.Color3(0.24, 0.04, 0.02)
    );
  }

  const wheelMaterial = createMaterial(
    scene,
    `${project.id}_wheelMat`,
    new BABYLON.Color3(0.08, 0.08, 0.09),
    new BABYLON.Color3(0.008, 0.008, 0.01)
  );

  const wheels: BABYLON.Mesh[] = [];
  const steeringPivots: BABYLON.TransformNode[] = [];
  for (const axle of [
    { z: 1.18, steer: true },
    { z: -1.24, steer: false },
  ]) {
    for (const side of [-1, 1]) {
      const pivot = new BABYLON.TransformNode(
        `${project.id}_wheelPivot_${axle.z}_${side}`,
        scene
      );
      pivot.parent = root;
      pivot.position = new BABYLON.Vector3(1.06 * side, 0.38, axle.z);
      if (axle.steer) {
        steeringPivots.push(pivot);
      }

      const wheel = BABYLON.MeshBuilder.CreateCylinder(
        `${project.id}_wheel_${axle.z}_${side}`,
        { diameter: 0.72, height: 0.34, tessellation: 18 },
        scene
      );
      wheel.parent = pivot;
      wheel.rotation.z = Math.PI / 2;
      wheel.isPickable = false;
      wheel.material = wheelMaterial;
      wheels.push(wheel);
    }
  }

  const interactionMesh = BABYLON.MeshBuilder.CreateBox(
    `${project.id}_carInteraction`,
    { width: 2.65, height: 1.55, depth: 4.8 },
    scene
  );
  interactionMesh.parent = root;
  interactionMesh.position = new BABYLON.Vector3(0, 0.94, 0);
  interactionMesh.isPickable = interactive;
  interactionMesh.material = createMaterial(
    scene,
    `${project.id}_carInteractionMat`,
    project.color.scale(0.1),
    project.color.scale(0.22),
    interactive ? 0.001 : 0
  );
  interactionMesh.metadata = {
    drivingInteractableId: "car",
  } satisfies DrivingInteractableMetadata;
  interactionMesh.setEnabled(interactive);

  const interactionHalo = BABYLON.MeshBuilder.CreateTorus(
    `${project.id}_carHalo`,
    { diameter: 3.1, thickness: 0.08, tessellation: 36 },
    scene
  );
  interactionHalo.parent = root;
  interactionHalo.position.y = 0.08;
  interactionHalo.rotation.x = Math.PI / 2;
  interactionHalo.isPickable = false;
  interactionHalo.material = createMaterial(
    scene,
    `${project.id}_carHaloMat`,
    project.color.scale(0.2),
    project.color.scale(0.36),
    interactive ? 0.14 : 0
  );
  interactionHalo.setEnabled(interactive);

  enableCollisions(chassis, cabin, hood, trunk, frontBumper, rearBumper);

  return {
    root,
    wheels,
    steeringPivots,
    interactionMesh,
    interactionHalo,
    chassis,
    cockpitAnchor,
    steeringWheel,
  };
}


export function createDrivingSimSystem(
  scene: BABYLON.Scene,
  project: ProjectData,
  camera: BABYLON.UniversalCamera,
  playerController: PlayerController,
  deps: DrivingSimSystemDeps
): DrivingSimSystem {
  const {
    canvas,
    drivingHint,
    drivingHud,
    drivingMode,
    drivingSpeed,
    getCurrentUiText,
    getFreeRoamStatusMessage,
    getIsPointerLocked,
    isLeaderboardOpen,
    isOverviewOpen,
    languageState,
    projectPanel,
    setIsDrivingVehicle,
    syncCrosshairVisibility,
    updateStatus,
  } = deps;
  const { right, back, yaw } = getRoomBasis(project);
  const zoneHalfWidth = DRIVING_ZONE_WIDTH * 0.5;
  const zoneHalfDepth = DRIVING_ZONE_DEPTH * 0.5;
  const roadRects = getDrivingRoadRects();
  const drivingKeys = new Set([
    "KeyW",
    "KeyZ",
    "KeyS",
    "KeyA",
    "KeyQ",
    "KeyD",
    "ArrowUp",
    "ArrowDown",
    "ArrowLeft",
    "ArrowRight",
    "Space",
  ]);
  const pressedKeys = new Set<string>();
  const toWorld = (x: number, y: number, z: number) =>
    project.position
      .add(right.scale(x))
      .add(back.scale(z))
      .add(new BABYLON.Vector3(0, y, 0));
  const toLocal = (position: BABYLON.Vector3) => {
    const offset = position.subtract(project.position);
    return {
      x: BABYLON.Vector3.Dot(offset, right),
      z: BABYLON.Vector3.Dot(offset, back),
    };
  };
  const getForward = (rotationY: number) =>
    new BABYLON.Vector3(Math.sin(rotationY), 0, Math.cos(rotationY));
  const car = createDrivingCar(
    scene,
    project,
    toWorld(0, 0.02, -31.8),
    yaw + Math.PI
  );
  let driving = false;
  let speed = 0;
  let steering = 0;
  let focusedInteraction: DrivingInteractionId | null = null;

  function isInsideZonePoint(position: BABYLON.Vector3) {
    const local = toLocal(position);
    return (
      Math.abs(local.x) <= zoneHalfWidth - 0.35 &&
      Math.abs(local.z) <= zoneHalfDepth - 0.35
    );
  }

  function enterVehicle() {
    if (driving) {
      return;
    }

    driving = true;
    speed = 0;
    steering = 0;
    setIsDrivingVehicle(true);
    playerController.resetInput();
    camera.rotation.z = 0;
    camera.detachControl();
    const enterForward = getForward(car.root.rotation.y);
    const cockpitPosition = car.cockpitAnchor.getAbsolutePosition();
    camera.position.copyFrom(cockpitPosition);
    lookAtTarget(
      camera,
      cockpitPosition
        .add(enterForward.scale(7.6))
        .add(new BABYLON.Vector3(0, 0.04, 0))
    );
    camera.fov = WALK_FOV + 0.01;
    syncCrosshairVisibility();
    updateStatus(getFreeRoamStatusMessage());
  }

  function exitVehicle() {
    if (!driving) {
      return;
    }

    driving = false;
    speed = 0;
    steering = 0;

    const forward = getForward(car.root.rotation.y);
    const carRight = new BABYLON.Vector3(forward.z, 0, -forward.x);
    const exitPosition = car.root.position
      .subtract(carRight.scale(1.8))
      .add(new BABYLON.Vector3(0, PLAYER_HEIGHT, 0));
    playerController.syncPosition(exitPosition);
    camera.attachControl(canvas, true);
    camera.fov = WALK_FOV;
    lookAtTarget(
      camera,
      car.root.position.add(forward.scale(6.2)).add(new BABYLON.Vector3(0, 0.9, 0))
    );
    setIsDrivingVehicle(false);
    syncCrosshairVisibility();
    updateStatus(getFreeRoamStatusMessage());
  }

  function isPressed(...codes: string[]) {
    return codes.some((code) => pressedKeys.has(code));
  }

  window.addEventListener("keydown", (event) => {
    if (isEditableTarget(event.target)) {
      return;
    }

    if (!drivingKeys.has(event.code)) {
      return;
    }

    pressedKeys.add(event.code);
    event.preventDefault();
  });

  window.addEventListener("keyup", (event) => {
    if (isEditableTarget(event.target)) {
      return;
    }

    if (!drivingKeys.has(event.code)) {
      return;
    }

    pressedKeys.delete(event.code);
    event.preventDefault();
  });

  return {
    interact(allowExit = true) {
      if (driving) {
        if (!allowExit) {
          return false;
        }
        exitVehicle();
        return true;
      }

      if (
        !isInsideZonePoint(camera.position) ||
        focusedInteraction !== "car" ||
        !getIsPointerLocked()
      ) {
        return false;
      }

      enterVehicle();
      return true;
    },
    isPlayerInsideZone() {
      return driving || isInsideZonePoint(camera.position);
    },
    isDriving() {
      return driving;
    },
    getSpeedKph() {
      return Math.round(Math.abs(speed) * 3.6);
    },
    update() {
      const dt = Math.min(scene.getEngine().getDeltaTime() / 1000, 0.05);
      if (dt <= 0) {
        return;
      }

      const visible =
        projectPanel.classList.contains("hidden") &&
        !isLeaderboardOpen() &&
        !isOverviewOpen() &&
        (driving || isInsideZonePoint(camera.position));
      const canControl = visible && getIsPointerLocked();

      if (driving) {
        const throttleInput =
          canControl
            ? (isPressed("KeyW", "KeyZ", "ArrowUp") ? 1 : 0) -
              (isPressed("KeyS", "ArrowDown") ? 1 : 0)
            : 0;
        const steeringInput =
          canControl
            ? (isPressed("KeyD", "ArrowRight") ? 1 : 0) -
              (isPressed("KeyA", "KeyQ", "ArrowLeft") ? 1 : 0)
            : 0;
        const brakeHeld = canControl && isPressed("Space");

        const speedRatioBefore = BABYLON.Scalar.Clamp(
          Math.abs(speed) / DRIVING_MAX_FORWARD_SPEED,
          0,
          1
        );

        if (throttleInput > 0) {
          speed = moveToward(
            speed,
            DRIVING_MAX_FORWARD_SPEED,
            DRIVING_ACCELERATION * (speed < -0.1 ? 2.1 : 1) * dt
          );
        } else if (throttleInput < 0) {
          speed = moveToward(
            speed,
            -DRIVING_MAX_REVERSE_SPEED,
            DRIVING_REVERSE_ACCELERATION * (speed > 0.1 ? 2.35 : 1) * dt
          );
        } else {
          speed = moveToward(
            speed,
            0,
            DRIVING_COAST_DECELERATION * (0.85 + speedRatioBefore * 0.7) * dt
          );
        }

        if (brakeHeld) {
          speed = moveToward(
            speed,
            0,
            DRIVING_BRAKE_DECELERATION * (1.1 + speedRatioBefore * 0.65) * dt
          );
        }

        steering = BABYLON.Scalar.Lerp(
          steering,
          steeringInput,
          1 -
            Math.exp(
              -(DRIVING_STEER_RESPONSE + (Math.abs(speed) < 0.4 ? 3 : 0)) * dt
            )
        );

        const speedRatio = BABYLON.Scalar.Clamp(
          Math.abs(speed) / DRIVING_MAX_FORWARD_SPEED,
          0,
          1
        );
        const steerGrip = 1 - speedRatio * 0.48;

        if (speedRatio > 0.005 && Math.abs(steering) > 0.01) {
          car.root.rotation.y +=
            steering *
            DRIVING_TURN_RATE *
            steerGrip *
            (0.24 + speedRatio * 1.04) *
            dt *
            Math.sign(speed || throttleInput || 1);
        }

        const forward = getForward(car.root.rotation.y);
        const proposedPosition = car.root.position.add(forward.scale(speed * dt));
        const proposedLocal = toLocal(proposedPosition);
        if (isInsideDrivingRoad(roadRects, proposedLocal.x, proposedLocal.z)) {
          car.root.position.copyFrom(proposedPosition);
        } else {
          speed = moveToward(speed, 0, DRIVING_BRAKE_DECELERATION * 2.2 * dt);
        }

        car.chassis.rotation.z = BABYLON.Scalar.Lerp(
          car.chassis.rotation.z,
          -steering * speedRatio * 0.09,
          1 - Math.exp(-dt * 7)
        );
        car.steeringPivots.forEach((pivot) => {
          pivot.rotation.y = steering * 0.45;
        });
        car.steeringWheel.rotation.y = -steering * 0.7;
        car.wheels.forEach((wheel) => {
          wheel.rotation.x += (speed * dt) / 0.36;
        });

        const cockpitPosition = car.cockpitAnchor.getAbsolutePosition();
        const carRight = new BABYLON.Vector3(forward.z, 0, -forward.x);
        camera.position.copyFrom(cockpitPosition);
        lookAtTarget(
          camera,
          cockpitPosition
            .add(forward.scale(7.6 + speedRatio * 1.4))
            .add(carRight.scale(steering * 0.42))
            .add(new BABYLON.Vector3(0, 0.03 + speedRatio * 0.04, 0))
        );
        camera.fov = BABYLON.Scalar.Lerp(
          camera.fov,
          WALK_FOV + 0.01 + speedRatio * 0.02,
          1 - Math.exp(-dt * 6)
        );
        focusedInteraction = null;
      } else {
        car.chassis.rotation.z = BABYLON.Scalar.Lerp(
          car.chassis.rotation.z,
          0,
          1 - Math.exp(-dt * 8)
        );
        car.steeringPivots.forEach((pivot) => {
          pivot.rotation.y = BABYLON.Scalar.Lerp(
            pivot.rotation.y,
            0,
            1 - Math.exp(-dt * 8)
          );
        });
        car.steeringWheel.rotation.y = BABYLON.Scalar.Lerp(
          car.steeringWheel.rotation.y,
          0,
          1 - Math.exp(-dt * 8)
        );
        if (visible && getIsPointerLocked()) {
          const pick = scene.pickWithRay(
            camera.getForwardRay(DRIVING_INTERACTION_DISTANCE),
            (mesh) =>
              Boolean(
                (mesh.metadata as DrivingInteractableMetadata | undefined)
                  ?.drivingInteractableId
              )
          );
          focusedInteraction =
            pick?.hit &&
            (pick.distance ?? Number.POSITIVE_INFINITY) <=
              DRIVING_INTERACTION_DISTANCE
              ? ((pick.pickedMesh?.metadata as DrivingInteractableMetadata | undefined)
                  ?.drivingInteractableId ?? null)
              : null;
        } else {
          focusedInteraction = null;
        }
      }

      if (car.interactionHalo.material instanceof BABYLON.StandardMaterial) {
        const pulse = 0.5 + 0.5 * Math.sin(performance.now() * 0.006);
        car.interactionHalo.material.alpha = driving
          ? 0
          : focusedInteraction === "car"
            ? 0.34 + pulse * 0.07
            : visible
              ? 0.12
              : 0.06;
        car.interactionHalo.material.emissiveColor = driving
          ? BABYLON.Color3.Black()
          : project.color.scale(
              focusedInteraction === "car" ? 0.52 + pulse * 0.16 : 0.18
            );
      }
      car.interactionHalo.setEnabled(!driving);

      drivingHud.classList.toggle("hidden", !visible);
      if (visible) {
        drivingSpeed.textContent = `${Math.round(Math.abs(speed) * 3.6)
          .toString()
          .padStart(3, "0")} km/h`;
        drivingMode.textContent = driving
          ? languageState.currentLanguage === "fr"
            ? "Au volant"
            : "Driving"
          : focusedInteraction === "car"
            ? languageState.currentLanguage === "fr"
              ? "Vehicule pret"
              : "Vehicle ready"
            : getCurrentUiText().drivingModeOnFoot;
        drivingMode.classList.toggle("active", driving);
        drivingHint.textContent = driving
          ? languageState.currentLanguage === "fr"
            ? "ZQSD / WASD pour accelerer et tourner. Space freine, E pour sortir du vehicule."
            : "ZQSD / WASD to accelerate and steer. Space brakes, E exits the vehicle."
          : focusedInteraction === "car"
            ? languageState.currentLanguage === "fr"
              ? "Clique ou appuie sur E pour entrer dans la voiture et lancer un tour."
              : "Click or press E to enter the car and start a run."
            : languageState.currentLanguage === "fr"
              ? "Approche-toi de la voiture rouge pour prendre le controle du vehicule."
              : "Get close to the red car to take control of the vehicle.";
      } else {
        drivingMode.classList.remove("active");
      }
    },
  };
}


