import * as BABYLON from "babylonjs";
import "./style.css";
import {
  CURRENT_TESTER_STORAGE_KEY,
  DRIVING_RACE_SEGMENT_TIME,
  DRIVING_ZONE_DEPTH,
  DRIVING_ZONE_WIDTH,
  GROUND_CONTACT_EPSILON,
  GROUND_RAY_CAST_LENGTH,
  GROUND_STICK_FORCE,
  HEAD_BOB_AMPLITUDE,
  HEAD_BOB_SPRINT_FREQUENCY,
  HEAD_SWAY_AMPLITUDE,
  HEAD_BOB_WALK_FREQUENCY,
  INTERACTION_DISTANCE,
  JUMP_ASCENT_GRAVITY,
  JUMP_BUFFER_TIME,
  JUMP_DESCENT_GRAVITY,
  JUMP_FORCE,
  JUMP_RELEASE_GRAVITY,
  LANGUAGE_STORAGE_KEY,
  LANDING_IMPACT_SCALE,
  LANDING_MAX_IMPULSE,
  LANDING_SPRING_DAMPING,
  LANDING_SPRING_STRENGTH,
  LEADERBOARD_STORAGE_KEY,
  MAX_FALL_SPEED,
  PANEL_INTERACTION_DISTANCE,
  PLAYER_HEIGHT,
  SLIME_PLAYER_HIT_LIMIT,
  SLIME_TERRAIN_Y_OFFSET,
  SPRINT_FOV_BOOST,
  SPRINT_SPEED,
  START_POSITION,
  WALK_FOV,
  WALK_SPEED,
  WORLD_SIZE,
  COYOTE_TIME,
  CAMERA_ROLL_INTENSITY,
} from "./core/constants";
import type {
  AppLanguage,
  CollisionCamera,
  CookingPopupTone,
  CreatedStand,
  DrivingSimSystem,
  FloatingParticle,
  LeaderboardCategory,
  LeaderboardEntry,
  PlayerController,
  ProjectData,
  ProjectInteractionMetadata,
  ProjectInteractionMode,
  RockTextureSet,
  SlimeEnemySystem,
  SlimeRainDropMetadata,
  SlimeRainSystem,
  SlimeWeaponSystem,
  VRCookingSystem,
} from "./core/types";
import { projects, projectTextByLanguage } from "./content/projects";
import { isEditableTarget } from "./core/dom-utils";
import {
  createColumn,
  createDecorColumn,
  createDecorScreen,
  createKitchenCounterModule,
  createKitchenTallUnit,
  createMaterial,
  createPathLight,
  enableCollisions,
} from "./scene/builders";
import { lookAtTarget } from "./scene/camera-utils";
import {
  createProjectLabel as createProjectLabelModule,
  createProjectStand as createProjectStandModule,
} from "./scene/project-signage";
import { getRoomBasis } from "./scene/room-basis";
import { createZoneLockBarrier as createZoneLockBarrierModule } from "./scene/zone-lock-barrier";
import {
  createDrivingSimSystem as createDrivingSimSystemModule,
  getDrivingRoadRects,
} from "./zones/driving-system";
import {
  createSlimeEnemySystem as createSlimeEnemySystemModule,
  createSlimeRainSystem as createSlimeRainSystemModule,
  createSlimeWeaponSystem as createSlimeWeaponSystemModule,
} from "./zones/slime-system";
import {
  applyWetLookToSlimeZone as applyWetLookToSlimeZoneModule,
  createDesertTerrain as createDesertTerrainModule,
} from "./zones/slime-zone";
import { createVrCookingZone } from "./zones/vr-cooking-zone";
import { createVRCookingSystem as createVRCookingSystemModule } from "./zones/vr-cooking-system";
import { uiText } from "./content/ui-text";

const canvas = document.getElementById("renderCanvas") as HTMLCanvasElement;
const engine = new BABYLON.Engine(canvas, true, {
  preserveDrawingBuffer: true,
  stencil: true,
});

const projectRail = document.getElementById("projectRail") as HTMLDivElement;
const languageToggle = document.getElementById("languageToggle") as HTMLButtonElement;
const brandEyebrow = document.getElementById("brandEyebrow") as HTMLParagraphElement;
const introCopy = document.getElementById("introCopy") as HTMLParagraphElement;
const heroPanel = document.getElementById("heroPanel") as HTMLDivElement;
const heroEyebrow = document.getElementById("heroEyebrow") as HTMLParagraphElement;
const heroTitle = document.getElementById("heroTitle") as HTMLHeadingElement;
const heroBody = document.getElementById("heroBody") as HTMLParagraphElement;
const combatHud = document.getElementById("combatHud") as HTMLDivElement;
const combatEyebrow = document.getElementById("combatEyebrow") as HTMLParagraphElement;
const combatTitle = document.getElementById("combatTitle") as HTMLSpanElement;
const projectPanel = document.getElementById("projectPanel") as HTMLDivElement;
const projectPanelBody = projectPanel.querySelector(".panel-body") as HTMLDivElement;
const closePanelBtn = document.getElementById("closePanel") as HTMLButtonElement;
const overviewTrigger = document.getElementById("overviewTrigger") as HTMLButtonElement;
const leaderboardTrigger = document.getElementById("leaderboardTrigger") as HTMLButtonElement;
const projectsOverview = document.getElementById("projectsOverview") as HTMLDivElement;
const closeOverviewBtn = document.getElementById("closeOverview") as HTMLButtonElement;
const overviewEyebrow = document.getElementById("overviewEyebrow") as HTMLParagraphElement;
const overviewTitle = document.getElementById("overviewTitle") as HTMLHeadingElement;
const overviewBody = document.getElementById("overviewBody") as HTMLParagraphElement;
const overviewList = document.getElementById("overviewList") as HTMLDivElement;
const leaderboardPanel = document.getElementById("leaderboardPanel") as HTMLDivElement;
const closeLeaderboardBtn = document.getElementById("closeLeaderboard") as HTMLButtonElement;
const leaderboardEyebrow = document.getElementById("leaderboardEyebrow") as HTMLParagraphElement;
const leaderboardTitle = document.getElementById("leaderboardTitle") as HTMLHeadingElement;
const leaderboardBody = document.getElementById("leaderboardBody") as HTMLParagraphElement;
const leaderboardCurrentEyebrow = document.getElementById(
  "leaderboardCurrentEyebrow"
) as HTMLParagraphElement;
const leaderboardCurrentName = document.getElementById(
  "leaderboardCurrentName"
) as HTMLSpanElement;
const leaderboardCurrentTotal = document.getElementById(
  "leaderboardCurrentTotal"
) as HTMLSpanElement;
const testerNameLabel = document.getElementById("testerNameLabel") as HTMLLabelElement;
const testerNameInput = document.getElementById("testerNameInput") as HTMLInputElement;
const saveTesterBtn = document.getElementById("saveTesterBtn") as HTMLButtonElement;
const leaderboardHint = document.getElementById("leaderboardHint") as HTMLParagraphElement;
const leaderboardListEyebrow = document.getElementById(
  "leaderboardListEyebrow"
) as HTMLParagraphElement;
const leaderboardList = document.getElementById("leaderboardList") as HTMLDivElement;
const testerSummary = document.getElementById("testerSummary") as HTMLDivElement;
const crosshair = document.getElementById("crosshair") as HTMLDivElement;
const statusPill = document.getElementById("statusPill") as HTMLDivElement;
const combatScore = document.getElementById("combatScore") as HTMLSpanElement;
const combatStatus = document.getElementById("combatStatus") as HTMLParagraphElement;
const combatPopup = document.getElementById("combatPopup") as HTMLDivElement;
const cookingHud = document.getElementById("cookingHud") as HTMLDivElement;
const cookingEyebrow = document.getElementById("cookingEyebrow") as HTMLParagraphElement;
const cookingTitle = document.getElementById("cookingTitle") as HTMLSpanElement;
const cookingScore = document.getElementById("cookingScore") as HTMLSpanElement;
const cookingRush = document.getElementById("cookingRush") as HTMLSpanElement;
const cookingCombo = document.getElementById("cookingCombo") as HTMLSpanElement;
const cookingHeld = document.getElementById("cookingHeld") as HTMLParagraphElement;
const cookingHint = document.getElementById("cookingHint") as HTMLParagraphElement;
const cookingPopup = document.getElementById("cookingPopup") as HTMLDivElement;
const drivingHud = document.getElementById("drivingHud") as HTMLDivElement;
const drivingEyebrow = document.getElementById("drivingEyebrow") as HTMLParagraphElement;
const drivingTitle = document.getElementById("drivingTitle") as HTMLSpanElement;
const drivingSpeed = document.getElementById("drivingSpeed") as HTMLSpanElement;
const drivingMode = document.getElementById("drivingMode") as HTMLSpanElement;
const drivingCheckpoint = document.getElementById("drivingCheckpoint") as HTMLSpanElement;
const drivingTimer = document.getElementById("drivingTimer") as HTMLSpanElement;
const drivingRace = document.getElementById("drivingRace") as HTMLParagraphElement;
const drivingHint = document.getElementById("drivingHint") as HTMLParagraphElement;
const drivingPopup = document.getElementById("drivingPopup") as HTMLDivElement;

const projectVideoEyebrow = document.getElementById("projectVideoEyebrow") as HTMLParagraphElement;
const projectKicker = document.getElementById("projectKicker") as HTMLParagraphElement;
const projectTitle = document.getElementById("projectTitle") as HTMLHeadingElement;
const projectSubtitle = document.getElementById("projectSubtitle") as HTMLParagraphElement;
const projectDescription = document.getElementById("projectDescription") as HTMLParagraphElement;
const projectVideoFrameLabel = document.getElementById("projectVideoFrameLabel") as HTMLSpanElement;
const metaEngineLabel = document.getElementById("metaEngineLabel") as HTMLSpanElement;
const metaFocusLabel = document.getElementById("metaFocusLabel") as HTMLSpanElement;
const metaContextLabel = document.getElementById("metaContextLabel") as HTMLSpanElement;
const metaRoleLabel = document.getElementById("metaRoleLabel") as HTMLSpanElement;
const metaYearLabel = document.getElementById("metaYearLabel") as HTMLSpanElement;
const metaStackLabel = document.getElementById("metaStackLabel") as HTMLSpanElement;
const projectEngine = document.getElementById("projectEngine") as HTMLSpanElement;
const projectFocus = document.getElementById("projectFocus") as HTMLSpanElement;
const projectContext = document.getElementById("projectContext") as HTMLSpanElement;
const projectRole = document.getElementById("projectRole") as HTMLSpanElement;
const projectYear = document.getElementById("projectYear") as HTMLSpanElement;
const projectStack = document.getElementById("projectStack") as HTMLSpanElement;
const projectAtmosphere = document.getElementById("projectAtmosphere") as HTMLQuoteElement;
const projectVideoTitle = document.getElementById("projectVideoTitle") as HTMLDivElement;
const projectVideoNote = document.getElementById("projectVideoNote") as HTMLSpanElement;
const hintCapture = document.getElementById("hintCapture") as HTMLSpanElement;
const hintMove = document.getElementById("hintMove") as HTMLSpanElement;
const hintOpen = document.getElementById("hintOpen") as HTMLSpanElement;

const standMap = new Map<string, CreatedStand>();
const cardMap = new Map<string, HTMLButtonElement>();
const rockMaterialCache = new Map<string, BABYLON.PBRMaterial>();
const localeRefreshers = new Set<() => void>();

