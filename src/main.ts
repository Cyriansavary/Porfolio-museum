import * as BABYLON from "babylonjs";
import heroImage from "./assets/hero.png";
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

const PLAYER_HEIGHT = 1.72;
const INTERACTION_DISTANCE = 6;
const START_POSITION = new BABYLON.Vector3(0, PLAYER_HEIGHT, 8);
const ROOM_OFFSET = 15;

const projects: ProjectData[] = [
  {
    id: "survivorSlime",
    title: "Survivor Slime",
    subtitle: "Prototype survivor ultra lisible sous Unreal Engine 5",
    description:
      "Une experience focalisee sur la boucle de survie, la lisibilite du combat et la vitesse d'iteration pour tester rapidement de nouvelles sensations de gameplay.",
    engine: "Unreal Engine 5",
    focus: "Gameplay systems, combat feedback, VFX",
    context: "Projet personnel",
    role: "Game programmer et design iteration",
    year: "2025",
    stack: "UE5, Blueprints, balancing, juice",
    atmosphere:
      "Concu comme un laboratoire de rythme: chaque ennemi, pickup et impact devait rester lisible meme lorsque l'ecran devient charge.",
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
const projectPanel = document.getElementById("projectPanel") as HTMLDivElement;
const closePanelBtn = document.getElementById("closePanel") as HTMLButtonElement;
const statusPill = document.getElementById("statusPill") as HTMLDivElement;

const projectHero = document.getElementById("projectHero") as HTMLImageElement;
const projectAccent = document.getElementById("projectAccent") as HTMLDivElement;
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

let activeProjectId: string | null = null;
let hoveredProjectId: string | null = null;
let focusProject: (projectId: string, shouldOpenPanel: boolean) => void = () => undefined;
let playerCamera: BABYLON.UniversalCamera | null = null;
let isPointerLocked = false;

function rgbString(color: BABYLON.Color3) {
  return `rgb(${Math.round(color.r * 255)}, ${Math.round(color.g * 255)}, ${Math.round(color.b * 255)})`;
}

function updateStatus(message: string) {
  statusPill.textContent = message;
}

function renderActiveCard() {
  cardMap.forEach((button, projectId) => {
    button.classList.toggle("active", projectId === activeProjectId);
  });
}

function getRoomBasis(project: ProjectData) {
  const inward = BABYLON.Vector3.Zero().subtract(project.position).normalize();
  const right = new BABYLON.Vector3(inward.z, 0, -inward.x);
  const back = inward.scale(-1);
  const yaw = Math.atan2(inward.x, inward.z);
  return { inward, right, back, yaw };
}

function openProjectPanel(project: ProjectData) {
  projectHero.src = heroImage;
  projectHero.alt = `Visuel decoratif pour ${project.title}`;
  projectAccent.style.color = rgbString(project.color);
  projectAccent.style.background = `linear-gradient(90deg, rgba(255,255,255,0.08), ${rgbString(project.color)})`;

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
  updateStatus(`Focus: ${project.title}`);
}

function closeProjectPanel() {
  projectPanel.classList.add("hidden");
  heroPanel.classList.remove("hidden");
  closePanelBtn.classList.add("hidden");
  activeProjectId = null;
  renderActiveCard();
  updateStatus(
    isPointerLocked
      ? "Visite libre active"
      : "Clique dans la scene pour entrer en mode visite."
  );
}

closePanelBtn.addEventListener("click", closeProjectPanel);
window.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
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
          : isPointerLocked
            ? "Visite libre active"
            : "Clique dans la scene pour entrer en mode visite."
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
function createAlienRockCluster(
  scene: BABYLON.Scene,
  name: string,
  center: BABYLON.Vector3,
  color: BABYLON.Color3,
  count = 4
) {
  for (let index = 0; index < count; index += 1) {
    const rock = BABYLON.MeshBuilder.CreatePolyhedron(
      `${name}_${index}`,
      { type: index % 3 === 0 ? 1 : 2, size: 0.7 + Math.random() * 1.1 },
      scene
    );
    rock.position = center.add(
      new BABYLON.Vector3(
        (Math.random() - 0.5) * 2.6,
        0.24 + Math.random() * 0.7,
        (Math.random() - 0.5) * 2.4
      )
    );
    rock.rotation = new BABYLON.Vector3(
      Math.random() * Math.PI,
      Math.random() * Math.PI,
      Math.random() * Math.PI
    );
    rock.scaling = new BABYLON.Vector3(
      0.95 + Math.random() * 0.9,
      0.6 + Math.random() * 0.7,
      0.9 + Math.random() * 0.85
    );
    rock.isPickable = false;

    const rockMaterial = createMaterial(
      scene,
      `${name}_${index}_mat`,
      new BABYLON.Color3(0.31, 0.34, 0.37),
      color.scale(0.03)
    );
    rockMaterial.specularColor = new BABYLON.Color3(0.025, 0.03, 0.035);
    rock.material = rockMaterial;
  }
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
  const shellMaterial = createMaterial(
    scene,
    `${name}_shellMat`,
    new BABYLON.Color3(0.28, 0.31, 0.34),
    new BABYLON.Color3(0.008, 0.011, 0.016)
  );
  shellMaterial.specularColor = new BABYLON.Color3(0.09, 0.1, 0.12);
  shellMaterial.specularPower = 48;

  const trimMaterial = createMaterial(
    scene,
    `${name}_trimMat`,
    new BABYLON.Color3(0.42, 0.45, 0.48),
    new BABYLON.Color3(0.01, 0.012, 0.015)
  );

  const body = BABYLON.MeshBuilder.CreateBox(
    `${name}_body`,
    { width, depth, height },
    scene
  );
  body.position = position.add(new BABYLON.Vector3(0, height * 0.5, 0));
  body.rotation.y = yaw;
  body.isPickable = false;
  body.material = shellMaterial;

  const roof = BABYLON.MeshBuilder.CreateCylinder(
    `${name}_roof`,
    { diameter: depth + 0.2, height: width + 0.14, tessellation: 24 },
    scene
  );
  roof.position = position.add(new BABYLON.Vector3(0, height + 0.22, 0));
  roof.rotation.z = Math.PI / 2;
  roof.rotation.y = yaw;
  roof.scaling = new BABYLON.Vector3(1, 0.24, 1);
  roof.isPickable = false;
  roof.material = trimMaterial;

  const foundation = BABYLON.MeshBuilder.CreateBox(
    `${name}_foundation`,
    { width: width + 0.45, depth: depth + 0.4, height: 0.16 },
    scene
  );
  foundation.position = position.add(new BABYLON.Vector3(0, 0.08, 0));
  foundation.rotation.y = yaw;
  foundation.isPickable = false;
  foundation.material = createMaterial(
    scene,
    `${name}_foundationMat`,
    new BABYLON.Color3(0.16, 0.18, 0.21),
    new BABYLON.Color3(0.008, 0.01, 0.014)
  );

  const doorway = BABYLON.MeshBuilder.CreateBox(
    `${name}_doorway`,
    { width: width * 0.26, depth: 0.08, height: height * 0.62 },
    scene
  );
  doorway.position = position.add(new BABYLON.Vector3(0, height * 0.34, -depth * 0.5 + 0.05));
  doorway.rotation.y = yaw;
  doorway.isPickable = false;
  doorway.material = createMaterial(
    scene,
    `${name}_doorwayMat`,
    new BABYLON.Color3(0.09, 0.12, 0.14),
    new BABYLON.Color3(0.04, 0.06, 0.06)
  );

  for (const side of [-1, 1]) {
    const sidePanel = BABYLON.MeshBuilder.CreateBox(
      `${name}_sidePanel_${side}`,
      { width: 0.14, depth: depth * 0.88, height: height * 0.78 },
      scene
    );
    sidePanel.position = position.add(new BABYLON.Vector3((width * 0.5 - 0.09) * side, height * 0.43, 0));
    sidePanel.rotation.y = yaw;
    sidePanel.isPickable = false;
    sidePanel.material = trimMaterial;

    const canister = BABYLON.MeshBuilder.CreateCylinder(
      `${name}_canister_${side}`,
      { diameter: 0.32, height: height * 0.74, tessellation: 18 },
      scene
    );
    canister.position = position.add(new BABYLON.Vector3((width * 0.5 + 0.26) * side, height * 0.38, depth * 0.1));
    canister.rotation.y = yaw;
    canister.isPickable = false;
    canister.material = createMaterial(
      scene,
      `${name}_canisterMat_${side}`,
      new BABYLON.Color3(0.22, 0.24, 0.27),
      new BABYLON.Color3(0.01, 0.012, 0.015)
    );

    const pipe = BABYLON.MeshBuilder.CreateCylinder(
      `${name}_pipe_${side}`,
      { diameter: 0.08, height: depth * 0.64, tessellation: 10 },
      scene
    );
    pipe.position = position.add(new BABYLON.Vector3((width * 0.32) * side, height * 0.72, 0));
    pipe.rotation.z = Math.PI / 2;
    pipe.rotation.y = yaw;
    pipe.isPickable = false;
    pipe.material = trimMaterial;
  }

  const vent = BABYLON.MeshBuilder.CreateBox(
    `${name}_vent`,
    { width: width * 0.22, depth: 0.12, height: 0.14 },
    scene
  );
  vent.position = position.add(new BABYLON.Vector3(0, height * 0.58, depth * 0.5 + 0.02));
  vent.rotation.y = yaw;
  vent.isPickable = false;
  vent.material = trimMaterial;

  const topAntenna = BABYLON.MeshBuilder.CreateCylinder(
    `${name}_antenna`,
    { diameter: 0.06, height: 0.9, tessellation: 8 },
    scene
  );
  topAntenna.position = position.add(new BABYLON.Vector3(width * 0.22, height + 0.7, 0));
  topAntenna.isPickable = false;
  topAntenna.material = trimMaterial;
}

function createSlimeBlob(
  scene: BABYLON.Scene,
  name: string,
  center: BABYLON.Vector3,
  color: BABYLON.Color3,
  scale: BABYLON.Vector3
) {
  const blob = BABYLON.MeshBuilder.CreateSphere(
    name,
    { diameter: 1.1, segments: 20 },
    scene
  );
  blob.position = center;
  blob.scaling = scale;
  blob.isPickable = false;
  blob.metadata = { assetType: "slimeBlob", baseY: center.y, scaleY: scale.y };

  const blobMaterial = createMaterial(
    scene,
    `${name}_mat`,
    new BABYLON.Color3(0.04, 0.08, 0.08),
    color.scale(0.62),
    0.92
  );
  blobMaterial.specularColor = new BABYLON.Color3(0.92, 0.96, 1);
  blobMaterial.specularPower = 164;
  blob.material = blobMaterial;

  const shell = BABYLON.MeshBuilder.CreateSphere(
    `${name}_shell`,
    { diameter: 1.22, segments: 18 },
    scene
  );
  shell.position = center.add(new BABYLON.Vector3(0, 0.04, 0));
  shell.scaling = scale.multiply(new BABYLON.Vector3(1.02, 0.96, 1.02));
  shell.isPickable = false;
  shell.metadata = { assetType: "slimeShell", target: name };
  shell.material = createMaterial(
    scene,
    `${name}_shellMat`,
    color.scale(0.08),
    color.scale(0.78),
    0.34
  );

  const puddle = BABYLON.MeshBuilder.CreateDisc(
    `${name}_puddle`,
    { radius: 1.1, tessellation: 40 },
    scene
  );
  puddle.position = center.add(new BABYLON.Vector3(0, -scale.y * 0.42, 0));
  puddle.rotation.x = Math.PI / 2;
  puddle.isPickable = false;
  puddle.metadata = { assetType: "slimePuddle", baseScale: 1 };
  puddle.material = createMaterial(
    scene,
    `${name}_puddleMat`,
    color.scale(0.14),
    color.scale(0.82),
    0.72
  );
}

function createSlimeInfestation(
  scene: BABYLON.Scene,
  name: string,
  center: BABYLON.Vector3,
  color: BABYLON.Color3,
  radius: number,
  blobCount: number
) {
  for (let index = 0; index < blobCount; index += 1) {
    const angle = (index / Math.max(blobCount, 1)) * Math.PI * 2 + Math.random() * 0.35;
    const distance = radius * (0.25 + Math.random() * 0.9);
    const blobColor = color.scale(0.88 + Math.random() * 0.22);
    createSlimeBlob(
      scene,
      `${name}_blob_${index}`,
      center.add(new BABYLON.Vector3(Math.cos(angle) * distance, 0.16 + Math.random() * 0.18, Math.sin(angle) * distance)),
      blobColor,
      new BABYLON.Vector3(
        0.3 + Math.random() * 0.55,
        0.14 + Math.random() * 0.22,
        0.36 + Math.random() * 0.72
      )
    );
  }

  for (let index = 0; index < 4; index += 1) {
    const stain = BABYLON.MeshBuilder.CreateDisc(
      `${name}_stain_${index}`,
      { radius: 0.9 + Math.random() * 0.55, tessellation: 40 },
      scene
    );
    stain.position = center.add(
      new BABYLON.Vector3(
        (Math.random() - 0.5) * radius * 1.7,
        0.075,
        (Math.random() - 0.5) * radius * 1.7
      )
    );
    stain.rotation.x = Math.PI / 2;
    stain.rotation.z = Math.random() * Math.PI;
    stain.scaling = new BABYLON.Vector3(0.7 + Math.random() * 1.5, 0.45 + Math.random() * 0.9, 1);
    stain.isPickable = false;
    stain.metadata = { assetType: "slimePuddle", baseScale: stain.scaling.x };
    stain.material = createMaterial(
      scene,
      `${name}_stainMat_${index}`,
      color.scale(0.08),
      color.scale(0.22),
      0.44
    );
  }
}

function createVideoTerminal(
  scene: BABYLON.Scene,
  name: string,
  position: BABYLON.Vector3,
  yaw: number,
  color: BABYLON.Color3
) {
  const frameMat = createMaterial(
    scene,
    `${name}_frameMat`,
    new BABYLON.Color3(0.18, 0.2, 0.23),
    new BABYLON.Color3(0.008, 0.01, 0.014)
  );
  const screenMat = createMaterial(
    scene,
    `${name}_screenMat`,
    new BABYLON.Color3(0.07, 0.11, 0.12),
    color.scale(0.22)
  );

  const base = BABYLON.MeshBuilder.CreateBox(
    `${name}_base`,
    { width: 2.2, height: 0.16, depth: 1.1 },
    scene
  );
  base.position = position.add(new BABYLON.Vector3(0, 0.08, 0));
  base.rotation.y = yaw;
  base.isPickable = false;
  base.material = frameMat;

  const mast = BABYLON.MeshBuilder.CreateBox(
    `${name}_mast`,
    { width: 0.22, height: 1.7, depth: 0.18 },
    scene
  );
  mast.position = position.add(new BABYLON.Vector3(0, 0.95, 0.18));
  mast.rotation.y = yaw;
  mast.isPickable = false;
  mast.material = frameMat;

  const screen = BABYLON.MeshBuilder.CreateBox(
    `${name}_screen`,
    { width: 2.1, height: 1.2, depth: 0.08 },
    scene
  );
  screen.position = position.add(new BABYLON.Vector3(0, 1.72, -0.06));
  screen.rotation.y = yaw;
  screen.rotation.x = -0.06;
  screen.isPickable = false;
  screen.material = screenMat;

  const hood = BABYLON.MeshBuilder.CreateBox(
    `${name}_hood`,
    { width: 2.28, height: 0.14, depth: 0.42 },
    scene
  );
  hood.position = position.add(new BABYLON.Vector3(0, 2.34, -0.14));
  hood.rotation.y = yaw;
  hood.isPickable = false;
  hood.material = frameMat;

  const console = BABYLON.MeshBuilder.CreateBox(
    `${name}_console`,
    { width: 1.5, height: 0.16, depth: 0.72 },
    scene
  );
  console.position = position.add(new BABYLON.Vector3(0, 0.92, -0.42));
  console.rotation.y = yaw;
  console.rotation.x = -0.32;
  console.isPickable = false;
  console.material = frameMat;

  const controlStrip = BABYLON.MeshBuilder.CreateBox(
    `${name}_controls`,
    { width: 1.16, height: 0.04, depth: 0.14 },
    scene
  );
  controlStrip.position = position.add(new BABYLON.Vector3(0, 0.98, -0.64));
  controlStrip.rotation.y = yaw;
  controlStrip.rotation.x = -0.32;
  controlStrip.isPickable = false;
  controlStrip.material = createMaterial(
    scene,
    `${name}_controlsMat`,
    new BABYLON.Color3(0.12, 0.16, 0.16),
    color.scale(0.18)
  );
}

function createSciFiPod(
  scene: BABYLON.Scene,
  name: string,
  position: BABYLON.Vector3,
  yaw: number,
  color: BABYLON.Color3
) {
  const shellMat = createMaterial(
    scene,
    `${name}_bodyMat`,
    new BABYLON.Color3(0.46, 0.5, 0.55),
    color.scale(0.04)
  );
  const trimMat = createMaterial(
    scene,
    `${name}_trimMat`,
    new BABYLON.Color3(0.25, 0.28, 0.31),
    new BABYLON.Color3(0.008, 0.01, 0.014)
  );

  const body = BABYLON.MeshBuilder.CreateCylinder(
    `${name}_body`,
    { diameter: 1.2, height: 2.9, tessellation: 28 },
    scene
  );
  body.position = position.add(new BABYLON.Vector3(0, 1.45, 0));
  body.rotation.y = yaw;
  body.isPickable = false;
  body.material = shellMat;

  const cap = BABYLON.MeshBuilder.CreateSphere(
    `${name}_cap`,
    { diameter: 1.24, segments: 18 },
    scene
  );
  cap.position = position.add(new BABYLON.Vector3(0, 2.84, 0));
  cap.scaling = new BABYLON.Vector3(1, 0.58, 1);
  cap.isPickable = false;
  cap.material = createMaterial(
    scene,
    `${name}_capMat`,
    new BABYLON.Color3(0.68, 0.72, 0.78),
    color.scale(0.08)
  );

  const core = BABYLON.MeshBuilder.CreateCylinder(
    `${name}_core`,
    { diameter: 0.26, height: 2.15, tessellation: 16 },
    scene
  );
  core.position = position.add(new BABYLON.Vector3(0, 1.45, 0));
  core.isPickable = false;
  core.metadata = { assetType: "podCore", baseY: 1.45 };
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
      { width: 0.12, height: 2.2, depth: 0.12 },
      scene
    );
    brace.position = position.add(new BABYLON.Vector3(offset, 1.02, 0));
    brace.rotation.y = yaw + offset * 0.08;
    brace.rotation.z = -offset * 0.22;
    brace.isPickable = false;
    brace.material = trimMat;
  }

  const baseRing = BABYLON.MeshBuilder.CreateTorus(
    `${name}_baseRing`,
    { diameter: 1.6, thickness: 0.1, tessellation: 42 },
    scene
  );
  baseRing.position = position.add(new BABYLON.Vector3(0, 0.18, 0));
  baseRing.rotation.x = Math.PI / 2;
  baseRing.isPickable = false;
  baseRing.material = trimMat;

  const ring = BABYLON.MeshBuilder.CreateTorus(
    `${name}_ring`,
    { diameter: 1.42, thickness: 0.06, tessellation: 32 },
    scene
  );
  ring.position = position.add(new BABYLON.Vector3(0, 1.95, 0));
  ring.rotation.x = Math.PI / 2;
  ring.rotation.y = yaw;
  ring.isPickable = false;
  ring.metadata = { assetType: "podRing" };
  ring.material = createMaterial(
    scene,
    `${name}_ringMat`,
    new BABYLON.Color3(0.4, 0.46, 0.53),
    color.scale(0.18)
  );
}
function addRoomTheme(scene: BABYLON.Scene, project: ProjectData) {
  const { inward, right, back, yaw } = getRoomBasis(project);
  const front = project.position.add(inward.scale(2.4));
  const rear = project.position.add(back.scale(2.9));

  if (project.id === "survivorSlime") {
    createAlienRockCluster(scene, `${project.id}_rocksLeft`, rear.add(right.scale(-6.6)).add(new BABYLON.Vector3(0, 0, 1.4)), project.color, 10);
    createAlienRockCluster(scene, `${project.id}_rocksRight`, rear.add(right.scale(6.8)).add(new BABYLON.Vector3(0, 0, 1.1)), project.color, 11);
    createAlienRockCluster(scene, `${project.id}_rocksRear`, rear.add(new BABYLON.Vector3(0, 0, 6.4)), project.color, 12);

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
    servicePad.isPickable = false;
    servicePad.material = createMaterial(
      scene,
      `${project.id}_servicePadMat`,
      new BABYLON.Color3(0.17, 0.19, 0.22),
      new BABYLON.Color3(0.008, 0.01, 0.014)
    );

    const relay = BABYLON.MeshBuilder.CreateCylinder(
      `${project.id}_relay`,
      { diameter: 0.14, height: 3.2, tessellation: 12 },
      scene
    );
    relay.position = rear.add(right.scale(5.8)).add(new BABYLON.Vector3(0, 1.6, 3.8));
    relay.isPickable = false;
    relay.material = createMaterial(
      scene,
      `${project.id}_relayMat`,
      new BABYLON.Color3(0.28, 0.31, 0.35),
      new BABYLON.Color3(0.01, 0.015, 0.02)
    );

    const relayDish = BABYLON.MeshBuilder.CreateSphere(
      `${project.id}_relayDish`,
      { diameter: 0.42, segments: 12 },
      scene
    );
    relayDish.position = relay.position.add(new BABYLON.Vector3(0, 1.34, 0));
    relayDish.scaling = new BABYLON.Vector3(1.1, 0.42, 1.1);
    relayDish.rotation.x = Math.PI / 5;
    relayDish.isPickable = false;
    relayDish.material = createMaterial(
      scene,
      `${project.id}_relayDishMat`,
      new BABYLON.Color3(0.48, 0.51, 0.55),
      new BABYLON.Color3(0.012, 0.014, 0.018)
    );

    createSciFiPod(scene, `${project.id}_podA`, rear.add(right.scale(2.9)).add(new BABYLON.Vector3(0, 0, 2.7)), yaw - Math.PI * 0.03, new BABYLON.Color3(0.08, 0.18, 0.16));
    createSciFiPod(scene, `${project.id}_podB`, rear.add(right.scale(-2.7)).add(new BABYLON.Vector3(0, 0, 3.4)), yaw + Math.PI * 0.05, new BABYLON.Color3(0.1, 0.22, 0.14));

    createSlimeInfestation(scene, `${project.id}_nest_front`, project.position.add(new BABYLON.Vector3(1.6, 0, 1.5)), new BABYLON.Color3(0.18, 0.74, 0.34), 1.8, 7);
    createSlimeInfestation(scene, `${project.id}_nest_left`, project.position.add(new BABYLON.Vector3(-2.3, 0, 2.5)), new BABYLON.Color3(0.15, 0.66, 0.46), 1.5, 6);
    createSlimeInfestation(scene, `${project.id}_nest_right`, rear.add(right.scale(2.3)).add(new BABYLON.Vector3(0, 0, 2.1)), new BABYLON.Color3(0.42, 0.76, 0.22), 1.4, 5);
    createSlimeInfestation(scene, `${project.id}_nest_outpost`, rear.add(right.scale(-1.2)).add(new BABYLON.Vector3(0, 0, 3.4)), new BABYLON.Color3(0.16, 0.72, 0.4), 2.2, 8);
    createSlimeInfestation(scene, `${project.id}_nest_relay`, rear.add(right.scale(4.2)).add(new BABYLON.Vector3(0, 0, 3.1)), new BABYLON.Color3(0.34, 0.78, 0.26), 1.8, 6);

    createSlimeBlob(
      scene,
      `${project.id}_alphaBlob`,
      rear.add(right.scale(0.9)).add(new BABYLON.Vector3(0, 0.36, 2.7)),
      new BABYLON.Color3(0.26, 0.84, 0.3),
      new BABYLON.Vector3(1.1, 0.42, 1.24)
    );

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
function createDesertTerrain(scene: BABYLON.Scene, project: ProjectData) {
  const collisionGround = BABYLON.MeshBuilder.CreateGround(
    `${project.id}_terrainCollision`,
    { width: 32, height: 32, subdivisions: 2 },
    scene
  );
  collisionGround.position = project.position.add(new BABYLON.Vector3(0, 0.01, 0));
  collisionGround.rotation.y = getRoomBasis(project).yaw;
  collisionGround.checkCollisions = true;
  collisionGround.isVisible = false;
  collisionGround.isPickable = false;

  const terrain = BABYLON.MeshBuilder.CreateGround(
    `${project.id}_terrain`,
    { width: 30, height: 30, subdivisions: 72 },
    scene
  );
  terrain.position = project.position.add(new BABYLON.Vector3(0, 0.06, 0));
  terrain.rotation.y = getRoomBasis(project).yaw;
  terrain.isPickable = false;

  const positions = terrain.getVerticesData(BABYLON.VertexBuffer.PositionKind);
  const indices = terrain.getIndices();
  const normals = terrain.getVerticesData(BABYLON.VertexBuffer.NormalKind);
  if (positions && indices && normals) {
    for (let index = 0; index < positions.length; index += 3) {
      const x = positions[index];
      const z = positions[index + 2];
      const dist = Math.sqrt(x * x + z * z);
      const duneA = Math.sin(x * 0.18) * 0.12;
      const duneB = Math.cos(z * 0.16) * 0.1;
      const ripple = Math.sin((x + z) * 0.28) * 0.06;
      const basin = Math.max(0, 1 - dist / 9.5) * -0.14;
      const rim = Math.max(0, (dist - 9.5) / 5.2) * 0.18;
      positions[index + 1] = duneA + duneB + ripple + basin + rim;
    }

    terrain.updateVerticesData(BABYLON.VertexBuffer.PositionKind, positions);
    BABYLON.VertexData.ComputeNormals(positions, indices, normals);
    terrain.updateVerticesData(BABYLON.VertexBuffer.NormalKind, normals);
  }

  const terrainMaterial = createMaterial(
    scene,
    `${project.id}_terrainMat`,
    new BABYLON.Color3(0.14, 0.15, 0.18),
    new BABYLON.Color3(0.006, 0.009, 0.014)
  );
  terrainMaterial.specularColor = new BABYLON.Color3(0.012, 0.014, 0.018);
  terrainMaterial.specularPower = 18;
  terrain.material = terrainMaterial;

  return terrain;
}
function createProjectRoom(scene: BABYLON.Scene, project: ProjectData) {
  const { back, right, inward, yaw } = getRoomBasis(project);
  const isSlime = project.id === "survivorSlime";

  if (isSlime) {
    createDesertTerrain(scene, project);

    createAlienRockCluster(scene, `${project.id}_horizonLeft`, project.position.add(back.scale(11.6)).add(right.scale(-9.2)).add(new BABYLON.Vector3(0, 0.2, 4.8)), project.color, 18);
    createAlienRockCluster(scene, `${project.id}_horizonCenter`, project.position.add(back.scale(13.4)).add(new BABYLON.Vector3(0, 0.2, 7.2)), project.color, 22);
    createAlienRockCluster(scene, `${project.id}_horizonRight`, project.position.add(back.scale(11.8)).add(right.scale(9.6)).add(new BABYLON.Vector3(0, 0.2, 4.5)), project.color, 18);

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
  root: BABYLON.TransformNode
) {
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

  const label = BABYLON.MeshBuilder.CreatePlane(
    `${project.id}_label`,
    { width: 4.6, height: 1.15 },
    scene
  );
  label.parent = root;
  label.position = new BABYLON.Vector3(0, 3.7, -1.8);
  label.rotation.y = Math.PI;
  label.material = labelMaterial;
  label.isPickable = false;
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
    mesh.metadata = { projectId: project.id };
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

function createScene() {
  const scene = new BABYLON.Scene(engine);

  scene.clearColor = new BABYLON.Color4(0.33, 0.36, 0.42, 1);
  scene.ambientColor = new BABYLON.Color3(0.16, 0.18, 0.22);
  scene.fogMode = BABYLON.Scene.FOGMODE_EXP;
  scene.fogDensity = 0.026;
  scene.fogColor = new BABYLON.Color3(0.4, 0.43, 0.48);
  scene.collisionsEnabled = true;
  scene.gravity = new BABYLON.Vector3(0, -0.12, 0);

  const glow = new BABYLON.GlowLayer("glow", scene);
  glow.intensity = 0.08;

  const camera = new BABYLON.UniversalCamera("playerCamera", START_POSITION.clone(), scene);
  camera.attachControl(canvas, true);
  camera.speed = 0.22;
  camera.inertia = 0.72;
  camera.angularSensibility = 4000;
  camera.minZ = 0.1;
  camera.applyGravity = true;
  camera.checkCollisions = true;
  camera.ellipsoid = new BABYLON.Vector3(0.55, 0.95, 0.55);
  camera.ellipsoidOffset = new BABYLON.Vector3(0, 0.95, 0);
  camera.keysUp = [90, 87];
  camera.keysDown = [83];
  camera.keysLeft = [81, 65];
  camera.keysRight = [68];
  playerCamera = camera;

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

  const centralRing = BABYLON.MeshBuilder.CreateTorus(
    "centralRing",
    { diameter: 5.5, thickness: 0.08, tessellation: 96 },
    scene
  );
  centralRing.position.y = 0.08;
  centralRing.rotation.x = Math.PI / 2;
  centralRing.isPickable = false;
  centralRing.material = createMaterial(
    scene,
    "centralRingMat",
    new BABYLON.Color3(0.07, 0.09, 0.14),
    new BABYLON.Color3(0.08, 0.18, 0.34)
  );

  const coreOrb = BABYLON.MeshBuilder.CreateSphere(
    "coreOrb",
    { diameter: 0.75, segments: 24 },
    scene
  );
  coreOrb.position.y = 1.25;
  coreOrb.isPickable = false;
  coreOrb.material = createMaterial(
    scene,
    "coreOrbMat",
    new BABYLON.Color3(0.8, 0.9, 1.0),
    new BABYLON.Color3(0.28, 0.48, 0.95)
  );

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

  createColumn(scene, -23, -23);
  createColumn(scene, 23, -23);
  createColumn(scene, -23, 23);
  createColumn(scene, 23, 23);

  createBounds(scene);

  projects.forEach((project) => {
    createProjectRoom(scene, project);
    standMap.set(project.id, createProjectStand(scene, project));
  });

  const particles = createFloatingParticles(scene);

  const rainLines: BABYLON.InstancedMesh[] = [];
  const rainSource = BABYLON.MeshBuilder.CreateCylinder(
    "rainSource",
    { diameter: 0.02, height: 0.9, tessellation: 6 },
    scene
  );
  rainSource.isVisible = false;
  rainSource.isPickable = false;
  rainSource.material = createMaterial(
    scene,
    "rainSourceMat",
    new BABYLON.Color3(0.72, 0.76, 0.82),
    new BABYLON.Color3(0.04, 0.04, 0.05),
    0.18
  );

  for (let index = 0; index < 90; index += 1) {
    const rain = rainSource.createInstance(`rain_${index}`);
    rain.position = new BABYLON.Vector3(
      -15 + Math.random() * 10,
      2.8 + Math.random() * 6,
      -15 + Math.random() * 10
    );
    rain.rotation.z = 0.22;
    rain.isPickable = false;
    rain.metadata = { assetType: "rainLine", minY: -0.2, maxY: 8.5, speed: 0.18 + Math.random() * 0.14 };
    rainLines.push(rain);
  }

  function setHoveredProject(projectId: string | null) {
    hoveredProjectId = projectId;

    if (projectId) {
      const project = projects.find((entry) => entry.id === projectId);
      if (project) {
        updateStatus(`Vise ${project.title} - appuie sur E pour ouvrir`);
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

    updateStatus(
      isPointerLocked
        ? "Visite libre active"
        : "Clique dans la scene pour entrer en mode visite."
    );
  }

  focusProject = (projectId: string, shouldOpenPanel: boolean) => {
    const project = projects.find((entry) => entry.id === projectId);
    if (!project || !playerCamera) return;

    activeProjectId = projectId;
    playerCamera.position.copyFrom(project.viewPosition);
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
    }
  });

  document.addEventListener("pointerlockchange", () => {
    isPointerLocked = document.pointerLockElement === canvas;
    setHoveredProject(hoveredProjectId);
  });

  window.addEventListener("keydown", (event) => {
    if (event.key.toLowerCase() !== "e") {
      return;
    }

    if (hoveredProjectId) {
      focusProject(hoveredProjectId, true);
    }
  });

  scene.onPointerObservable.add((pointerInfo) => {
    if (pointerInfo.type !== BABYLON.PointerEventTypes.POINTERPICK) {
      return;
    }

    const pick = scene.pick(scene.pointerX, scene.pointerY);
    const projectId = pick?.hit ? pick.pickedMesh?.metadata?.projectId ?? null : null;
    if (projectId) {
      focusProject(projectId, true);
    }
  });

  scene.registerBeforeRender(() => {
    const time = performance.now() * 0.001;

    const forwardPick = scene.pickWithRay(
      camera.getForwardRay(INTERACTION_DISTANCE),
      (mesh) => Boolean(mesh.metadata?.projectId)
    );
    const projectId = forwardPick?.hit
      ? forwardPick.pickedMesh?.metadata?.projectId ?? null
      : null;
    setHoveredProject(projectId);

    pointLight.position.x = Math.sin(time * 0.45) * 1.2;
    pointLight.position.z = Math.cos(time * 0.45) * 1.2;
    coreOrb.position.y = 1.25 + Math.sin(time * 1.8) * 0.12;
    centralRing.rotation.z += 0.0015;

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
        mesh.position.y = mesh.metadata.baseY + Math.sin(time * 2.3 + mesh.position.x) * 0.08;
        mesh.scaling.y = mesh.metadata.scaleY + Math.sin(time * 2.7 + mesh.position.z) * 0.05;
      }

      if (mesh.metadata?.assetType === "slimePuddle") {
        const pulse = 1 + Math.sin(time * 1.9 + mesh.position.x) * 0.08;
        mesh.scaling.x = pulse;
        mesh.scaling.y = pulse * 0.96;
        if (mesh.material instanceof BABYLON.StandardMaterial) {
          mesh.material.alpha = 0.24 + Math.sin(time * 2.2 + mesh.position.z) * 0.06;
        }
      }

      if (mesh.metadata?.assetType === "podCore") {
        const parentNode = mesh.parent as BABYLON.TransformNode | null;
        mesh.position.y = parentNode ? parentNode.position.y + 0.05 : mesh.position.y;
        if (mesh.material instanceof BABYLON.StandardMaterial) {
          mesh.material.emissiveColor = new BABYLON.Color3(0.18, 0.95, 0.82).scale(0.18 + Math.sin(time * 2.4 + mesh.position.x) * 0.05);
        }
      }

      if (mesh.metadata?.assetType === "podRing") {
        mesh.rotation.y += 0.01;
      }
    });

    rainLines.forEach((rain) => {
      rain.position.y -= rain.metadata.speed;
      rain.position.x -= 0.018;
      if (rain.position.y < rain.metadata.minY) {
        rain.position.y = rain.metadata.maxY;
        rain.position.x = -15 + Math.random() * 10;
        rain.position.z = -15 + Math.random() * 10;
      }
    });

    particles.forEach((particle) => {
      particle.mesh.position.y =
        particle.baseY + Math.sin(time * particle.speed + particle.offset) * 0.16;
    });
  });

  createProjectCards();
  lookAtTarget(camera, new BABYLON.Vector3(0, PLAYER_HEIGHT, -18));
  updateStatus("Clique dans la scene pour entrer en mode visite.");

  return scene;
}

const scene = createScene();

engine.runRenderLoop(() => {
  scene.render();
});

window.addEventListener("resize", () => {
  engine.resize();
});

























