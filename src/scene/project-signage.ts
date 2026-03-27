import * as BABYLON from "babylonjs";

import {
  DRIVING_ZONE_DEPTH,
  PANEL_INTERACTION_DISTANCE,
  VR_COOKING_ZONE_DEPTH,
} from "../core/constants";
import type {
  AppLanguage,
  CreatedStand,
  ProjectData,
  ProjectInteractionMetadata,
  ProjectTextContent,
} from "../core/types";
import { createMaterial } from "./builders";
import { getRoomBasis } from "./room-basis";

export type ProjectSignageDeps = {
  getProjectText: (project: ProjectData) => ProjectTextContent;
  languageState: { readonly currentLanguage: AppLanguage };
  registerLocaleRefresher: (refresher: () => void) => void;
  rgbString: (color: BABYLON.Color3) => string;
};

export function createProjectTrailerBillboard(
  scene: BABYLON.Scene,
  project: ProjectData,
  position: BABYLON.Vector3,
  rotationY: number,
  deps: ProjectSignageDeps
) {
  const { getProjectText, languageState, registerLocaleRefresher } = deps;
  const root = new BABYLON.TransformNode(
    `${project.id}_trailerBillboardRoot`,
    scene
  );
  root.position = position.add(new BABYLON.Vector3(0, 3.34, 0));
  root.rotation.y = rotationY;

  const frameMaterial = createMaterial(
    scene,
    `${project.id}_trailerFrameMat`,
    new BABYLON.Color3(0.1, 0.13, 0.16),
    project.color.scale(0.12)
  );
  frameMaterial.specularColor = new BABYLON.Color3(0.28, 0.34, 0.38);
  frameMaterial.specularPower = 78;

  const glowMaterial = createMaterial(
    scene,
    `${project.id}_trailerGlowMat`,
    new BABYLON.Color3(0.08, 0.16, 0.12),
    project.color.scale(0.58),
    0.18
  );
  glowMaterial.disableLighting = true;

  const screenTexture = new BABYLON.DynamicTexture(
    `${project.id}_trailerTexture`,
    { width: 1536, height: 896 },
    scene,
    true
  );
  screenTexture.hasAlpha = true;
  const context = screenTexture.getContext();

  registerLocaleRefresher(() => {
    const projectText = getProjectText(project);
    const currentLanguage = languageState.currentLanguage;
    const descriptorLine =
      project.id === "survivorSlime"
        ? currentLanguage === "fr"
          ? "FPS roguelike | Merge system | Combat de horde"
          : "FPS roguelike | Merge system | Horde combat"
        : project.id === "vrCooking"
          ? currentLanguage === "fr"
            ? "VR cooking | Burger rush | Interactions coop"
            : "VR cooking | Burger rush | Co-op interactions"
          : project.id === "drivingSim"
            ? currentLanguage === "fr"
              ? "Dynamique vehicule | Quartier urbain | Simulation sur rig"
              : "Vehicle dynamics | Urban district | Rig-ready simulation"
            : `${projectText.engine} | ${projectText.focus}`;
    const trailerNote =
      project.id === "vrCooking"
        ? currentLanguage === "fr"
          ? "Placeholder en attendant l'integration d'une capture de gameplay cuisine / service."
          : "Placeholder while waiting for cooking and service gameplay footage."
        : project.id === "drivingSim"
          ? currentLanguage === "fr"
            ? "Placeholder en attendant l'integration d'une capture de conduite et de telemetrie sur le rig."
            : "Placeholder while waiting for driving footage and rig telemetry capture."
          : currentLanguage === "fr"
            ? "Placeholder en attendant l'integration de la vraie video trailer."
            : "Placeholder while waiting for the final trailer video.";

    context.clearRect(0, 0, 1536, 896);
    const gradient = context.createLinearGradient(0, 0, 0, 896);
    gradient.addColorStop(0, "rgba(8, 14, 24, 0.98)");
    gradient.addColorStop(1, "rgba(3, 8, 14, 0.98)");
    context.fillStyle = gradient;
    context.fillRect(0, 0, 1536, 896);

    context.fillStyle = "rgba(98, 255, 196, 0.08)";
    context.fillRect(96, 88, 1344, 720);

    for (let line = 0; line < 24; line += 1) {
      context.fillStyle = `rgba(255, 255, 255, ${
        0.012 + (line % 3) * 0.006
      })`;
      context.fillRect(96, 88 + line * 30, 1344, 1);
    }

    context.strokeStyle = "rgba(69, 255, 191, 0.55)";
    context.lineWidth = 4;
    context.strokeRect(96, 88, 1344, 720);

    context.fillStyle = "rgba(127, 231, 203, 0.96)";
    context.font = "600 38px Segoe UI";
    context.fillText(
      currentLanguage === "fr"
        ? "TRAILER / CAPTURE GAMEPLAY"
        : "TRAILER / GAMEPLAY CAPTURE",
      142,
      162
    );

    context.fillStyle = "rgba(242, 247, 255, 0.98)";
    context.font = "700 102px Segoe UI";
    context.fillText(projectText.title, 136, 336);

    context.fillStyle = "rgba(185, 208, 255, 0.82)";
    context.font = "400 42px Segoe UI";
    context.fillText(descriptorLine, 142, 402);

    context.fillStyle = "rgba(52, 255, 182, 0.18)";
    context.beginPath();
    context.arc(768, 490, 118, 0, Math.PI * 2);
    context.fill();

    context.strokeStyle = "rgba(129, 255, 210, 0.72)";
    context.lineWidth = 5;
    context.beginPath();
    context.arc(768, 490, 118, 0, Math.PI * 2);
    context.stroke();

    context.fillStyle = "rgba(245, 250, 255, 0.96)";
    context.beginPath();
    context.moveTo(740, 430);
    context.lineTo(740, 550);
    context.lineTo(836, 490);
    context.closePath();
    context.fill();

    context.fillStyle = "rgba(134, 255, 210, 0.92)";
    context.font = "700 44px Segoe UI";
    context.fillText(
      currentLanguage === "fr" ? "VOIR LE PROTOTYPE" : "WATCH THE PROTOTYPE",
      538,
      676
    );

    context.fillStyle = "rgba(214, 226, 255, 0.72)";
    context.font = "400 28px Segoe UI";
    context.fillText(trailerNote, 258, 726);
    screenTexture.update();
  });

  const screenMaterial = new BABYLON.StandardMaterial(
    `${project.id}_trailerScreenMat`,
    scene
  );
  screenMaterial.diffuseTexture = screenTexture;
  screenMaterial.emissiveTexture = screenTexture;
  screenMaterial.opacityTexture = screenTexture;
  screenMaterial.emissiveColor = new BABYLON.Color3(0.92, 0.98, 1);
  screenMaterial.disableLighting = true;
  screenMaterial.backFaceCulling = false;

  const frame = BABYLON.MeshBuilder.CreateBox(
    `${project.id}_trailerFrame`,
    { width: 8.2, height: 4.72, depth: 0.18 },
    scene
  );
  frame.parent = root;
  frame.position.z = 0.02;
  frame.isPickable = false;
  frame.material = frameMaterial;

  const screen = BABYLON.MeshBuilder.CreatePlane(
    `${project.id}_trailerScreen`,
    { width: 7.82, height: 4.34, sideOrientation: BABYLON.Mesh.DOUBLESIDE },
    scene
  );
  screen.parent = root;
  screen.position.z = -0.1;
  screen.isPickable = false;
  screen.material = screenMaterial;

  const glow = BABYLON.MeshBuilder.CreatePlane(
    `${project.id}_trailerGlow`,
    { width: 8.55, height: 5.02, sideOrientation: BABYLON.Mesh.DOUBLESIDE },
    scene
  );
  glow.parent = root;
  glow.position.z = -0.18;
  glow.isPickable = false;
  glow.material = glowMaterial;

  for (const side of [-1, 1]) {
    const support = BABYLON.MeshBuilder.CreateBox(
      `${project.id}_trailerSupport_${side}`,
      { width: 0.12, height: 2.9, depth: 0.12 },
      scene
    );
    support.parent = root;
    support.position = new BABYLON.Vector3(3.42 * side, -3.8, 0.02);
    support.isPickable = false;
    support.material = frameMaterial;
  }
}

