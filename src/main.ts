import * as BABYLON from "babylonjs";
import "./style.css";

type ProjectData = {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  engine: string;
  focus: string;
  context: string;
  role: string;
  year: string;
  stack: string;
  atmosphere: string;
  accent: string;
  color: BABYLON.Color3;
  position: BABYLON.Vector3;
  viewPosition: BABYLON.Vector3;
};

type CreatedStand = {
  root: BABYLON.TransformNode;
  orb: BABYLON.Mesh;
  ring: BABYLON.Mesh;
  halo: BABYLON.Mesh;
  display: BABYLON.Mesh;
  beam: BABYLON.Mesh;
  orbMaterial: BABYLON.StandardMaterial;
  ringMaterial: BABYLON.StandardMaterial;
  haloMaterial: BABYLON.StandardMaterial;
  displayMaterial: BABYLON.StandardMaterial;
};

type FloatingParticle = {
  mesh: BABYLON.InstancedMesh;
  baseY: number;
  offset: number;
  speed: number;
};

type PlayerController = {
  update: () => void;
  syncPosition: (position: BABYLON.Vector3) => void;
  resetInput: () => void;
};

type CollisionCamera = BABYLON.UniversalCamera & {
  _collideWithWorld: (displacement: BABYLON.Vector3) => void;
};

type RockTextureSet = {
  albedoTexture: BABYLON.DynamicTexture;
  normalTexture: BABYLON.DynamicTexture;
  roughnessTexture: BABYLON.DynamicTexture;
};

type SlimeRainDropMetadata = {
  assetType: "slimeRainLine";
  minY: number;
  speed: number;
  wind: BABYLON.Vector3;
};

type SlimeRainSystem = {
  lines: BABYLON.InstancedMesh[];
  respawnLine: (line: BABYLON.InstancedMesh) => void;
};

type ProjectInteractionMode = "focus" | "panel";

type ProjectInteractionMetadata = {
  projectId: string;
  interactionMode?: ProjectInteractionMode;
  interactionDistance?: number;
};

type SlimeEnemyState = "falling" | "chasing";

type SlimeEnemy = {
  root: BABYLON.TransformNode;
  body: BABYLON.Mesh;
  shell: BABYLON.Mesh;
  shadow: BABYLON.Mesh;
  localX: number;
  localZ: number;
  radius: number;
  groundY: number;
  velocityY: number;
  state: SlimeEnemyState;
  moveSpeed: number;
  phase: number;
  baseScale: BABYLON.Vector3;
};

type SlimeShotResult = {
  targetPoint: BABYLON.Vector3;
  hit: boolean;
  scoreDelta: number;
  totalScore: number;
};

type CombatCrosshairState = {
  armed: boolean;
  targeting: boolean;
  coolingDown: boolean;
  firing: boolean;
  hit: boolean;
};

type SlimeEnemySystem = {
  update: () => void;
  disposeAll: () => void;
  shoot: (origin: BABYLON.Vector3, direction: BABYLON.Vector3) => SlimeShotResult;
  isPlayerInsideArena: () => boolean;
  getScore: () => number;
  getEnemyCount: () => number;
};

type SlimeWeaponSystem = {
  update: () => void;
  tryShoot: () => SlimeShotResult | null;
  isArmed: () => boolean;
  getCrosshairState: () => CombatCrosshairState;
  dispose: () => void;
};

const PLAYER_HEIGHT = 1.72;
const INTERACTION_DISTANCE = 6;
const PANEL_INTERACTION_DISTANCE = 12.5;
const SLIME_ARENA_SIZE = 30;
const SLIME_ARENA_HALF_SIZE = 15.4;
const SLIME_TERRAIN_Y_OFFSET = 0.06;
const SLIME_ENEMY_MAX = 6;
const SLIME_ENEMY_SPAWN_INTERVAL = 1.3;
const SLIME_ENEMY_FALL_GRAVITY = 22;
const SLIME_ENEMY_SPAWN_MIN_HEIGHT = 7.8;
const SLIME_ENEMY_SPAWN_MAX_HEIGHT = 12.6;
const SLIME_ENEMY_CHASE_SPEED_MIN = 2.2;
const SLIME_ENEMY_CHASE_SPEED_MAX = 3.15;
const SLIME_WEAPON_RANGE = 24;
const SLIME_WEAPON_COOLDOWN = 0.2;
const SLIME_WEAPON_BOLT_LIFETIME = 120;
const SLIME_WEAPON_SCORE_PER_KILL = 100;
const START_POSITION = new BABYLON.Vector3(0, PLAYER_HEIGHT, 8);
const ROOM_OFFSET = 15;
const WALK_SPEED = 6.2;
const SPRINT_SPEED = 9.6;
const JUMP_FORCE = 6.15;
const JUMP_ASCENT_GRAVITY = -20;
const JUMP_RELEASE_GRAVITY = -30;
const JUMP_DESCENT_GRAVITY = -36;
const MAX_FALL_SPEED = -28;
const COYOTE_TIME = 0.12;
const JUMP_BUFFER_TIME = 0.14;
const GROUND_STICK_FORCE = -1.8;
const WALK_FOV = 0.92;
const SPRINT_FOV_BOOST = 0.035;
const GROUND_RAY_CAST_LENGTH = PLAYER_HEIGHT + 0.95;
const GROUND_CONTACT_EPSILON = 0.12;
const HEAD_BOB_WALK_FREQUENCY = 8.1;
const HEAD_BOB_SPRINT_FREQUENCY = 11.2;
const HEAD_BOB_AMPLITUDE = 0.05;
const HEAD_SWAY_AMPLITUDE = 0.016;
const CAMERA_ROLL_INTENSITY = 0.018;
const LANDING_IMPACT_SCALE = 0.045;
const LANDING_MAX_IMPULSE = 0.9;
const LANDING_SPRING_STRENGTH = 42;
const LANDING_SPRING_DAMPING = 14;

const projects: ProjectData[] = [
  {
    id: "survivorSlime",
    title: "Survivor Slime",
    subtitle: "FPS roguelike a vagues sous Unreal Engine 5",
    description:
      "FPS roguelike base sur des vagues d'ennemis dans lequel le joueur incarne un agent municipal intergalactique charge de nettoyer des zones infectees par une matiere vivante instable.\n\nCore loop\n- entrer dans une zone\n- survivre aux vagues de slimes\n- gerer les merges ennemis\n- recuperer recompenses et progression\n- encaisser l'escalade de difficulte jusqu'a l'extraction ou la mort\n\nMecanique cle - Merge system\n- 3 slimes identiques et de meme power fusionnent\n- la puissance evolue par paliers (1 -> 4 -> 16 -> ...)\n- la taille, les HP et le niveau de menace augmentent\n- un cooldown de merge protege la lisibilite du systeme\n\nA la mort d'un slime fusionne\n- spawn de A slimes gris\n- ces slimes gris ne fusionnent pas\n- ils servent de fallback vers l'etat de base",
    engine: "Unreal Engine 5",
    focus: "Merge system, horde combat, architecture IA scalable, roguelike loop",
    context: "Projet de fin d'etude de master",
    role: "Gameplay programmer, AI architecture, combat systems, VFX gameplay",
    year: "2025/2026",
    stack: "UE5, Blueprints, Behavior Trees, NavMesh, Niagara, optimisation",
    atmosphere:
      "Piliers du gameplay\n- escalade systemique: merge -> menace exponentielle\n- lisibilite et controle: VFX clairs, comportements distincts\n- gameplay nerveux: FPS rapide et gestion de horde\n- rejouabilite roguelike\n\nArchitecture IA\n- BP_EnemyMain derive de Character\n- navigation via NavMesh\n- Behavior Tree simple avec une task Move unique\n- chaque slime decide comment se deplacer: crawl, jump, super jump, dash ou glide selon sa variante\n\nRefonte du systeme ennemi\n- passage a une architecture scalable\n- resolution des problemes de physique et de navigation\n- hop system propre via LaunchCharacter, OnLanded et timers\n- Mega Jump AOE avec preview Niagara, impact et knockback joueur\n- VFX lisibles et performants sans tick global",
    accent: "Exposition 01",
    color: new BABYLON.Color3(0.2, 0.95, 0.65),
    position: new BABYLON.Vector3(-ROOM_OFFSET, 0, -ROOM_OFFSET),
    viewPosition: new BABYLON.Vector3(-10.8, PLAYER_HEIGHT, -10.8),
  },
  {
    id: "fantasyMobile",
    title: "Fantasy Mobile Multiplayer",
    subtitle: "Jeu medieval-fantasy multijoueur pense pour mobile",
    description:
      "Un projet centre sur la replication, l'interface et les contraintes de performance, avec une attention particuliere portee a la fluidite d'experience sur des appareils limites.",
    engine: "Unreal Engine 5",
    focus: "Replication, UI, mobile optimisation",
    context: "Projet en equipe",
    role: "Gameplay programmer / UI / reseau",
    year: "2024-2025",
    stack: "UE5, replication, widgets, profiling",
    atmosphere:
      "L'enjeu etait de garder une sensation de monde partage tout en preservant de la clarte et une bonne tenue framerate sur mobile.",
    accent: "Exposition 02",
    color: new BABYLON.Color3(0.45, 0.7, 1.0),
    position: new BABYLON.Vector3(ROOM_OFFSET, 0, -ROOM_OFFSET),
    viewPosition: new BABYLON.Vector3(10.8, PLAYER_HEIGHT, -10.8),
  },
  {
    id: "vrCooking",
    title: "VR Cooking Multiplayer",
    subtitle: "Jeu de cuisine coop en VR sous Unity",
    description:
      "Une production orientee interactions, objets manipulables et cooperation, ou la clarte UX compte autant que la sensation physique des gestes en VR.",
    engine: "Unity",
    focus: "VR interactions, multiplayer, UX",
    context: "Projet en equipe",
    role: "Gameplay / interactions / integration",
    year: "2023-2024",
    stack: "Unity, XR, interactions, prototypage",
    atmosphere:
      "La reussite passait par une gestuelle satisfaisante et par une lecture immediate des outils, ingredients et actions en espace partage.",
    accent: "Exposition 03",
    color: new BABYLON.Color3(1.0, 0.65, 0.25),
    position: new BABYLON.Vector3(-ROOM_OFFSET, 0, ROOM_OFFSET),
    viewPosition: new BABYLON.Vector3(-10.8, PLAYER_HEIGHT, 10.8),
  },
  {
    id: "drivingSim",
    title: "Ultra Realistic Driving Simulator",
    subtitle: "Simulation de conduite temps reel sur rig physique",
    description:
      "Un projet professionnel fortement oriente simulation, hardware, stabilite et performances. Une partie des medias reste non partageable mais l'experience technique est centrale.",
    engine: "Unreal Engine",
    focus: "Simulation, hardware, performance, pipeline",
    context: "Projet professionnel / NDA",
    role: "Programmation gameplay temps reel",
    year: "2025-2026",
    stack: "UE, pipeline, hardware IO, optimisation",
    atmosphere:
      "Le coeur du travail consistait a faire tenir ensemble precision, robustesse et ressenti credible sur une installation physique exigeante.",
    accent: "Exposition 04",
    color: new BABYLON.Color3(1.0, 0.35, 0.35),
    position: new BABYLON.Vector3(ROOM_OFFSET, 0, ROOM_OFFSET),
    viewPosition: new BABYLON.Vector3(10.8, PLAYER_HEIGHT, 10.8),
  },
];

const canvas = document.getElementById("renderCanvas") as HTMLCanvasElement;
const engine = new BABYLON.Engine(canvas, true, {
  preserveDrawingBuffer: true,
  stencil: true,
});

const projectRail = document.getElementById("projectRail") as HTMLDivElement;
const heroPanel = document.getElementById("heroPanel") as HTMLDivElement;
const combatHud = document.getElementById("combatHud") as HTMLDivElement;
const projectPanel = document.getElementById("projectPanel") as HTMLDivElement;
const projectPanelBody = projectPanel.querySelector(".panel-body") as HTMLDivElement;
const closePanelBtn = document.getElementById("closePanel") as HTMLButtonElement;
const overviewTrigger = document.getElementById("overviewTrigger") as HTMLButtonElement;
const projectsOverview = document.getElementById("projectsOverview") as HTMLDivElement;
const closeOverviewBtn = document.getElementById("closeOverview") as HTMLButtonElement;
const overviewList = document.getElementById("overviewList") as HTMLDivElement;
const crosshair = document.getElementById("crosshair") as HTMLDivElement;
const statusPill = document.getElementById("statusPill") as HTMLDivElement;
const combatScore = document.getElementById("combatScore") as HTMLSpanElement;
const combatStatus = document.getElementById("combatStatus") as HTMLParagraphElement;
const combatPopup = document.getElementById("combatPopup") as HTMLDivElement;

const projectKicker = document.getElementById("projectKicker") as HTMLParagraphElement;
const projectTitle = document.getElementById("projectTitle") as HTMLHeadingElement;
const projectSubtitle = document.getElementById("projectSubtitle") as HTMLParagraphElement;
const projectDescription = document.getElementById("projectDescription") as HTMLParagraphElement;
const projectEngine = document.getElementById("projectEngine") as HTMLSpanElement;
const projectFocus = document.getElementById("projectFocus") as HTMLSpanElement;
const projectContext = document.getElementById("projectContext") as HTMLSpanElement;
const projectRole = document.getElementById("projectRole") as HTMLSpanElement;
const projectYear = document.getElementById("projectYear") as HTMLSpanElement;
const projectStack = document.getElementById("projectStack") as HTMLSpanElement;
const projectAtmosphere = document.getElementById("projectAtmosphere") as HTMLQuoteElement;
const projectVideoTitle = document.getElementById("projectVideoTitle") as HTMLDivElement;
const projectVideoNote = document.getElementById("projectVideoNote") as HTMLSpanElement;

const standMap = new Map<string, CreatedStand>();
const cardMap = new Map<string, HTMLButtonElement>();
const rockMaterialCache = new Map<string, BABYLON.PBRMaterial>();

let activeProjectId: string | null = null;
let hoveredProjectId: string | null = null;
let hoveredInteractionMode: ProjectInteractionMode = "focus";
let focusProject: (projectId: string, shouldOpenPanel: boolean) => void = () => undefined;
let playerCamera: BABYLON.UniversalCamera | null = null;
let isPointerLocked = false;
let isInSlimeCombatZone = false;
let combatPopupHideAt = 0;

function rgbString(color: BABYLON.Color3) {
  return `rgb(${Math.round(color.r * 255)}, ${Math.round(color.g * 255)}, ${Math.round(color.b * 255)})`;
}

function updateStatus(message: string) {
  statusPill.textContent = message;
}

function isOverviewOpen() {
  return !projectsOverview.classList.contains("hidden");
}