let activeProjectId: string | null = null;
let hoveredProjectId: string | null = null;
let hoveredInteractionMode: ProjectInteractionMode = "focus";
let focusProject: (projectId: string, shouldOpenPanel: boolean) => void = () => undefined;
let playerCamera: BABYLON.UniversalCamera | null = null;
let isPointerLocked = false;
let isInSlimeCombatZone = false;
let isInVRCookingZone = false;
let isInDrivingSimZone = false;
let isDrivingVehicle = false;
let combatPopupHideAt = 0;
let cookingPopupHideAt = 0;
let currentLanguage: AppLanguage =
  localStorage.getItem(LANGUAGE_STORAGE_KEY) === "en" ? "en" : "fr";
let testerLeaderboard = loadLeaderboardEntries();
let currentTesterId = loadCurrentTesterId(testerLeaderboard);

function rgbString(color: BABYLON.Color3) {
  return `rgb(${Math.round(color.r * 255)}, ${Math.round(color.g * 255)}, ${Math.round(color.b * 255)})`;
}

function normalizeTesterName(value: string) {
  return value.replace(/\s+/g, " ").trim().slice(0, 24);
}

function generateTesterId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return `tester_${Math.random().toString(36).slice(2, 10)}`;
}

function isLocalLeaderboardFallbackEnabled() {
  return (
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1"
  );
}

function loadLeaderboardEntries(): LeaderboardEntry[] {
  if (!isLocalLeaderboardFallbackEnabled()) {
    return [];
  }

  try {
    const raw = localStorage.getItem(LEADERBOARD_STORAGE_KEY);
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed
      .map((entry) => {
        const record = entry as Partial<LeaderboardEntry>;
        const name = typeof record.name === "string" ? normalizeTesterName(record.name) : "";
        if (!name) {
          return null;
        }

        return {
          id:
            typeof record.id === "string" && record.id.length > 0
              ? record.id
              : generateTesterId(),
          name,
          totalScore: Math.max(0, Number(record.totalScore) || 0),
          slimeScore: Math.max(0, Number(record.slimeScore) || 0),
          cookingScore: Math.max(0, Number(record.cookingScore) || 0),
          lastPlayedAt: Math.max(0, Number(record.lastPlayedAt) || 0),
        };
      })
      .filter((entry): entry is LeaderboardEntry => Boolean(entry));
  } catch {
    return [];
  }
}

function loadCurrentTesterId(entries: LeaderboardEntry[]) {
  const savedId = localStorage.getItem(CURRENT_TESTER_STORAGE_KEY);
  if (!isLocalLeaderboardFallbackEnabled()) {
    return savedId || null;
  }

  if (savedId && entries.some((entry) => entry.id === savedId)) {
    return savedId;
  }

  if (entries.length === 0) {
    return null;
  }

  return [...entries].sort((a, b) => b.lastPlayedAt - a.lastPlayedAt)[0].id;
}

function registerLocaleRefresher(refresher: () => void) {
  localeRefreshers.add(refresher);
}

function getCurrentUiText() {
  return uiText[currentLanguage];
}