export function createProjectWipSign(
  scene: BABYLON.Scene,
  project: ProjectData,
  deps: ProjectSignageDeps
) {
  const { languageState, registerLocaleRefresher } = deps;
  if (project.id !== "drivingSim" && project.id !== "fantasyMobile") {
    return;
  }

  const { inward, right, yaw } = getRoomBasis(project);
  const config =
    project.id === "drivingSim"
      ? {
          forward: DRIVING_ZONE_DEPTH * 0.5 + 2.15,
          lateral: -8.1,
          height: 1.22,
          width: 2.45,
          supportHeight: 1.28,
        }
      : {
          forward: 5.85,
          lateral: -3.2,
          height: 1.14,
          width: 2.15,
          supportHeight: 1.18,
        };

  const root = new BABYLON.TransformNode(`${project.id}_wipRoot`, scene);
  root.position = project.position
    .add(inward.scale(config.forward))
    .add(right.scale(config.lateral))
    .add(new BABYLON.Vector3(0, config.height, 0));
  root.rotation.y = yaw + Math.PI;

  const frameMaterial = createMaterial(
    scene,
    `${project.id}_wipFrameMat`,
    new BABYLON.Color3(0.14, 0.11, 0.08),
    new BABYLON.Color3(0.18, 0.08, 0.02)
  );
  frameMaterial.specularColor = new BABYLON.Color3(0.3, 0.24, 0.16);
  frameMaterial.specularPower = 64;

  const glowMaterial = createMaterial(
    scene,
    `${project.id}_wipGlowMat`,
    new BABYLON.Color3(0.22, 0.12, 0.04),
    new BABYLON.Color3(0.8, 0.38, 0.04),
    0.14
  );
  glowMaterial.disableLighting = true;

  const signTexture = new BABYLON.DynamicTexture(
    `${project.id}_wipTexture`,
    { width: 1024, height: 512 },
    scene,
    true
  );
  signTexture.hasAlpha = true;
  const context = signTexture.getContext();

  registerLocaleRefresher(() => {
    const currentLanguage = languageState.currentLanguage;
    context.clearRect(0, 0, 1024, 512);
    context.fillStyle = "rgba(18, 12, 8, 0.92)";
    context.fillRect(42, 54, 940, 404);
    context.strokeStyle = "rgba(255, 168, 74, 0.95)";
    context.lineWidth = 6;
    context.strokeRect(42, 54, 940, 404);
    context.fillStyle = "rgba(255, 196, 122, 0.92)";
    context.font = "600 42px Segoe UI";
    context.fillText(
      currentLanguage === "fr" ? "ZONE EN PROGRESSION" : "WORK IN PROGRESS",
      92,
      134
    );
    context.fillStyle = "rgba(255, 244, 232, 0.98)";
    context.font = "800 162px Segoe UI";
    context.fillText("WIP", 92, 286);
    context.fillStyle = "rgba(255, 214, 168, 0.9)";
    context.font = "600 40px Segoe UI";
    context.fillText(
      currentLanguage === "fr"
        ? "Contenu en cours d'iteration"
        : "Content still being iterated",
      96,
      356
    );
    context.fillStyle = "rgba(255, 224, 194, 0.76)";
    context.font = "400 28px Segoe UI";
    context.fillText(
      currentLanguage === "fr"
        ? "Gameplay, visuels et media encore en construction."
        : "Gameplay, visuals and media are still under construction.",
      96,
      408
    );
    signTexture.update();
  });

  const signMaterial = new BABYLON.StandardMaterial(`${project.id}_wipMat`, scene);
  signMaterial.diffuseTexture = signTexture;
  signMaterial.emissiveTexture = signTexture;
  signMaterial.opacityTexture = signTexture;
  signMaterial.emissiveColor = new BABYLON.Color3(1, 0.74, 0.42);
  signMaterial.disableLighting = true;
  signMaterial.backFaceCulling = false;

  const backPlate = BABYLON.MeshBuilder.CreateBox(
    `${project.id}_wipBackPlate`,
    { width: config.width + 0.24, height: 1.26, depth: 0.12 },
    scene
  );
  backPlate.parent = root;
  backPlate.position.z = 0.02;
  backPlate.isPickable = false;
  backPlate.material = frameMaterial;

  const panel = BABYLON.MeshBuilder.CreatePlane(
    `${project.id}_wipPanel`,
    { width: config.width, height: 1.08, sideOrientation: BABYLON.Mesh.DOUBLESIDE },
    scene
  );
  panel.parent = root;
  panel.position.z = -0.06;
  panel.isPickable = false;
  panel.material = signMaterial;

  const glow = BABYLON.MeshBuilder.CreatePlane(
    `${project.id}_wipGlow`,
    {
      width: config.width + 0.42,
      height: 1.34,
      sideOrientation: BABYLON.Mesh.DOUBLESIDE,
    },
    scene
  );
  glow.parent = root;
  glow.position.z = -0.12;
  glow.isPickable = false;
  glow.material = glowMaterial;

  for (const side of [-1, 1]) {
    const support = BABYLON.MeshBuilder.CreateBox(
      `${project.id}_wipSupport_${side}`,
      { width: 0.08, height: config.supportHeight, depth: 0.08 },
      scene
    );
    support.parent = root;
    support.position = new BABYLON.Vector3(
      side * (config.width * 0.32),
      -0.5 - config.supportHeight * 0.5,
      0
    );
    support.isPickable = false;
    support.material = frameMaterial;
  }

  const base = BABYLON.MeshBuilder.CreateBox(
    `${project.id}_wipBase`,
    { width: config.width * 0.62, height: 0.08, depth: 0.52 },
    scene
  );
  base.parent = root;
  base.position = new BABYLON.Vector3(0, -1.18, 0.08);
  base.isPickable = false;
  base.material = frameMaterial;
}