function syncCrosshairVisibility() {
  const panelOpen = !projectPanel.classList.contains("hidden");
  crosshair.classList.toggle("hidden", panelOpen || isOverviewOpen() || !isPointerLocked);
}

function getFreeRoamStatusMessage() {
  if (isPointerLocked && isInSlimeCombatZone) {
    return "Zone Survivor Slime - clic gauche pour tirer, Shift pour sprinter, Space pour sauter";
  }

  return isPointerLocked
    ? "Visite libre active - Shift pour sprinter, Space pour sauter"
    : "Clique dans la scene pour entrer en mode visite.";
}

function showCombatPopup(message: string) {
  combatPopup.textContent = message;
  combatPopup.classList.remove("visible");
  void combatPopup.offsetWidth;
  combatPopup.classList.add("visible");
  combatPopupHideAt = performance.now() + 800;
}

function renderActiveCard() {
  cardMap.forEach((button, projectId) => {
    button.classList.toggle("active", projectId === activeProjectId);
  });
}

function formatOverviewText(value: string) {
  return value.replaceAll("\n", "<br>");
}

function renderProjectsOverview() {
  overviewList.innerHTML = projects
    .map(
      (project) => `
        <article class="overview-card">
          <p class="eyebrow">${project.accent}</p>
          <h3>${project.title}</h3>
          <p class="overview-card-subtitle">${project.subtitle}</p>
          <p class="overview-card-description">${formatOverviewText(project.description)}</p>

          <div class="overview-card-meta">
            <p><strong>Moteur</strong><span>${project.engine}</span></p>
            <p><strong>Focus</strong><span>${project.focus}</span></p>
            <p><strong>Contexte</strong><span>${project.context}</span></p>
            <p><strong>Role</strong><span>${project.role}</span></p>
            <p><strong>Periode</strong><span>${project.year}</span></p>
            <p><strong>Stack</strong><span>${project.stack}</span></p>
          </div>

          <blockquote class="overview-card-quote">${formatOverviewText(project.atmosphere)}</blockquote>
        </article>
      `
    )
    .join("");
}

function getRoomBasis(project: ProjectData) {
  const inward = BABYLON.Vector3.Zero().subtract(project.position).normalize();
  const right = new BABYLON.Vector3(inward.z, 0, -inward.x);
  const back = inward.scale(-1);
  const yaw = Math.atan2(inward.x, inward.z);
  return { inward, right, back, yaw };
}

function openProjectPanel(project: ProjectData) {
  if (document.pointerLockElement === canvas) {
    document.exitPointerLock();
  }

  projectKicker.textContent = project.accent;
  projectTitle.textContent = project.title;
  projectSubtitle.textContent = project.subtitle;
  projectDescription.textContent = project.description;
  projectEngine.textContent = project.engine;
  projectFocus.textContent = project.focus;
  projectContext.textContent = project.context;
  projectRole.textContent = project.role;
  projectYear.textContent = project.year;
  projectStack.textContent = project.stack;
  projectAtmosphere.textContent = project.atmosphere;
  projectVideoTitle.textContent = project.id === "survivorSlime" ? "Trailer Survivor Slime" : `Presentation ${project.title}`;
  projectVideoNote.textContent = project.id === "survivorSlime"
    ? "Zone prevue pour integrer une video de gameplay ou une bande-annonce du prototype."
    : "Zone prevue pour integrer une video de presentation du projet.";

  heroPanel.classList.add("hidden");
  projectPanel.classList.remove("hidden");
  closePanelBtn.classList.remove("hidden");
  projectPanel.scrollTop = 0;
  projectPanelBody.scrollTop = 0;
  syncCrosshairVisibility();
  updateStatus(`Focus: ${project.title}`);
}

function closeProjectPanel() {
  projectPanel.classList.add("hidden");
  heroPanel.classList.remove("hidden");
  closePanelBtn.classList.add("hidden");
  activeProjectId = null;
  renderActiveCard();
  syncCrosshairVisibility();
  updateStatus(getFreeRoamStatusMessage());
}

function openProjectsOverview() {
  if (document.pointerLockElement === canvas) {
    document.exitPointerLock();
  }

  projectPanel.classList.add("hidden");
  closePanelBtn.classList.add("hidden");
  heroPanel.classList.add("hidden");
  projectsOverview.classList.remove("hidden");
  syncCrosshairVisibility();
  updateStatus("Vue rapide du portfolio ouverte.");
}

function closeProjectsOverview() {
  projectsOverview.classList.add("hidden");
  heroPanel.classList.remove("hidden");
  syncCrosshairVisibility();
  updateStatus(getFreeRoamStatusMessage());
}

renderProjectsOverview();
syncCrosshairVisibility();

function openProjectInfo(projectId: string) {
  const project = projects.find((entry) => entry.id === projectId);
  if (!project) {
    return;
  }

  activeProjectId = projectId;
  renderActiveCard();
  openProjectPanel(project);
}

closePanelBtn.addEventListener("click", closeProjectPanel);
overviewTrigger.addEventListener("click", openProjectsOverview);
closeOverviewBtn.addEventListener("click", closeProjectsOverview);
window.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    if (isOverviewOpen()) {
      closeProjectsOverview();
      return;
    }
    closeProjectPanel();
  }
});

function createProjectCards() {
  projectRail.innerHTML = "";

  projects.forEach((project, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "project-card";
    button.dataset.projectId = project.id;
    button.innerHTML = `
      <strong>${project.title}</strong>
      <span>${project.subtitle}</span>
      <em>${String(index + 1).padStart(2, "0")} / ${project.engine}</em>
    `;

    button.addEventListener("mouseenter", () => {
      hoveredProjectId = project.id;
      updateStatus(`Survol UI: ${project.title}`);
    });

    button.addEventListener("mouseleave", () => {
      hoveredProjectId = null;
      updateStatus(
        activeProjectId
          ? `Focus: ${project.title}`
          : getFreeRoamStatusMessage()
      );
    });

    button.addEventListener("click", () => {
      focusProject(project.id, true);
    });

    cardMap.set(project.id, button);
    projectRail.appendChild(button);
  });
}

function createMaterial(
  scene: BABYLON.Scene,
  name: string,
  diffuse: BABYLON.Color3,
  emissive?: BABYLON.Color3,
  alpha = 1
) {
  const material = new BABYLON.StandardMaterial(name, scene);
  material.diffuseColor = diffuse;
  material.specularColor = new BABYLON.Color3(0.05, 0.05, 0.08);
  material.emissiveColor = emissive ?? BABYLON.Color3.Black();
  material.alpha = alpha;
  return material;
}

function enableCollisions(...meshes: BABYLON.AbstractMesh[]) {
  meshes.forEach((mesh) => {
    mesh.checkCollisions = true;
  });
}

function createPathLight(
  scene: BABYLON.Scene,
  name: string,
  width: number,
  depth: number,
  position: BABYLON.Vector3,
  color: BABYLON.Color3
) {
  const path = BABYLON.MeshBuilder.CreateBox(
    name,
    { width, height: 0.04, depth },
    scene
  );
  path.position = position;
  path.isPickable = false;
  path.material = createMaterial(
    scene,
    `${name}_mat`,
    color.scale(0.12),
    color.scale(0.42),
    0.95
  );
}

function createColumn(scene: BABYLON.Scene, x: number, z: number, height = 6) {
  const column = BABYLON.MeshBuilder.CreateCylinder(
    `column_${x}_${z}`,
    { diameter: 1.1, height, tessellation: 24 },
    scene
  );

  column.position = new BABYLON.Vector3(x, height / 2, z);
  column.checkCollisions = true;
  column.material = createMaterial(
    scene,
    `columnMat_${x}_${z}`,
    new BABYLON.Color3(0.08, 0.1, 0.16),
    new BABYLON.Color3(0.01, 0.015, 0.03)
  );
}

function createDecorColumn(
  scene: BABYLON.Scene,
  name: string,
  position: BABYLON.Vector3,
  color: BABYLON.Color3,
  height = 2.8,
  diameter = 0.5
) {
  const mesh = BABYLON.MeshBuilder.CreateCylinder(
    name,
    { diameter, height, tessellation: 16 },
    scene
  );
  mesh.position = position.add(new BABYLON.Vector3(0, height / 2, 0));
  mesh.isPickable = false;
  mesh.material = createMaterial(
    scene,
    `${name}_mat`,
    color.scale(0.16),
    color.scale(0.55)
  );
}


function createDecorScreen(
  scene: BABYLON.Scene,
  name: string,
  position: BABYLON.Vector3,
  rotationY: number,
  color: BABYLON.Color3,
  width = 1.4,
  height = 0.8
) {
  const screen = BABYLON.MeshBuilder.CreatePlane(name, { width, height }, scene);
  screen.position = position;
  screen.rotation.y = rotationY;
  screen.isPickable = false;
  screen.material = createMaterial(
    scene,
    `${name}_mat`,
    color.scale(0.22),
    color.scale(0.85),
    0.92
  );
}