async function requestLeaderboardApi(
  path: string,
  init: RequestInit = {}
): Promise<{ entries?: unknown; entry?: unknown }> {
  const requestUrls = [path];
  if (isLocalLeaderboardFallbackEnabled()) {
    requestUrls.push(`http://localhost:4173${path}`);
  }

  let lastError: unknown = null;
  for (const requestUrl of requestUrls) {
    try {
      const headers = new Headers(init.headers);
      if (init.body && !headers.has("Content-Type")) {
        headers.set("Content-Type", "application/json");
      }

      const response = await fetch(requestUrl, {
        ...init,
        headers,
      });
      if (!response.ok) {
        throw new Error(`Leaderboard API error ${response.status}`);
      }

      return (await response.json()) as { entries?: unknown; entry?: unknown };
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new Error("Leaderboard API unavailable");
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function saveLeaderboardState() {
  if (isLocalLeaderboardFallbackEnabled()) {
    localStorage.setItem(LEADERBOARD_STORAGE_KEY, JSON.stringify(testerLeaderboard));
  } else {
    localStorage.removeItem(LEADERBOARD_STORAGE_KEY);
  }

  if (currentTesterId) {
    localStorage.setItem(CURRENT_TESTER_STORAGE_KEY, currentTesterId);
  } else {
    localStorage.removeItem(CURRENT_TESTER_STORAGE_KEY);
  }
}

function normalizeLeaderboardEntry(entry: unknown): LeaderboardEntry | null {
  const record = entry as Partial<LeaderboardEntry> | null;
  const name = typeof record?.name === "string" ? normalizeTesterName(record.name) : "";
  if (!record || !name || typeof record.id !== "string" || record.id.length === 0) {
    return null;
  }

  return {
    id: record.id,
    name,
    totalScore: Math.max(0, Number(record.totalScore) || 0),
    slimeScore: Math.max(0, Number(record.slimeScore) || 0),
    cookingScore: Math.max(0, Number(record.cookingScore) || 0),
    drivingScore: Math.max(0, Number(record.drivingScore) || 0),
    lastPlayedAt: Math.max(0, Number(record.lastPlayedAt) || 0),
  };
}

function sortLeaderboardEntries(entries: LeaderboardEntry[]) {
  return [...entries].sort((a, b) => {
    if (b.totalScore !== a.totalScore) {
      return b.totalScore - a.totalScore;
    }

    return b.lastPlayedAt - a.lastPlayedAt;
  });
}

function applyLeaderboardEntries(
  entries: unknown,
  preferredTesterId: string | null = currentTesterId
) {
  const normalizedEntries = Array.isArray(entries)
    ? entries
        .map((entry) => normalizeLeaderboardEntry(entry))
        .filter((entry): entry is LeaderboardEntry => Boolean(entry))
    : [];

  testerLeaderboard = sortLeaderboardEntries(normalizedEntries);
  currentTesterId =
    preferredTesterId &&
    testerLeaderboard.some((entry) => entry.id === preferredTesterId)
      ? preferredTesterId
      : currentTesterId &&
          testerLeaderboard.some((entry) => entry.id === currentTesterId)
        ? currentTesterId
        : null;
  saveLeaderboardState();
  renderLeaderboard();
}

function getCurrentTesterEntry() {
  return testerLeaderboard.find((entry) => entry.id === currentTesterId) ?? null;
}

function isLeaderboardOpen() {
  return !leaderboardPanel.classList.contains("hidden");
}

function formatLeaderboardDate(timestamp: number) {
  if (!timestamp) {
    return "-";
  }

  return new Date(timestamp).toLocaleString(
    currentLanguage === "fr" ? "fr-FR" : "en-US",
    {
      dateStyle: "short",
      timeStyle: "short",
    }
  );
}

function renderLeaderboard() {
  const ui = getCurrentUiText();
  const currentTester = getCurrentTesterEntry();
  const entries = sortLeaderboardEntries(testerLeaderboard);

  leaderboardTrigger.textContent = ui.leaderboardTrigger;
  leaderboardEyebrow.textContent = ui.leaderboardEyebrow;
  leaderboardTitle.textContent = ui.leaderboardTitle;
  leaderboardBody.textContent = ui.leaderboardBody;
  closeLeaderboardBtn.textContent = ui.closeLeaderboard;
  leaderboardCurrentEyebrow.textContent = ui.leaderboardCurrentEyebrow;
  leaderboardCurrentName.textContent =
    currentTester?.name ?? ui.leaderboardCurrentEmpty;
  leaderboardCurrentTotal.textContent = `${ui.leaderboardCurrentTotal}: ${
    currentTester?.totalScore ?? 0
  } pts`;
  testerNameLabel.textContent = ui.leaderboardNameLabel;
  testerNameInput.placeholder = ui.leaderboardNamePlaceholder;
  saveTesterBtn.textContent = ui.leaderboardSave;
  leaderboardHint.textContent = ui.leaderboardHint;
  leaderboardListEyebrow.textContent = ui.leaderboardListEyebrow;
  testerSummary.textContent = currentTester
    ? `${ui.testerSummaryLabel}: ${currentTester.name} | ${currentTester.totalScore} pts`
    : ui.testerSummaryEmpty;

  if (entries.length === 0) {
    leaderboardList.innerHTML = `<p class="leaderboard-empty">${escapeHtml(
      ui.leaderboardEmpty
    )}</p>`;
    return;
  }

  leaderboardList.innerHTML = entries
    .map((entry, index) => {
      const isActive = entry.id === currentTesterId;
      return `
        <article class="leaderboard-entry${isActive ? " active" : ""}">
          <div class="leaderboard-rank">#${index + 1}</div>
          <div>
            <div class="leaderboard-entry-head">
              <strong>${escapeHtml(entry.name)}</strong>
              <span>${entry.totalScore} pts</span>
            </div>
            <p class="leaderboard-entry-meta">${escapeHtml(
              `${ui.leaderboardMetricUpdated}: ${formatLeaderboardDate(entry.lastPlayedAt)}`
            )}</p>
            <div class="leaderboard-entry-metrics">
              <div class="leaderboard-entry-metric">
                <strong>${escapeHtml(ui.leaderboardMetricTotal)}</strong>
                <span>${entry.totalScore} pts</span>
              </div>
              <div class="leaderboard-entry-metric">
                <strong>${escapeHtml(ui.leaderboardMetricSlime)}</strong>
                <span>${entry.slimeScore} pts</span>
              </div>
              <div class="leaderboard-entry-metric">
                <strong>${escapeHtml(ui.leaderboardMetricCooking)}</strong>
                <span>${entry.cookingScore} pts</span>
              </div>
              <div class="leaderboard-entry-metric">
                <strong>${escapeHtml(ui.leaderboardMetricDriving)}</strong>
                <span>${entry.drivingScore} pts</span>
              </div>
            </div>
          </div>
        </article>
      `;
    })
    .join("");
}

function setCurrentTesterLocal(name: string) {
  const normalizedName = normalizeTesterName(name);
  if (!normalizedName) {
    return false;
  }

  const existingEntry = testerLeaderboard.find(
    (entry) => entry.name.toLowerCase() === normalizedName.toLowerCase()
  );

  if (existingEntry) {
    existingEntry.name = normalizedName;
    existingEntry.lastPlayedAt = Date.now();
    currentTesterId = existingEntry.id;
  } else {
    const newEntry: LeaderboardEntry = {
      id: generateTesterId(),
      name: normalizedName,
      totalScore: 0,
      slimeScore: 0,
      cookingScore: 0,
      drivingScore: 0,
      lastPlayedAt: Date.now(),
    };
    testerLeaderboard.push(newEntry);
    currentTesterId = newEntry.id;
  }

  saveLeaderboardState();
  renderLeaderboard();
  return true;
}

async function setCurrentTester(name: string) {
  const normalizedName = normalizeTesterName(name);
  if (!normalizedName) {
    return false;
  }

  try {
    const payload = await requestLeaderboardApi("/api/leaderboard/testers", {
      method: "POST",
      body: JSON.stringify({ name: normalizedName }),
    });
    const activatedEntry = normalizeLeaderboardEntry(payload.entry);
    if (!activatedEntry) {
      throw new Error("Invalid tester payload");
    }

    currentTesterId = activatedEntry.id;
    applyLeaderboardEntries(payload.entries, activatedEntry.id);
    return true;
  } catch {
    if (!isLocalLeaderboardFallbackEnabled()) {
      return false;
    }

    return setCurrentTesterLocal(normalizedName);
  }
}

function awardLeaderboardPointsLocal(category: LeaderboardCategory, delta: number) {
  const activeTester = getCurrentTesterEntry();
  if (!activeTester || delta === 0) {
    return;
  }

  activeTester.totalScore = Math.max(0, activeTester.totalScore + delta);
  if (category === "slime") {
    activeTester.slimeScore = Math.max(0, activeTester.slimeScore + delta);
  } else if (category === "cooking") {
    activeTester.cookingScore = Math.max(0, activeTester.cookingScore + delta);
  } else {
    activeTester.drivingScore = Math.max(0, activeTester.drivingScore + delta);
  }
  activeTester.lastPlayedAt = Date.now();
  saveLeaderboardState();
  renderLeaderboard();
}

let leaderboardMutationQueue = Promise.resolve();

function refreshLeaderboardFromApi() {
  return requestLeaderboardApi("/api/leaderboard")
    .then((payload) => {
      applyLeaderboardEntries(payload.entries);
    })
    .catch(() => {
      renderLeaderboard();
    });
}

function awardLeaderboardPoints(category: LeaderboardCategory, delta: number) {
  if (!currentTesterId || delta === 0) {
    return;
  }

  const testerId = currentTesterId;
  leaderboardMutationQueue = leaderboardMutationQueue
    .then(async () => {
      try {
        const payload = await requestLeaderboardApi("/api/leaderboard/score", {
          method: "POST",
          body: JSON.stringify({
            testerId,
            category,
            delta,
          }),
        });
        applyLeaderboardEntries(payload.entries, testerId);
      } catch {
        if (isLocalLeaderboardFallbackEnabled()) {
          awardLeaderboardPointsLocal(category, delta);
        }
      }
    })
    .catch(() => undefined);
}

function getProjectText(project: ProjectData) {
  return projectTextByLanguage[currentLanguage][project.id];
}

function getProjectSignageDeps() {
  return {
    getProjectText,
    languageState: {
      get currentLanguage() {
        return currentLanguage;
      },
    },
    registerLocaleRefresher,
    rgbString,
  };
}

function getProjectVideoTitle(project: ProjectData) {
  return currentLanguage === "fr"
    ? project.id === "survivorSlime"
      ? "Trailer Survivor Slime"
      : `Presentation ${getProjectText(project).title}`
    : project.id === "survivorSlime"
      ? "Survivor Slime trailer"
      : `${getProjectText(project).title} presentation`;
}

function getProjectVideoNote(project: ProjectData) {
  if (project.id === "survivorSlime") {
    return currentLanguage === "fr"
      ? "Zone prevue pour integrer une video de gameplay ou une bande-annonce du prototype."
      : "Reserved area for gameplay footage or a prototype trailer.";
  }

  return currentLanguage === "fr"
    ? "Zone prevue pour integrer une video de presentation du projet."
    : "Reserved area for an embedded project presentation video.";
}

function applyStaticLanguage() {
  const ui = getCurrentUiText();
  document.documentElement.lang = ui.htmlLang;
  languageToggle.textContent = ui.languageToggle;
  brandEyebrow.textContent = ui.brandEyebrow;
  introCopy.textContent = ui.introCopy;
  overviewTrigger.textContent = ui.overviewTrigger;
  closePanelBtn.textContent = ui.closePanel;
  heroEyebrow.textContent = ui.heroEyebrow;
  heroTitle.textContent = ui.heroTitle;
  heroBody.textContent = ui.heroBody;
  combatEyebrow.textContent = ui.combatEyebrow;
  combatTitle.textContent = ui.combatTitle;
  cookingEyebrow.textContent = ui.cookingEyebrow;
  cookingTitle.textContent = ui.cookingTitle;
  if (!cookingHud.classList.contains("hidden")) {
    if (cookingHeld.textContent === "" || cookingHeld.textContent === uiText.fr.cookingHeldEmpty || cookingHeld.textContent === uiText.en.cookingHeldEmpty) {
      cookingHeld.textContent = ui.cookingHeldEmpty;
    }
  } else {
    cookingHeld.textContent = ui.cookingHeldEmpty;
  }
  if (cookingHint.textContent === "" || !isInVRCookingZone) {
    cookingHint.textContent = ui.cookingHintDefault;
  }
  drivingEyebrow.textContent = ui.drivingEyebrow;
  drivingTitle.textContent = ui.drivingTitle;
  if (!isInDrivingSimZone && !isDrivingVehicle) {
    drivingMode.textContent = ui.drivingModeOnFoot;
    drivingCheckpoint.textContent = ui.drivingRaceIdle;
    drivingTimer.textContent = `${DRIVING_RACE_SEGMENT_TIME.toFixed(1)} s`;
    drivingRace.textContent = `${ui.drivingRaceScore}: 0000`;
    drivingHint.textContent = ui.drivingHintDefault;
  }
  projectVideoEyebrow.textContent = ui.projectVideoEyebrow;
  projectVideoFrameLabel.textContent = ui.projectVideoFrameLabel;
  metaEngineLabel.textContent = ui.metaEngine;
  metaFocusLabel.textContent = ui.metaFocus;
  metaContextLabel.textContent = ui.metaContext;
  metaRoleLabel.textContent = ui.metaRole;
  metaYearLabel.textContent = ui.metaYear;
  metaStackLabel.textContent = ui.metaStack;
  overviewEyebrow.textContent = ui.overviewEyebrow;
  overviewTitle.textContent = ui.overviewTitle;
  overviewBody.textContent = ui.overviewBody;
  closeOverviewBtn.textContent = ui.closeOverview;
  hintCapture.textContent = ui.hintCapture;
  hintMove.textContent = ui.hintMove;
  hintOpen.textContent = ui.hintOpen;
  if (!combatHud.classList.contains("hidden")) {
    if (combatStatus.textContent === "" || combatStatus.textContent === uiText.fr.combatDefault || combatStatus.textContent === uiText.en.combatDefault) {
      combatStatus.textContent = ui.combatDefault;
    }
  } else {
    combatStatus.textContent = ui.combatDefault;
  }
  renderLeaderboard();
}

function setLanguage(language: AppLanguage) {
  if (currentLanguage === language) {
    return;
  }

  currentLanguage = language;
  localStorage.setItem(LANGUAGE_STORAGE_KEY, currentLanguage);
  applyStaticLanguage();
  renderProjectsOverview();
  createProjectCards();
  localeRefreshers.forEach((refresher) => refresher());
  if (activeProjectId && !projectPanel.classList.contains("hidden")) {
    const activeProject = projects.find((project) => project.id === activeProjectId);
    if (activeProject) {
      openProjectPanel(activeProject);
    }
  } else {
    updateStatus(getFreeRoamStatusMessage());
  }
}

function updateStatus(message: string) {
  statusPill.textContent = message;
}

function isOverviewOpen() {
  return !projectsOverview.classList.contains("hidden");
}

function syncCrosshairVisibility() {
  const panelOpen = !projectPanel.classList.contains("hidden");
  crosshair.classList.toggle(
    "hidden",
    panelOpen ||
      isOverviewOpen() ||
      isLeaderboardOpen() ||
      !isPointerLocked ||
      isDrivingVehicle
  );
}

function getFreeRoamStatusMessage() {
  if (isPointerLocked && isDrivingVehicle) {
    return currentLanguage === "fr"
      ? "Zone DrivingSim - enchaine les checkpoints avant la fin du chrono, Space freine, E pour sortir du vehicule"
      : "DrivingSim zone - chain the checkpoints before the timer runs out, Space brakes, E exits the vehicle";
  }

  if (isPointerLocked && isInSlimeCombatZone) {
    return currentLanguage === "fr"
      ? "Zone Survivor Slime - clic gauche pour tirer, Shift pour sprinter, Space pour sauter"
      : "Survivor Slime zone - left click to shoot, Shift to sprint, Space to jump";
  }

  if (isPointerLocked && isInVRCookingZone) {
    return currentLanguage === "fr"
      ? "Zone VR Cooking - vise une station et clique ou appuie sur E pour cuisiner"
      : "VR Cooking zone - aim at a station and click or press E to cook";
  }

  if (isPointerLocked && isInDrivingSimZone) {
    return currentLanguage === "fr"
      ? "Zone DrivingSim - approche-toi de la voiture et clique ou appuie sur E pour lancer la boucle"
      : "DrivingSim zone - get close to the car and click or press E to launch the loop";
  }

  return isPointerLocked
    ? currentLanguage === "fr"
      ? "Visite libre active - Shift pour sprinter, Space pour sauter"
      : "Free roam active - Shift to sprint, Space to jump"
    : currentLanguage === "fr"
      ? "Clique dans la scene pour entrer en mode visite."
      : "Click in the scene to enter free roam.";
}

function showCombatPopup(message: string) {
  combatPopup.textContent = message;
  combatPopup.classList.remove("visible");
  void combatPopup.offsetWidth;
  combatPopup.classList.add("visible");
  combatPopupHideAt = performance.now() + 800;
}

function showCookingPopup(
  message: string,
  tone: CookingPopupTone = "neutral",
  durationMs = 900
) {
  cookingPopup.textContent = message;
  cookingPopup.classList.remove("success", "warning", "error");
  if (tone !== "neutral") {
    cookingPopup.classList.add(tone);
  }
  cookingPopup.classList.remove("visible");
  void cookingPopup.offsetWidth;
  cookingPopup.classList.add("visible");
  cookingPopupHideAt = performance.now() + durationMs;
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
      (project) => {
        const text = getProjectText(project);
        return `
        <article class="overview-card">
          <p class="eyebrow">${text.accent}</p>
          <h3>${text.title}</h3>
          <p class="overview-card-subtitle">${text.subtitle}</p>
          <p class="overview-card-description">${formatOverviewText(text.description)}</p>

          <div class="overview-card-meta">
            <p><strong>${getCurrentUiText().metaEngine}</strong><span>${text.engine}</span></p>
            <p><strong>${getCurrentUiText().metaFocus}</strong><span>${text.focus}</span></p>
            <p><strong>${getCurrentUiText().metaContext}</strong><span>${text.context}</span></p>
            <p><strong>${getCurrentUiText().metaRole}</strong><span>${text.role}</span></p>
            <p><strong>${getCurrentUiText().metaYear}</strong><span>${text.year}</span></p>
            <p><strong>${getCurrentUiText().metaStack}</strong><span>${text.stack}</span></p>
          </div>

          <blockquote class="overview-card-quote">${formatOverviewText(text.atmosphere)}</blockquote>
        </article>
      `;
      }
    )
    .join("");
}

function openProjectPanel(project: ProjectData) {
  if (document.pointerLockElement === canvas) {
    document.exitPointerLock();
  }

  leaderboardPanel.classList.add("hidden");
  const text = getProjectText(project);
  projectKicker.textContent = text.accent;
  projectTitle.textContent = text.title;
  projectSubtitle.textContent = text.subtitle;
  projectDescription.textContent = text.description;
  projectEngine.textContent = text.engine;
  projectFocus.textContent = text.focus;
  projectContext.textContent = text.context;
  projectRole.textContent = text.role;
  projectYear.textContent = text.year;
  projectStack.textContent = text.stack;
  projectAtmosphere.textContent = text.atmosphere;
  projectVideoTitle.textContent = getProjectVideoTitle(project);
  projectVideoNote.textContent = getProjectVideoNote(project);

  heroPanel.classList.add("hidden");
  projectPanel.classList.remove("hidden");
  closePanelBtn.classList.remove("hidden");
  projectPanel.scrollTop = 0;
  projectPanelBody.scrollTop = 0;
  syncCrosshairVisibility();
  updateStatus(`Focus: ${getProjectText(project).title}`);
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

  leaderboardPanel.classList.add("hidden");
  projectPanel.classList.add("hidden");
  closePanelBtn.classList.add("hidden");
  heroPanel.classList.add("hidden");
  projectsOverview.classList.remove("hidden");
  syncCrosshairVisibility();
  updateStatus(
    currentLanguage === "fr"
      ? "Vue rapide du portfolio ouverte."
      : "Fast-track portfolio view opened."
  );
}

function closeProjectsOverview() {
  projectsOverview.classList.add("hidden");
  heroPanel.classList.remove("hidden");
  syncCrosshairVisibility();
  updateStatus(getFreeRoamStatusMessage());
}

function openLeaderboardPanel() {
  if (document.pointerLockElement === canvas) {
    document.exitPointerLock();
  }

  projectPanel.classList.add("hidden");
  closePanelBtn.classList.add("hidden");
  heroPanel.classList.add("hidden");
  projectsOverview.classList.add("hidden");
  leaderboardPanel.classList.remove("hidden");
  renderLeaderboard();
  void refreshLeaderboardFromApi();
  testerNameInput.value = "";
  testerNameInput.focus();
  syncCrosshairVisibility();
  updateStatus(
    currentLanguage === "fr"
      ? "Leaderboard partage ouvert."
      : "Local leaderboard opened."
  );
}

function closeLeaderboardPanel() {
  leaderboardPanel.classList.add("hidden");
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
leaderboardTrigger.addEventListener("click", openLeaderboardPanel);
closeLeaderboardBtn.addEventListener("click", closeLeaderboardPanel);
languageToggle.addEventListener("click", () => {
  setLanguage(currentLanguage === "fr" ? "en" : "fr");
});

function saveTesterFromInput() {
  const previousTesterId = currentTesterId;
  const submit = async () => {
    saveTesterBtn.disabled = true;
    testerNameInput.disabled = true;
    const success = await setCurrentTester(testerNameInput.value);
    saveTesterBtn.disabled = false;
    testerNameInput.disabled = false;
    if (!success) {
      testerNameInput.focus();
      return;
    }

    testerNameInput.value = "";
    if (!previousTesterId || isLeaderboardOpen()) {
      closeLeaderboardPanel();
    }
  };
  void submit();
}

saveTesterBtn.addEventListener("click", saveTesterFromInput);
testerNameInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    event.preventDefault();
    saveTesterFromInput();
  }
});