export function createProjectLabel(
  scene: BABYLON.Scene,
  project: ProjectData,
  deps: ProjectSignageDeps,
  root?: BABYLON.TransformNode
) {
  const { getProjectText, registerLocaleRefresher, rgbString } = deps;
  const { inward, right, yaw } = getRoomBasis(project);
  const isEntrancePanel =
    project.id === "survivorSlime" ||
    project.id === "vrCooking" ||
    project.id === "drivingSim";
  const labelTexture = new BABYLON.DynamicTexture(
    `${project.id}_labelTexture`,
    { width: 1024, height: 256 },
    scene,
    true
  );
  const context = labelTexture.getContext();
  labelTexture.hasAlpha = true;

  registerLocaleRefresher(() => {
    const text = getProjectText(project);
    context.clearRect(0, 0, 1024, 256);
    context.fillStyle = "rgba(4, 8, 18, 0.78)";
    context.fillRect(12, 30, 1000, 196);
    context.strokeStyle = rgbString(project.color);
    context.lineWidth = 4;
    context.strokeRect(12, 30, 1000, 196);
    context.fillStyle = "rgba(127, 231, 203, 0.95)";
    context.font = "600 34px Segoe UI";
    context.fillText(text.accent.toUpperCase(), 48, 88);
    context.fillStyle = "rgba(243, 246, 255, 0.96)";
    context.font = "700 62px Segoe UI";
    context.fillText(text.title, 48, 160);
    context.fillStyle = "rgba(185, 206, 255, 0.86)";
    context.font = "400 30px Segoe UI";
    context.fillText(text.engine, 48, 208);
    labelTexture.update();
  });

  const labelMaterial = new BABYLON.StandardMaterial(`${project.id}_labelMat`, scene);
  labelMaterial.diffuseTexture = labelTexture;
  labelMaterial.opacityTexture = labelTexture;
  labelMaterial.emissiveColor = project.color.scale(0.65);
  labelMaterial.disableLighting = true;
  labelMaterial.backFaceCulling = false;

  const label = BABYLON.MeshBuilder.CreatePlane(
    `${project.id}_label`,
    { width: 5.4, height: 1.45, sideOrientation: BABYLON.Mesh.DOUBLESIDE },
    scene
  );

  if (isEntrancePanel) {
    const entranceOffset =
      project.id === "survivorSlime"
        ? 15.82
        : project.id === "vrCooking"
          ? VR_COOKING_ZONE_DEPTH * 0.5 + 0.4
          : DRIVING_ZONE_DEPTH * 0.5 + 0.42;
    const entranceHeight =
      project.id === "survivorSlime"
        ? 3.12
        : project.id === "vrCooking"
          ? 3.78
          : 3.64;

    label.position = project.position
      .add(inward.scale(entranceOffset))
      .add(right.scale(0))
      .add(new BABYLON.Vector3(0, entranceHeight, 0));
    label.rotation.y = yaw + Math.PI;
    label.isPickable = true;
    label.metadata = {
      projectId: project.id,
      interactionMode: "panel",
      interactionDistance: PANEL_INTERACTION_DISTANCE,
    } satisfies ProjectInteractionMetadata;
    createProjectTrailerBillboard(
      scene,
      project,
      label.position.clone(),
      label.rotation.y,
      deps
    );
  } else {
    if (root) {
      label.parent = root;
    }
    label.position = new BABYLON.Vector3(0, 3.7, -1.8);
    label.rotation.y = Math.PI;
    label.isPickable = false;
  }

  label.material = labelMaterial;
  createProjectWipSign(scene, project, deps);
}