function createProjectTrailerBillboard(
  scene: BABYLON.Scene,
  project: ProjectData,
  position: BABYLON.Vector3,
  rotationY: number
) {
  const root = new BABYLON.TransformNode(`${project.id}_trailerBillboardRoot`, scene);
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

  context.clearRect(0, 0, 1536, 896);
  const gradient = context.createLinearGradient(0, 0, 0, 896);
  gradient.addColorStop(0, "rgba(8, 14, 24, 0.98)");
  gradient.addColorStop(1, "rgba(3, 8, 14, 0.98)");
  context.fillStyle = gradient;
  context.fillRect(0, 0, 1536, 896);

  context.fillStyle = "rgba(98, 255, 196, 0.08)";
  context.fillRect(96, 88, 1344, 720);

  for (let line = 0; line < 24; line += 1) {
    context.fillStyle = `rgba(255, 255, 255, ${0.012 + (line % 3) * 0.006})`;
    context.fillRect(96, 88 + line * 30, 1344, 1);
  }

  context.strokeStyle = "rgba(69, 255, 191, 0.55)";
  context.lineWidth = 4;
  context.strokeRect(96, 88, 1344, 720);

  context.fillStyle = "rgba(127, 231, 203, 0.96)";
  context.font = "600 38px Segoe UI";
  context.fillText("TRAILER / GAMEPLAY CAPTURE", 142, 162);

  context.fillStyle = "rgba(242, 247, 255, 0.98)";
  context.font = "700 102px Segoe UI";
  context.fillText(project.title, 136, 336);

  context.fillStyle = "rgba(185, 208, 255, 0.82)";
  context.font = "400 42px Segoe UI";
  context.fillText("FPS roguelike | Merge system | Horde combat", 142, 402);

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
  context.fillText("WATCH THE PROTOTYPE", 538, 676);

  context.fillStyle = "rgba(214, 226, 255, 0.72)";
  context.font = "400 28px Segoe UI";
  context.fillText("Placeholder en attendant l'integration de la vraie video trailer.", 432, 726);
  screenTexture.update();

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

function getOrCreateRockMaterial(
  scene: BABYLON.Scene,
  color: BABYLON.Color3
) {
  const materialKey = `rock_${Math.round(color.r * 255)}_${Math.round(color.g * 255)}_${Math.round(color.b * 255)}`;
  let rockMaterial = rockMaterialCache.get(materialKey);
  if (!rockMaterial) {
    rockMaterial = createRockPbrMaterial(scene, materialKey, color);
    rockMaterialCache.set(materialKey, rockMaterial);
  }

  return rockMaterial;
}

function fract(value: number) {
  return value - Math.floor(value);
}

function saturate(value: number) {
  return BABYLON.Scalar.Clamp(value, 0, 1);
}

function hashNoise2D(x: number, y: number, seed: number) {
  return fract(Math.sin(x * 127.1 + y * 311.7 + seed * 74.7) * 43758.5453123);
}

function valueNoise2D(x: number, y: number, seed: number) {
  const x0 = Math.floor(x);
  const y0 = Math.floor(y);
  const tx = x - x0;
  const ty = y - y0;
  const sx = tx * tx * (3 - 2 * tx);
  const sy = ty * ty * (3 - 2 * ty);

  const n00 = hashNoise2D(x0, y0, seed);
  const n10 = hashNoise2D(x0 + 1, y0, seed);
  const n01 = hashNoise2D(x0, y0 + 1, seed);
  const n11 = hashNoise2D(x0 + 1, y0 + 1, seed);

  return BABYLON.Scalar.Lerp(
    BABYLON.Scalar.Lerp(n00, n10, sx),
    BABYLON.Scalar.Lerp(n01, n11, sx),
    sy
  );
}

function fbm2D(x: number, y: number, octaves: number, seed: number) {
  let amplitude = 0.5;
  let frequency = 1;
  let sum = 0;
  let normalizer = 0;

  for (let octave = 0; octave < octaves; octave += 1) {
    sum += valueNoise2D(x * frequency, y * frequency, seed + octave * 11) * amplitude;
    normalizer += amplitude;
    amplitude *= 0.5;
    frequency *= 2;
  }

  return normalizer > 0 ? sum / normalizer : 0;
}

function sampleRockNoise(position: BABYLON.Vector3, seed: number) {
  const xy = fbm2D(position.x * 1.24, position.y * 1.24, 4, seed + 7);
  const yz = fbm2D(position.y * 1.42, position.z * 1.42, 4, seed + 19);
  const xz = fbm2D(position.x * 1.58, position.z * 1.58, 5, seed + 31);
  return xy * 0.28 + yz * 0.24 + xz * 0.48;
}

function toTextureByte(value: number) {
  return Math.round(saturate(value) * 255);
}

function configureProceduralTexture(texture: BABYLON.DynamicTexture) {
  texture.wrapU = BABYLON.Texture.WRAP_ADDRESSMODE;
  texture.wrapV = BABYLON.Texture.WRAP_ADDRESSMODE;
  texture.anisotropicFilteringLevel = 8;
}

function createProceduralRockTextures(
  scene: BABYLON.Scene,
  name: string,
  accentColor: BABYLON.Color3,
  size = 512
): RockTextureSet {
  const albedoTexture = new BABYLON.DynamicTexture(
    `${name}_albedo`,
    { width: size, height: size },
    scene,
    false
  );
  const normalTexture = new BABYLON.DynamicTexture(
    `${name}_normal`,
    { width: size, height: size },
    scene,
    false
  );
  const roughnessTexture = new BABYLON.DynamicTexture(
    `${name}_roughness`,
    { width: size, height: size },
    scene,
    false
  );

  [albedoTexture, normalTexture, roughnessTexture].forEach(configureProceduralTexture);

  const heights = new Float32Array(size * size);

  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const u = x / size - 0.5;
      const v = y / size - 0.5;
      const broad = fbm2D(u * 4.4, v * 4.4, 4, 13);
      const medium = fbm2D(u * 10.2 + 6.7, v * 10.2 - 4.1, 4, 29);
      const fine = fbm2D(u * 24.8 - 3.2, v * 24.8 + 1.5, 5, 47);
      const strata = 1 - Math.abs(Math.sin((u * 18 + v * 7.2) + broad * 3.4));
      const chips = Math.pow(fbm2D(u * 34.5 + 9.2, v * 34.5 - 8.6, 3, 71), 2.6);
      const fractureNoise = fbm2D(u * 21.4 - v * 11.2, v * 21.4 + u * 8.6, 4, 89);
      const fractures = Math.pow(
        saturate(1 - Math.abs(fractureNoise - 0.52) * 10),
        2.8
      );

      heights[y * size + x] = saturate(
        broad * 0.34 +
        medium * 0.24 +
        fine * 0.12 +
        strata * 0.14 +
        chips * 0.16 -
        fractures * 0.09
      );
    }
  }

  const albedoContext = albedoTexture.getContext() as CanvasRenderingContext2D;
  const normalContext = normalTexture.getContext() as CanvasRenderingContext2D;
  const roughnessContext = roughnessTexture.getContext() as CanvasRenderingContext2D;
  const albedoImage = albedoContext.createImageData(size, size);
  const normalImage = normalContext.createImageData(size, size);
  const roughnessImage = roughnessContext.createImageData(size, size);

  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const index = y * size + x;
      const u = x / size - 0.5;
      const v = y / size - 0.5;
      const left = heights[y * size + ((x - 1 + size) % size)];
      const right = heights[y * size + ((x + 1) % size)];
      const up = heights[((y - 1 + size) % size) * size + x];
      const down = heights[((y + 1) % size) * size + x];
      const height = heights[index];

      const dx = (right - left) * 3.2;
      const dy = (down - up) * 3.2;
      const normal = new BABYLON.Vector3(-dx, -dy, 1).normalize();

      const cavity = Math.pow(1 - height, 1.55);
      const ridge = Math.pow(height, 1.35);
      const macroTint = fbm2D(u * 2.6 - 3.4, v * 2.6 + 4.2, 3, 97);
      const warmNoise = fbm2D(u * 6.5 + 8.4, v * 6.5 - 5.8, 4, 101);
      const coolNoise = fbm2D(u * 8.1 - 2.7, v * 8.1 + 7.1, 4, 131);
      const grit = Math.pow(fbm2D(u * 58.2 + 1.5, v * 58.2 - 4.6, 2, 151), 6);
      const fractureNoise = fbm2D(u * 21.4 - v * 11.2, v * 21.4 + u * 8.6, 4, 89);
      const fractureMask = Math.pow(
        saturate(1 - Math.abs(fractureNoise - 0.52) * 11),
        3.2
      );
      const veinNoise = fbm2D(u * 15.8 + v * 4.2 + 2.3, v * 15.8 - u * 3.6 - 6.8, 4, 173);
      const veinMask = Math.pow(
        saturate(1 - Math.abs(veinNoise - 0.48) * 13),
        2.7
      ) * (0.45 + ridge * 0.55);
      const dustMask = saturate((height - 0.54) * 2.2) * (0.55 + macroTint * 0.45);
      const lichenMask = Math.pow(
        saturate(1 - Math.abs(height - 0.5) * 5.2),
        1.7
      ) * Math.pow(fbm2D(u * 12.5 - 6.1, v * 12.5 + 3.4, 3, 211), 2.4) * 0.35;

      const baseRock = new BABYLON.Color3(
        0.14 + macroTint * 0.04,
        0.145 + macroTint * 0.035,
        0.155 + macroTint * 0.03
      );
      const coolLayer = new BABYLON.Color3(0.06, 0.08, 0.11).scale(coolNoise * 0.6 + cavity * 0.4);
      const warmLayer = new BABYLON.Color3(0.16, 0.12, 0.08).scale(warmNoise * 0.22 + ridge * 0.14);
      const dustLayer = new BABYLON.Color3(0.2, 0.185, 0.16).scale(dustMask * 0.9);
      const veinLayer = new BABYLON.Color3(0.32, 0.28, 0.24).scale(veinMask * 0.42);
      const lichenLayer = accentColor.scale(lichenMask * 0.12);

      const finalColor = baseRock
        .subtract(new BABYLON.Color3(cavity * 0.08, cavity * 0.07, cavity * 0.06))
        .add(coolLayer)
        .add(warmLayer)
        .add(dustLayer)
        .add(veinLayer)
        .add(lichenLayer)
        .add(new BABYLON.Color3(grit * 0.12, grit * 0.12, grit * 0.12))
        .subtract(new BABYLON.Color3(fractureMask * 0.13, fractureMask * 0.12, fractureMask * 0.11));

      const rockR = saturate(finalColor.r);
      const rockG = saturate(finalColor.g);
      const rockB = saturate(finalColor.b);

      const roughness = saturate(
        0.58 +
        cavity * 0.18 +
        fractureMask * 0.16 +
        grit * 0.1 +
        (1 - ridge) * 0.08 -
        dustMask * 0.08 -
        veinMask * 0.05
      );
      const baseIndex = index * 4;

      albedoImage.data[baseIndex] = toTextureByte(rockR);
      albedoImage.data[baseIndex + 1] = toTextureByte(rockG);
      albedoImage.data[baseIndex + 2] = toTextureByte(rockB);
      albedoImage.data[baseIndex + 3] = 255;

      normalImage.data[baseIndex] = toTextureByte(normal.x * 0.5 + 0.5);
      normalImage.data[baseIndex + 1] = toTextureByte(normal.y * 0.5 + 0.5);
      normalImage.data[baseIndex + 2] = toTextureByte(normal.z * 0.5 + 0.5);
      normalImage.data[baseIndex + 3] = 255;

      roughnessImage.data[baseIndex] = toTextureByte(roughness);
      roughnessImage.data[baseIndex + 1] = toTextureByte(roughness);
      roughnessImage.data[baseIndex + 2] = toTextureByte(roughness);
      roughnessImage.data[baseIndex + 3] = 255;
    }
  }

  albedoContext.putImageData(albedoImage, 0, 0);
  normalContext.putImageData(normalImage, 0, 0);
  roughnessContext.putImageData(roughnessImage, 0, 0);

  albedoTexture.update();
  normalTexture.update();
  roughnessTexture.update();

  return {
    albedoTexture,
    normalTexture,
    roughnessTexture,
  };
}

function createRockPbrMaterial(
  scene: BABYLON.Scene,
  name: string,
  accentColor: BABYLON.Color3
) {
  const textures = createProceduralRockTextures(scene, name, accentColor);
  const material = new BABYLON.PBRMaterial(`${name}_pbrMat`, scene);
  material.albedoColor = new BABYLON.Color3(0.92, 0.92, 0.92);
  material.albedoTexture = textures.albedoTexture;
  material.bumpTexture = textures.normalTexture;
  material.bumpTexture.level = 1.65;
  material.microSurfaceTexture = textures.roughnessTexture;
  material.metallic = 0.03;
  material.roughness = 0.86;
  material.environmentIntensity = 0.55;
  material.directIntensity = 1.1;
  material.specularIntensity = 0.9;
  material.useAmbientOcclusionFromMetallicTextureRed = false;
  material.forceIrradianceInFragment = true;
  return material;
}

function sculptRockMesh(mesh: BABYLON.Mesh, seed: number) {
  const positions = mesh.getVerticesData(BABYLON.VertexBuffer.PositionKind);
  const normals = mesh.getVerticesData(BABYLON.VertexBuffer.NormalKind);
  const indices = mesh.getIndices();
  if (!positions || !normals || !indices) {
    return;
  }

  for (let index = 0; index < positions.length; index += 3) {
    const local = new BABYLON.Vector3(
      positions[index],
      positions[index + 1],
      positions[index + 2]
    );
    const direction = local.normalize();
    const primaryNoise = sampleRockNoise(local.scale(0.95), seed);
    const secondaryNoise = sampleRockNoise(local.scale(1.7).add(new BABYLON.Vector3(1.1, -0.4, 0.8)), seed + 17);
    const strata = 1 - Math.abs(
      Math.sin(direction.y * 15 + direction.x * 5.5 - direction.z * 3.4)
    );
    const facetDominance = Math.max(
      Math.abs(direction.x) * 1.08,
      Math.abs(direction.y) * 1.22,
      Math.abs(direction.z)
    );
    const edgeMask = Math.pow(facetDominance, 1.75);
    const terrace = Math.floor((primaryNoise * 0.75 + secondaryNoise * 0.25) * 7) / 7;
    const shardMask = Math.pow(
      saturate(1 - Math.abs(direction.y + 0.08) * 1.45),
      1.35
    ) * (0.45 + edgeMask * 0.8);

    const radialScale =
      0.94 +
      edgeMask * 0.24 +
      (terrace - 0.5) * 0.52 +
      (secondaryNoise - 0.5) * 0.22 +
      strata * 0.06;

    const flattened = direction.y < -0.18 ? (-0.18 - direction.y) * 0.95 : 0;
    local.scaleInPlace(radialScale);
    local.x *= 1.16;
    local.y *= 0.8;
    local.z *= 0.92;
    local.x += Math.sign(direction.x || 1) * shardMask * 0.08;
    local.z += Math.sign(direction.z || 1) * shardMask * 0.05;
    if (direction.y > 0.2) {
      local.y += edgeMask * 0.12;
    }
    local.y -= flattened;

    positions[index] = local.x;
    positions[index + 1] = local.y;
    positions[index + 2] = local.z;
  }

  mesh.updateVerticesData(BABYLON.VertexBuffer.PositionKind, positions);
  BABYLON.VertexData.ComputeNormals(positions, indices, normals);
  mesh.updateVerticesData(BABYLON.VertexBuffer.NormalKind, normals);
  mesh.refreshBoundingInfo();
}

function createDetailedRockMesh(
  scene: BABYLON.Scene,
  name: string,
  material: BABYLON.PBRMaterial,
  seed: number,
  radius: number
) {
  const rock = BABYLON.MeshBuilder.CreateIcoSphere(
    name,
    { radius, subdivisions: radius > 1.2 ? 3 : 2 },
    scene
  );
  sculptRockMesh(rock, seed);
  rock.convertToFlatShadedMesh();
  rock.material = material;
  rock.isPickable = false;
  rock.checkCollisions = true;
  return rock;
}