window.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    if (isLeaderboardOpen()) {
      closeLeaderboardPanel();
      return;
    }
    if (isOverviewOpen()) {
      closeProjectsOverview();
      return;
    }
    closeProjectPanel();
  }
});

applyStaticLanguage();
void refreshLeaderboardFromApi();

function createProjectCards() {
  projectRail.innerHTML = "";
  cardMap.clear();

  projects.forEach((project, index) => {
    const text = getProjectText(project);
    const button = document.createElement("button");
    button.type = "button";
    button.className = "project-card";
    button.dataset.projectId = project.id;
    button.innerHTML = `
      <strong>${text.title}</strong>
      <span>${text.subtitle}</span>
      <em>${String(index + 1).padStart(2, "0")} / ${text.engine}</em>
    `;

    button.addEventListener("mouseenter", () => {
      hoveredProjectId = project.id;
      updateStatus(
        currentLanguage === "fr"
          ? `Survol UI: ${text.title}`
          : `UI hover: ${text.title}`
      );
    });

    button.addEventListener("mouseleave", () => {
      hoveredProjectId = null;
      if (activeProjectId) {
        const activeProject = projects.find((entry) => entry.id === activeProjectId);
        if (activeProject) {
          updateStatus(`Focus: ${getProjectText(activeProject).title}`);
          return;
        }
      }
      updateStatus(getFreeRoamStatusMessage());
    });

    button.addEventListener("click", () => {
      focusProject(project.id, true);
    });

    cardMap.set(project.id, button);
    projectRail.appendChild(button);
  });
}