export function createProjectStand(
  scene: BABYLON.Scene,
  project: ProjectData,
  deps: ProjectSignageDeps
): CreatedStand {
  const root = new BABYLON.TransformNode(`${project.id}_root`, scene);
  root.position = project.position.clone();

  const { yaw } = getRoomBasis(project);
  root.rotation.y = yaw;

  const isSlime = project.id === "survivorSlime";
  const baseMaterial = createMaterial(
    scene,
    `${project.id}_baseMat`,
    isSlime
      ? new BABYLON.Color3(0.14, 0.16, 0.19)
      : new BABYLON.Color3(0.07, 0.08, 0.12),
    isSlime
      ? new BABYLON.Color3(0.008, 0.01, 0.012)
      : project.color.scale(0.12)
  );

  const base = BABYLON.MeshBuilder.CreateCylinder(
    `${project.id}_base`,
    isSlime
      ? { diameter: 2.5, height: 0.18, tessellation: 48 }
      : { diameter: 2.8, height: 0.26, tessellation: 48 },
    scene
  );
  base.parent = root;
  base.position.y = isSlime ? 0.09 : 0.14;
  base.checkCollisions = true;
  base.material = baseMaterial;

  const pedestal = isSlime
    ? BABYLON.MeshBuilder.CreateBox(
        `${project.id}_pedestal`,
        { width: 1.6, height: 0.54, depth: 1.22 },
        scene
      )
    : BABYLON.MeshBuilder.CreateCylinder(
        `${project.id}_pedestal`,
        { diameter: 1.35, height: 1.15, tessellation: 32 },
        scene
      );
  pedestal.parent = root;
  pedestal.position.y = isSlime ? 0.36 : 0.72;
  pedestal.checkCollisions = true;
  pedestal.material = createMaterial(
    scene,
    `${project.id}_pedestalMat`,
    isSlime
      ? new BABYLON.Color3(0.22, 0.24, 0.27)
      : new BABYLON.Color3(0.1, 0.12, 0.18),
    isSlime
      ? new BABYLON.Color3(0.01, 0.012, 0.014)
      : project.color.scale(0.06)
  );

  const displayMaterial = createMaterial(
    scene,
    `${project.id}_displayMat`,
    isSlime
      ? new BABYLON.Color3(0.08, 0.12, 0.12)
      : project.color.scale(0.26),
    isSlime
      ? new BABYLON.Color3(0.08, 0.16, 0.14)
      : project.color.scale(0.5)
  );
  const display = BABYLON.MeshBuilder.CreateBox(
    `${project.id}_display`,
    isSlime
      ? { width: 1.74, height: 0.94, depth: 0.08 }
      : { width: 1.55, height: 0.95, depth: 0.16 },
    scene
  );
  display.parent = root;
  display.position.y = isSlime ? 1.12 : 1.62;
  display.position.z = isSlime ? -0.28 : -0.58;
  display.rotation.x = isSlime ? -0.3 : 0;
  display.checkCollisions = true;
  display.material = displayMaterial;

  const orbMaterial = createMaterial(
    scene,
    `${project.id}_orbMat`,
    isSlime
      ? new BABYLON.Color3(0.58, 0.72, 0.68)
      : new BABYLON.Color3(0.82, 0.9, 1.0),
    isSlime ? project.color.scale(0.28) : project.color.scale(1.25)
  );
  const orb = BABYLON.MeshBuilder.CreateSphere(
    `${project.id}_orb`,
    { diameter: isSlime ? 0.28 : 0.55, segments: 24 },
    scene
  );
  orb.parent = root;
  orb.position.y = isSlime ? 1.56 : 2.2;
  orb.position.z = isSlime ? -0.12 : 0;
  orb.material = orbMaterial;
  orb.isPickable = true;

  const ringMaterial = createMaterial(
    scene,
    `${project.id}_ringMat`,
    isSlime
      ? new BABYLON.Color3(0.12, 0.16, 0.17)
      : new BABYLON.Color3(0.08, 0.1, 0.16),
    isSlime ? project.color.scale(0.12) : project.color.scale(0.7)
  );
  const ring = BABYLON.MeshBuilder.CreateTorus(
    `${project.id}_ring`,
    {
      diameter: isSlime ? 0.84 : 1.9,
      thickness: isSlime ? 0.03 : 0.06,
      tessellation: 64,
    },
    scene
  );
  ring.parent = root;
  ring.position.y = isSlime ? 1.28 : 1.62;
  ring.position.z = isSlime ? -0.12 : 0;
  ring.rotation.x = Math.PI / 2;
  ring.material = ringMaterial;

  const haloMaterial = createMaterial(
    scene,
    `${project.id}_haloMat`,
    isSlime ? project.color.scale(0.05) : project.color.scale(0.15),
    isSlime ? project.color.scale(0.1) : project.color.scale(0.55),
    isSlime ? 0.12 : 0.45
  );
  const halo = BABYLON.MeshBuilder.CreateDisc(
    `${project.id}_halo`,
    { radius: isSlime ? 1.18 : 1.45, tessellation: 48 },
    scene
  );
  halo.parent = root;
  halo.rotation.x = Math.PI / 2;
  halo.position.y = isSlime ? 0.1 : 0.16;
  halo.material = haloMaterial;
  halo.isPickable = false;

  const beamMaterial = createMaterial(
    scene,
    `${project.id}_beamMat`,
    isSlime
      ? new BABYLON.Color3(0.05, 0.08, 0.09)
      : project.color.scale(0.08),
    isSlime ? project.color.scale(0.08) : project.color.scale(0.4),
    isSlime ? 0.1 : 0.28
  );
  const beam = BABYLON.MeshBuilder.CreateCylinder(
    `${project.id}_beam`,
    isSlime
      ? { diameterTop: 0.05, diameterBottom: 0.12, height: 1.3, tessellation: 14 }
      : { diameterTop: 0.12, diameterBottom: 0.42, height: 3.1, tessellation: 16 },
    scene
  );
  beam.parent = root;
  beam.position.y = isSlime ? 0.88 : 1.72;
  beam.material = beamMaterial;
  beam.isPickable = false;

  if (isSlime) {
    const sideStrutLeft = BABYLON.MeshBuilder.CreateBox(
      `${project.id}_sideStrutLeft`,
      { width: 0.14, height: 0.86, depth: 0.18 },
      scene
    );
    sideStrutLeft.parent = root;
    sideStrutLeft.position = new BABYLON.Vector3(-0.98, 0.72, 0.02);
    sideStrutLeft.rotation.z = 0.24;
    sideStrutLeft.material = baseMaterial;

    const sideStrutRight = BABYLON.MeshBuilder.CreateBox(
      `${project.id}_sideStrutRight`,
      { width: 0.14, height: 0.86, depth: 0.18 },
      scene
    );
    sideStrutRight.parent = root;
    sideStrutRight.position = new BABYLON.Vector3(0.98, 0.72, 0.02);
    sideStrutRight.rotation.z = -0.24;
    sideStrutRight.material = baseMaterial;

    const hood = BABYLON.MeshBuilder.CreateBox(
      `${project.id}_screenHood`,
      { width: 1.9, height: 0.12, depth: 0.34 },
      scene
    );
    hood.parent = root;
    hood.position = new BABYLON.Vector3(0, 1.56, -0.28);
    hood.material = baseMaterial;

    const console = BABYLON.MeshBuilder.CreateBox(
      `${project.id}_console`,
      { width: 1.26, height: 0.14, depth: 0.62 },
      scene
    );
    console.parent = root;
    console.position = new BABYLON.Vector3(0, 0.84, -0.56);
    console.rotation.x = -0.28;
    console.material = baseMaterial;
  }

  [base, pedestal, display, orb, ring].forEach((mesh) => {
    mesh.metadata = {
      projectId: project.id,
      interactionMode: "focus",
    } satisfies ProjectInteractionMetadata;
  });

  createProjectLabel(scene, project, deps, root);

  if (isSlime) {
    root.position = root.position.add(new BABYLON.Vector3(0, 0, -1.2));
  }

  return {
    root,
    orb,
    ring,
    halo,
    display,
    beam,
    orbMaterial,
    ringMaterial,
    haloMaterial,
    displayMaterial,
  } satisfies CreatedStand;
}
