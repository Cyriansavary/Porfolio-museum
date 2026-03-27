import type * as BABYLON from "babylonjs";

export type ProjectData = {
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

export type CreatedStand = {
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

export type FloatingParticle = {
  mesh: BABYLON.InstancedMesh;
  baseY: number;
  offset: number;
  speed: number;
};

export type PlayerController = {
  update: () => void;
  syncPosition: (position: BABYLON.Vector3) => void;
  resetInput: () => void;
};

export type CollisionCamera = BABYLON.UniversalCamera & {
  _collideWithWorld: (displacement: BABYLON.Vector3) => void;
};

export type RockTextureSet = {
  albedoTexture: BABYLON.DynamicTexture;
  normalTexture: BABYLON.DynamicTexture;
  roughnessTexture: BABYLON.DynamicTexture;
};

export type SlimeRainDropMetadata = {
  assetType: "slimeRainLine";
  minY: number;
  speed: number;
  wind: BABYLON.Vector3;
};

export type SlimeRainSystem = {
  lines: BABYLON.InstancedMesh[];
  respawnLine: (line: BABYLON.InstancedMesh) => void;
};

export type ProjectInteractionMode = "focus" | "panel";

export type ProjectInteractionMetadata = {
  projectId: string;
  interactionMode?: ProjectInteractionMode;
  interactionDistance?: number;
};

export type SlimeEnemyState = "falling" | "chasing";

export type SlimeEnemy = {
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

export type SlimeShotResult = {
  targetPoint: BABYLON.Vector3;
  hit: boolean;
  scoreDelta: number;
  totalScore: number;
};

export type CombatCrosshairState = {
  armed: boolean;
  targeting: boolean;
  coolingDown: boolean;
  firing: boolean;
  hit: boolean;
};

export type SlimeEnemySystem = {
  update: () => void;
  disposeAll: () => void;
  shoot: (origin: BABYLON.Vector3, direction: BABYLON.Vector3) => SlimeShotResult;
  isPlayerInsideArena: () => boolean;
  getScore: () => number;
  getEnemyCount: () => number;
  isLocked: () => boolean;
  getPlayerHitCount: () => number;
};

export type SlimeWeaponSystem = {
  update: () => void;
  tryShoot: () => SlimeShotResult | null;
  isArmed: () => boolean;
  getCrosshairState: () => CombatCrosshairState;
  dispose: () => void;
};

export type VRCookingOrderType =
  | "classic"
  | "cheese"
  | "salad"
  | "tomato"
  | "cheeseTomato"
  | "cheeseSalad"
  | "fresh"
  | "deluxe";

export type VRCookingInventory = {
  bun: boolean;
  rawSteak: boolean;
  cookedSteak: boolean;
  cheese: boolean;
  lettuce: boolean;
  tomato: boolean;
  burger: VRCookingOrderType | null;
};

export type VRCookingStationType =
  | "bunBin"
  | "steakBin"
  | "cheeseBin"
  | "saladBin"
  | "tomatoBin"
  | "grill"
  | "prep"
  | "serve"
  | "trash";

export type VRCookingOrder = {
  id: number;
  type: VRCookingOrderType;
  title: string;
  ingredients: string[];
  reward: number;
  timeLimitMs: number;
  remainingMs: number;
};

export type CookingPopupTone = "neutral" | "success" | "warning" | "error";

export type VRCookingStation = {
  id: VRCookingStationType;
  interactionMesh: BABYLON.AbstractMesh;
  meshes: BABYLON.AbstractMesh[];
  emissiveColor: BABYLON.Color3;
};

export type VRCookingSystem = {
  update: () => void;
  interact: () => boolean;
  isPlayerInsideZone: () => boolean;
  isLocked: () => boolean;
  getFailureCount: () => number;
};

export type DrivingInteractionId = "car";

export type DrivingInteractableMetadata = {
  drivingInteractableId?: DrivingInteractionId;
};

export type DrivingSimSystem = {
  update: () => void;
  interact: (allowExit?: boolean) => boolean;
  isPlayerInsideZone: () => boolean;
  isDriving: () => boolean;
  getSpeedKph: () => number;
};

export type LeaderboardCategory = "slime" | "cooking";

export type LeaderboardEntry = {
  id: string;
  name: string;
  totalScore: number;
  slimeScore: number;
  cookingScore: number;
  lastPlayedAt: number;
};

export type AppLanguage = "fr" | "en";

export type ProjectTextContent = {
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
};