function createOutpostModule(
  scene: BABYLON.Scene,
  name: string,
  position: BABYLON.Vector3,
  yaw: number,
  width: number,
  depth: number,
  height: number
) {
  const root = new BABYLON.TransformNode(`${name}_root`, scene);
  root.position = position.clone();
  root.rotation.y = yaw;
  const collidableMeshes: BABYLON.AbstractMesh[] = [];

  const shellMaterial = createMaterial(
    scene,
    `${name}_shellMat`,
    new BABYLON.Color3(0.68, 0.72, 0.76),
    new BABYLON.Color3(0.012, 0.015, 0.018)
  );
  shellMaterial.specularColor = new BABYLON.Color3(0.22, 0.25, 0.29);
  shellMaterial.specularPower = 96;

  const trimMaterial = createMaterial(
    scene,
    `${name}_trimMat`,
    new BABYLON.Color3(0.18, 0.22, 0.27),
    new BABYLON.Color3(0.01, 0.012, 0.015)
  );
  trimMaterial.specularColor = new BABYLON.Color3(0.16, 0.19, 0.22);
  trimMaterial.specularPower = 84;

  const panelMaterial = createMaterial(
    scene,
    `${name}_panelMat`,
    new BABYLON.Color3(0.09, 0.11, 0.16),
    new BABYLON.Color3(0.02, 0.025, 0.03)
  );

  const windowMaterial = createMaterial(
    scene,
    `${name}_windowMat`,
    new BABYLON.Color3(0.08, 0.14, 0.18),
    new BABYLON.Color3(0.24, 0.32, 0.34),
    0.88
  );
  windowMaterial.specularColor = new BABYLON.Color3(0.46, 0.54, 0.58);
  windowMaterial.specularPower = 148;

  const body = BABYLON.MeshBuilder.CreateBox(
    `${name}_body`,
    { width, depth, height },
    scene
  );
  body.parent = root;
  body.position = new BABYLON.Vector3(0, height * 0.39, 0);
  body.isPickable = false;
  body.material = shellMaterial;
  collidableMeshes.push(body);

  const roof = BABYLON.MeshBuilder.CreateCylinder(
    `${name}_roof`,
    { diameter: depth + 0.2, height: width + 0.14, tessellation: 24 },
    scene
  );
  roof.parent = root;
  roof.position = new BABYLON.Vector3(0, height * 0.82, 0);
  roof.rotation.z = Math.PI / 2;
  roof.scaling = new BABYLON.Vector3(1, 0.42, 1);
  roof.isPickable = false;
  roof.material = shellMaterial;
  collidableMeshes.push(roof);

  const foundation = BABYLON.MeshBuilder.CreateBox(
    `${name}_foundation`,
    { width: width + 0.8, depth: depth + 0.7, height: 0.16 },
    scene
  );
  foundation.parent = root;
  foundation.position = new BABYLON.Vector3(0, 0.08, 0);
  foundation.isPickable = false;
  foundation.material = createMaterial(
    scene,
    `${name}_foundationMat`,
    new BABYLON.Color3(0.21, 0.24, 0.28),
    new BABYLON.Color3(0.008, 0.01, 0.014)
  );
  collidableMeshes.push(foundation);

  for (const footOffset of [
    new BABYLON.Vector3(-width * 0.34, 0.12, -depth * 0.28),
    new BABYLON.Vector3(width * 0.34, 0.12, -depth * 0.28),
    new BABYLON.Vector3(-width * 0.34, 0.12, depth * 0.28),
    new BABYLON.Vector3(width * 0.34, 0.12, depth * 0.28),
  ]) {
    const foot = BABYLON.MeshBuilder.CreateCylinder(
      `${name}_foot_${footOffset.x}_${footOffset.z}`,
      { diameter: 0.28, height: 0.24, tessellation: 14 },
      scene
    );
    foot.parent = root;
    foot.position = footOffset;
    foot.isPickable = false;
    foot.material = trimMaterial;
    collidableMeshes.push(foot);
  }

  const airlock = BABYLON.MeshBuilder.CreateCylinder(
    `${name}_airlock`,
    { diameter: height * 0.86, height: 0.82, tessellation: 24 },
    scene
  );
  airlock.parent = root;
  airlock.position = new BABYLON.Vector3(0, height * 0.34, -depth * 0.5 - 0.24);
  airlock.rotation.x = Math.PI / 2;
  airlock.isPickable = false;
  airlock.material = trimMaterial;
  collidableMeshes.push(airlock);

  const airlockCap = BABYLON.MeshBuilder.CreateCylinder(
    `${name}_airlockCap`,
    { diameter: height * 0.64, height: 0.12, tessellation: 24 },
    scene
  );
  airlockCap.parent = root;
  airlockCap.position = new BABYLON.Vector3(0, height * 0.34, -depth * 0.5 - 0.68);
  airlockCap.rotation.x = Math.PI / 2;
  airlockCap.isPickable = false;
  airlockCap.material = shellMaterial;
  collidableMeshes.push(airlockCap);

  const doorway = BABYLON.MeshBuilder.CreateBox(
    `${name}_doorway`,
    { width: width * 0.18, depth: 0.06, height: height * 0.42 },
    scene
  );
  doorway.parent = root;
  doorway.position = new BABYLON.Vector3(0, height * 0.34, -depth * 0.5 - 0.72);
  doorway.isPickable = false;
  doorway.material = panelMaterial;
  collidableMeshes.push(doorway);

  const ramp = BABYLON.MeshBuilder.CreateBox(
    `${name}_ramp`,
    { width: width * 0.2, depth: 0.88, height: 0.06 },
    scene
  );
  ramp.parent = root;
  ramp.position = new BABYLON.Vector3(0, 0.12, -depth * 0.5 - 0.96);
  ramp.rotation.x = -0.18;
  ramp.isPickable = false;
  ramp.material = trimMaterial;
  collidableMeshes.push(ramp);

  for (const side of [-1, 1]) {
    const sidePanel = BABYLON.MeshBuilder.CreateBox(
      `${name}_sidePanel_${side}`,
      { width: 0.12, depth: depth * 0.86, height: height * 0.64 },
      scene
    );
    sidePanel.parent = root;
    sidePanel.position = new BABYLON.Vector3((width * 0.5 - 0.09) * side, height * 0.4, 0);
    sidePanel.isPickable = false;
    sidePanel.material = trimMaterial;
    collidableMeshes.push(sidePanel);

    const canister = BABYLON.MeshBuilder.CreateCylinder(
      `${name}_canister_${side}`,
      { diameter: 0.3, height: height * 0.72, tessellation: 18 },
      scene
    );
    canister.parent = root;
    canister.position = new BABYLON.Vector3((width * 0.5 + 0.24) * side, height * 0.36, depth * 0.12);
    canister.isPickable = false;
    canister.material = createMaterial(
      scene,
      `${name}_canisterMat_${side}`,
      new BABYLON.Color3(0.74, 0.77, 0.8),
      new BABYLON.Color3(0.01, 0.012, 0.015)
    );
    collidableMeshes.push(canister);

    const pipe = BABYLON.MeshBuilder.CreateCylinder(
      `${name}_pipe_${side}`,
      { diameter: 0.08, height: depth * 0.58, tessellation: 10 },
      scene
    );
    pipe.parent = root;
    pipe.position = new BABYLON.Vector3((width * 0.3) * side, height * 0.66, 0.04);
    pipe.rotation.z = Math.PI / 2;
    pipe.isPickable = false;
    pipe.material = trimMaterial;
  }

  for (const windowOffset of [-width * 0.22, 0, width * 0.22]) {
    const window = BABYLON.MeshBuilder.CreateBox(
      `${name}_window_${windowOffset}`,
      { width: 0.34, height: 0.14, depth: 0.04 },
      scene
    );
    window.parent = root;
    window.position = new BABYLON.Vector3(windowOffset, height * 0.58, depth * 0.5 + 0.04);
    window.isPickable = false;
    window.material = windowMaterial;
  }

  const roofPanel = BABYLON.MeshBuilder.CreateBox(
    `${name}_roofPanel`,
    { width: width * 0.28, height: 0.1, depth: depth * 0.68 },
    scene
  );
  roofPanel.parent = root;
  roofPanel.position = new BABYLON.Vector3(0, height + 0.04, 0);
  roofPanel.isPickable = false;
  roofPanel.material = panelMaterial;

  const vent = BABYLON.MeshBuilder.CreateBox(
    `${name}_vent`,
    { width: width * 0.16, depth: 0.18, height: 0.12 },
    scene
  );
  vent.parent = root;
  vent.position = new BABYLON.Vector3(-width * 0.24, height + 0.18, depth * 0.06);
  vent.isPickable = false;
  vent.material = trimMaterial;

  const topAntenna = BABYLON.MeshBuilder.CreateCylinder(
    `${name}_antenna`,
    { diameter: 0.06, height: 0.9, tessellation: 8 },
    scene
  );
  topAntenna.parent = root;
  topAntenna.position = new BABYLON.Vector3(width * 0.24, height + 0.42, 0);
  topAntenna.isPickable = false;
  topAntenna.material = trimMaterial;

  const dish = BABYLON.MeshBuilder.CreateDisc(
    `${name}_dish`,
    { radius: 0.24, tessellation: 32 },
    scene
  );
  dish.parent = root;
  dish.position = new BABYLON.Vector3(width * 0.34, height + 0.78, 0.06);
  dish.rotation.y = Math.PI / 2;
  dish.rotation.z = -0.42;
  dish.isPickable = false;
  dish.material = shellMaterial;
  enableCollisions(...collidableMeshes);
}

function createVideoTerminal(
  scene: BABYLON.Scene,
  name: string,
  position: BABYLON.Vector3,
  yaw: number,
  color: BABYLON.Color3
) {
  const root = new BABYLON.TransformNode(`${name}_root`, scene);
  root.position = position.clone();
  root.rotation.y = yaw;
  const collidableMeshes: BABYLON.AbstractMesh[] = [];

  const frameMat = createMaterial(
    scene,
    `${name}_frameMat`,
    new BABYLON.Color3(0.72, 0.76, 0.8),
    new BABYLON.Color3(0.008, 0.01, 0.014)
  );
  frameMat.specularColor = new BABYLON.Color3(0.22, 0.25, 0.3);
  frameMat.specularPower = 88;

  const trimMat = createMaterial(
    scene,
    `${name}_trimMat`,
    new BABYLON.Color3(0.2, 0.24, 0.29),
    new BABYLON.Color3(0.01, 0.012, 0.015)
  );
  const screenMat = createMaterial(
    scene,
    `${name}_screenMat`,
    new BABYLON.Color3(0.05, 0.07, 0.11),
    color.scale(0.08)
  );
  screenMat.specularColor = new BABYLON.Color3(0.32, 0.38, 0.46);
  screenMat.specularPower = 142;

  const base = BABYLON.MeshBuilder.CreateBox(
    `${name}_base`,
    { width: 2.2, height: 0.14, depth: 1.3 },
    scene
  );
  base.parent = root;
  base.position = new BABYLON.Vector3(0, 0.07, 0);
  base.isPickable = false;
  base.material = trimMat;
  collidableMeshes.push(base);

  for (const support of [-1, 1]) {
    const leg = BABYLON.MeshBuilder.CreateBox(
      `${name}_leg_${support}`,
      { width: 0.12, height: 1.38, depth: 0.12 },
      scene
    );
    leg.parent = root;
    leg.position = new BABYLON.Vector3(0.64 * support, 0.74, 0.14);
    leg.rotation.z = -0.24 * support;
    leg.isPickable = false;
    leg.material = frameMat;
    collidableMeshes.push(leg);
  }

  const screen = BABYLON.MeshBuilder.CreateBox(
    `${name}_screen`,
    { width: 2.2, height: 1.24, depth: 0.08 },
    scene
  );
  screen.parent = root;
  screen.position = new BABYLON.Vector3(0, 1.46, -0.08);
  screen.rotation.x = -0.66;
  screen.isPickable = false;
  screen.material = screenMat;
  collidableMeshes.push(screen);

  for (const ribOffset of [-0.68, 0, 0.68]) {
    const rib = BABYLON.MeshBuilder.CreateBox(
      `${name}_rib_${ribOffset}`,
      { width: 0.04, height: 1.1, depth: 0.1 },
      scene
    );
    rib.parent = root;
    rib.position = new BABYLON.Vector3(ribOffset, 1.46, -0.05);
    rib.rotation.x = -0.66;
    rib.isPickable = false;
    rib.material = frameMat;
    collidableMeshes.push(rib);
  }

  const controlStrip = BABYLON.MeshBuilder.CreateBox(
    `${name}_controls`,
    { width: 1.84, height: 0.05, depth: 0.14 },
    scene
  );
  controlStrip.parent = root;
  controlStrip.position = new BABYLON.Vector3(0, 1.92, -0.34);
  controlStrip.rotation.x = -0.66;
  controlStrip.isPickable = false;
  controlStrip.material = createMaterial(
    scene,
    `${name}_controlsMat`,
    new BABYLON.Color3(0.14, 0.18, 0.22),
    color.scale(0.22)
  );
  collidableMeshes.push(controlStrip);

  const ballast = BABYLON.MeshBuilder.CreateBox(
    `${name}_ballast`,
    { width: 0.66, height: 0.36, depth: 0.62 },
    scene
  );
  ballast.parent = root;
  ballast.position = new BABYLON.Vector3(0, 0.18, 0.26);
  ballast.isPickable = false;
  ballast.material = trimMat;
  collidableMeshes.push(ballast);

  const mast = BABYLON.MeshBuilder.CreateCylinder(
    `${name}_mast`,
    { diameter: 0.08, height: 1.24, tessellation: 12 },
    scene
  );
  mast.parent = root;
  mast.position = new BABYLON.Vector3(0.94, 1.02, 0.22);
  mast.isPickable = false;
  mast.material = frameMat;
  collidableMeshes.push(mast);

  const dish = BABYLON.MeshBuilder.CreateDisc(
    `${name}_dish`,
    { radius: 0.32, tessellation: 36 },
    scene
  );
  dish.parent = root;
  dish.position = new BABYLON.Vector3(0.94, 1.82, 0.28);
  dish.rotation.y = Math.PI / 2;
  dish.rotation.z = -0.5;
  dish.isPickable = false;
  dish.material = frameMat;

  const beacon = BABYLON.MeshBuilder.CreateSphere(
    `${name}_beacon`,
    { diameter: 0.12, segments: 10 },
    scene
  );
  beacon.parent = root;
  beacon.position = new BABYLON.Vector3(0.94, 2.18, 0.22);
  beacon.isPickable = false;
  beacon.material = createMaterial(
    scene,
    `${name}_beaconMat`,
    color.scale(0.24),
    color.scale(0.62)
  );
  enableCollisions(...collidableMeshes);
}