function createVRCookingSystem(

  scene: BABYLON.Scene,

  project: ProjectData,

  camera: BABYLON.UniversalCamera,

  playerController: PlayerController

): VRCookingSystem {

  return createVRCookingSystemModule(scene, project, camera, playerController, {

    awardLeaderboardPoints,

    createZoneLockBarrier,

    cookingCombo,

    cookingHeld,

    cookingHint,

    cookingHud,

    cookingPopup,

    cookingRush,

    cookingScore,

    getCookingPopupHideAt: () => cookingPopupHideAt,

    getCurrentUiText,

    getIsPointerLocked: () => isPointerLocked,

    isLeaderboardOpen,

    isOverviewOpen,

    languageState: {

      get currentLanguage() {

        return currentLanguage;

      },

    },

    projectPanel,

    registerLocaleRefresher,

    rgbString,

    showCookingPopup,

    updateStatus,

  });

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
function createDrivingRoadStripe(
  scene: BABYLON.Scene,
  name: string,
  position: BABYLON.Vector3,
  rotationY: number,
  width: number,
  depth: number,
  color: BABYLON.Color3,
  alpha = 0.96
) {
  const stripe = BABYLON.MeshBuilder.CreateBox(
    name,
    { width, height: 0.012, depth },
    scene
  );
  stripe.position = position;
  stripe.rotation.y = rotationY;
  stripe.isPickable = false;
  stripe.material = createMaterial(
    scene,
    `${name}_mat`,
    color.scale(0.9),
    color.scale(0.28),
    alpha
  );
}

function createDrivingBuilding(
  scene: BABYLON.Scene,
  name: string,
  position: BABYLON.Vector3,
  rotationY: number,
  width: number,
  depth: number,
  height: number,
  accentColor: BABYLON.Color3
) {
  const root = new BABYLON.TransformNode(`${name}_root`, scene);
  root.position = position.clone();
  root.rotation.y = rotationY;

  const shell = BABYLON.MeshBuilder.CreateBox(
    `${name}_shell`,
    { width, height, depth },
    scene
  );
  shell.parent = root;
  shell.position.y = height * 0.5;
  shell.isPickable = false;
  shell.material = createMaterial(
    scene,
    `${name}_shellMat`,
    new BABYLON.Color3(0.54, 0.52, 0.48),
    accentColor.scale(0.025)
  );

  const plinth = BABYLON.MeshBuilder.CreateBox(
    `${name}_plinth`,
    { width: width + 0.12, height: 0.22, depth: depth + 0.12 },
    scene
  );
  plinth.parent = root;
  plinth.position.y = 0.11;
  plinth.isPickable = false;
  plinth.material = createMaterial(
    scene,
    `${name}_plinthMat`,
    new BABYLON.Color3(0.3, 0.27, 0.24),
    new BABYLON.Color3(0.02, 0.018, 0.015)
  );

  const roof = BABYLON.MeshBuilder.CreateBox(
    `${name}_roof`,
    { width: width + 0.18, height: 0.14, depth: depth + 0.18 },
    scene
  );
  roof.parent = root;
  roof.position.y = height + 0.07;
  roof.isPickable = false;
  roof.material = createMaterial(
    scene,
    `${name}_roofMat`,
    new BABYLON.Color3(0.26, 0.2, 0.18),
    accentColor.scale(0.06)
  );

  const windowMaterial = createMaterial(
    scene,
    `${name}_windowMat`,
    new BABYLON.Color3(0.2, 0.24, 0.28),
    accentColor.scale(0.22),
    0.86
  );
  windowMaterial.disableLighting = true;

  const frontWindows = BABYLON.MeshBuilder.CreatePlane(
    `${name}_frontWindows`,
    { width: Math.max(0.8, width - 0.42), height: Math.max(0.9, height - 1.2) },
    scene
  );
  frontWindows.parent = root;
  frontWindows.position = new BABYLON.Vector3(0, height * 0.54, -depth * 0.5 - 0.04);
  frontWindows.isPickable = false;
  frontWindows.material = windowMaterial;

  const sideWindows = BABYLON.MeshBuilder.CreatePlane(
    `${name}_sideWindows`,
    { width: Math.max(0.8, depth - 0.42), height: Math.max(0.9, height - 1.55) },
    scene
  );
  sideWindows.parent = root;
  sideWindows.position = new BABYLON.Vector3(width * 0.5 + 0.04, height * 0.52, 0);
  sideWindows.rotation.y = Math.PI / 2;
  sideWindows.isPickable = false;
  sideWindows.material = windowMaterial;

  const awningDepth = Math.min(0.72, depth * 0.3);
  const awning = BABYLON.MeshBuilder.CreateBox(
    `${name}_awning`,
    {
      width: Math.max(1.6, width - 0.55),
      height: 0.1,
      depth: awningDepth,
    },
    scene
  );
  awning.parent = root;
  awning.position = new BABYLON.Vector3(
    0,
    Math.min(2.25, height * 0.42),
    -depth * 0.5 - awningDepth * 0.24
  );
  awning.isPickable = false;
  awning.material = createMaterial(
    scene,
    `${name}_awningMat`,
    new BABYLON.Color3(0.46, 0.32, 0.24),
    accentColor.scale(0.08)
  );

  enableCollisions(shell, plinth, roof, awning);
  return root;
}

function createDrivingStreetLamp(
  scene: BABYLON.Scene,
  name: string,
  position: BABYLON.Vector3,
  rotationY: number,
  accentColor: BABYLON.Color3
) {
  const pole = BABYLON.MeshBuilder.CreateCylinder(
    `${name}_pole`,
    { diameter: 0.08, height: 3.4, tessellation: 10 },
    scene
  );
  pole.position = position.add(new BABYLON.Vector3(0, 1.7, 0));
  pole.rotation.y = rotationY;
  pole.isPickable = false;
  pole.material = createMaterial(
    scene,
    `${name}_poleMat`,
    new BABYLON.Color3(0.16, 0.18, 0.2),
    new BABYLON.Color3(0.012, 0.012, 0.014)
  );

  const arm = BABYLON.MeshBuilder.CreateBox(
    `${name}_arm`,
    { width: 0.08, height: 0.08, depth: 0.82 },
    scene
  );
  arm.position = position.add(new BABYLON.Vector3(0, 3.22, 0.28));
  arm.rotation.y = rotationY;
  arm.isPickable = false;
  arm.material = pole.material;

  const head = BABYLON.MeshBuilder.CreateBox(
    `${name}_head`,
    { width: 0.16, height: 0.12, depth: 0.42 },
    scene
  );
  head.position = position.add(new BABYLON.Vector3(0, 3.22, 0.66));
  head.rotation.y = rotationY;
  head.isPickable = false;
  head.material = createMaterial(
    scene,
    `${name}_headMat`,
    new BABYLON.Color3(0.88, 0.88, 0.84),
    accentColor.scale(0.16)
  );

  const lampGlow = BABYLON.MeshBuilder.CreateSphere(
    `${name}_glow`,
    { diameter: 0.18, segments: 10 },
    scene
  );
  lampGlow.position = position.add(new BABYLON.Vector3(0, 3.1, 0.76));
  lampGlow.isPickable = false;
  lampGlow.material = createMaterial(
    scene,
    `${name}_glowMat`,
    new BABYLON.Color3(0.95, 0.86, 0.68),
    new BABYLON.Color3(0.42, 0.28, 0.08),
    0.94
  );

  const light = new BABYLON.PointLight(`${name}_light`, lampGlow.position.clone(), scene);
  light.diffuse = new BABYLON.Color3(1, 0.82, 0.6);
  light.intensity = 0.46;
  light.range = 7.5;
}

function createDrivingSimZone(scene: BABYLON.Scene, project: ProjectData) {
  const { right, back, yaw } = getRoomBasis(project);
  const zoneWidth = DRIVING_ZONE_WIDTH;
  const zoneDepth = DRIVING_ZONE_DEPTH;
  const wallHeight = 5.35;
  const wallThickness = 0.45;
  const entranceHalfWidth = 5.4;
  const roadRects = getDrivingRoadRects();
  const toWorld = (x: number, y: number, z: number) =>
    project.position
      .add(right.scale(x))
      .add(back.scale(z))
      .add(new BABYLON.Vector3(0, y, 0));

  const lot = BABYLON.MeshBuilder.CreateBox(
    `${project.id}_lot`,
    { width: zoneWidth, height: 0.08, depth: zoneDepth },
    scene
  );
  lot.position = toWorld(0, 0.04, 0);
  lot.rotation.y = yaw;
  lot.checkCollisions = true;
  lot.isPickable = false;
  lot.material = createMaterial(
    scene,
    `${project.id}_lotMat`,
    new BABYLON.Color3(0.14, 0.15, 0.17),
    new BABYLON.Color3(0.01, 0.01, 0.012)
  );

  const wallMaterial = createMaterial(
    scene,
    `${project.id}_wallMat`,
    new BABYLON.Color3(0.12, 0.14, 0.18),
    project.color.scale(0.04)
  );
  const sidewalkMaterial = createMaterial(
    scene,
    `${project.id}_sidewalkMat`,
    new BABYLON.Color3(0.46, 0.44, 0.4),
    new BABYLON.Color3(0.028, 0.026, 0.02)
  );
  const asphaltMaterial = createMaterial(
    scene,
    `${project.id}_asphaltMat`,
    new BABYLON.Color3(0.075, 0.08, 0.095),
    new BABYLON.Color3(0.008, 0.01, 0.014)
  );
  const plazaMaterial = createMaterial(
    scene,
    `${project.id}_plazaMat`,
    new BABYLON.Color3(0.62, 0.58, 0.5),
    new BABYLON.Color3(0.04, 0.03, 0.025)
  );
  const foliageMaterial = createMaterial(
    scene,
    `${project.id}_foliageMat`,
    new BABYLON.Color3(0.22, 0.34, 0.24),
    new BABYLON.Color3(0.02, 0.04, 0.02)
  );
  const trunkMaterial = createMaterial(
    scene,
    `${project.id}_trunkMat`,
    new BABYLON.Color3(0.26, 0.19, 0.14),
    new BABYLON.Color3(0.01, 0.008, 0.006)
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
      size: { width: zoneWidth * 0.5 - entranceHalfWidth + wallThickness, height: wallHeight, depth: wallThickness },
      position: { x: -(entranceHalfWidth + (zoneWidth * 0.5 - entranceHalfWidth) * 0.5), z: -zoneDepth * 0.5 },
    },
    {
      name: "frontRight",
      size: { width: zoneWidth * 0.5 - entranceHalfWidth + wallThickness, height: wallHeight, depth: wallThickness },
      position: { x: entranceHalfWidth + (zoneWidth * 0.5 - entranceHalfWidth) * 0.5, z: -zoneDepth * 0.5 },
    },
  ];

  wallSegments.forEach((segment) => {
    const wall = BABYLON.MeshBuilder.CreateBox(
      `${project.id}_wall_${segment.name}`,
      segment.size,
      scene
    );
    wall.position = toWorld(segment.position.x, wallHeight * 0.5, segment.position.z);
    wall.rotation.y = yaw;
    wall.isPickable = false;
    wall.material = wallMaterial;
    wall.checkCollisions = true;
  });

  const entryHeader = BABYLON.MeshBuilder.CreateBox(
    `${project.id}_entryHeader`,
    { width: entranceHalfWidth * 2 + 0.85, height: 0.42, depth: wallThickness },
    scene
  );
  entryHeader.position = toWorld(0, wallHeight - 0.35, -zoneDepth * 0.5);
  entryHeader.rotation.y = yaw;
  entryHeader.isPickable = false;
  entryHeader.material = wallMaterial;
  entryHeader.checkCollisions = true;

  const createPad = (
    name: string,
    x: number,
    z: number,
    width: number,
    depth: number,
    height = 0.16,
    material = sidewalkMaterial
  ) => {
    const pad = BABYLON.MeshBuilder.CreateBox(
      `${project.id}_${name}`,
      { width, height, depth },
      scene
    );
    pad.position = toWorld(x, height * 0.5 + 0.03, z);
    pad.rotation.y = yaw;
    pad.isPickable = false;
    pad.material = material;
    pad.checkCollisions = true;
    return pad;
  };
  const createRoundedPad = (
    name: string,
    x: number,
    z: number,
    width: number,
    depth: number,
    height = 0.16,
    material = sidewalkMaterial,
    rotationY = yaw
  ) => {
    const pad = BABYLON.MeshBuilder.CreateCylinder(
      `${project.id}_${name}`,
      { diameter: 1, height, tessellation: 36 },
      scene
    );
    pad.position = toWorld(x, height * 0.5 + 0.03, z);
    pad.rotation.y = rotationY;
    pad.scaling = new BABYLON.Vector3(width, 1, depth);
    pad.isPickable = false;
    pad.material = material;
    pad.checkCollisions = true;
    return pad;
  };
  const addArcDashes = (
    prefix: string,
    centerX: number,
    centerZ: number,
    radius: number,
    startAngle: number,
    endAngle: number,
    count: number
  ) => {
    for (let index = 0; index < count; index += 1) {
      const t = count === 1 ? 0 : index / (count - 1);
      const angle = BABYLON.Scalar.Lerp(startAngle, endAngle, t);
      const localX = centerX + Math.cos(angle) * radius;
      const localZ = centerZ + Math.sin(angle) * radius;
      const tangent = new BABYLON.Vector2(-Math.sin(angle), Math.cos(angle));
      createDrivingRoadStripe(
        scene,
        `${project.id}_${prefix}_${index}`,
        toWorld(localX, 0.118, localZ),
        yaw + Math.atan2(tangent.x, tangent.y),
        0.18,
        1.02,
        dashColor,
        0.92
      );
    }
  };
  const createStreetTree = (name: string, x: number, z: number, scale = 1) => {
    const trunk = BABYLON.MeshBuilder.CreateCylinder(
      `${project.id}_${name}_trunk`,
      { diameter: 0.18 * scale, height: 1.2 * scale, tessellation: 10 },
      scene
    );
    trunk.position = toWorld(x, 0.6 * scale + 0.03, z);
    trunk.isPickable = false;
    trunk.material = trunkMaterial;

    const crown = BABYLON.MeshBuilder.CreateSphere(
      `${project.id}_${name}_crown`,
      { diameter: 1.05 * scale, segments: 12 },
      scene
    );
    crown.position = toWorld(x, 1.45 * scale + 0.03, z);
    crown.scaling.y = 0.82;
    crown.isPickable = false;
    crown.material = foliageMaterial;
  };

  roadRects.forEach((rect) => {
    const road = BABYLON.MeshBuilder.CreateBox(
      `${project.id}_road_${rect.name}`,
      { width: rect.maxX - rect.minX, height: 0.03, depth: rect.maxZ - rect.minZ },
      scene
    );
    road.position = toWorld(
      (rect.minX + rect.maxX) * 0.5,
      0.095,
      (rect.minZ + rect.maxZ) * 0.5
    );
    road.rotation.y = yaw;
    road.isPickable = false;
    road.material = asphaltMaterial;
    road.checkCollisions = true;
  });

  const perimeterPads = [
    { name: "sidewalkNorth", x: 0, z: zoneDepth * 0.5 - 1.45, width: zoneWidth - 0.8, depth: 2.3 },
    {
      name: "sidewalkSouthLeft",
      x: -(entranceHalfWidth + (zoneWidth * 0.5 - entranceHalfWidth - 0.65) * 0.5),
      z: -zoneDepth * 0.5 + 1.45,
      width: zoneWidth * 0.5 - entranceHalfWidth - 0.65,
      depth: 2.3,
    },
    {
      name: "sidewalkSouthRight",
      x: entranceHalfWidth + (zoneWidth * 0.5 - entranceHalfWidth - 0.65) * 0.5,
      z: -zoneDepth * 0.5 + 1.45,
      width: zoneWidth * 0.5 - entranceHalfWidth - 0.65,
      depth: 2.3,
    },
    { name: "sidewalkWest", x: -zoneWidth * 0.5 + 1.45, z: 0, width: 2.3, depth: zoneDepth - 0.8 },
    { name: "sidewalkEast", x: zoneWidth * 0.5 - 1.45, z: 0, width: 2.3, depth: zoneDepth - 0.8 },
  ];
  perimeterPads.forEach((pad) =>
    createPad(pad.name, pad.x, pad.z, pad.width, pad.depth)
  );

  const cityBlocks = [
    { name: "blockSouthWest", x: -12.0, z: -7.9, width: 11.6, depth: 7.2 },
    { name: "blockSouthEast", x: 12.0, z: -7.9, width: 11.6, depth: 7.2 },
    { name: "blockMarketWest", x: -12.0, z: 11.4, width: 11.6, depth: 6.8 },
    { name: "blockMarketEast", x: 12.0, z: 11.4, width: 11.6, depth: 6.8 },
    { name: "blockWestSouth", x: -32.0, z: -7.9, width: 4.2, depth: 7.2 },
    { name: "blockEastSouth", x: 32.0, z: -7.9, width: 4.2, depth: 7.2 },
    { name: "blockWestMarket", x: -32.0, z: 11.4, width: 4.2, depth: 6.8 },
    { name: "blockEastMarket", x: 32.0, z: 11.4, width: 4.2, depth: 6.8 },
    { name: "blockRearWest", x: -12.0, z: 31.6, width: 11.6, depth: 6.2 },
    { name: "blockRearCenter", x: 0, z: 31.6, width: 11.8, depth: 6.2 },
    { name: "blockRearEast", x: 12.0, z: 31.6, width: 11.6, depth: 6.2 },
    { name: "blockWestRear", x: -32.0, z: 31.6, width: 4.2, depth: 6.2 },
    { name: "blockEastRear", x: 32.0, z: 31.6, width: 4.2, depth: 6.2 },
  ];
  cityBlocks.forEach((block) =>
    createPad(block.name, block.x, block.z, block.width, block.depth, 0.18)
  );

  for (const corner of [
    { name: "cornerSouthWestA", x: -8.7, z: -11.4, w: 2.6, d: 2.1 },
    { name: "cornerSouthEastA", x: 8.7, z: -11.4, w: 2.6, d: 2.1 },
    { name: "cornerMarketWestA", x: -8.7, z: 9.2, w: 2.8, d: 2.2 },
    { name: "cornerMarketEastA", x: 8.7, z: 9.2, w: 2.8, d: 2.2 },
    { name: "cornerNorthWestA", x: -16.8, z: 18.8, w: 2.4, d: 2.1 },
    { name: "cornerNorthEastA", x: 16.8, z: 18.8, w: 2.4, d: 2.1 },
    { name: "cornerWestSouthA", x: -16.8, z: -11.4, w: 2.4, d: 2.1 },
    { name: "cornerEastSouthA", x: 16.8, z: -11.4, w: 2.4, d: 2.1 },
  ]) {
    createRoundedPad(corner.name, corner.x, corner.z, corner.w, corner.d);
  }

  createRoundedPad("piazzaWest", -9.2, 11.2, 4.4, 3.2, 0.14, plazaMaterial, yaw - 0.14);
  createRoundedPad("piazzaEast", 9.6, 11.0, 4.8, 3.4, 0.14, plazaMaterial, yaw + 0.1);
  createRoundedPad("piazzaRear", -3.2, 31.2, 4.6, 3.4, 0.14, plazaMaterial, yaw - 0.08);

  const fountainBase = BABYLON.MeshBuilder.CreateCylinder(
    `${project.id}_fountainBase`,
    { diameter: 2.4, height: 0.26, tessellation: 32 },
    scene
  );
  fountainBase.position = toWorld(-3.2, 0.2, 31.2);
  fountainBase.scaling.z = 0.88;
  fountainBase.isPickable = false;
  fountainBase.material = plazaMaterial;
  fountainBase.checkCollisions = true;

  const fountainColumn = BABYLON.MeshBuilder.CreateCylinder(
    `${project.id}_fountainColumn`,
    { diameter: 0.42, height: 1.1, tessellation: 20 },
    scene
  );
  fountainColumn.position = toWorld(-3.2, 0.74, 31.2);
  fountainColumn.isPickable = false;
  fountainColumn.material = wallMaterial;

  const fountainTop = BABYLON.MeshBuilder.CreateSphere(
    `${project.id}_fountainTop`,
    { diameter: 0.38, segments: 10 },
    scene
  );
  fountainTop.position = toWorld(-3.2, 1.36, 31.2);
  fountainTop.isPickable = false;
  fountainTop.material = createMaterial(
    scene,
    `${project.id}_fountainTopMat`,
    new BABYLON.Color3(0.86, 0.88, 0.92),
    project.color.scale(0.12)
  );

  createStreetTree("treeWestPiazzaA", -8.6, 10.2, 0.95);
  createStreetTree("treeWestPiazzaB", -10.1, 12.2, 0.8);
  createStreetTree("treeEastPiazzaA", 8.8, 10.1, 0.92);
  createStreetTree("treeEastPiazzaB", 10.6, 12.3, 0.8);
  createStreetTree("treeRearPiazza", -5.1, 31.1, 0.95);

  const cafeMetalMaterial = createMaterial(
    scene,
    `${project.id}_cafeMetalMat`,
    new BABYLON.Color3(0.18, 0.18, 0.2),
    new BABYLON.Color3(0.012, 0.012, 0.014)
  );
  const cafeTopMaterial = createMaterial(
    scene,
    `${project.id}_cafeTopMat`,
    new BABYLON.Color3(0.58, 0.42, 0.3),
    new BABYLON.Color3(0.03, 0.022, 0.016)
  );
  for (const table of [
    { name: "cafeWest", x: -8.0, z: 12.0 },
    { name: "cafeEast", x: 8.1, z: 12.1 },
  ]) {
    const top = BABYLON.MeshBuilder.CreateCylinder(
      `${project.id}_${table.name}_top`,
      { diameter: 0.9, height: 0.08, tessellation: 20 },
      scene
    );
    top.position = toWorld(table.x, 0.73, table.z);
    top.isPickable = false;
    top.material = cafeTopMaterial;

    const leg = BABYLON.MeshBuilder.CreateCylinder(
      `${project.id}_${table.name}_leg`,
      { diameter: 0.12, height: 0.66, tessellation: 12 },
      scene
    );
    leg.position = toWorld(table.x, 0.37, table.z);
    leg.isPickable = false;
    leg.material = cafeMetalMaterial;

    for (const seat of [
      { x: table.x - 0.62, z: table.z + 0.1 },
      { x: table.x + 0.52, z: table.z - 0.12 },
    ]) {
      const stool = BABYLON.MeshBuilder.CreateCylinder(
        `${project.id}_${table.name}_stool_${seat.x}_${seat.z}`,
        { diameter: 0.34, height: 0.42, tessellation: 14 },
        scene
      );
      stool.position = toWorld(seat.x, 0.24, seat.z);
      stool.isPickable = false;
      stool.material = cafeTopMaterial;
    }
  }

  const dashColor = new BABYLON.Color3(0.94, 0.92, 0.76);
  const crosswalkColor = new BABYLON.Color3(0.95, 0.95, 0.93);

  const addVerticalDashes = (
    prefix: string,
    x: number,
    zStart: number,
    zEnd: number,
    step: number,
    dashDepth: number
  ) => {
    let index = 0;
    for (let z = zStart; z <= zEnd; z += step) {
      createDrivingRoadStripe(
        scene,
        `${project.id}_${prefix}_${index}`,
        toWorld(x, 0.118, z),
        yaw,
        0.18,
        dashDepth,
        dashColor,
        0.92
      );
      index += 1;
    }
  };

  const addHorizontalDashes = (
    prefix: string,
    z: number,
    xStart: number,
    xEnd: number,
    step: number,
    dashWidth: number
  ) => {
    let index = 0;
    for (let x = xStart; x <= xEnd; x += step) {
      createDrivingRoadStripe(
        scene,
        `${project.id}_${prefix}_${index}`,
        toWorld(x, 0.118, z),
        yaw,
        dashWidth,
        0.18,
        dashColor,
        0.92
      );
      index += 1;
    }
  };

  addVerticalDashes("entryDashes", 0, -34.2, -25.2, 2.8, 1.22);
  addVerticalDashes("mainDashes", 0, -20.2, 31.4, 3.2, 1.22);
  addVerticalDashes("westDashes", -23.8, -20.2, 27.6, 3.2, 1.14);
  addVerticalDashes("eastDashes", 23.8, -20.2, 27.6, 3.2, 1.14);
  addHorizontalDashes("southStreetDashes", -17.6, -31.2, 31.2, 3.2, 1.2);
  addHorizontalDashes("marketStreetDashes", 1.8, -31.2, 31.2, 3.2, 1.2);
  addHorizontalDashes("northStreetDashes", 21.2, -31.2, 31.2, 3.2, 1.2);
  addHorizontalDashes("westConnectorDashes", 11.8, -16.4, -6.8, 3, 1.02);
  addHorizontalDashes("eastConnectorDashes", 11.8, 6.8, 16.4, 3, 1.02);
  addArcDashes("southEastArc", 23.8, -17.8, 5.6, Math.PI, Math.PI * 0.5, 5);
  addArcDashes("northEastArc", 23.8, 21.2, 5.6, -Math.PI * 0.5, -Math.PI, 5);
  addArcDashes("northWestArc", -23.8, 21.2, 5.6, 0, -Math.PI * 0.5, 5);
  addArcDashes("southWestArc", -23.8, -17.8, 5.6, Math.PI * 0.5, 0, 5);

  createDrivingRoadStripe(
    scene,
    `${project.id}_startLine`,
    toWorld(0, 0.124, -31.2),
    yaw,
    6.4,
    0.22,
    project.color,
    0.96
  );

  for (let index = 0; index < 8; index += 1) {
    createDrivingRoadStripe(
      scene,
      `${project.id}_crosswalkSouth_${index}`,
      toWorld(-3.2 + index * 0.9, 0.118, -10.1),
      yaw,
      0.52,
      1.24,
      crosswalkColor,
      0.88
    );
    createDrivingRoadStripe(
      scene,
      `${project.id}_crosswalkMarket_${index}`,
      toWorld(-3.2 + index * 0.9, 0.118, 9.6),
      yaw,
      0.52,
      1.24,
      crosswalkColor,
      0.88
    );
    createDrivingRoadStripe(
      scene,
      `${project.id}_crosswalkNorth_${index}`,
      toWorld(-3.2 + index * 0.9, 0.118, 29),
      yaw,
      0.52,
      1.24,
      crosswalkColor,
      0.88
    );
  }

  const buildingData = [
    { name: "southWestRetail", x: -13.6, z: -8.3, width: 8.6, depth: 3.3, height: 4.2, rotation: yaw - 0.08 },
    { name: "southEastRetail", x: 13.3, z: -8.0, width: 8.2, depth: 3.5, height: 4.5, rotation: yaw + 0.1 },
    { name: "marketWestOffice", x: -14.0, z: 11.1, width: 8.4, depth: 4.6, height: 5.7, rotation: yaw - 0.06 },
    { name: "marketEastOffice", x: 14.1, z: 11.0, width: 8.8, depth: 4.8, height: 5.2, rotation: yaw + 0.08 },
    { name: "westSouthCorner", x: -31.6, z: -8.2, width: 5.2, depth: 2.4, height: 4.9, rotation: yaw + Math.PI / 2 - 0.08 },
    { name: "westMidCorner", x: -31.5, z: 11.0, width: 5.2, depth: 2.4, height: 5.8, rotation: yaw + Math.PI / 2 + 0.04 },
    { name: "westRearTower", x: -31.2, z: 31.2, width: 5.6, depth: 2.4, height: 7.5, rotation: yaw + Math.PI / 2 - 0.04 },
    { name: "eastSouthCorner", x: 31.6, z: -8.0, width: 5.0, depth: 2.4, height: 4.7, rotation: yaw - Math.PI / 2 + 0.06 },
    { name: "eastMidCorner", x: 31.5, z: 11.1, width: 5.2, depth: 2.4, height: 5.5, rotation: yaw - Math.PI / 2 - 0.04 },
    { name: "eastRearTower", x: 31.4, z: 31.0, width: 5.8, depth: 2.4, height: 7.3, rotation: yaw - Math.PI / 2 + 0.08 },
    { name: "rearWestBlock", x: -13.7, z: 31.1, width: 8.8, depth: 4.1, height: 5.9, rotation: yaw + Math.PI - 0.07 },
    { name: "rearCenterStation", x: 3.2, z: 31.2, width: 6.2, depth: 4.0, height: 4.8, rotation: yaw + Math.PI + 0.06 },
    { name: "rearEastBlock", x: 14.0, z: 31.2, width: 8.4, depth: 4.2, height: 6.1, rotation: yaw + Math.PI + 0.04 },
  ];

  buildingData.forEach((building) => {
    createDrivingBuilding(
      scene,
      `${project.id}_${building.name}`,
      toWorld(building.x, 0, building.z),
      building.rotation,
      building.width,
      building.depth,
      building.height,
      project.color
    );
  });

  const lamps = [
    { x: -8.4, z: -27.2, rot: yaw },
    { x: 8.4, z: -27.2, rot: yaw },
    { x: -8.4, z: -7.2, rot: yaw },
    { x: 8.4, z: -7.2, rot: yaw },
    { x: -8.4, z: 12.2, rot: yaw },
    { x: 8.4, z: 12.2, rot: yaw },
    { x: -8.4, z: 30.2, rot: yaw },
    { x: 8.4, z: 30.2, rot: yaw },
    { x: -31.2, z: -10.4, rot: yaw + Math.PI / 2 },
    { x: -31.2, z: 11.8, rot: yaw + Math.PI / 2 },
    { x: 31.2, z: -10.4, rot: yaw - Math.PI / 2 },
    { x: 31.2, z: 11.8, rot: yaw - Math.PI / 2 },
  ];
  lamps.forEach((lamp, index) => {
    createDrivingStreetLamp(
      scene,
      `${project.id}_streetLamp_${index}`,
      toWorld(lamp.x, 0, lamp.z),
      lamp.rot,
      project.color
    );
  });

  const planterBaseMaterial = createMaterial(
    scene,
    `${project.id}_planterBaseMat`,
    new BABYLON.Color3(0.22, 0.24, 0.26),
    new BABYLON.Color3(0.01, 0.01, 0.012)
  );
  const planterLeafMaterial = createMaterial(
    scene,
    `${project.id}_planterLeafMat`,
    new BABYLON.Color3(0.18, 0.34, 0.22),
    new BABYLON.Color3(0.02, 0.04, 0.02)
  );

  for (const planter of [
    { x: -8.6, z: -11.2, w: 1.25, d: 1.25 },
    { x: 8.6, z: -11.2, w: 1.25, d: 1.25 },
    { x: -8.6, z: 9.5, w: 1.25, d: 1.25 },
    { x: 8.6, z: 9.5, w: 1.25, d: 1.25 },
    { x: -17.2, z: 11.8, w: 1.02, d: 1.02 },
    { x: 17.2, z: 11.8, w: 1.02, d: 1.02 },
  ]) {
    const base = BABYLON.MeshBuilder.CreateBox(
      `${project.id}_planter_${planter.x}_${planter.z}`,
      { width: planter.w, height: 0.42, depth: planter.d },
      scene
    );
    base.position = toWorld(planter.x, 0.31, planter.z);
    base.rotation.y = yaw;
    base.isPickable = false;
    base.material = planterBaseMaterial;
    base.checkCollisions = true;

    const shrub = BABYLON.MeshBuilder.CreateSphere(
      `${project.id}_planterShrub_${planter.x}_${planter.z}`,
      { diameter: Math.min(planter.w, planter.d) * 0.72, segments: 10 },
      scene
    );
    shrub.position = toWorld(planter.x, 0.72, planter.z);
    shrub.scaling.y = 0.7;
    shrub.isPickable = false;
    shrub.material = planterLeafMaterial;
  }

  const shelterFrameMaterial = createMaterial(
    scene,
    `${project.id}_shelterFrameMat`,
    new BABYLON.Color3(0.14, 0.16, 0.18),
    new BABYLON.Color3(0.01, 0.01, 0.012)
  );
  const shelterGlassMaterial = createMaterial(
    scene,
    `${project.id}_shelterGlassMat`,
    new BABYLON.Color3(0.22, 0.28, 0.32),
    project.color.scale(0.08),
    0.48
  );

  for (const shelter of [
    { name: "westShelter", x: -15.2, z: 10.1, rot: yaw + Math.PI / 2 },
    { name: "eastShelter", x: 15.2, z: 10.1, rot: yaw - Math.PI / 2 },
  ]) {
    const roof = BABYLON.MeshBuilder.CreateBox(
      `${project.id}_${shelter.name}_roof`,
      { width: 2.2, height: 0.08, depth: 0.92 },
      scene
    );
    roof.position = toWorld(shelter.x, 2.18, shelter.z);
    roof.rotation.y = shelter.rot;
    roof.isPickable = false;
    roof.material = shelterFrameMaterial;
    roof.checkCollisions = true;

    for (const side of [-1, 1]) {
      const post = BABYLON.MeshBuilder.CreateBox(
        `${project.id}_${shelter.name}_post_${side}`,
        { width: 0.08, height: 2.05, depth: 0.08 },
        scene
      );
      post.position = toWorld(
        shelter.x + Math.cos(shelter.rot) * 0.68 * side,
        1.02,
        shelter.z + Math.sin(shelter.rot) * 0.68 * side
      );
      post.rotation.y = shelter.rot;
      post.isPickable = false;
      post.material = shelterFrameMaterial;
      post.checkCollisions = true;
    }

    const glass = BABYLON.MeshBuilder.CreatePlane(
      `${project.id}_${shelter.name}_glass`,
      { width: 1.78, height: 1.35 },
      scene
    );
    glass.position = toWorld(shelter.x, 1.28, shelter.z);
    glass.rotation.y = shelter.rot;
    glass.isPickable = false;
    glass.material = shelterGlassMaterial;
  }

  const startGateLeft = BABYLON.MeshBuilder.CreateBox(
    `${project.id}_startGateLeft`,
    { width: 0.18, height: 2.6, depth: 0.18 },
    scene
  );
  startGateLeft.position = toWorld(-3.1, 1.3, -31.8);
  startGateLeft.rotation.y = yaw;
  startGateLeft.isPickable = false;
  startGateLeft.material = wallMaterial;

  const startGateRight = startGateLeft.clone(`${project.id}_startGateRight`);
  startGateRight.position = toWorld(3.1, 1.3, -31.8);

  const startGateBeam = BABYLON.MeshBuilder.CreateBox(
    `${project.id}_startGateBeam`,
    { width: 6.5, height: 0.18, depth: 0.18 },
    scene
  );
  startGateBeam.position = toWorld(0, 2.56, -31.8);
  startGateBeam.rotation.y = yaw;
  startGateBeam.isPickable = false;
  startGateBeam.material = createMaterial(
    scene,
    `${project.id}_startGateBeamMat`,
    new BABYLON.Color3(0.12, 0.14, 0.18),
    project.color.scale(0.2)
  );

  createDecorScreen(
    scene,
    `${project.id}_diagScreen`,
    toWorld(-13.8, 2.35, -29.2),
    yaw,
    project.color,
    4.2,
    1.18
  );

  const fillLight = new BABYLON.PointLight(
    `${project.id}_fillLight`,
    toWorld(0, 5.6, -4.8),
    scene
  );
  fillLight.diffuse = new BABYLON.Color3(0.38, 0.42, 0.48);
  fillLight.intensity = 0.42;
  fillLight.range = 68;

  const cityGlow = new BABYLON.PointLight(
    `${project.id}_cityGlow`,
    toWorld(0, 7.2, 17),
    scene
  );
  cityGlow.diffuse = project.color.scale(0.85).add(new BABYLON.Color3(0.12, 0.12, 0.12));
  cityGlow.intensity = 0.22;
  cityGlow.range = 44;
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
    const kitchenRear = project.position.add(back.scale(5.5));
    const leftRun = project.position.add(right.scale(-5.55)).add(back.scale(1.25));
    const islandCenter = project.position.add(right.scale(3.05)).add(back.scale(0.35));
    const rearPrepCounterCenter = kitchenRear.add(right.scale(-0.55));

    createKitchenCounterModule(
      scene,
      `${project.id}_prepCounter`,
      rearPrepCounterCenter,
      yaw,
      4.7,
      1.0,
      project.color
    );
    const stoveCounter = createKitchenCounterModule(
      scene,
      `${project.id}_stoveCounter`,
      kitchenRear.add(right.scale(3.45)),
      yaw,
      2.5,
      1.0,
      project.color
    );
    const sideCounter = createKitchenCounterModule(
      scene,
      `${project.id}_sideCounter`,
      leftRun,
      yaw + Math.PI / 2,
      3.4,
      1.0,
      project.color
    );
    const island = createKitchenCounterModule(
      scene,
      `${project.id}_island`,
      islandCenter,
      yaw,
      2.8,
      1.22,
      project.color
    );

    createKitchenTallUnit(
      scene,
      `${project.id}_fridge`,
      kitchenRear.add(right.scale(5.55)),
      yaw,
      1.28,
      1.04,
      2.5,
      project.color
    );
    createKitchenTallUnit(
      scene,
      `${project.id}_pantry`,
      project.position.add(right.scale(-5.55)).add(back.scale(5.25)),
      yaw + Math.PI / 2,
      1.18,
      0.96,
      2.5,
      project.color
    );

    const sinkBasin = BABYLON.MeshBuilder.CreateBox(
      `${project.id}_sinkBasin`,
      { width: 1.08, height: 0.16, depth: 0.54 },
      scene
    );
    sinkBasin.parent = sideCounter;
    sinkBasin.position = new BABYLON.Vector3(1.02, 0.95, -0.02);
    sinkBasin.isPickable = false;
    sinkBasin.material = createMaterial(
      scene,
      `${project.id}_sinkBasinMat`,
      new BABYLON.Color3(0.68, 0.72, 0.76),
      new BABYLON.Color3(0.02, 0.024, 0.03)
    );

    const faucet = BABYLON.MeshBuilder.CreateCylinder(
      `${project.id}_faucet`,
      { diameter: 0.06, height: 0.46, tessellation: 12 },
      scene
    );
    faucet.parent = sideCounter;
    faucet.position = new BABYLON.Vector3(1.3, 1.22, 0);
    faucet.isPickable = false;
    faucet.material = createMaterial(
      scene,
      `${project.id}_faucetMat`,
      new BABYLON.Color3(0.2, 0.22, 0.24),
      new BABYLON.Color3(0.01, 0.012, 0.014)
    );
    enableCollisions(sinkBasin, faucet);

    const board = BABYLON.MeshBuilder.CreateBox(
      `${project.id}_cuttingBoard`,
      { width: 0.72, height: 0.06, depth: 0.44 },
      scene
    );
    board.parent = island;
    board.position = new BABYLON.Vector3(-0.56, 0.99, -0.06);
    board.isPickable = false;
    board.material = createMaterial(
      scene,
      `${project.id}_boardMat`,
      new BABYLON.Color3(0.54, 0.34, 0.18),
      project.color.scale(0.06)
    );

    const pot = BABYLON.MeshBuilder.CreateCylinder(
      `${project.id}_pot`,
      { diameter: 0.42, height: 0.28, tessellation: 20 },
      scene
    );
    pot.parent = island;
    pot.position = new BABYLON.Vector3(0.08, 1.1, 0.16);
    pot.isPickable = false;
    pot.material = createMaterial(
      scene,
      `${project.id}_potMat`,
      new BABYLON.Color3(0.16, 0.18, 0.2),
      project.color.scale(0.08)
    );
    enableCollisions(board, pot);

    for (const burner of [
      new BABYLON.Vector3(-0.38, 0.99, -0.18),
      new BABYLON.Vector3(0.38, 0.99, -0.18),
      new BABYLON.Vector3(-0.38, 0.99, 0.18),
      new BABYLON.Vector3(0.38, 0.99, 0.18),
    ]) {
      const plate = BABYLON.MeshBuilder.CreateDisc(
        `${project.id}_burner_${burner.x}_${burner.z}`,
        { radius: 0.16, tessellation: 24 },
        scene
      );
      plate.parent = stoveCounter;
      plate.position = burner;
      plate.rotation.x = Math.PI / 2;
      plate.isPickable = false;
      plate.material = createMaterial(
        scene,
        `${project.id}_burnerMat_${burner.x}_${burner.z}`,
        new BABYLON.Color3(0.06, 0.06, 0.07),
        project.color.scale(0.18),
        0.94
      );
    }

    const hood = BABYLON.MeshBuilder.CreateBox(
      `${project.id}_hood`,
      { width: 1.8, height: 0.34, depth: 0.9 },
      scene
    );
    hood.position = kitchenRear.add(right.scale(3.45)).add(new BABYLON.Vector3(0, 2.5, -0.12));
    hood.rotation.y = yaw;
    hood.isPickable = false;
    hood.material = createMaterial(
      scene,
      `${project.id}_hoodMat`,
      new BABYLON.Color3(0.66, 0.68, 0.7),
      project.color.scale(0.08)
    );
    hood.checkCollisions = true;

    const shelfUpper = BABYLON.MeshBuilder.CreateBox(
      `${project.id}_shelfUpper`,
      { width: 2.4, height: 0.12, depth: 0.34 },
      scene
    );
    shelfUpper.position = leftRun.add(back.scale(2.3)).add(new BABYLON.Vector3(0, 2.18, 0));
    shelfUpper.rotation.y = yaw + Math.PI / 2;
    shelfUpper.isPickable = false;
    shelfUpper.material = createMaterial(
      scene,
      `${project.id}_shelfMat`,
      new BABYLON.Color3(0.34, 0.24, 0.14),
      project.color.scale(0.08)
    );
    shelfUpper.checkCollisions = true;

    const shelfLower = shelfUpper.clone(`${project.id}_shelfLower`);
    shelfLower.position.y = 1.72;
    shelfLower.checkCollisions = true;

    const warmBounce = new BABYLON.PointLight(
      `${project.id}_warmBounce`,
      islandCenter.add(new BABYLON.Vector3(0, 1.6, 0)),
      scene
    );
    warmBounce.diffuse = new BABYLON.Color3(1, 0.78, 0.48);
    warmBounce.intensity = 0.32;
    warmBounce.range = 10;
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





function applyWetLookToSlimeZone(scene: BABYLON.Scene, project: ProjectData) {
  return applyWetLookToSlimeZoneModule(scene, project);
}

function createSlimeRainSystem(
  scene: BABYLON.Scene,
  project: ProjectData
): SlimeRainSystem {
  return createSlimeRainSystemModule(scene, project);
}

function createZoneLockBarrier(
  scene: BABYLON.Scene,
  name: string,
  position: BABYLON.Vector3,
  rotationY: number,
  size: { width: number; height: number; depth: number },
  color: BABYLON.Color3,
  getTitle: () => string,
  getSubtitle: () => string
) {
  return createZoneLockBarrierModule(
    scene,
    name,
    position,
    rotationY,
    size,
    color,
    getTitle,
    getSubtitle,
    {
      registerLocaleRefresher,
      rgbString,
    }
  );
}

function createSlimeEnemySystem(
  scene: BABYLON.Scene,
  project: ProjectData,
  camera: BABYLON.UniversalCamera,
  playerController: PlayerController
): SlimeEnemySystem {
  return createSlimeEnemySystemModule(scene, project, camera, playerController, {
    awardLeaderboardPoints,
    createZoneLockBarrier,
    getGroundHeight: (localX: number, localZ: number) =>
      sampleSlimeArenaHeight(localX, localZ) + SLIME_TERRAIN_Y_OFFSET,
    languageState: {
      get currentLanguage() {
        return currentLanguage;
      },
    },
    showCombatPopup,
    updateStatus,
  });
}

function createSlimeWeaponSystem(
  scene: BABYLON.Scene,
  camera: BABYLON.UniversalCamera,
  project: ProjectData,
  enemySystem: SlimeEnemySystem
): SlimeWeaponSystem {
  return createSlimeWeaponSystemModule(scene, camera, project, enemySystem, {
    getIsPointerLocked: () => isPointerLocked,
    isLeaderboardOpen,
    isOverviewOpen,
    projectPanel,
  });
}





function createDesertTerrain(scene: BABYLON.Scene, project: ProjectData) {
  return createDesertTerrainModule(scene, project, {
    createDetailedRockMesh,
    getOrCreateRockMaterial,
    hashNoise2D,
    sampleHeight: sampleSlimeArenaHeight,
    saturate,
  });
}

function createProjectRoom(scene: BABYLON.Scene, project: ProjectData) {
  const { back, right, inward, yaw } = getRoomBasis(project);
  const isSlime = project.id === "survivorSlime";
  const isCooking = project.id === "vrCooking";
  const isDriving = project.id === "drivingSim";

  if (isSlime) {
    createDesertTerrain(scene, project);
    addRoomTheme(scene, project);
    return;
  }

  if (isCooking) {
    createVrCookingZone(scene, project);
    addRoomTheme(scene, project);
    return;
  }

  if (isDriving) {
    createDrivingSimZone(scene, project);
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
  return createProjectLabelModule(scene, project, getProjectSignageDeps(), root);
}

function createProjectStand(scene: BABYLON.Scene, project: ProjectData) {
  return createProjectStandModule(scene, project, getProjectSignageDeps());
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
  const halfWorld = WORLD_SIZE * 0.5;
  const walls = [
    {
      name: "north",
      size: { width: WORLD_SIZE, height: 6, depth: 1 },
      position: new BABYLON.Vector3(0, 3, -halfWorld + 0.5),
    },
    {
      name: "south",
      size: { width: WORLD_SIZE, height: 6, depth: 1 },
      position: new BABYLON.Vector3(0, 3, halfWorld - 0.5),
    },
    {
      name: "west",
      size: { width: 1, height: 6, depth: WORLD_SIZE },
      position: new BABYLON.Vector3(-halfWorld + 0.5, 3, 0),
    },
    {
      name: "east",
      size: { width: 1, height: 6, depth: WORLD_SIZE },
      position: new BABYLON.Vector3(halfWorld - 0.5, 3, 0),
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

function createDrivingSimSystem(
  scene: BABYLON.Scene,
  project: ProjectData,
  camera: BABYLON.UniversalCamera,
  playerController: PlayerController
): DrivingSimSystem {
  return createDrivingSimSystemModule(scene, project, camera, playerController, {
    createZoneLockBarrier,
    canvas,
    drivingHint,
    drivingHud,
    drivingCheckpoint,
    drivingMode,
    drivingPopup,
    drivingRace,
    drivingSpeed,
    drivingTimer,
    awardLeaderboardPoints,
    getCurrentUiText,
    getFreeRoamStatusMessage,
    getIsPointerLocked: () => isPointerLocked,
    isLeaderboardOpen,
    isOverviewOpen,
    languageState: {
      get currentLanguage() {
        return currentLanguage;
      },
    },
    projectPanel,
    setIsDrivingVehicle: (value: boolean) => {
      isDrivingVehicle = value;
    },
    syncCrosshairVisibility,
    updateStatus,
  });
}

function getGroundProbe(scene: BABYLON.Scene, origin: BABYLON.Vector3) {
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

  return {
    distance: Math.max(0, groundHit.distance - rayOffset),
    point: groundHit.pickedPoint?.clone() ?? null,
  };
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
    if (isEditableTarget(event.target)) {
      return;
    }

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
    if (isEditableTarget(event.target)) {
      return;
    }

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

      if (isDrivingVehicle) {
        return;
      }

      const movementEnabled =
        isPointerLocked &&
        projectPanel.classList.contains("hidden") &&
        !isDrivingVehicle;

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

      const groundProbeBeforeMove = getGroundProbe(scene, state.bodyPosition);
      const groundDistanceBeforeMove = groundProbeBeforeMove?.distance ?? null;
      const groundedBeforeMove =
        groundDistanceBeforeMove !== null &&
        state.verticalVelocity <= 0 &&
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
      const groundProbeAfterMove = getGroundProbe(scene, state.bodyPosition);
      const groundDistanceAfterMove = groundProbeAfterMove?.distance ?? null;

      state.isGrounded =
        groundDistanceAfterMove !== null &&
        state.verticalVelocity <= 0 &&
        groundDistanceAfterMove <= PLAYER_HEIGHT + GROUND_CONTACT_EPSILON;

      if (state.isGrounded && groundProbeAfterMove?.point) {
        state.bodyPosition.y = groundProbeAfterMove.point.y + PLAYER_HEIGHT;
        camera.position.y = state.bodyPosition.y;
      }

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
    { width: WORLD_SIZE, height: WORLD_SIZE, subdivisions: 4 },
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

  createColumn(scene, 92, -92);
  createColumn(scene, -92, 92);
  createColumn(scene, 92, 92);

  createBounds(scene);

  projects.forEach((project) => {
    createProjectRoom(scene, project);
    if (
      project.id === "survivorSlime" ||
      project.id === "vrCooking" ||
      project.id === "drivingSim"
    ) {
      createProjectLabel(scene, project);
      return;
    }

    standMap.set(project.id, createProjectStand(scene, project));
  });

  const slimeProject = projects.find((project) => project.id === "survivorSlime");
  const vrCookingProject = projects.find((project) => project.id === "vrCooking");
  const drivingSimProject = projects.find((project) => project.id === "drivingSim");
  if (slimeProject) {
    applyWetLookToSlimeZone(scene, slimeProject);
  }

  const particles = createFloatingParticles(scene);
  const slimeRain = slimeProject
    ? createSlimeRainSystem(scene, slimeProject)
    : { lines: [], respawnLine: (_line: BABYLON.InstancedMesh) => undefined };
  const slimeEnemySystem = slimeProject
    ? createSlimeEnemySystem(scene, slimeProject, camera, playerController)
    : null;
  const slimeWeaponSystem =
    slimeProject && slimeEnemySystem
      ? createSlimeWeaponSystem(scene, camera, slimeProject, slimeEnemySystem)
      : null;
  const vrCookingSystem = vrCookingProject
    ? createVRCookingSystem(scene, vrCookingProject, camera, playerController)
    : null;
  const drivingSimSystem = drivingSimProject
    ? createDrivingSimSystem(scene, drivingSimProject, camera, playerController)
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
          updateStatus(`${currentLanguage === "fr" ? "Focus" : "Focus"}: ${getProjectText(activeProject).title}`);
        }
      }
      return;
    }

    if (projectId) {
      const project = projects.find((entry) => entry.id === projectId);
      if (project) {
        const text = getProjectText(project);
        updateStatus(
          interactionMode === "panel"
            ? currentLanguage === "fr"
              ? `Vise ${text.title} - appuie sur E pour ouvrir la fiche`
              : `Aim at ${text.title} - press E to open the sheet`
            : currentLanguage === "fr"
              ? `Vise ${text.title} - appuie sur E pour ouvrir`
              : `Aim at ${text.title} - press E to open`
        );
      }
      return;
    }

    if (activeProjectId) {
      const project = projects.find((entry) => entry.id === activeProjectId);
      if (project) {
        updateStatus(`${currentLanguage === "fr" ? "Focus" : "Focus"}: ${getProjectText(project).title}`);
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
      "#projectRail, #projectPanel, #topbar, #heroPanel, #closePanel, #leaderboardPanel"
    );

    if (!clickedUi && document.pointerLockElement !== canvas) {
      canvas.requestPointerLock();
      return;
    }

    if (event.button === 0 && isPointerLocked) {
      if (!hoveredProjectId && drivingSimSystem?.interact(false)) {
        return;
      }

      if (!hoveredProjectId && vrCookingSystem?.interact()) {
        return;
      }

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
    if (isEditableTarget(event.target)) {
      return;
    }

    if (event.key.toLowerCase() !== "e") {
      return;
    }

    if (drivingSimSystem?.isDriving() && drivingSimSystem.interact(true)) {
      return;
    }

    if (hoveredProjectId) {
      if (hoveredInteractionMode === "panel") {
        openProjectInfo(hoveredProjectId);
      } else {
        focusProject(hoveredProjectId, true);
      }
      return;
    }

    if (drivingSimSystem?.interact(true)) {
      return;
    }

    vrCookingSystem?.interact();
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
    drivingSimSystem?.update();
    const crosshairState = slimeWeaponSystem?.getCrosshairState();
    crosshair.classList.toggle("combat", Boolean(crosshairState?.armed));
    crosshair.classList.toggle("targeting", Boolean(crosshairState?.targeting));
    crosshair.classList.toggle("cooldown", Boolean(crosshairState?.coolingDown));
    crosshair.classList.toggle("firing", Boolean(crosshairState?.firing));
    crosshair.classList.toggle("hit", Boolean(crosshairState?.hit));

    isInSlimeCombatZone = slimeEnemySystem?.isPlayerInsideArena() ?? false;
    isInVRCookingZone = vrCookingSystem?.isPlayerInsideZone() ?? false;
    isInDrivingSimZone = drivingSimSystem?.isPlayerInsideZone() ?? false;
    isDrivingVehicle = drivingSimSystem?.isDriving() ?? false;
    vrCookingSystem?.update();
    const showCombatHud =
      isInSlimeCombatZone &&
      projectPanel.classList.contains("hidden") &&
      !isOverviewOpen() &&
      !isLeaderboardOpen();
    combatHud.classList.toggle("hidden", !showCombatHud);
    if (showCombatHud && slimeEnemySystem) {
      combatScore.textContent = slimeEnemySystem
        .getScore()
        .toString()
        .padStart(4, "0");
      const enemyCount = slimeEnemySystem.getEnemyCount();
      const difficultyTier = slimeEnemySystem.getDifficultyTier();
      const hitCount = slimeEnemySystem.getPlayerHitCount();
      combatStatus.textContent = slimeEnemySystem.isLocked()
        ? currentLanguage === "fr"
          ? "Arene verrouillee - 4 impacts subis."
          : "Arena locked - 4 hits taken."
        : enemyCount > 0
          ? currentLanguage === "fr"
            ? `${enemyCount} slime${enemyCount > 1 ? "s" : ""} actif${enemyCount > 1 ? "s" : ""} - niveau ${difficultyTier} - ${SLIME_PLAYER_HIT_LIMIT - hitCount} impact${SLIME_PLAYER_HIT_LIMIT - hitCount > 1 ? "s" : ""} restant${SLIME_PLAYER_HIT_LIMIT - hitCount > 1 ? "s" : ""}`
            : `${enemyCount} active slime${enemyCount > 1 ? "s" : ""} - tier ${difficultyTier} - ${SLIME_PLAYER_HIT_LIMIT - hitCount} hit${SLIME_PLAYER_HIT_LIMIT - hitCount > 1 ? "s" : ""} left`
          : currentLanguage === "fr"
            ? `Zone securisee pour l'instant - niveau ${difficultyTier} - les slimes repopent tant que tu restes dans l'arene`
            : `Area secured for now - tier ${difficultyTier} - slimes keep respawning while you stay in the arena`;
    }
    if (combatPopup.classList.contains("visible") && performance.now() >= combatPopupHideAt) {
      combatPopup.classList.remove("visible");
    }

    if (isDrivingVehicle) {
      setHoveredProject(null);
    } else {
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
    }

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
localeRefreshers.forEach((refresher) => refresher());

engine.runRenderLoop(() => {
  scene.render();
});

window.addEventListener("resize", () => {
  engine.resize();
});




