function createSciFiPod(
  scene: BABYLON.Scene,
  name: string,
  position: BABYLON.Vector3,
  yaw: number,
  color: BABYLON.Color3
) {
  const root = new BABYLON.TransformNode(`${name}_root`, scene);
  root.position = position.clone();
  root.rotation.y = yaw;
  const collidableMeshes: BABYLON.AbstractMesh[] = [];

  const shellMat = createMaterial(
    scene,
    `${name}_bodyMat`,
    new BABYLON.Color3(0.76, 0.8, 0.84),
    new BABYLON.Color3(0.012, 0.015, 0.02)
  );
  shellMat.specularColor = new BABYLON.Color3(0.22, 0.26, 0.3);
  shellMat.specularPower = 104;
  const trimMat = createMaterial(
    scene,
    `${name}_trimMat`,
    new BABYLON.Color3(0.18, 0.22, 0.26),
    new BABYLON.Color3(0.008, 0.01, 0.014)
  );
  const glassMat = createMaterial(
    scene,
    `${name}_glassMat`,
    new BABYLON.Color3(0.06, 0.14, 0.15),
    color.scale(0.36),
    0.92
  );
  glassMat.specularColor = new BABYLON.Color3(0.64, 0.72, 0.78);
  glassMat.specularPower = 180;

  const base = BABYLON.MeshBuilder.CreateCylinder(
    `${name}_base`,
    { diameter: 1.54, height: 0.18, tessellation: 28 },
    scene
  );
  base.parent = root;
  base.position = new BABYLON.Vector3(0, 0.09, 0);
  base.isPickable = false;
  base.material = trimMat;
  collidableMeshes.push(base);

  const body = BABYLON.MeshBuilder.CreateCylinder(
    `${name}_body`,
    { diameter: 1.08, height: 2.5, tessellation: 28 },
    scene
  );
  body.parent = root;
  body.position = new BABYLON.Vector3(0, 1.33, 0);
  body.isPickable = false;
  body.material = shellMat;
  collidableMeshes.push(body);

  const cap = BABYLON.MeshBuilder.CreateSphere(
    `${name}_cap`,
    { diameter: 1.24, segments: 18 },
    scene
  );
  cap.parent = root;
  cap.position = new BABYLON.Vector3(0, 2.54, 0);
  cap.scaling = new BABYLON.Vector3(0.96, 0.46, 0.96);
  cap.isPickable = false;
  cap.material = shellMat;
  collidableMeshes.push(cap);

  const lowerCap = BABYLON.MeshBuilder.CreateSphere(
    `${name}_lowerCap`,
    { diameter: 1.08, segments: 16 },
    scene
  );
  lowerCap.parent = root;
  lowerCap.position = new BABYLON.Vector3(0, 0.22, 0);
  lowerCap.scaling = new BABYLON.Vector3(0.92, 0.34, 0.92);
  lowerCap.isPickable = false;
  lowerCap.material = shellMat;
  collidableMeshes.push(lowerCap);

  const core = BABYLON.MeshBuilder.CreateCylinder(
    `${name}_core`,
    { diameter: 0.22, height: 1.86, tessellation: 16 },
    scene
  );
  core.parent = root;
  core.position = new BABYLON.Vector3(0, 1.36, 0);
  core.isPickable = false;
  core.metadata = { assetType: "podCore", baseY: 1.36 };
  core.material = createMaterial(
    scene,
    `${name}_coreMat`,
    color.scale(0.08),
    color.scale(0.42),
    0.46
  );

  for (const offset of [-0.62, 0.62]) {
    const brace = BABYLON.MeshBuilder.CreateBox(
      `${name}_brace_${offset}`,
      { width: 0.11, height: 1.88, depth: 0.11 },
      scene
    );
    brace.parent = root;
    brace.position = new BABYLON.Vector3(offset, 1.04, 0);
    brace.rotation.z = -offset * 0.22;
    brace.isPickable = false;
    brace.material = trimMat;
    collidableMeshes.push(brace);
  }

  const midBand = BABYLON.MeshBuilder.CreateTorus(
    `${name}_midBand`,
    { diameter: 1.16, thickness: 0.07, tessellation: 42 },
    scene
  );
  midBand.parent = root;
  midBand.position = new BABYLON.Vector3(0, 1.58, 0);
  midBand.rotation.x = Math.PI / 2;
  midBand.isPickable = false;
  midBand.material = trimMat;
  collidableMeshes.push(midBand);

  const baseRing = BABYLON.MeshBuilder.CreateTorus(
    `${name}_baseRing`,
    { diameter: 1.6, thickness: 0.1, tessellation: 42 },
    scene
  );
  baseRing.parent = root;
  baseRing.position = new BABYLON.Vector3(0, 0.22, 0);
  baseRing.rotation.x = Math.PI / 2;
  baseRing.isPickable = false;
  baseRing.material = trimMat;
  collidableMeshes.push(baseRing);

  const viewport = BABYLON.MeshBuilder.CreateBox(
    `${name}_viewport`,
    { width: 0.08, height: 0.84, depth: 0.04 },
    scene
  );
  viewport.parent = root;
  viewport.position = new BABYLON.Vector3(0, 1.46, 0.56);
  viewport.isPickable = false;
  viewport.material = glassMat;
  collidableMeshes.push(viewport);

  const ring = BABYLON.MeshBuilder.CreateTorus(
    `${name}_ring`,
    { diameter: 1.42, thickness: 0.06, tessellation: 32 },
    scene
  );
  ring.parent = root;
  ring.position = new BABYLON.Vector3(0, 1.88, 0);
  ring.rotation.x = Math.PI / 2;
  ring.isPickable = false;
  ring.metadata = { assetType: "podRing" };
  ring.material = createMaterial(
    scene,
    `${name}_ringMat`,
    new BABYLON.Color3(0.42, 0.48, 0.56),
    color.scale(0.18)
  );
  collidableMeshes.push(ring);

  for (const hoseSide of [-1, 1]) {
    const hose = BABYLON.MeshBuilder.CreateCylinder(
      `${name}_hose_${hoseSide}`,
      { diameter: 0.06, height: 0.7, tessellation: 10 },
      scene
    );
    hose.parent = root;
    hose.position = new BABYLON.Vector3(0.44 * hoseSide, 0.48, 0.16);
    hose.rotation.z = Math.PI / 3.2 * hoseSide;
    hose.isPickable = false;
    hose.material = trimMat;
    collidableMeshes.push(hose);
  }
  enableCollisions(...collidableMeshes);
}
function addRoomTheme(scene: BABYLON.Scene, project: ProjectData) {
  const { inward, right, back, yaw } = getRoomBasis(project);
  const front = project.position.add(inward.scale(2.4));
  const rear = project.position.add(back.scale(2.9));

  if (project.id === "survivorSlime") {
    createOutpostModule(scene, `${project.id}_outpostMain`, rear.add(right.scale(-0.4)).add(new BABYLON.Vector3(0, 0, 3.8)), yaw + 0.03, 4.4, 2.8, 1.9);
    createOutpostModule(scene, `${project.id}_outpostSide`, rear.add(right.scale(-4.9)).add(new BABYLON.Vector3(0, 0, 2.9)), yaw + 0.14, 2.4, 1.9, 1.45);
    createVideoTerminal(scene, `${project.id}_videoTerminal`, rear.add(right.scale(4.9)).add(new BABYLON.Vector3(0, 0, 1.9)), yaw - 0.18, project.color);

    const servicePad = BABYLON.MeshBuilder.CreateBox(
      `${project.id}_servicePad`,
      { width: 2.4, height: 0.05, depth: 1.3 },
      scene
    );
    servicePad.position = rear.add(right.scale(-2.4)).add(new BABYLON.Vector3(0, 0.04, 2.15));
    servicePad.rotation.y = yaw + 0.08;
    servicePad.checkCollisions = true;
    servicePad.isPickable = false;
    servicePad.material = createMaterial(
      scene,
      `${project.id}_servicePadMat`,
      new BABYLON.Color3(0.17, 0.19, 0.22),
      new BABYLON.Color3(0.008, 0.01, 0.014)
    );

    createSciFiPod(scene, `${project.id}_podA`, rear.add(right.scale(2.9)).add(new BABYLON.Vector3(0, 0, 2.7)), yaw - Math.PI * 0.03, new BABYLON.Color3(0.08, 0.18, 0.16));
    createSciFiPod(scene, `${project.id}_podB`, rear.add(right.scale(-2.7)).add(new BABYLON.Vector3(0, 0, 3.4)), yaw + Math.PI * 0.05, new BABYLON.Color3(0.1, 0.22, 0.14));

    for (const offset of [
      new BABYLON.Vector3(-2.8, 0.05, 1.1),
      new BABYLON.Vector3(-1.7, 0.05, 1.8),
      new BABYLON.Vector3(-0.4, 0.05, 2.1),
      new BABYLON.Vector3(1.0, 0.05, 2.5),
      new BABYLON.Vector3(2.6, 0.05, 2.2),
      new BABYLON.Vector3(4.1, 0.05, 2.7)
    ]) {
      const shard = BABYLON.MeshBuilder.CreateBox(
        `${project.id}_shard_${offset.x}_${offset.z}`,
        { width: 0.38, height: 0.04, depth: 0.18 },
        scene
      );
      shard.position = project.position.add(offset);
      shard.rotation = new BABYLON.Vector3(0, yaw + offset.x * 0.18, -0.18 + offset.z * 0.03);
      shard.isPickable = false;
      shard.material = createMaterial(
        scene,
        `${project.id}_shardMat_${offset.x}_${offset.z}`,
        new BABYLON.Color3(0.22, 0.24, 0.27),
        new BABYLON.Color3(0.008, 0.01, 0.012)
      );
    }

    const coldLight = new BABYLON.PointLight(
      `${project.id}_coldLight`,
      project.position.add(new BABYLON.Vector3(0, 4.8, 2.6)),
      scene
    );
    coldLight.diffuse = new BABYLON.Color3(0.31, 0.35, 0.4);
    coldLight.intensity = 0.34;
    coldLight.range = 22;

    const rimLight = new BABYLON.SpotLight(
      `${project.id}_rimLight`,
      project.position.add(new BABYLON.Vector3(-6.8, 5.2, -1.4)),
      new BABYLON.Vector3(0.88, -0.52, 0.34),
      Math.PI / 2.6,
      10,
      scene
    );
    rimLight.diffuse = new BABYLON.Color3(0.36, 0.4, 0.46);
    rimLight.intensity = 1.1;

    const outpostLight = new BABYLON.PointLight(
      `${project.id}_outpostLight`,
      rear.add(right.scale(-0.8)).add(new BABYLON.Vector3(0, 1.8, 2.4)),
      scene
    );
    outpostLight.diffuse = new BABYLON.Color3(0.26, 0.3, 0.28);
    outpostLight.intensity = 0.28;
    outpostLight.range = 10;
  }

  if (project.id === "fantasyMobile") {
    createDecorScreen(scene, `${project.id}_screenA`, rear.add(right.scale(-2.2)).add(new BABYLON.Vector3(0, 2.1, 0)), yaw + Math.PI, project.color, 1.6, 1.1);
    createDecorScreen(scene, `${project.id}_screenB`, rear.add(right.scale(2.2)).add(new BABYLON.Vector3(0, 1.8, 0)), yaw + Math.PI, project.color, 1.2, 0.85);
    createDecorColumn(scene, `${project.id}_antenna`, front.add(right.scale(2.4)), project.color, 3.2, 0.22);
  }

  if (project.id === "vrCooking") {
    const table = BABYLON.MeshBuilder.CreateBox(
      `${project.id}_table`,
      { width: 2.8, height: 0.18, depth: 1.4 },
      scene
    );
    table.position = front.add(back.scale(0.7)).add(right.scale(2.2)).add(new BABYLON.Vector3(0, 0.9, 0));
    table.rotation.y = yaw;
    table.isPickable = false;
    table.material = createMaterial(scene, `${project.id}_tableMat`, new BABYLON.Color3(0.18, 0.12, 0.08), project.color.scale(0.18));

    createDecorColumn(scene, `${project.id}_potA`, table.position.add(right.scale(-0.7)).add(new BABYLON.Vector3(0, 0.32, 0)), project.color, 0.38, 0.32);
    createDecorColumn(scene, `${project.id}_potB`, table.position.add(right.scale(0.6)).add(new BABYLON.Vector3(0, 0.28, 0)), project.color, 0.32, 0.26);
    createDecorScreen(scene, `${project.id}_recipe`, rear.add(right.scale(-2.1)).add(new BABYLON.Vector3(0, 2.1, 0)), yaw + Math.PI, project.color, 1.3, 1.0);
  }

  if (project.id === "drivingSim") {
    const rig = BABYLON.MeshBuilder.CreateBox(
      `${project.id}_rig`,
      { width: 2.4, height: 0.22, depth: 3.4 },
      scene
    );
    rig.position = front.add(back.scale(0.8)).add(right.scale(-2.1)).add(new BABYLON.Vector3(0, 0.55, 0));
    rig.rotation.y = yaw;
    rig.isPickable = false;
    rig.material = createMaterial(scene, `${project.id}_rigMat`, new BABYLON.Color3(0.14, 0.14, 0.16), project.color.scale(0.16));

    const arch = BABYLON.MeshBuilder.CreateTorus(
      `${project.id}_arch`,
      { diameter: 2.8, thickness: 0.12, tessellation: 48 },
      scene
    );
    arch.position = rear.add(new BABYLON.Vector3(0, 2.5, 0));
    arch.rotation.x = Math.PI / 2;
    arch.rotation.z = Math.PI / 2;
    arch.rotation.y = yaw;
    arch.isPickable = false;
    arch.material = createMaterial(scene, `${project.id}_archMat`, new BABYLON.Color3(0.1, 0.1, 0.12), project.color.scale(0.7));

    createDecorScreen(scene, `${project.id}_diag`, rear.add(right.scale(2.1)).add(new BABYLON.Vector3(0, 1.9, 0)), yaw + Math.PI, project.color, 1.5, 0.9);
  }
}
function sampleSlimeArenaHeight(x: number, z: number) {
  const duneAngle = -0.46;
  const duneDirectionX = Math.cos(duneAngle);
  const duneDirectionZ = Math.sin(duneAngle);
  const duneRidges = [
    {
      center: -12.4,
      height: 2.35,
      windwardWidth: 4.8,
      slipWidth: 2.2,
      alongOffset: -6,
      alongScale: 16,
      seed: 131,
      waveFreq: 0.12,
      phase: 0.4,
    },
    {
      center: -5.3,
      height: 2.05,
      windwardWidth: 4.2,
      slipWidth: 2,
      alongOffset: -2,
      alongScale: 15,
      seed: 227,
      waveFreq: 0.14,
      phase: 1.15,
    },
    {
      center: 1.6,
      height: 2.7,
      windwardWidth: 5.1,
      slipWidth: 2.35,
      alongOffset: 2,
      alongScale: 18,
      seed: 341,
      waveFreq: 0.105,
      phase: 2.1,
    },
    {
      center: 8.4,
      height: 2.25,
      windwardWidth: 4.4,
      slipWidth: 2.1,
      alongOffset: 6,
      alongScale: 16,
      seed: 419,
      waveFreq: 0.13,
      phase: 0.9,
    },
    {
      center: 13.8,
      height: 2.85,
      windwardWidth: 4.9,
      slipWidth: 2.25,
      alongOffset: 10,
      alongScale: 14,
      seed: 587,
      waveFreq: 0.11,
      phase: 1.9,
    },
  ];

  const along = x * duneDirectionX + z * duneDirectionZ;
  const across = -x * duneDirectionZ + z * duneDirectionX;
  const warp =
    (fbm2D(x * 0.05 + 21.3, z * 0.05 - 7.4, 4, 811) - 0.5) * 2.2 +
    Math.sin(along * 0.09 + 0.7) * 1.2 +
    Math.cos(along * 0.13 - across * 0.04) * 0.55;
  const duneCoord = across + warp;

  let duneHeight = 0;
  for (const ridge of duneRidges) {
    const ridgeWobble =
      (fbm2D(
        (along + ridge.alongOffset) * 0.05 + ridge.seed * 0.01,
        duneCoord * 0.04 - ridge.seed * 0.006,
        3,
        ridge.seed
      ) -
        0.5) *
        1.5 +
      Math.sin(along * ridge.waveFreq + ridge.phase) * 0.45;
    const ridgeCenter = ridge.center + ridgeWobble;
    const ridgeDelta = duneCoord - ridgeCenter;
    const profileWidth =
      ridgeDelta < 0 ? ridge.windwardWidth : ridge.slipWidth;
    const ridgeProfile = Math.exp(
      -Math.pow(ridgeDelta / profileWidth, 2) * 1.6
    );
    const lengthProfile = Math.max(
      0.32,
      0.58 +
        Math.exp(
          -Math.pow((along - ridge.alongOffset) / ridge.alongScale, 2) * 1.2
        ) *
          0.22 +
        (fbm2D(
          along * 0.034 + ridge.seed * 0.07,
          ridge.center * 0.11,
          2,
          ridge.seed + 97
        ) -
          0.5) *
          0.22
    );
    duneHeight += ridgeProfile * ridge.height * lengthProfile;
  }

  const scatteredDunes =
    Math.pow(
      Math.max(0, fbm2D(x * 0.11 + 8.4, z * 0.11 - 12.1, 3, 913) - 0.58) /
        0.42,
      1.6
    ) * 0.34;
  duneHeight += scatteredDunes;

  const duneMask = saturate(duneHeight / 3.1);
  const interdune =
    -Math.pow(
      Math.sin(duneCoord * 0.12 + along * 0.03 + 0.9) * 0.5 + 0.5,
      2.6
    ) * 0.16;
  const broadUndulation =
    Math.sin(along * 0.06 + duneCoord * 0.03) * 0.12 +
    Math.cos(along * 0.05 - duneCoord * 0.045) * 0.08;
  const crestNoise =
    (fbm2D(x * 0.08 + 33.8, z * 0.08 + 11.4, 3, 1402) - 0.5) *
    (0.05 + duneMask * 0.07);
  const surfaceRipples =
    Math.sin(along * 0.5 + duneCoord * 0.22) * 0.03 * duneMask;

  const edgeDistance = Math.max(Math.abs(x), Math.abs(z));
  const edgeBlendBase = saturate(1 - (edgeDistance - 12.1) / 2.9);
  const edgeBlend =
    edgeBlendBase * edgeBlendBase * (3 - 2 * edgeBlendBase);

  // Keep a flatter center so the project stand remains readable and usable.
  const standDistance = Math.sqrt(x * x + z * z);
  const standBlendBase = saturate((standDistance - 3.1) / 3.2);
  const standBlend =
    standBlendBase * standBlendBase * (3 - 2 * standBlendBase);

  return Math.max(
    0,
    (
      0.03 +
      duneHeight +
      interdune +
      broadUndulation +
      crestNoise +
      surfaceRipples
    ) *
      edgeBlend *
      standBlend
  );
}

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

function applyTerrainColorRamp(mesh: BABYLON.Mesh, maxHeight: number) {
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
    color = BABYLON.Color3.Lerp(
      color,
      highColor,
      Math.pow(heightBlend, 1.5)
    );

    const contourShade =
      0.9 + Math.sin(height * 6.2 + terrainPositions[index] * 0.08) * 0.1;
    const slopeShade = 0.74 + normalY * 0.26;
    color = color.scale(contourShade * slopeShade);

    colors.push(color.r, color.g, color.b, 1);
  }

  mesh.setVerticesData(BABYLON.VertexBuffer.ColorKind, colors, true);
  mesh.useVertexColors = true;
}

function applyWetLookToSlimeZone(scene: BABYLON.Scene, project: ProjectData) {
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
      !(material instanceof BABYLON.StandardMaterial || material instanceof BABYLON.PBRMaterial)
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
      material.environmentIntensity = Math.max(material.environmentIntensity ?? 0, 0.9);
      material.directIntensity = Math.max(material.directIntensity ?? 0, 1.05);
    }
  });
}

function createSlimeRainSystem(
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

function createSlimeEnemySystem(
  scene: BABYLON.Scene,
  project: ProjectData,
  camera: BABYLON.UniversalCamera
): SlimeEnemySystem {
  const { right, back } = getRoomBasis(project);
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
  const getGroundHeight = (localX: number, localZ: number) =>
    sampleSlimeArenaHeight(localX, localZ) + SLIME_TERRAIN_Y_OFFSET;
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

  const enemies: SlimeEnemy[] = [];
  let spawnTimer = 0;
  let score = 0;

  function disposeEnemy(enemy: SlimeEnemy) {
    if (
      enemy.shadow.material &&
      enemy.shadow.material !== shadowMaterial
    ) {
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
      groundY + SLIME_ENEMY_SPAWN_MIN_HEIGHT + Math.random() * (SLIME_ENEMY_SPAWN_MAX_HEIGHT - SLIME_ENEMY_SPAWN_MIN_HEIGHT),
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
        SLIME_ENEMY_CHASE_SPEED_MIN +
        Math.random() * (SLIME_ENEMY_CHASE_SPEED_MAX - SLIME_ENEMY_CHASE_SPEED_MIN),
      phase: Math.random() * Math.PI * 2,
      baseScale,
    });
  }

  return {
    disposeAll,
    shoot(origin, direction) {
      const normalizedDirection = direction.clone();
      if (normalizedDirection.lengthSquared() < 0.0001) {
        normalizedDirection.copyFrom(camera.getForwardRay(SLIME_WEAPON_RANGE).direction);
      }
      normalizedDirection.normalize();

      const ray = new BABYLON.Ray(origin.clone(), normalizedDirection, SLIME_WEAPON_RANGE);
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
    update() {
      const dt = Math.min(scene.getEngine().getDeltaTime() / 1000, 0.05);
      if (dt <= 0) {
        return;
      }

      if (!isInsideArena(camera.position)) {
        if (enemies.length > 0) {
          disposeAll();
        }
        return;
      }

      spawnTimer -= dt;
      if (spawnTimer <= 0 && enemies.length < SLIME_ENEMY_MAX) {
        spawnEnemy();
        spawnTimer = SLIME_ENEMY_SPAWN_INTERVAL * (0.82 + Math.random() * 0.48);
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
          enemy.root.position.copyFrom(toWorld(enemy.localX, enemy.groundY, enemy.localZ));
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
            ? 0.56 + Math.max(0.18, 1 - (enemy.root.position.y - enemy.groundY) * 0.08)
            : 0.96 + pulse * 0.08;
        enemy.shadow.scaling.x = shadowScale;
        enemy.shadow.scaling.y = shadowScale * 0.92;
        if (enemy.shadow.material instanceof BABYLON.StandardMaterial) {
          enemy.shadow.material.alpha =
            enemy.state === "falling" ? 0.08 + shadowScale * 0.06 : 0.14 + pulse * 0.04;
        }
      }
    },
  };
}

function createSlimeWeaponSystem(
  scene: BABYLON.Scene,
  camera: BABYLON.UniversalCamera,
  project: ProjectData,
  enemySystem: SlimeEnemySystem
): SlimeWeaponSystem {
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
    enemySystem.isPlayerInsideArena() && projectPanel.classList.contains("hidden");

  const isArmed = () => isCombatVisible() && isPointerLocked;

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

function createSlimeArenaRockScatter(
  scene: BABYLON.Scene,
  project: ProjectData,
  toWorld: (x: number, y: number, z: number) => BABYLON.Vector3,
  sampleHeight: (x: number, z: number) => number
) {
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

    // Keep the front entrance and center ring open for navigation.
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
    const scaleNoiseC = hashNoise2D(index * 2.41, localX * 0.13 - localZ * 0.09, 661);
    const rotationNoiseX = hashNoise2D(index * 2.73, localX * 0.05, 701);
    const rotationNoiseY = hashNoise2D(index * 3.07, localZ * 0.05, 743);
    const rotationNoiseZ = hashNoise2D(index * 3.39, localX * 0.04 - localZ * 0.03, 787);

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
      size: { width: arenaHalfSize * 2 + wallThickness, height: wallHeight, depth: wallThickness },
      position: { x: 0, z: arenaHalfSize },
    },
    {
      name: "left",
      size: { width: wallThickness, height: wallHeight, depth: arenaHalfSize * 2 + wallThickness },
      position: { x: -arenaHalfSize, z: 0 },
    },
    {
      name: "right",
      size: { width: wallThickness, height: wallHeight, depth: arenaHalfSize * 2 + wallThickness },
      position: { x: arenaHalfSize, z: 0 },
    },
    {
      name: "frontLeft",
      size: { width: arenaHalfSize - entranceHalfWidth + wallThickness, height: wallHeight, depth: wallThickness },
      position: { x: -(entranceHalfWidth + (arenaHalfSize - entranceHalfWidth) * 0.5), z: -arenaHalfSize },
    },
    {
      name: "frontRight",
      size: { width: arenaHalfSize - entranceHalfWidth + wallThickness, height: wallHeight, depth: wallThickness },
      position: { x: entranceHalfWidth + (arenaHalfSize - entranceHalfWidth) * 0.5, z: -arenaHalfSize },
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
        width: segment.size.width + (segment.size.depth > segment.size.width ? 0 : 0.18),
        height: 0.12,
        depth: segment.size.depth + (segment.size.width > segment.size.depth ? 0 : 0.18),
      },
      scene
    );
    topTrim.position = wall.position.add(new BABYLON.Vector3(0, wallHeight * 0.5 + 0.07, 0));
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

function createDesertTerrain(scene: BABYLON.Scene, project: ProjectData) {
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
  terrain.position = project.position.add(new BABYLON.Vector3(0, terrainYOffset, 0));
  terrain.rotation.y = yaw;
  terrain.isPickable = false;

  applyHeightFieldToTerrain(collisionGround, sampleSlimeArenaHeight);
  applyHeightFieldToTerrain(terrain, sampleSlimeArenaHeight);
  applyTerrainColorRamp(terrain, 3.1);

  const terrainMaterial = new BABYLON.StandardMaterial(
    `${project.id}_terrainMat`,
    scene
  );
  terrainMaterial.diffuseColor = BABYLON.Color3.White();
  terrainMaterial.specularColor = new BABYLON.Color3(0.06, 0.08, 0.07);
  terrainMaterial.specularPower = 20;
  terrainMaterial.emissiveColor = new BABYLON.Color3(0.012, 0.016, 0.014);
  terrain.material = terrainMaterial;

  createSlimeArenaRockScatter(scene, project, toWorld, sampleSlimeArenaHeight);
  createSlimeArenaWalls(scene, project, toWorld, yaw);

  return terrain;
}

function createProjectRoom(scene: BABYLON.Scene, project: ProjectData) {
  const { back, right, inward, yaw } = getRoomBasis(project);
  const isSlime = project.id === "survivorSlime";

  if (isSlime) {
    createDesertTerrain(scene, project);
    addRoomTheme(scene, project);
    return;
  }

  const wallMaterial = createMaterial(
    scene,
    `${project.id}_roomWallMat`,
    new BABYLON.Color3(0.055, 0.07, 0.11),
    project.color.scale(0.05)
  );

  const floorPlate = BABYLON.MeshBuilder.CreateBox(
    `${project.id}_floorPlate`,
    { width: 10, height: 0.06, depth: 10 },
    scene
  );
  floorPlate.position = project.position.add(new BABYLON.Vector3(0, 0.03, 0));
  floorPlate.rotation.y = yaw;
  floorPlate.isPickable = false;
  floorPlate.material = createMaterial(
    scene,
    `${project.id}_floorPlateMat`,
    new BABYLON.Color3(0.03, 0.04, 0.07),
    project.color.scale(0.08)
  );

  const backWall = BABYLON.MeshBuilder.CreateBox(
    `${project.id}_backWall`,
    { width: 10, height: 5, depth: 0.5 },
    scene
  );
  backWall.position = project.position.add(back.scale(4.75)).add(new BABYLON.Vector3(0, 2.5, 0));
  backWall.rotation.y = yaw;
  backWall.checkCollisions = true;
  backWall.material = wallMaterial;

  const leftWall = BABYLON.MeshBuilder.CreateBox(
    `${project.id}_leftWall`,
    { width: 0.5, height: 5, depth: 10 },
    scene
  );
  leftWall.position = project.position.add(right.scale(-4.75)).add(new BABYLON.Vector3(0, 2.5, 0));
  leftWall.rotation.y = yaw;
  leftWall.checkCollisions = true;
  leftWall.material = wallMaterial;

  const rightWall = BABYLON.MeshBuilder.CreateBox(
    `${project.id}_rightWall`,
    { width: 0.5, height: 5, depth: 10 },
    scene
  );
  rightWall.position = project.position.add(right.scale(4.75)).add(new BABYLON.Vector3(0, 2.5, 0));
  rightWall.rotation.y = yaw;
  rightWall.checkCollisions = true;
  rightWall.material = wallMaterial;

  const header = BABYLON.MeshBuilder.CreateBox(
    `${project.id}_header`,
    { width: 10, height: 0.45, depth: 0.5 },
    scene
  );
  header.position = project.position.add(inward.scale(4.75)).add(new BABYLON.Vector3(0, 4.8, 0));
  header.rotation.y = yaw;
  header.checkCollisions = true;
  header.material = wallMaterial;

  const beacon = BABYLON.MeshBuilder.CreateBox(
    `${project.id}_beacon`,
    { width: 3.4, height: 0.08, depth: 0.18 },
    scene
  );
  beacon.position = project.position.add(back.scale(4.45)).add(new BABYLON.Vector3(0, 4.1, 0));
  beacon.rotation.y = yaw;
  beacon.isPickable = false;
  beacon.material = createMaterial(
    scene,
    `${project.id}_beaconMat`,
    project.color.scale(0.2),
    project.color.scale(0.95)
  );

  const halo = BABYLON.MeshBuilder.CreateDisc(
    `${project.id}_roomHalo`,
    { radius: 3.6, tessellation: 60 },
    scene
  );
  halo.position = project.position.add(new BABYLON.Vector3(0, 0.04, 0));
  halo.rotation.x = Math.PI / 2;
  halo.isPickable = false;
  halo.material = createMaterial(
    scene,
    `${project.id}_roomHaloMat`,
    project.color.scale(0.08),
    project.color.scale(0.24),
    0.68
  );

  addRoomTheme(scene, project);
}
function createProjectLabel(
  scene: BABYLON.Scene,
  project: ProjectData,
  root?: BABYLON.TransformNode
) {
  const { inward, yaw } = getRoomBasis(project);
  const labelTexture = new BABYLON.DynamicTexture(
    `${project.id}_labelTexture`,
    { width: 1024, height: 256 },
    scene,
    true
  );
  const context = labelTexture.getContext();
  labelTexture.hasAlpha = true;

  context.clearRect(0, 0, 1024, 256);
  context.fillStyle = "rgba(4, 8, 18, 0.78)";
  context.fillRect(12, 30, 1000, 196);
  context.strokeStyle = rgbString(project.color);
  context.lineWidth = 4;
  context.strokeRect(12, 30, 1000, 196);
  context.fillStyle = "rgba(127, 231, 203, 0.95)";
  context.font = "600 34px Segoe UI";
  context.fillText(project.accent.toUpperCase(), 48, 88);
  context.fillStyle = "rgba(243, 246, 255, 0.96)";
  context.font = "700 62px Segoe UI";
  context.fillText(project.title, 48, 160);
  context.fillStyle = "rgba(185, 206, 255, 0.86)";
  context.font = "400 30px Segoe UI";
  context.fillText(project.engine, 48, 208);
  labelTexture.update();

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
  if (project.id === "survivorSlime") {
    label.position = project.position
      .add(inward.scale(15.82))
      .add(new BABYLON.Vector3(0, 3.12, 0));
    label.rotation.y = yaw + Math.PI;
    label.isPickable = true;
    label.metadata = {
      projectId: project.id,
      interactionMode: "panel",
      interactionDistance: PANEL_INTERACTION_DISTANCE,
    } satisfies ProjectInteractionMetadata;
    createProjectTrailerBillboard(scene, project, label.position.clone(), label.rotation.y);
  } else {
    if (root) {
      label.parent = root;
    }
    label.position = new BABYLON.Vector3(0, 3.7, -1.8);
    label.rotation.y = Math.PI;
    label.isPickable = false;
  }
  label.material = labelMaterial;
}

function createProjectStand(scene: BABYLON.Scene, project: ProjectData) {
  const root = new BABYLON.TransformNode(`${project.id}_root`, scene);
  root.position = project.position.clone();

  const { yaw } = getRoomBasis(project);
  root.rotation.y = yaw;

  const isSlime = project.id === "survivorSlime";
  const baseMaterial = createMaterial(
    scene,
    `${project.id}_baseMat`,
    isSlime ? new BABYLON.Color3(0.14, 0.16, 0.19) : new BABYLON.Color3(0.07, 0.08, 0.12),
    isSlime ? new BABYLON.Color3(0.008, 0.01, 0.012) : project.color.scale(0.12)
  );

  const base = BABYLON.MeshBuilder.CreateCylinder(
    `${project.id}_base`,
    isSlime ? { diameter: 2.5, height: 0.18, tessellation: 48 } : { diameter: 2.8, height: 0.26, tessellation: 48 },
    scene
  );
  base.parent = root;
  base.position.y = isSlime ? 0.09 : 0.14;
  base.checkCollisions = true;
  base.material = baseMaterial;

  const pedestal = isSlime
    ? BABYLON.MeshBuilder.CreateBox(`${project.id}_pedestal`, { width: 1.6, height: 0.54, depth: 1.22 }, scene)
    : BABYLON.MeshBuilder.CreateCylinder(`${project.id}_pedestal`, { diameter: 1.35, height: 1.15, tessellation: 32 }, scene);
  pedestal.parent = root;
  pedestal.position.y = isSlime ? 0.36 : 0.72;
  pedestal.checkCollisions = true;
  pedestal.material = createMaterial(
    scene,
    `${project.id}_pedestalMat`,
    isSlime ? new BABYLON.Color3(0.22, 0.24, 0.27) : new BABYLON.Color3(0.1, 0.12, 0.18),
    isSlime ? new BABYLON.Color3(0.01, 0.012, 0.014) : project.color.scale(0.06)
  );

  const displayMaterial = createMaterial(
    scene,
    `${project.id}_displayMat`,
    isSlime ? new BABYLON.Color3(0.08, 0.12, 0.12) : project.color.scale(0.26),
    isSlime ? new BABYLON.Color3(0.08, 0.16, 0.14) : project.color.scale(0.5)
  );
  const display = BABYLON.MeshBuilder.CreateBox(
    `${project.id}_display`,
    isSlime ? { width: 1.74, height: 0.94, depth: 0.08 } : { width: 1.55, height: 0.95, depth: 0.16 },
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
    isSlime ? new BABYLON.Color3(0.58, 0.72, 0.68) : new BABYLON.Color3(0.82, 0.9, 1.0),
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
    isSlime ? new BABYLON.Color3(0.12, 0.16, 0.17) : new BABYLON.Color3(0.08, 0.1, 0.16),
    isSlime ? project.color.scale(0.12) : project.color.scale(0.7)
  );
  const ring = BABYLON.MeshBuilder.CreateTorus(
    `${project.id}_ring`,
    { diameter: isSlime ? 0.84 : 1.9, thickness: isSlime ? 0.03 : 0.06, tessellation: 64 },
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
    isSlime ? new BABYLON.Color3(0.05, 0.08, 0.09) : project.color.scale(0.08),
    isSlime ? project.color.scale(0.08) : project.color.scale(0.4),
    isSlime ? 0.1 : 0.28
  );
  const beam = BABYLON.MeshBuilder.CreateCylinder(
    `${project.id}_beam`,
    isSlime ? { diameterTop: 0.05, diameterBottom: 0.12, height: 1.3, tessellation: 14 } : { diameterTop: 0.12, diameterBottom: 0.42, height: 3.1, tessellation: 16 },
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

  createProjectLabel(scene, project, root);

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

function createFloatingParticles(scene: BABYLON.Scene) {
  const source = BABYLON.MeshBuilder.CreateSphere(
    "particleSource",
    { diameter: 0.05, segments: 6 },
    scene
  );
  source.isVisible = false;
  source.isPickable = false;
  source.material = createMaterial(
    scene,
    "particleMat",
    new BABYLON.Color3(0.52, 0.58, 0.66),
    new BABYLON.Color3(0.02, 0.03, 0.05),
    0.28
  );

  const particles: FloatingParticle[] = [];
  for (let index = 0; index < 26; index += 1) {
    const instance = source.createInstance(`particle_${index}`);
    const angle = Math.random() * Math.PI * 2;
    const radius = 5 + Math.random() * 18;
    const y = 1.2 + Math.random() * 3.2;
    instance.position = new BABYLON.Vector3(
      Math.cos(angle) * radius,
      y,
      Math.sin(angle) * radius
    );
    instance.scaling = BABYLON.Vector3.One().scale(0.45 + Math.random() * 0.45);
    instance.isPickable = false;

    particles.push({
      mesh: instance,
      baseY: y,
      offset: Math.random() * Math.PI * 2,
      speed: 0.18 + Math.random() * 0.28,
    });
  }

  return particles;
}

function createBounds(scene: BABYLON.Scene) {
  const walls = [
    {
      name: "north",
      size: { width: 56, height: 6, depth: 1 },
      position: new BABYLON.Vector3(0, 3, -27.5),
    },
    {
      name: "south",
      size: { width: 56, height: 6, depth: 1 },
      position: new BABYLON.Vector3(0, 3, 27.5),
    },
    {
      name: "west",
      size: { width: 1, height: 6, depth: 56 },
      position: new BABYLON.Vector3(-27.5, 3, 0),
    },
    {
      name: "east",
      size: { width: 1, height: 6, depth: 56 },
      position: new BABYLON.Vector3(27.5, 3, 0),
    },
  ];

  walls.forEach((wall) => {
    const mesh = BABYLON.MeshBuilder.CreateBox(`bound_${wall.name}`, wall.size, scene);
    mesh.position = wall.position;
    mesh.isVisible = false;
    mesh.isPickable = false;
    mesh.checkCollisions = true;
  });
}

function lookAtTarget(camera: BABYLON.UniversalCamera, target: BABYLON.Vector3) {
  const direction = target.subtract(camera.position);
  const distanceXZ = Math.sqrt(direction.x * direction.x + direction.z * direction.z);
  camera.rotation.y = Math.atan2(direction.x, direction.z);
  camera.rotation.x = -Math.atan2(direction.y, distanceXZ);
}

function getGroundDistance(scene: BABYLON.Scene, origin: BABYLON.Vector3) {
  const rayOffset = 0.1;
  const ray = new BABYLON.Ray(
    origin.add(new BABYLON.Vector3(0, rayOffset, 0)),
    BABYLON.Vector3.Down(),
    GROUND_RAY_CAST_LENGTH
  );
  const groundHit = scene.pickWithRay(
    ray,
    (mesh) => mesh.checkCollisions && mesh.isEnabled()
  );

  if (!groundHit?.hit) {
    return null;
  }

  return Math.max(0, groundHit.distance - rayOffset);
}

function createPlayerController(
  scene: BABYLON.Scene,
  camera: BABYLON.UniversalCamera
): PlayerController {
  const collisionCamera = camera as CollisionCamera;
  const movementKeys = new Set([
    "KeyW",
    "KeyZ",
    "KeyS",
    "KeyA",
    "KeyQ",
    "KeyD",
    "ShiftLeft",
    "ShiftRight",
    "Space",
  ]);
  const pressedKeys = new Set<string>();
  let jumpBuffer = 0;
  let coyoteTime = 0;

  const state = {
    bodyPosition: camera.position.clone(),
    horizontalVelocity: BABYLON.Vector3.Zero(),
    verticalVelocity: 0,
    bobPhase: 0,
    bobOffset: BABYLON.Vector3.Zero(),
    landingOffset: 0,
    landingVelocity: 0,
    isGrounded: true,
  };

  function isPressed(...codes: string[]) {
    return codes.some((code) => pressedKeys.has(code));
  }

  function resetInput() {
    pressedKeys.clear();
    jumpBuffer = 0;
  }

  window.addEventListener("keydown", (event) => {
    if (!movementKeys.has(event.code)) {
      return;
    }

    pressedKeys.add(event.code);
    if (event.code === "Space" && !event.repeat) {
      jumpBuffer = JUMP_BUFFER_TIME;
    }
    event.preventDefault();
  });

  window.addEventListener("keyup", (event) => {
    if (!movementKeys.has(event.code)) {
      return;
    }

    pressedKeys.delete(event.code);
    event.preventDefault();
  });

  camera.fov = WALK_FOV;

  return {
    resetInput,
    syncPosition(position) {
      state.bodyPosition.copyFrom(position);
      state.horizontalVelocity.set(0, 0, 0);
      state.verticalVelocity = 0;
      state.bobPhase = 0;
      state.bobOffset.set(0, 0, 0);
      state.landingOffset = 0;
      state.landingVelocity = 0;
      state.isGrounded = true;
      coyoteTime = 0;
      jumpBuffer = 0;
      camera.rotation.z = 0;
      camera.fov = WALK_FOV;
      camera.position.copyFrom(position);
    },
    update() {
      const dt = Math.min(scene.getEngine().getDeltaTime() / 1000, 0.05);
      if (dt <= 0) {
        return;
      }

      const movementEnabled =
        isPointerLocked && projectPanel.classList.contains("hidden");

      camera.position.copyFrom(state.bodyPosition);

      jumpBuffer = Math.max(0, jumpBuffer - dt);

      const yaw = camera.rotation.y;
      const forward = new BABYLON.Vector3(Math.sin(yaw), 0, Math.cos(yaw));
      const right = new BABYLON.Vector3(forward.z, 0, -forward.x);

      let moveForward = 0;
      let moveRight = 0;
      if (movementEnabled) {
        if (isPressed("KeyW", "KeyZ")) moveForward += 1;
        if (isPressed("KeyS")) moveForward -= 1;
        if (isPressed("KeyD")) moveRight += 1;
        if (isPressed("KeyA", "KeyQ")) moveRight -= 1;
      }

      const inputDirection = forward.scale(moveForward).add(right.scale(moveRight));
      const hasMoveInput = inputDirection.lengthSquared() > 0.001;
      if (hasMoveInput) {
        inputDirection.normalize();
      }

      const groundDistanceBeforeMove = getGroundDistance(scene, state.bodyPosition);
      const groundedBeforeMove =
        groundDistanceBeforeMove !== null &&
        groundDistanceBeforeMove <= PLAYER_HEIGHT + GROUND_CONTACT_EPSILON;

      if (groundedBeforeMove) {
        coyoteTime = COYOTE_TIME;
        if (state.verticalVelocity < 0) {
          state.verticalVelocity = GROUND_STICK_FORCE;
        }
      } else {
        coyoteTime = Math.max(0, coyoteTime - dt);
      }

      const sprinting =
        movementEnabled &&
        hasMoveInput &&
        isPressed("ShiftLeft", "ShiftRight");
      const jumpHeld = isPressed("Space");
      const targetSpeed = hasMoveInput
        ? sprinting
          ? SPRINT_SPEED
          : WALK_SPEED
        : 0;
      const controlSharpness = groundedBeforeMove
        ? hasMoveInput
          ? 13
          : 11
        : hasMoveInput
          ? 4.2
          : 2.6;
      const blend = 1 - Math.exp(-controlSharpness * dt);

      state.horizontalVelocity = BABYLON.Vector3.Lerp(
        state.horizontalVelocity,
        inputDirection.scale(targetSpeed),
        blend
      );

      if (!hasMoveInput && state.horizontalVelocity.lengthSquared() < 0.0004) {
        state.horizontalVelocity.set(0, 0, 0);
      }

      if (movementEnabled && jumpBuffer > 0 && coyoteTime > 0) {
        state.verticalVelocity = JUMP_FORCE;
        jumpBuffer = 0;
        coyoteTime = 0;
        state.isGrounded = false;
      }

      if (!groundedBeforeMove || state.verticalVelocity > 0) {
        const gravity =
          state.verticalVelocity > 0
            ? jumpHeld
              ? JUMP_ASCENT_GRAVITY
              : JUMP_RELEASE_GRAVITY
            : JUMP_DESCENT_GRAVITY;

        state.verticalVelocity = Math.max(
          MAX_FALL_SPEED,
          state.verticalVelocity + gravity * dt
        );
      }

      const frameMovement = state.horizontalVelocity.scale(dt).add(
        new BABYLON.Vector3(0, state.verticalVelocity * dt, 0)
      );
      collisionCamera._collideWithWorld(frameMovement);
      state.bodyPosition.copyFrom(camera.position);

      const fallSpeed = state.verticalVelocity;
      const wasGrounded = state.isGrounded;
      const groundDistanceAfterMove = getGroundDistance(scene, state.bodyPosition);

      state.isGrounded =
        groundDistanceAfterMove !== null &&
        groundDistanceAfterMove <= PLAYER_HEIGHT + GROUND_CONTACT_EPSILON;

      if (state.isGrounded && !wasGrounded && fallSpeed < -6) {
        state.landingVelocity -= Math.min(
          LANDING_MAX_IMPULSE,
          Math.abs(fallSpeed) * LANDING_IMPACT_SCALE
        );
      }

      if (state.isGrounded && state.verticalVelocity < 0) {
        state.verticalVelocity = GROUND_STICK_FORCE;
      }

      state.landingVelocity +=
        (
          -state.landingOffset * LANDING_SPRING_STRENGTH -
          state.landingVelocity * LANDING_SPRING_DAMPING
        ) * dt;
      state.landingOffset += state.landingVelocity * dt;

      if (state.landingOffset > 0) {
        state.landingOffset = 0;
        if (state.landingVelocity > 0) {
          state.landingVelocity = 0;
        }
      }

      const planarSpeed = Math.sqrt(
        state.horizontalVelocity.x * state.horizontalVelocity.x +
        state.horizontalVelocity.z * state.horizontalVelocity.z
      );
      const movementRatio = BABYLON.Scalar.Clamp(
        planarSpeed / SPRINT_SPEED,
        0,
        1
      );

      if (state.isGrounded && planarSpeed > 0.22) {
        state.bobPhase +=
          dt *
          (sprinting
            ? HEAD_BOB_SPRINT_FREQUENCY
            : HEAD_BOB_WALK_FREQUENCY);

        const bobWave = 0.5 - 0.5 * Math.cos(state.bobPhase * Math.PI * 2);
        const swayWave = Math.cos(state.bobPhase * Math.PI);
        const bobBlend = 1 - Math.exp(-dt * 14);

        state.bobOffset.x = BABYLON.Scalar.Lerp(
          state.bobOffset.x,
          swayWave * HEAD_SWAY_AMPLITUDE * (0.6 + movementRatio * 0.4),
          bobBlend
        );
        state.bobOffset.y = BABYLON.Scalar.Lerp(
          state.bobOffset.y,
          -bobWave * HEAD_BOB_AMPLITUDE * (0.48 + movementRatio * 0.52),
          bobBlend
        );
      } else {
        const settleBlend = 1 - Math.exp(-dt * 10);
        state.bobOffset.x = BABYLON.Scalar.Lerp(
          state.bobOffset.x,
          0,
          settleBlend
        );
        state.bobOffset.y = BABYLON.Scalar.Lerp(
          state.bobOffset.y,
          0,
          settleBlend
        );
      }

      const strafeRatio = BABYLON.Scalar.Clamp(
        state.horizontalVelocity.dot(right) / SPRINT_SPEED,
        -1,
        1
      );
      const rollTarget =
        -strafeRatio * CAMERA_ROLL_INTENSITY - state.bobOffset.x * 0.45;
      camera.rotation.z = BABYLON.Scalar.Lerp(
        camera.rotation.z,
        rollTarget,
        1 - Math.exp(-dt * 10)
      );

      const targetFov =
        WALK_FOV +
        (sprinting ? SPRINT_FOV_BOOST : 0) +
        (!state.isGrounded ? 0.012 : 0);
      camera.fov = BABYLON.Scalar.Lerp(
        camera.fov,
        targetFov,
        1 - Math.exp(-dt * 8)
      );

      camera.position.set(
        state.bodyPosition.x + state.bobOffset.x,
        state.bodyPosition.y + state.bobOffset.y + state.landingOffset,
        state.bodyPosition.z
      );
    },
  };
}

function createScene() {
  const scene = new BABYLON.Scene(engine);

  scene.clearColor = new BABYLON.Color4(0.33, 0.36, 0.42, 1);
  scene.ambientColor = new BABYLON.Color3(0.16, 0.18, 0.22);
  scene.fogMode = BABYLON.Scene.FOGMODE_NONE;
  scene.collisionsEnabled = true;
  scene.gravity = new BABYLON.Vector3(0, -0.12, 0);

  const glow = new BABYLON.GlowLayer("glow", scene);
  glow.intensity = 0.08;

  const camera = new BABYLON.UniversalCamera("playerCamera", START_POSITION.clone(), scene);
  camera.attachControl(canvas, true);
  camera.speed = 0;
  camera.inertia = 0.68;
  camera.angularSensibility = 3600;
  camera.minZ = 0.1;
  camera.applyGravity = false;
  camera.checkCollisions = true;
  camera.ellipsoid = new BABYLON.Vector3(0.55, 0.95, 0.55);
  camera.ellipsoidOffset = new BABYLON.Vector3(0, 0.95, 0);
  camera.keysUp = [];
  camera.keysDown = [];
  camera.keysLeft = [];
  camera.keysRight = [];
  playerCamera = camera;
  const playerController = createPlayerController(scene, camera);

  const hemiLight = new BABYLON.HemisphericLight(
    "hemi",
    new BABYLON.Vector3(0, 1, 0),
    scene
  );
  hemiLight.intensity = 0.34;
  hemiLight.groundColor = new BABYLON.Color3(0.02, 0.02, 0.05);
  hemiLight.diffuse = new BABYLON.Color3(0.42, 0.45, 0.5);

  const pointLight = new BABYLON.PointLight(
    "point",
    new BABYLON.Vector3(0, 5.5, 0),
    scene
  );
  pointLight.intensity = 1.7;
  pointLight.diffuse = new BABYLON.Color3(0.42, 0.48, 0.58);

  const skylight = new BABYLON.SpotLight(
    "skylight",
    new BABYLON.Vector3(0, 10, 0),
    new BABYLON.Vector3(0, -1, 0),
    Math.PI / 1.7,
    18,
    scene
  );
  skylight.intensity = 6.2;
  skylight.diffuse = new BABYLON.Color3(0.46, 0.48, 0.54);

  const ground = BABYLON.MeshBuilder.CreateGround(
    "ground",
    { width: 56, height: 56, subdivisions: 2 },
    scene
  );
  ground.material = createMaterial(
    scene,
    "groundMat",
    new BABYLON.Color3(0.04, 0.05, 0.09),
    new BABYLON.Color3(0.005, 0.008, 0.015)
  );
  ground.checkCollisions = true;

  createPathLight(
    scene,
    "path_north",
    4,
    22,
    new BABYLON.Vector3(0, 0.05, -11),
    new BABYLON.Color3(0.25, 0.65, 1)
  );
  createPathLight(
    scene,
    "path_south",
    4,
    22,
    new BABYLON.Vector3(0, 0.05, 11),
    new BABYLON.Color3(0.25, 0.65, 1)
  );
  createPathLight(
    scene,
    "path_west",
    22,
    4,
    new BABYLON.Vector3(-11, 0.05, 0),
    new BABYLON.Color3(0.25, 0.65, 1)
  );
  createPathLight(
    scene,
    "path_east",
    22,
    4,
    new BABYLON.Vector3(11, 0.05, 0),
    new BABYLON.Color3(0.25, 0.65, 1)
  );

  createColumn(scene, 23, -23);
  createColumn(scene, -23, 23);
  createColumn(scene, 23, 23);

  createBounds(scene);

  projects.forEach((project) => {
    createProjectRoom(scene, project);
    if (project.id === "survivorSlime") {
      createProjectLabel(scene, project);
      return;
    }

    standMap.set(project.id, createProjectStand(scene, project));
  });

  const slimeProject = projects.find((project) => project.id === "survivorSlime");
  if (slimeProject) {
    applyWetLookToSlimeZone(scene, slimeProject);
  }

  const particles = createFloatingParticles(scene);
  const slimeRain = slimeProject
    ? createSlimeRainSystem(scene, slimeProject)
    : { lines: [], respawnLine: (_line: BABYLON.InstancedMesh) => undefined };
  const slimeEnemySystem = slimeProject
    ? createSlimeEnemySystem(scene, slimeProject, camera)
    : null;
  const slimeWeaponSystem =
    slimeProject && slimeEnemySystem
      ? createSlimeWeaponSystem(scene, camera, slimeProject, slimeEnemySystem)
      : null;

  function setHoveredProject(
    projectId: string | null,
    interactionMode: ProjectInteractionMode = "focus"
  ) {
    hoveredProjectId = projectId;
    hoveredInteractionMode = interactionMode;

    if (!projectPanel.classList.contains("hidden")) {
      if (activeProjectId) {
        const activeProject = projects.find((entry) => entry.id === activeProjectId);
        if (activeProject) {
          updateStatus(`Focus: ${activeProject.title}`);
        }
      }
      return;
    }

    if (projectId) {
      const project = projects.find((entry) => entry.id === projectId);
      if (project) {
        updateStatus(
          interactionMode === "panel"
            ? `Vise ${project.title} - appuie sur E pour ouvrir la fiche`
            : `Vise ${project.title} - appuie sur E pour ouvrir`
        );
      }
      return;
    }

    if (activeProjectId) {
      const project = projects.find((entry) => entry.id === activeProjectId);
      if (project) {
        updateStatus(`Focus: ${project.title}`);
      }
      return;
    }

    updateStatus(getFreeRoamStatusMessage());
  }

  focusProject = (projectId: string, shouldOpenPanel: boolean) => {
    const project = projects.find((entry) => entry.id === projectId);
    if (!project || !playerCamera) return;

    activeProjectId = projectId;
    playerController.syncPosition(project.viewPosition);
    playerCamera.cameraDirection.scaleInPlace(0);
    playerCamera.cameraRotation.scaleInPlace(0);
    lookAtTarget(playerCamera, project.position.add(new BABYLON.Vector3(0, 1.8, 0)));
    renderActiveCard();

    if (shouldOpenPanel) {
      openProjectPanel(project);
    }
  };

  canvas.addEventListener("pointerdown", (event) => {
    const clickedUi = (event.target as HTMLElement).closest(
      "#projectRail, #projectPanel, #topbar, #heroPanel, #closePanel"
    );

    if (!clickedUi && document.pointerLockElement !== canvas) {
      canvas.requestPointerLock();
      return;
    }

    if (event.button === 0 && isPointerLocked) {
      const shot = slimeWeaponSystem?.tryShoot();
      if (shot?.scoreDelta) {
        showCombatPopup(`+${shot.scoreDelta}`);
      }
    }
  });

  document.addEventListener("pointerlockchange", () => {
    isPointerLocked = document.pointerLockElement === canvas;
    if (!isPointerLocked) {
      playerController.resetInput();
    }
    syncCrosshairVisibility();
    setHoveredProject(hoveredProjectId, hoveredInteractionMode);
  });

  window.addEventListener("keydown", (event) => {
    if (event.key.toLowerCase() !== "e") {
      return;
    }

    if (hoveredProjectId) {
      if (hoveredInteractionMode === "panel") {
        openProjectInfo(hoveredProjectId);
      } else {
        focusProject(hoveredProjectId, true);
      }
    }
  });

  scene.onPointerObservable.add((pointerInfo) => {
    if (pointerInfo.type !== BABYLON.PointerEventTypes.POINTERPICK) {
      return;
    }

    const pick = scene.pick(scene.pointerX, scene.pointerY);
    const interaction = pick?.hit
      ? (pick.pickedMesh?.metadata as ProjectInteractionMetadata | undefined)
      : undefined;
    const projectId = interaction?.projectId ?? null;
    if (projectId) {
      if (interaction?.interactionMode === "panel") {
        openProjectInfo(projectId);
      } else {
        focusProject(projectId, true);
      }
    }
  });

  scene.registerBeforeRender(() => {
    const time = performance.now() * 0.001;
    const frameScale = Math.min(scene.getEngine().getDeltaTime() / 16.6667, 2);
    playerController.update();
    slimeEnemySystem?.update();
    slimeWeaponSystem?.update();
    const crosshairState = slimeWeaponSystem?.getCrosshairState();
    crosshair.classList.toggle("combat", Boolean(crosshairState?.armed));
    crosshair.classList.toggle("targeting", Boolean(crosshairState?.targeting));
    crosshair.classList.toggle("cooldown", Boolean(crosshairState?.coolingDown));
    crosshair.classList.toggle("firing", Boolean(crosshairState?.firing));
    crosshair.classList.toggle("hit", Boolean(crosshairState?.hit));

    isInSlimeCombatZone = slimeEnemySystem?.isPlayerInsideArena() ?? false;
    const showCombatHud =
      isInSlimeCombatZone && projectPanel.classList.contains("hidden");
    combatHud.classList.toggle("hidden", !showCombatHud);
    if (showCombatHud && slimeEnemySystem) {
      combatScore.textContent = slimeEnemySystem
        .getScore()
        .toString()
        .padStart(4, "0");
      const enemyCount = slimeEnemySystem.getEnemyCount();
      combatStatus.textContent =
        enemyCount > 0
          ? `${enemyCount} slime${enemyCount > 1 ? "s" : ""} actif${enemyCount > 1 ? "s" : ""} - clic gauche pour lancer un eclair`
          : "Zone securisee pour l'instant - les slimes repopent tant que tu restes dans l'arene";
    }
    if (combatPopup.classList.contains("visible") && performance.now() >= combatPopupHideAt) {
      combatPopup.classList.remove("visible");
    }

    const forwardPick = scene.pickWithRay(
      camera.getForwardRay(PANEL_INTERACTION_DISTANCE),
      (mesh) => Boolean((mesh.metadata as ProjectInteractionMetadata | undefined)?.projectId)
    );
    const interaction = forwardPick?.hit
      ? (forwardPick.pickedMesh?.metadata as ProjectInteractionMetadata | undefined)
      : undefined;
    const interactionDistance = interaction?.interactionDistance ?? INTERACTION_DISTANCE;
    const isWithinRange = (forwardPick?.distance ?? Number.POSITIVE_INFINITY) <= interactionDistance;
    setHoveredProject(
      isWithinRange ? interaction?.projectId ?? null : null,
      isWithinRange ? interaction?.interactionMode ?? "focus" : "focus"
    );

    pointLight.position.x = Math.sin(time * 0.45) * 1.2;
    pointLight.position.z = Math.cos(time * 0.45) * 1.2;

    standMap.forEach((stand, standProjectId) => {
      const project = projects.find((entry) => entry.id === standProjectId);
      if (!project) return;

      const isActive = activeProjectId === standProjectId;
      const isHovered = hoveredProjectId === standProjectId;
      const highlight = isActive ? 1 : isHovered ? 0.58 : 0.18;

      stand.orb.position.y = 2.2 + Math.sin(time * 2 + project.position.x) * 0.13;
      stand.ring.rotation.z += 0.008 + highlight * 0.008;
      stand.halo.rotation.z -= 0.004 + highlight * 0.005;
      stand.beam.scaling.y =
        0.95 + Math.sin(time * 1.3 + project.position.z) * 0.04 + highlight * 0.08;

      const emissiveBoost =
        project.id === "survivorSlime"
          ? 0.16 + highlight * 0.22
          : 0.7 + highlight * 0.9;
      stand.orbMaterial.emissiveColor = project.color.scale(emissiveBoost);
      stand.ringMaterial.emissiveColor = project.color.scale(project.id === "survivorSlime" ? 0.08 + highlight * 0.12 : 0.35 + highlight * 0.95);
      stand.haloMaterial.emissiveColor = project.color.scale(project.id === "survivorSlime" ? 0.04 + highlight * 0.08 : 0.18 + highlight * 0.5);
      stand.haloMaterial.alpha = project.id === "survivorSlime" ? 0.08 + highlight * 0.12 : 0.16 + highlight * 0.32;
      stand.displayMaterial.emissiveColor = project.color.scale(project.id === "survivorSlime" ? 0.06 + highlight * 0.12 : 0.2 + highlight * 0.65);
      stand.display.scaling = BABYLON.Vector3.Lerp(
        stand.display.scaling,
        BABYLON.Vector3.One().scale(isActive ? 1.05 : isHovered ? 1.02 : 1),
        0.12
      );
    });

    scene.meshes.forEach((mesh) => {
      if (mesh.metadata?.assetType === "slimeBlob") {
        const baseScaleY = mesh.metadata.baseScaleY ?? mesh.scaling.y;
        const baseScaleX = mesh.metadata.baseScaleX ?? mesh.scaling.x;
        const baseScaleZ = mesh.metadata.baseScaleZ ?? mesh.scaling.z;
        const phase = mesh.metadata.phase ?? 0;
        const pulse = Math.sin(time * 1.8 + phase) * 0.5 + 0.5;
        const scaleY = baseScaleY * (0.94 + pulse * 0.1);
        const scaleX = baseScaleX * (1.03 - pulse * 0.035);
        const scaleZ = baseScaleZ * (1.02 - pulse * 0.03);
        mesh.scaling.set(scaleX, scaleY, scaleZ);
        mesh.position.y = mesh.metadata.baseY * (scaleY / baseScaleY);
      }

      if (mesh.metadata?.assetType === "slimePuddle") {
        const phase = mesh.metadata.phase ?? 0;
        const baseScale = mesh.metadata.baseScale ?? mesh.scaling.x;
        const pulse = 0.96 + (Math.sin(time * 1.5 + phase) * 0.5 + 0.5) * 0.1;
        mesh.scaling.x = baseScale * pulse;
        mesh.scaling.y = baseScale * pulse * 0.9;
        if (mesh.material instanceof BABYLON.StandardMaterial) {
          mesh.material.alpha = 0.12 + pulse * 0.06;
        }
      }

      if (mesh.metadata?.assetType === "podCore") {
        mesh.position.y = mesh.metadata.baseY + Math.sin(time * 1.8 + mesh.position.x) * 0.04;
        if (mesh.material instanceof BABYLON.StandardMaterial) {
          mesh.material.emissiveColor = new BABYLON.Color3(0.18, 0.95, 0.82).scale(0.18 + Math.sin(time * 2.4 + mesh.position.x) * 0.05);
        }
      }

      if (mesh.metadata?.assetType === "podRing") {
        mesh.rotation.y += 0.01;
      }
    });

    slimeRain.lines.forEach((rain) => {
      const metadata = rain.metadata as SlimeRainDropMetadata | undefined;
      if (!metadata) {
        return;
      }

      rain.position.addInPlace(metadata.wind.scale(frameScale));
      rain.position.y -= metadata.speed * frameScale;
      if (rain.position.y < metadata.minY) {
        slimeRain.respawnLine(rain);
      }
    });

    particles.forEach((particle) => {
      particle.mesh.position.y =
        particle.baseY + Math.sin(time * particle.speed + particle.offset) * 0.16;
    });
  });

  createProjectCards();
  lookAtTarget(camera, new BABYLON.Vector3(0, PLAYER_HEIGHT, -18));
  updateStatus(getFreeRoamStatusMessage());

  return scene;
}

const scene = createScene();

engine.runRenderLoop(() => {
  scene.render();
});

window.addEventListener("resize", () => {
  engine.resize();
});

























