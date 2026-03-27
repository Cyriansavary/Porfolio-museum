import * as BABYLON from "babylonjs";
import "./style.css";
import {
  CURRENT_TESTER_STORAGE_KEY,
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
  SLIME_ARENA_HALF_SIZE,
  SLIME_ARENA_SIZE,
  SLIME_ENEMY_CHASE_SPEED_MAX,
  SLIME_ENEMY_CHASE_SPEED_MIN,
  SLIME_ENEMY_FALL_GRAVITY,
  SLIME_ENEMY_MAX,
  SLIME_ENEMY_SPAWN_INTERVAL,
  SLIME_ENEMY_SPAWN_MAX_HEIGHT,
  SLIME_ENEMY_SPAWN_MIN_HEIGHT,
  SLIME_PLAYER_CONTACT_DISTANCE,
  SLIME_PLAYER_HIT_LIMIT,
  SLIME_TERRAIN_Y_OFFSET,
  SLIME_WEAPON_BOLT_LIFETIME,
  SLIME_WEAPON_COOLDOWN,
  SLIME_WEAPON_RANGE,
  SLIME_WEAPON_SCORE_PER_KILL,
  SPRINT_FOV_BOOST,
  SPRINT_SPEED,
  START_POSITION,
  VR_COOKING_COMBO_BONUS_STEP,
  VR_COOKING_COMBO_MAX_BONUS,
  VR_COOKING_COMBO_WINDOW,
  VR_COOKING_FAILURE_LIMIT,
  VR_COOKING_GRILL_TIME,
  VR_COOKING_INITIAL_CLIENT_COUNT,
  VR_COOKING_INTERACTION_DISTANCE,
  VR_COOKING_ORDER_COUNT,
  VR_COOKING_ORDER_DANGER_TIME,
  VR_COOKING_ORDER_TIME_LIMIT,
  VR_COOKING_ORDER_WARNING_TIME,
  VR_COOKING_SECOND_CLIENT_DELAY,
  VR_COOKING_TIMEOUT_PENALTY,
  VR_COOKING_ZONE_DEPTH,
  VR_COOKING_ZONE_WIDTH,
  WALK_FOV,
  WALK_SPEED,
  WORLD_SIZE,
  COYOTE_TIME,
  CAMERA_ROLL_INTENSITY,
} from "./constants";
import type {
  AppLanguage,
  CollisionCamera,
  CookingPopupTone,
  CreatedStand,
  DrivingInteractionId,
  DrivingInteractableMetadata,
  DrivingSimSystem,
  FloatingParticle,
  LeaderboardCategory,
  LeaderboardEntry,
  PlayerController,
  ProjectData,
  ProjectInteractionMetadata,
  ProjectInteractionMode,
  RockTextureSet,
  SlimeEnemy,
  SlimeEnemySystem,
  SlimeRainDropMetadata,
  SlimeRainSystem,
  SlimeWeaponSystem,
  VRCookingInventory,
  VRCookingOrder,
  VRCookingOrderType,
  VRCookingStation,
  VRCookingStationType,
  VRCookingSystem,
} from "./types";
import { projects, projectTextByLanguage } from "./projects";
import { uiText } from "./ui-text";

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
const drivingHint = document.getElementById("drivingHint") as HTMLParagraphElement;

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

function moveToward(current: number, target: number, maxDelta: number) {
  if (Math.abs(target - current) <= maxDelta) {
    return target;
  }

  return current + Math.sign(target - current) * maxDelta;
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

function isEditableTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) {
    return false;
  }

  if (target.isContentEditable) {
    return true;
  }

  return (
    target instanceof HTMLInputElement ||
    target instanceof HTMLTextAreaElement ||
    target instanceof HTMLSelectElement
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
                <strong>${escapeHtml(ui.leaderboardMetricSlime)}</strong>
                <span>${entry.slimeScore} pts</span>
              </div>
              <div class="leaderboard-entry-metric">
                <strong>${escapeHtml(ui.leaderboardMetricCooking)}</strong>
                <span>${entry.cookingScore} pts</span>
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
  } else {
    activeTester.cookingScore = Math.max(0, activeTester.cookingScore + delta);
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
      ? "Zone DrivingSim - ZQSD ou WASD pour conduire, Space pour freiner, E pour sortir du vehicule"
      : "DrivingSim zone - ZQSD or WASD to drive, Space to brake, E to exit the vehicle";
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
      ? "Zone DrivingSim - approche-toi de la voiture et clique ou appuie sur E pour prendre le volant"
      : "DrivingSim zone - get close to the car and click or press E to take the wheel";
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

function createKitchenCounterModule(
  scene: BABYLON.Scene,
  name: string,
  position: BABYLON.Vector3,
  rotationY: number,
  width: number,
  depth: number,
  accentColor: BABYLON.Color3,
  height = 0.92
) {
  const root = new BABYLON.TransformNode(`${name}_root`, scene);
  root.position = position.clone();
  root.rotation.y = rotationY;

  const bodyMat = createMaterial(
    scene,
    `${name}_bodyMat`,
    new BABYLON.Color3(0.2, 0.2, 0.19),
    accentColor.scale(0.08)
  );
  const topMat = createMaterial(
    scene,
    `${name}_topMat`,
    new BABYLON.Color3(0.45, 0.3, 0.18),
    accentColor.scale(0.12)
  );
  const trimMat = createMaterial(
    scene,
    `${name}_trimMat`,
    new BABYLON.Color3(0.08, 0.08, 0.09),
    new BABYLON.Color3(0.01, 0.01, 0.012)
  );

  const body = BABYLON.MeshBuilder.CreateBox(
    `${name}_body`,
    { width, height, depth },
    scene
  );
  body.parent = root;
  body.position.y = height * 0.5;
  body.isPickable = false;
  body.material = bodyMat;

  const top = BABYLON.MeshBuilder.CreateBox(
    `${name}_top`,
    { width: width + 0.08, height: 0.08, depth: depth + 0.08 },
    scene
  );
  top.parent = root;
  top.position.y = height + 0.04;
  top.isPickable = false;
  top.material = topMat;

  const kick = BABYLON.MeshBuilder.CreateBox(
    `${name}_kick`,
    { width: width - 0.12, height: 0.1, depth: depth - 0.12 },
    scene
  );
  kick.parent = root;
  kick.position.y = 0.05;
  kick.isPickable = false;
  kick.material = trimMat;

  enableCollisions(body, top, kick);
  return root;
}

function createKitchenTallUnit(
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

  const bodyMat = createMaterial(
    scene,
    `${name}_bodyMat`,
    new BABYLON.Color3(0.72, 0.72, 0.7),
    accentColor.scale(0.06)
  );
  const trimMat = createMaterial(
    scene,
    `${name}_trimMat`,
    new BABYLON.Color3(0.18, 0.18, 0.18),
    accentColor.scale(0.08)
  );

  const body = BABYLON.MeshBuilder.CreateBox(
    `${name}_body`,
    { width, height, depth },
    scene
  );
  body.parent = root;
  body.position.y = height * 0.5;
  body.isPickable = false;
  body.material = bodyMat;

  const upperDoor = BABYLON.MeshBuilder.CreateBox(
    `${name}_upperDoor`,
    { width: width - 0.04, height: height * 0.46, depth: 0.04 },
    scene
  );
  upperDoor.parent = root;
  upperDoor.position = new BABYLON.Vector3(0, height * 0.72, -depth * 0.5 - 0.02);
  upperDoor.isPickable = false;
  upperDoor.material = trimMat;

  const lowerDoor = BABYLON.MeshBuilder.CreateBox(
    `${name}_lowerDoor`,
    { width: width - 0.04, height: height * 0.4, depth: 0.04 },
    scene
  );
  lowerDoor.parent = root;
  lowerDoor.position = new BABYLON.Vector3(0, height * 0.24, -depth * 0.5 - 0.02);
  lowerDoor.isPickable = false;
  lowerDoor.material = trimMat;

  enableCollisions(body, upperDoor, lowerDoor);
  return root;
}

function createKitchenPendantLight(
  scene: BABYLON.Scene,
  name: string,
  position: BABYLON.Vector3,
  color: BABYLON.Color3
) {
  const cable = BABYLON.MeshBuilder.CreateCylinder(
    `${name}_cable`,
    { diameter: 0.03, height: 1.2, tessellation: 8 },
    scene
  );
  cable.position = position.add(new BABYLON.Vector3(0, -0.6, 0));
  cable.isPickable = false;
  cable.material = createMaterial(
    scene,
    `${name}_cableMat`,
    new BABYLON.Color3(0.06, 0.06, 0.07),
    new BABYLON.Color3(0.01, 0.01, 0.012)
  );

  const shade = BABYLON.MeshBuilder.CreateCylinder(
    `${name}_shade`,
    { diameterTop: 0.28, diameterBottom: 0.82, height: 0.42, tessellation: 20 },
    scene
  );
  shade.position = position.add(new BABYLON.Vector3(0, -1.22, 0));
  shade.isPickable = false;
  shade.material = createMaterial(
    scene,
    `${name}_shadeMat`,
    new BABYLON.Color3(0.9, 0.86, 0.78),
    color.scale(0.16)
  );

  const bulb = BABYLON.MeshBuilder.CreateSphere(
    `${name}_bulb`,
    { diameter: 0.18, segments: 10 },
    scene
  );
  bulb.position = position.add(new BABYLON.Vector3(0, -1.28, 0));
  bulb.isPickable = false;
  bulb.material = createMaterial(
    scene,
    `${name}_bulbMat`,
    new BABYLON.Color3(0.96, 0.88, 0.62),
    new BABYLON.Color3(0.64, 0.42, 0.12)
  );

  const light = new BABYLON.PointLight(`${name}_light`, bulb.position.clone(), scene);
  light.diffuse = new BABYLON.Color3(1, 0.84, 0.66);
  light.intensity = 0.65;
  light.range = 8;
}

function createVrCookingZone(scene: BABYLON.Scene, project: ProjectData) {
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

function createVRCookingSystem(
  scene: BABYLON.Scene,
  project: ProjectData,
  camera: BABYLON.UniversalCamera,
  playerController: PlayerController
): VRCookingSystem {
  const { right, back, yaw } = getRoomBasis(project);
  const zoneHalfWidth = VR_COOKING_ZONE_WIDTH * 0.5;
  const zoneHalfDepth = VR_COOKING_ZONE_DEPTH * 0.5;
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

  const stations = new Map<VRCookingStationType, VRCookingStation>();
  const inventory: VRCookingInventory = {
    bun: false,
    rawSteak: false,
    cookedSteak: false,
    cheese: false,
    lettuce: false,
    tomato: false,
    burger: null,
  };
  const orderQueue: VRCookingOrder[] = [];
  const clientSlots: Array<{
    body: BABYLON.Mesh;
    head: BABYLON.Mesh;
    badge: BABYLON.Mesh;
  }> = [];

  let focusedStationId: VRCookingStationType | null = null;
  let score = 0;
  let grillActive = false;
  let grillReady = false;
  let grillProgress = 0;
  let orderBoardDirty = true;
  let lastBoardRefreshAt = 0;
  let nextOrderId = 1;
  let comboStreak = 0;
  let comboExpiresAt = 0;
  let unlockedClientCount = VR_COOKING_INITIAL_CLIENT_COUNT;
  let cookingActiveElapsedMs = 0;
  let failedOrders = 0;
  let locked = false;

  const entranceBarrier = createZoneLockBarrier(
    scene,
    `${project.id}_lockBarrier`,
    toWorld(0, 1.34, -zoneHalfDepth + 1.72),
    yaw,
    { width: 4.96, height: 2.68, depth: 0.28 },
    project.color,
    () => (currentLanguage === "fr" ? "SERVICE FERME" : "SERVICE CLOSED"),
    () =>
      currentLanguage === "fr"
        ? "3 clients perdus - acces bloque"
        : "3 customers lost - area locked"
  );

  const resetInventory = () => {
    inventory.bun = false;
    inventory.rawSteak = false;
    inventory.cookedSteak = false;
    inventory.cheese = false;
    inventory.lettuce = false;
    inventory.tomato = false;
    inventory.burger = null;
  };

  const isInventoryEmpty = () =>
    !inventory.bun &&
    !inventory.rawSteak &&
    !inventory.cookedSteak &&
    !inventory.cheese &&
    !inventory.lettuce &&
    !inventory.tomato &&
    inventory.burger === null;

  const lockKitchen = () => {
    if (locked) {
      return;
    }

    locked = true;
    entranceBarrier.setEnabled(true);
    resetInventory();
    orderQueue.length = 0;
    grillActive = false;
    grillReady = false;
    grillProgress = 0;
    comboStreak = 0;
    comboExpiresAt = 0;
    focusedStationId = null;
    orderBoardDirty = true;
    showCookingPopup(
      currentLanguage === "fr" ? "Cuisine fermee" : "Kitchen closed",
      "error",
      1600
    );
    updateStatus(
      currentLanguage === "fr"
        ? "VR Cooking verrouille : 3 clients ont ete perdus."
        : "VR Cooking locked: 3 customers were lost."
    );
    playerController.syncPosition(
      toWorld(0, PLAYER_HEIGHT, -zoneHalfDepth - 1.35)
    );
  };

  const registerFailure = (count: number) => {
    if (locked || count <= 0) {
      return;
    }

    failedOrders = Math.min(VR_COOKING_FAILURE_LIMIT, failedOrders + count);
    orderBoardDirty = true;
    if (failedOrders >= VR_COOKING_FAILURE_LIMIT) {
      lockKitchen();
    }
  };

  const getIngredientLabels = () =>
    currentLanguage === "fr"
      ? {
          bun: "pain burger",
          bunShort: "pain",
          rawSteak: "steak cru",
          cookedSteak: "steak cuit",
          cheese: "fromage",
          lettuce: "salade",
          tomato: "tomate",
        }
      : {
          bun: "burger bun",
          bunShort: "bun",
          rawSteak: "raw patty",
          cookedSteak: "cooked patty",
          cheese: "cheese",
          lettuce: "lettuce",
          tomato: "tomato",
        };

  const recipeDefinitions: Record<
    VRCookingOrderType,
    {
      titles: Record<AppLanguage, string>;
      ingredientKeys: Array<keyof ReturnType<typeof getIngredientLabels>>;
      reward: number;
      tint: BABYLON.Color3;
    }
  > = {
    classic: {
      titles: { fr: "Burger classique", en: "Classic burger" },
      ingredientKeys: ["bun", "cookedSteak"],
      reward: 120,
      tint: new BABYLON.Color3(1, 0.76, 0.3),
    },
    cheese: {
      titles: { fr: "Cheeseburger", en: "Cheeseburger" },
      ingredientKeys: ["bun", "cookedSteak", "cheese"],
      reward: 145,
      tint: new BABYLON.Color3(1, 0.88, 0.32),
    },
    salad: {
      titles: { fr: "Burger salade", en: "Lettuce burger" },
      ingredientKeys: ["bun", "cookedSteak", "lettuce"],
      reward: 150,
      tint: new BABYLON.Color3(0.34, 0.92, 0.3),
    },
    tomato: {
      titles: { fr: "Burger tomate", en: "Tomato burger" },
      ingredientKeys: ["bun", "cookedSteak", "tomato"],
      reward: 145,
      tint: new BABYLON.Color3(1, 0.46, 0.36),
    },
    cheeseTomato: {
      titles: { fr: "Burger cheddar tomate", en: "Cheddar tomato burger" },
      ingredientKeys: ["bun", "cookedSteak", "cheese", "tomato"],
      reward: 175,
      tint: new BABYLON.Color3(1, 0.62, 0.34),
    },
    cheeseSalad: {
      titles: { fr: "Burger cheddar salade", en: "Cheddar lettuce burger" },
      ingredientKeys: ["bun", "cookedSteak", "cheese", "lettuce"],
      reward: 178,
      tint: new BABYLON.Color3(0.74, 0.92, 0.3),
    },
    fresh: {
      titles: { fr: "Burger fraicheur", en: "Fresh burger" },
      ingredientKeys: ["bun", "cookedSteak", "lettuce", "tomato"],
      reward: 176,
      tint: new BABYLON.Color3(0.3, 0.9, 0.72),
    },
    deluxe: {
      titles: { fr: "Burger deluxe", en: "Deluxe burger" },
      ingredientKeys: ["bun", "cookedSteak", "cheese", "lettuce", "tomato"],
      reward: 210,
      tint: new BABYLON.Color3(0.4, 1, 0.84),
    },
  };

  const getRecipeInfo = (type: VRCookingOrderType) => {
    const ingredientLabels = getIngredientLabels();
    const definition = recipeDefinitions[type];
    return {
      title: definition.titles[currentLanguage],
      ingredients: definition.ingredientKeys.map((key) => ingredientLabels[key]),
      reward: definition.reward,
      tint: definition.tint,
    };
  };
  const orderPool: VRCookingOrderType[] = [
    "classic",
    "classic",
    "cheese",
    "salad",
    "tomato",
    "cheeseTomato",
    "cheeseSalad",
    "fresh",
    "deluxe",
  ];

  const getHeldLabel = () => {
    if (inventory.burger) {
      return currentLanguage === "fr"
        ? `Plateau : ${getRecipeInfo(inventory.burger).title.toLowerCase()} pret a servir`
        : `Tray: ${getRecipeInfo(inventory.burger).title.toLowerCase()} ready to serve`;
    }

    const ingredientLabels = getIngredientLabels();
    const items: string[] = [];
    if (inventory.bun) {
      items.push(ingredientLabels.bunShort);
    }
    if (inventory.rawSteak) {
      items.push(ingredientLabels.rawSteak);
    }
    if (inventory.cookedSteak) {
      items.push(ingredientLabels.cookedSteak);
    }
    if (inventory.cheese) {
      items.push(ingredientLabels.cheese);
    }
    if (inventory.lettuce) {
      items.push(ingredientLabels.lettuce);
    }
    if (inventory.tomato) {
      items.push(ingredientLabels.tomato);
    }

    return items.length > 0
      ? currentLanguage === "fr"
        ? `Plateau : ${items.join(" + ")}`
        : `Tray: ${items.join(" + ")}`
      : getCurrentUiText().cookingHeldEmpty;
  };

  const applyLocalizedOrder = (order: VRCookingOrder) => {
    const recipe = getRecipeInfo(order.type);
    order.title = recipe.title;
    order.ingredients = recipe.ingredients;
    order.reward = recipe.reward;
  };

  const createOrder = (): VRCookingOrder => {
    const type = orderPool[Math.floor(Math.random() * orderPool.length)];
    const recipe = getRecipeInfo(type);
    return {
      id: nextOrderId++,
      type,
      title: recipe.title,
      ingredients: recipe.ingredients,
      reward: recipe.reward,
      timeLimitMs: VR_COOKING_ORDER_TIME_LIMIT * 1000,
      remainingMs: VR_COOKING_ORDER_TIME_LIMIT * 1000,
    };
  };

  const refillOrders = () => {
    if (locked) {
      return;
    }

    while (orderQueue.length < unlockedClientCount) {
      orderQueue.push(createOrder());
    }
  };

  const getOrderTimeLeftMs = (order: VRCookingOrder) => Math.max(0, order.remainingMs);

  const getOrderUrgency = (order: VRCookingOrder) =>
    1 - Math.min(1, getOrderTimeLeftMs(order) / order.timeLimitMs);

  const getComboBonus = () =>
    Math.min(
      VR_COOKING_COMBO_MAX_BONUS,
      Math.max(0, comboStreak - 1) * VR_COOKING_COMBO_BONUS_STEP
    );

  const registerStation = (
    id: VRCookingStationType,
    interactionMesh: BABYLON.AbstractMesh,
    meshes: BABYLON.AbstractMesh[],
    emissiveColor: BABYLON.Color3
  ) => {
    interactionMesh.metadata = { vrCookingStationId: id };
    stations.set(id, {
      id,
      interactionMesh,
      meshes,
      emissiveColor,
    });
  };

  const createHotspot = (
    name: string,
    position: BABYLON.Vector3,
    width: number,
    depth: number,
    color: BABYLON.Color3,
    rotationY = yaw
  ) => {
    const hotspot = BABYLON.MeshBuilder.CreateBox(
      name,
      { width, height: 0.035, depth },
      scene
    );
    hotspot.position = position;
    hotspot.rotation.y = rotationY;
    hotspot.isPickable = true;
    hotspot.material = createMaterial(
      scene,
      `${name}_mat`,
      color.scale(0.18),
      color.scale(0.42),
      0.24
    );
    if (hotspot.material instanceof BABYLON.StandardMaterial) {
      hotspot.material.disableLighting = true;
    }
    return hotspot;
  };

  const createCrateFrontLabel = (
    name: string,
    text: string | (() => string),
    parent: BABYLON.Mesh,
    _height: number,
    depth: number,
    tint: BABYLON.Color3,
    side: "front" | "back" = "front"
  ) => {
    const texture = new BABYLON.DynamicTexture(
      `${name}_labelTexture`,
      { width: 384, height: 120 },
      scene,
      true
    );
    texture.hasAlpha = true;
    const context = texture.getContext() as CanvasRenderingContext2D;
    registerLocaleRefresher(() => {
      const resolvedText = typeof text === "function" ? text() : text;
      context.clearRect(0, 0, 384, 120);
      context.fillStyle = "rgba(10, 12, 18, 0.92)";
      context.fillRect(8, 8, 368, 104);
      context.strokeStyle = rgbString(tint);
      context.lineWidth = 3;
      context.strokeRect(8, 8, 368, 104);
      context.fillStyle = "rgba(244, 247, 255, 0.96)";
      context.font = "700 34px Segoe UI";
      context.textAlign = "center";
      context.textBaseline = "middle";
      context.fillText(resolvedText, 192, 60);
      texture.update();
    });

    const material = new BABYLON.StandardMaterial(`${name}_labelMat`, scene);
    material.diffuseTexture = texture;
    material.emissiveTexture = texture;
    material.opacityTexture = texture;
    material.disableLighting = true;
    material.backFaceCulling = false;

    const plane = BABYLON.MeshBuilder.CreatePlane(
      `${name}_label`,
      { width: 0.54, height: 0.16, sideOrientation: BABYLON.Mesh.FRONTSIDE },
      scene
    );
    plane.parent = parent;
    plane.position = new BABYLON.Vector3(
      0,
      0.01,
      side === "back" ? depth * 0.5 + 0.016 : -depth * 0.5 - 0.016
    );
    plane.rotation.x = 0;
    plane.rotation.y = side === "back" ? Math.PI : 0;
    plane.isPickable = false;
    plane.material = material;
    return plane;
  };

  const boardTexture = new BABYLON.DynamicTexture(
    `${project.id}_ordersTexture`,
    { width: 1280, height: 900 },
    scene,
    true
  );
  boardTexture.hasAlpha = true;

  const boardMaterial = new BABYLON.StandardMaterial(
    `${project.id}_ordersMat`,
    scene
  );
  boardMaterial.diffuseTexture = boardTexture;
  boardMaterial.emissiveTexture = boardTexture;
  boardMaterial.opacityTexture = boardTexture;
  boardMaterial.disableLighting = true;
  boardMaterial.backFaceCulling = false;

  const orderBoardX = -0.55;
  const boardFrame = BABYLON.MeshBuilder.CreateBox(
    `${project.id}_ordersFrame`,
    { width: 4.48, height: 2.72, depth: 0.14 },
    scene
  );
  boardFrame.position = toWorld(orderBoardX, 2.58, zoneHalfDepth - 0.24);
  boardFrame.rotation.y = yaw;
  boardFrame.isPickable = false;
  boardFrame.material = createMaterial(
    scene,
    `${project.id}_ordersFrameMat`,
    new BABYLON.Color3(0.12, 0.13, 0.16),
    project.color.scale(0.12)
  );

  const orderBoard = BABYLON.MeshBuilder.CreatePlane(
    `${project.id}_ordersBoard`,
    { width: 4.2, height: 2.48, sideOrientation: BABYLON.Mesh.DOUBLESIDE },
    scene
  );
  orderBoard.position = boardFrame.position.add(back.scale(-0.09));
  orderBoard.rotation.y = yaw + Math.PI;
  orderBoard.isPickable = false;
  orderBoard.material = boardMaterial;

  const updateClientVisuals = (now = performance.now()) => {
    clientSlots.forEach((slot, index) => {
      const order = orderQueue[index];
      const tint = order ? recipeDefinitions[order.type].tint : new BABYLON.Color3(1, 0.76, 0.3);
      const urgency = order ? getOrderUrgency(order) : 0;
      const pulse =
        order && urgency > 0.55
          ? 0.92 + Math.sin(now * 0.016 + index * 1.3) * (0.08 + urgency * 0.08)
          : 1;

      [slot.body, slot.head, slot.badge].forEach((mesh) => {
        mesh.setEnabled(Boolean(order));
        if (mesh.material instanceof BABYLON.StandardMaterial) {
          const baseEmissive =
            mesh === slot.badge ? 0.54 + urgency * 0.4 : 0.12 + urgency * 0.16;
          mesh.material.emissiveColor = tint.scale(baseEmissive * pulse);
        }
      });

      slot.body.scaling.y = order ? 1 + urgency * 0.08 : 1;
      slot.head.scaling = order
        ? new BABYLON.Vector3(1 + urgency * 0.03, 1 + urgency * 0.03, 1 + urgency * 0.03)
        : BABYLON.Vector3.One();
      slot.badge.scaling = order
        ? new BABYLON.Vector3(
            1 + urgency * 0.16,
            1 + urgency * 0.24 + Math.max(0, pulse - 1) * 0.5,
            1
          )
        : BABYLON.Vector3.One();
    });
  };

  const boardContext = boardTexture.getContext() as CanvasRenderingContext2D;
  const updateOrderBoard = (now = performance.now()) => {
    boardContext.clearRect(0, 0, 1280, 900);

    if (locked) {
      const gradient = boardContext.createLinearGradient(0, 0, 0, 900);
      gradient.addColorStop(0, "rgba(18, 10, 14, 0.98)");
      gradient.addColorStop(1, "rgba(8, 4, 8, 0.98)");
      boardContext.fillStyle = gradient;
      boardContext.fillRect(0, 0, 1280, 900);
      boardContext.fillStyle = "rgba(255, 116, 116, 0.18)";
      boardContext.fillRect(72, 72, 1136, 756);
      boardContext.strokeStyle = "rgba(255, 126, 126, 0.88)";
      boardContext.lineWidth = 4;
      boardContext.strokeRect(72, 72, 1136, 756);
      boardContext.textAlign = "center";
      boardContext.textBaseline = "middle";
      boardContext.fillStyle = "rgba(255, 236, 236, 0.96)";
      boardContext.font = "700 74px Segoe UI";
      boardContext.fillText(
        currentLanguage === "fr" ? "SERVICE FERME" : "SERVICE CLOSED",
        640,
        326
      );
      boardContext.fillStyle = "rgba(255, 202, 202, 0.9)";
      boardContext.font = "600 36px Segoe UI";
      boardContext.fillText(
        currentLanguage === "fr"
          ? "3 clients mal servis ou perdus"
          : "3 customers served wrong or lost",
        640,
        406
      );
      boardContext.fillStyle = "rgba(223, 232, 248, 0.84)";
      boardContext.font = "500 28px Segoe UI";
      boardContext.fillText(
        currentLanguage === "fr"
          ? "La cuisine est verrouillee pour le reste de la visite."
          : "The kitchen is locked for the rest of the visit.",
        640,
        470
      );
      boardContext.fillStyle = "rgba(255, 216, 180, 0.95)";
      boardContext.font = "700 34px Segoe UI";
      boardContext.fillText(
        `${currentLanguage === "fr" ? "Score final" : "Final score"} ${score
          .toString()
          .padStart(4, "0")}`,
        640,
        560
      );
      boardTexture.update();
      orderBoardDirty = false;
      lastBoardRefreshAt = performance.now();
      updateClientVisuals(now);
      return;
    }

    const gradient = boardContext.createLinearGradient(0, 0, 0, 900);
    gradient.addColorStop(0, "rgba(10, 16, 28, 0.98)");
    gradient.addColorStop(1, "rgba(4, 8, 14, 0.98)");
    boardContext.fillStyle = gradient;
    boardContext.fillRect(0, 0, 1280, 900);

    boardContext.fillStyle = "rgba(255, 186, 110, 0.14)";
    boardContext.fillRect(56, 58, 1168, 108);
    boardContext.strokeStyle = "rgba(255, 186, 110, 0.72)";
    boardContext.lineWidth = 4;
    boardContext.strokeRect(56, 58, 1168, 108);

    boardContext.fillStyle = "rgba(255, 214, 166, 0.96)";
    boardContext.font = "700 46px Segoe UI";
    boardContext.textAlign = "left";
    boardContext.textBaseline = "middle";
    boardContext.fillText(
      currentLanguage === "fr" ? "COMMANDES BURGER" : "BURGER ORDERS",
      94,
      112
    );

    boardContext.fillStyle = "rgba(221, 235, 255, 0.78)";
    boardContext.font = "500 24px Segoe UI";
    boardContext.fillText(
      currentLanguage === "fr"
        ? "Cuisine VR - production, cuisson et service"
        : "VR kitchen - prep, cooking and service",
      94,
      150
    );

    boardContext.textAlign = "right";
    boardContext.fillStyle = "rgba(127, 231, 203, 0.96)";
    boardContext.font = "700 42px Segoe UI";
    boardContext.fillText(`SCORE ${score.toString().padStart(4, "0")}`, 1186, 112);

    boardContext.fillStyle = "rgba(206, 218, 240, 0.88)";
    boardContext.font = "600 24px Segoe UI";
    const grillText = grillReady
      ? currentLanguage === "fr"
        ? "Grill : steak cuit pret"
        : "Grill: cooked patty ready"
      : grillActive
        ? currentLanguage === "fr"
          ? `Grill : ${Math.max(1, Math.ceil((1 - grillProgress) * VR_COOKING_GRILL_TIME))} s`
          : `Grill: ${Math.max(1, Math.ceil((1 - grillProgress) * VR_COOKING_GRILL_TIME))} s`
        : currentLanguage === "fr"
          ? "Grill : libre"
          : "Grill: idle";
    boardContext.fillText(grillText, 1186, 148);

    const visibleOrderCount = Math.max(1, orderQueue.length);
    const cardHeight = visibleOrderCount > 1 ? 248 : 278;
    const cardGap = visibleOrderCount > 1 ? 24 : 0;
    const cardStartY = visibleOrderCount > 1 ? 216 : 230;

    orderQueue.forEach((order, index) => {
      const x = 76;
      const y = cardStartY + index * (cardHeight + cardGap);
      const width = 1128;
      const height = cardHeight;
      const timeLeftMs = getOrderTimeLeftMs(order);
      const urgency = getOrderUrgency(order);
      const timeLeftSeconds = Math.ceil(timeLeftMs / 1000);
      const tint = recipeDefinitions[order.type].tint;
      const timerColor =
        timeLeftMs <= VR_COOKING_ORDER_DANGER_TIME * 1000
          ? "rgba(255, 124, 124, 0.98)"
          : timeLeftMs <= VR_COOKING_ORDER_WARNING_TIME * 1000
            ? "rgba(255, 208, 132, 0.98)"
            : "rgba(127, 231, 203, 0.96)";
      const cardGradient = boardContext.createLinearGradient(x, y, x + width, y + height);
      cardGradient.addColorStop(0, `rgba(${Math.round(18 + tint.r * 24)}, ${Math.round(
        24 + tint.g * 26
      )}, ${Math.round(32 + tint.b * 24)}, 0.96)`);
      cardGradient.addColorStop(
        1,
        urgency > 0.74 ? "rgba(44, 16, 18, 0.96)" : "rgba(12, 18, 30, 0.92)"
      );

      boardContext.fillStyle = cardGradient;
      boardContext.fillRect(x, y, width, height);
      boardContext.strokeStyle = `rgba(${Math.round(tint.r * 255)}, ${Math.round(
        tint.g * 255
      )}, ${Math.round(tint.b * 255)}, 0.72)`;
      boardContext.lineWidth = 3;
      boardContext.strokeRect(x, y, width, height);

      boardContext.fillStyle = "rgba(127, 231, 203, 0.92)";
      boardContext.font = "700 26px Segoe UI";
      boardContext.textAlign = "left";
      boardContext.fillText(
        `${currentLanguage === "fr" ? "CLIENT" : "CLIENT"} ${String.fromCharCode(65 + index)}`,
        x + 26,
        y + 34
      );

      boardContext.fillStyle = "rgba(245, 248, 255, 0.98)";
      boardContext.font = "700 48px Segoe UI";
      boardContext.fillText(order.title, x + 26, y + 92);

      boardContext.fillStyle = "rgba(196, 210, 234, 0.88)";
      boardContext.font = "600 22px Segoe UI";
      order.ingredients.forEach((ingredient, ingredientIndex) => {
        boardContext.fillText(`- ${ingredient}`, x + 28, y + 140 + ingredientIndex * 22);
      });

      boardContext.textAlign = "right";
      boardContext.fillStyle = "rgba(255, 236, 182, 0.96)";
      boardContext.font = "700 34px Segoe UI";
      boardContext.fillText(`+${order.reward} pts`, x + width - 28, y + 46);

      boardContext.fillStyle = timerColor;
      boardContext.font = "700 34px Segoe UI";
      boardContext.fillText(`${timeLeftSeconds}s`, x + width - 28, y + 92);

      boardContext.fillStyle = "rgba(255, 255, 255, 0.08)";
      boardContext.fillRect(x + 26, y + height - 22, width - 52, 10);
      boardContext.fillStyle = timerColor;
      boardContext.fillRect(
        x + 26,
        y + height - 22,
        (width - 52) * Math.max(0.06, timeLeftMs / order.timeLimitMs),
        10
      );
    });

    boardContext.textAlign = "left";
    boardContext.fillStyle = "rgba(168, 186, 212, 0.76)";
    boardContext.font = "500 24px Segoe UI";
    boardContext.fillText(
      currentLanguage === "fr"
        ? "Bacs infinis : pain, steak cru, fromage, salade, tomate | clic ou E pour interagir"
        : "Infinite bins: bun, raw patty, cheese, lettuce, tomato | click or E to interact",
      76,
      812
    );
    const clientReleaseText =
      unlockedClientCount < VR_COOKING_ORDER_COUNT
        ? currentLanguage === "fr"
          ? `Client B arrive dans ${Math.max(
              0,
              Math.ceil((VR_COOKING_SECOND_CLIENT_DELAY * 1000 - cookingActiveElapsedMs) / 1000)
            )} s`
          : `Client B arrives in ${Math.max(
              0,
              Math.ceil((VR_COOKING_SECOND_CLIENT_DELAY * 1000 - cookingActiveElapsedMs) / 1000)
            )} s`
        : currentLanguage === "fr"
          ? "Deux postes clients actifs"
          : "Two customer slots active";
    boardContext.fillText(clientReleaseText, 76, 850);

    boardTexture.update();
    orderBoardDirty = false;
    lastBoardRefreshAt = performance.now();
    updateClientVisuals(now);
  };

  registerLocaleRefresher(() => {
    orderQueue.forEach((order) => applyLocalizedOrder(order));
    orderBoardDirty = true;
    updateOrderBoard();
    cookingHeld.textContent = getHeldLabel();
    cookingHint.textContent = getHintForStation();
  });

  const updateCookingHudState = (now: number) => {
    if (locked) {
      cookingHud.classList.remove("urgent", "danger");
      cookingRush.classList.remove("warning", "danger");
      cookingCombo.classList.remove("active");
      cookingRush.textContent =
        currentLanguage === "fr" ? "Cuisine fermee" : "Kitchen closed";
      cookingCombo.textContent =
        currentLanguage === "fr"
          ? `Erreurs ${failedOrders}/${VR_COOKING_FAILURE_LIMIT}`
          : `Fails ${failedOrders}/${VR_COOKING_FAILURE_LIMIT}`;
      return;
    }

    const nextExpiry = orderQueue.reduce((minTime, order) => {
      return Math.min(minTime, getOrderTimeLeftMs(order));
    }, Number.POSITIVE_INFINITY);
    const hasUrgency = Number.isFinite(nextExpiry);
    const isWarning = hasUrgency && nextExpiry <= VR_COOKING_ORDER_WARNING_TIME * 1000;
    const isDanger = hasUrgency && nextExpiry <= VR_COOKING_ORDER_DANGER_TIME * 1000;
    const comboActive = comboStreak > 1 && now < comboExpiresAt;
    const comboSeconds = Math.max(0, Math.ceil((comboExpiresAt - now) / 1000));

    cookingHud.classList.toggle("urgent", Boolean(isWarning));
    cookingHud.classList.toggle("danger", Boolean(isDanger));
    cookingRush.classList.toggle("warning", Boolean(isWarning && !isDanger));
    cookingRush.classList.toggle("danger", Boolean(isDanger));
    cookingCombo.classList.toggle("active", comboActive);

    if (!hasUrgency) {
      cookingRush.textContent = getCurrentUiText().cookingRushStable;
    } else if (isDanger) {
      cookingRush.textContent =
        currentLanguage === "fr"
          ? `Urgence ${Math.max(1, Math.ceil(nextExpiry / 1000))} s`
          : `Urgency ${Math.max(1, Math.ceil(nextExpiry / 1000))} s`;
    } else if (isWarning) {
      cookingRush.textContent =
        currentLanguage === "fr"
          ? `Rush ${Math.max(1, Math.ceil(nextExpiry / 1000))} s`
          : `Rush ${Math.max(1, Math.ceil(nextExpiry / 1000))} s`;
    } else {
      cookingRush.textContent =
        currentLanguage === "fr"
          ? `Prochaine commande ${Math.max(1, Math.ceil(nextExpiry / 1000))} s`
          : `Next order ${Math.max(1, Math.ceil(nextExpiry / 1000))} s`;
    }

    cookingCombo.textContent = comboActive
      ? `Combo x${comboStreak} | ${comboSeconds}s`
      : getCurrentUiText().cookingComboBase;
  };

  const applyStationHighlights = (now = performance.now()) => {
    stations.forEach((station) => {
      const isFocused = focusedStationId === station.id;
      const isPriority =
        (station.id === "grill" && grillReady) ||
        (station.id === "serve" && inventory.burger !== null);
      const pulse = 0.92 + Math.sin(now * 0.012 + station.id.length * 0.5) * 0.08;
      const glowStrength = isFocused ? 1.18 : isPriority ? 0.62 + pulse * 0.18 : 0.28;
      station.meshes.forEach((mesh) => {
        if (mesh.material instanceof BABYLON.StandardMaterial) {
          mesh.material.emissiveColor = station.emissiveColor.scale(glowStrength);
          mesh.material.alpha = isFocused ? 0.46 : isPriority ? 0.22 + (pulse - 0.92) * 0.12 : 0.08;
        }
      });
    });
  };

  const binMaterial = createMaterial(
    scene,
    `${project.id}_binMat`,
    new BABYLON.Color3(0.3, 0.24, 0.18),
    project.color.scale(0.05)
  );
  const steelMaterial = createMaterial(
    scene,
    `${project.id}_steelMat`,
    new BABYLON.Color3(0.64, 0.66, 0.68),
    new BABYLON.Color3(0.02, 0.03, 0.04)
  );
  const bunMaterial = createMaterial(
    scene,
    `${project.id}_bunMat`,
    new BABYLON.Color3(0.7, 0.5, 0.24),
    new BABYLON.Color3(0.06, 0.04, 0.01)
  );
  const bunTopMaterial = createMaterial(
    scene,
    `${project.id}_bunTopMat`,
    new BABYLON.Color3(0.86, 0.66, 0.34),
    new BABYLON.Color3(0.08, 0.05, 0.02)
  );
  const rawSteakMaterial = createMaterial(
    scene,
    `${project.id}_rawSteakMat`,
    new BABYLON.Color3(0.52, 0.14, 0.14),
    new BABYLON.Color3(0.06, 0.01, 0.01)
  );
  const cookedSteakMaterial = createMaterial(
    scene,
    `${project.id}_cookedSteakMat`,
    new BABYLON.Color3(0.34, 0.18, 0.08),
    new BABYLON.Color3(0.08, 0.03, 0.01)
  );
  const cheeseMaterial = createMaterial(
    scene,
    `${project.id}_cheeseMat`,
    new BABYLON.Color3(0.96, 0.82, 0.24),
    new BABYLON.Color3(0.1, 0.08, 0.02)
  );
  const lettuceMaterial = createMaterial(
    scene,
    `${project.id}_lettuceMat`,
    new BABYLON.Color3(0.34, 0.76, 0.28),
    new BABYLON.Color3(0.08, 0.2, 0.04)
  );
  const tomatoMaterial = createMaterial(
    scene,
    `${project.id}_tomatoMat`,
    new BABYLON.Color3(0.86, 0.24, 0.18),
    new BABYLON.Color3(0.1, 0.02, 0.02)
  );
  const darkMetalMaterial = createMaterial(
    scene,
    `${project.id}_darkMetalMat`,
    new BABYLON.Color3(0.18, 0.2, 0.22),
    new BABYLON.Color3(0.01, 0.012, 0.016)
  );

  const heldRoot = new BABYLON.TransformNode(`${project.id}_heldRoot`, scene);
  heldRoot.parent = camera;
  heldRoot.setEnabled(false);
  heldRoot.scaling = new BABYLON.Vector3(1.28, 1.28, 1.28);

  const heldTray = BABYLON.MeshBuilder.CreateBox(
    `${project.id}_heldTray`,
    { width: 0.34, height: 0.05, depth: 0.3 },
    scene
  );
  heldTray.parent = heldRoot;
  heldTray.position = new BABYLON.Vector3(0, -0.08, 0.08);
  heldTray.isPickable = false;
  heldTray.material = steelMaterial;

  const heldBunBottom = BABYLON.MeshBuilder.CreateCylinder(
    `${project.id}_heldBunBottom`,
    { diameter: 0.16, height: 0.045, tessellation: 18 },
    scene
  );
  heldBunBottom.parent = heldRoot;
  heldBunBottom.position = new BABYLON.Vector3(0.06, -0.01, 0.09);
  heldBunBottom.isPickable = false;
  heldBunBottom.material = bunMaterial;

  const heldBunTop = BABYLON.MeshBuilder.CreateSphere(
    `${project.id}_heldBunTop`,
    { diameter: 0.165, segments: 12 },
    scene
  );
  heldBunTop.parent = heldRoot;
  heldBunTop.position = new BABYLON.Vector3(0.06, 0.03, 0.09);
  heldBunTop.scaling.y = 0.54;
  heldBunTop.isPickable = false;
  heldBunTop.material = bunTopMaterial;

  const heldRawSteak = BABYLON.MeshBuilder.CreateCylinder(
    `${project.id}_heldRawSteak`,
    { diameter: 0.15, height: 0.05, tessellation: 18 },
    scene
  );
  heldRawSteak.parent = heldRoot;
  heldRawSteak.position = new BABYLON.Vector3(-0.08, -0.005, 0.03);
  heldRawSteak.isPickable = false;
  heldRawSteak.material = rawSteakMaterial;

  const heldCookedSteak = BABYLON.MeshBuilder.CreateCylinder(
    `${project.id}_heldCookedSteak`,
    { diameter: 0.15, height: 0.05, tessellation: 18 },
    scene
  );
  heldCookedSteak.parent = heldRoot;
  heldCookedSteak.position = new BABYLON.Vector3(-0.08, -0.005, 0.03);
  heldCookedSteak.isPickable = false;
  heldCookedSteak.material = cookedSteakMaterial;

  const heldCheese = BABYLON.MeshBuilder.CreateBox(
    `${project.id}_heldCheese`,
    { width: 0.13, height: 0.02, depth: 0.13 },
    scene
  );
  heldCheese.parent = heldRoot;
  heldCheese.position = new BABYLON.Vector3(-0.02, -0.02, 0.11);
  heldCheese.rotation.y = 0.3;
  heldCheese.isPickable = false;
  heldCheese.material = cheeseMaterial;

  const heldLettuce = BABYLON.MeshBuilder.CreateSphere(
    `${project.id}_heldLettuce`,
    { diameter: 0.14, segments: 10 },
    scene
  );
  heldLettuce.parent = heldRoot;
  heldLettuce.position = new BABYLON.Vector3(0.1, 0, -0.03);
  heldLettuce.scaling = new BABYLON.Vector3(1.2, 0.4, 0.92);
  heldLettuce.isPickable = false;
  heldLettuce.material = lettuceMaterial;

  const heldTomato = BABYLON.MeshBuilder.CreateCylinder(
    `${project.id}_heldTomato`,
    { diameter: 0.12, height: 0.028, tessellation: 18 },
    scene
  );
  heldTomato.parent = heldRoot;
  heldTomato.position = new BABYLON.Vector3(0.12, -0.005, 0.02);
  heldTomato.isPickable = false;
  heldTomato.material = tomatoMaterial;

  const heldBurgerBottom = BABYLON.MeshBuilder.CreateCylinder(
    `${project.id}_heldBurgerBottom`,
    { diameter: 0.18, height: 0.045, tessellation: 18 },
    scene
  );
  heldBurgerBottom.parent = heldRoot;
  heldBurgerBottom.position = new BABYLON.Vector3(0.02, -0.01, 0.07);
  heldBurgerBottom.isPickable = false;
  heldBurgerBottom.material = bunMaterial;

  const heldBurgerPatty = BABYLON.MeshBuilder.CreateCylinder(
    `${project.id}_heldBurgerPatty`,
    { diameter: 0.16, height: 0.05, tessellation: 18 },
    scene
  );
  heldBurgerPatty.parent = heldRoot;
  heldBurgerPatty.position = new BABYLON.Vector3(0.02, 0.022, 0.07);
  heldBurgerPatty.isPickable = false;
  heldBurgerPatty.material = cookedSteakMaterial;

  const heldBurgerCheese = BABYLON.MeshBuilder.CreateBox(
    `${project.id}_heldBurgerCheese`,
    { width: 0.145, height: 0.016, depth: 0.145 },
    scene
  );
  heldBurgerCheese.parent = heldRoot;
  heldBurgerCheese.position = new BABYLON.Vector3(0.02, 0.042, 0.07);
  heldBurgerCheese.rotation.y = 0.24;
  heldBurgerCheese.isPickable = false;
  heldBurgerCheese.material = cheeseMaterial;

  const heldBurgerLettuce = BABYLON.MeshBuilder.CreateSphere(
    `${project.id}_heldBurgerLettuce`,
    { diameter: 0.16, segments: 10 },
    scene
  );
  heldBurgerLettuce.parent = heldRoot;
  heldBurgerLettuce.position = new BABYLON.Vector3(0.02, 0.048, 0.07);
  heldBurgerLettuce.scaling = new BABYLON.Vector3(1.1, 0.26, 0.88);
  heldBurgerLettuce.isPickable = false;
  heldBurgerLettuce.material = lettuceMaterial;

  const heldBurgerTomato = BABYLON.MeshBuilder.CreateCylinder(
    `${project.id}_heldBurgerTomato`,
    { diameter: 0.13, height: 0.022, tessellation: 18 },
    scene
  );
  heldBurgerTomato.parent = heldRoot;
  heldBurgerTomato.position = new BABYLON.Vector3(0.02, 0.056, 0.07);
  heldBurgerTomato.isPickable = false;
  heldBurgerTomato.material = tomatoMaterial;

  const heldBurgerTop = BABYLON.MeshBuilder.CreateSphere(
    `${project.id}_heldBurgerTop`,
    { diameter: 0.19, segments: 12 },
    scene
  );
  heldBurgerTop.parent = heldRoot;
  heldBurgerTop.position = new BABYLON.Vector3(0.02, 0.082, 0.07);
  heldBurgerTop.scaling.y = 0.56;
  heldBurgerTop.isPickable = false;
  heldBurgerTop.material = bunTopMaterial;

  const updateHeldVisuals = (visible: boolean, now: number) => {
    const hasItem = !isInventoryEmpty();
    heldRoot.setEnabled(visible && hasItem);
    if (!visible || !hasItem) {
      return;
    }

    heldRoot.position.set(
      0.46 + Math.sin(now * 0.003) * 0.009,
      -0.29 + Math.sin(now * 0.006) * 0.007,
      0.88
    );
    heldRoot.rotation.set(0.08, -0.24, -0.08);

    const showLooseItems = inventory.burger === null;
    heldBunBottom.setEnabled(showLooseItems && inventory.bun);
    heldBunTop.setEnabled(showLooseItems && inventory.bun);
    heldRawSteak.setEnabled(showLooseItems && inventory.rawSteak);
    heldCookedSteak.setEnabled(showLooseItems && inventory.cookedSteak);
    heldCheese.setEnabled(showLooseItems && inventory.cheese);
    heldLettuce.setEnabled(showLooseItems && inventory.lettuce);
    heldTomato.setEnabled(showLooseItems && inventory.tomato);

    const showBurger = inventory.burger !== null;
    const burgerIngredients = inventory.burger
      ? recipeDefinitions[inventory.burger].ingredientKeys
      : [];
    heldBurgerBottom.setEnabled(showBurger);
    heldBurgerPatty.setEnabled(showBurger);
    heldBurgerCheese.setEnabled(showBurger && burgerIngredients.includes("cheese"));
    heldBurgerLettuce.setEnabled(showBurger && burgerIngredients.includes("lettuce"));
    heldBurgerTomato.setEnabled(showBurger && burgerIngredients.includes("tomato"));
    heldBurgerTop.setEnabled(showBurger);
  };

  const serviceCounter = createKitchenCounterModule(
    scene,
    `${project.id}_serviceCounter`,
    toWorld(0, 0, -4.45),
    yaw,
    3.1,
    0.92,
    project.color
  );
  serviceCounter.position.y = 0;

  const rearIngredientCounterX = -0.55;
  const rearIngredientCounterZ = 5.38;
  const rearIngredientRail = BABYLON.MeshBuilder.CreateBox(
    `${project.id}_rearIngredientRail`,
    { width: 3.82, height: 0.12, depth: 0.6 },
    scene
  );
  rearIngredientRail.position = toWorld(rearIngredientCounterX, 1.03, rearIngredientCounterZ);
  rearIngredientRail.rotation.y = yaw;
  rearIngredientRail.isPickable = false;
  rearIngredientRail.material = steelMaterial;

  const rearIngredientInset = BABYLON.MeshBuilder.CreateBox(
    `${project.id}_rearIngredientInset`,
    { width: 3.56, height: 0.02, depth: 0.38 },
    scene
  );
  rearIngredientInset.position = toWorld(rearIngredientCounterX, 1.11, rearIngredientCounterZ);
  rearIngredientInset.rotation.y = yaw;
  rearIngredientInset.isPickable = false;
  rearIngredientInset.material = darkMetalMaterial;

  const rearCounterSplash = BABYLON.MeshBuilder.CreateBox(
    `${project.id}_rearCounterSplash`,
    { width: 3.82, height: 0.24, depth: 0.06 },
    scene
  );
  rearCounterSplash.position = toWorld(rearIngredientCounterX, 1.16, 5.73);
  rearCounterSplash.rotation.y = yaw;
  rearCounterSplash.isPickable = false;
  rearCounterSplash.material = createMaterial(
    scene,
    `${project.id}_rearCounterSplashMat`,
    new BABYLON.Color3(0.76, 0.76, 0.74),
    project.color.scale(0.06)
  );

  const bunBinBody = BABYLON.MeshBuilder.CreateBox(
    `${project.id}_bunBin`,
    { width: 0.96, height: 0.26, depth: 0.62 },
    scene
  );
  bunBinBody.position = toWorld(2.18, 1.1, 0.08);
  bunBinBody.rotation.y = yaw;
  bunBinBody.isPickable = false;
  bunBinBody.material = binMaterial;
  createCrateFrontLabel(
    `${project.id}_bunBinFront`,
    () => (currentLanguage === "fr" ? "PAIN" : "BUN"),
    bunBinBody,
    0.26,
    0.62,
    new BABYLON.Color3(1, 0.78, 0.32)
  );
  const bunHotspot = createHotspot(
    `${project.id}_bunHotspot`,
    toWorld(2.18, 1.255, 0.08),
    0.74,
    0.42,
    new BABYLON.Color3(1, 0.78, 0.32)
  );
  for (const offset of [
    new BABYLON.Vector3(-0.22, 0.14, -0.12),
    new BABYLON.Vector3(0.1, 0.14, 0.02),
    new BABYLON.Vector3(0.26, 0.14, -0.08),
  ]) {
    const bottom = BABYLON.MeshBuilder.CreateCylinder(
      `${project.id}_bunBottom_${offset.x}_${offset.z}`,
      { diameter: 0.24, height: 0.08, tessellation: 18 },
      scene
    );
    bottom.position = bunBinBody.position.add(offset);
    bottom.isPickable = false;
    bottom.material = bunMaterial;

    const top = BABYLON.MeshBuilder.CreateSphere(
      `${project.id}_bunTop_${offset.x}_${offset.z}`,
      { diameter: 0.25, segments: 14 },
      scene
    );
    top.position = bunBinBody.position.add(offset).add(new BABYLON.Vector3(0, 0.065, 0));
    top.scaling.y = 0.58;
    top.isPickable = false;
    top.material = bunTopMaterial;
  }
  registerStation(
    "bunBin",
    bunHotspot,
    [bunHotspot],
    new BABYLON.Color3(1, 0.78, 0.32)
  );

  const steakBinBody = BABYLON.MeshBuilder.CreateBox(
    `${project.id}_steakBin`,
    { width: 0.98, height: 0.26, depth: 0.64 },
    scene
  );
  steakBinBody.position = toWorld(-1.7, 1.1, rearIngredientCounterZ);
  steakBinBody.rotation.y = yaw;
  steakBinBody.isPickable = false;
  steakBinBody.material = binMaterial;
  createCrateFrontLabel(
    `${project.id}_steakBinFront`,
    () => (currentLanguage === "fr" ? "STEAK" : "PATTY"),
    steakBinBody,
    0.26,
    0.64,
    new BABYLON.Color3(0.96, 0.34, 0.3),
    "back"
  );
  const steakHotspot = createHotspot(
    `${project.id}_steakHotspot`,
    toWorld(-1.7, 1.255, rearIngredientCounterZ),
    0.76,
    0.44,
    new BABYLON.Color3(0.96, 0.34, 0.3)
  );
  for (const offset of [
    new BABYLON.Vector3(-0.22, 0.12, -0.08),
    new BABYLON.Vector3(0.08, 0.12, 0.08),
    new BABYLON.Vector3(0.24, 0.12, -0.02),
  ]) {
    const patty = BABYLON.MeshBuilder.CreateCylinder(
      `${project.id}_rawPatty_${offset.x}_${offset.z}`,
      { diameter: 0.25, height: 0.08, tessellation: 20 },
      scene
    );
    patty.position = steakBinBody.position.add(offset);
    patty.isPickable = false;
    patty.material = rawSteakMaterial;
  }
  registerStation(
    "steakBin",
    steakHotspot,
    [steakHotspot],
    new BABYLON.Color3(0.96, 0.34, 0.3)
  );

  const cheeseBinBody = BABYLON.MeshBuilder.CreateBox(
    `${project.id}_cheeseBin`,
    { width: 0.92, height: 0.24, depth: 0.58 },
    scene
  );
  cheeseBinBody.position = toWorld(-0.55, 1.09, rearIngredientCounterZ);
  cheeseBinBody.rotation.y = yaw;
  cheeseBinBody.isPickable = false;
  cheeseBinBody.material = binMaterial;
  createCrateFrontLabel(
    `${project.id}_cheeseBinFront`,
    () => (currentLanguage === "fr" ? "FROMAGE" : "CHEESE"),
    cheeseBinBody,
    0.24,
    0.58,
    new BABYLON.Color3(1, 0.88, 0.28),
    "back"
  );
  const cheeseHotspot = createHotspot(
    `${project.id}_cheeseHotspot`,
    toWorld(-0.55, 1.24, rearIngredientCounterZ),
    0.72,
    0.4,
    new BABYLON.Color3(1, 0.88, 0.28)
  );
  for (const offset of [
    new BABYLON.Vector3(-0.18, 0.12, -0.06),
    new BABYLON.Vector3(0.02, 0.12, 0.08),
    new BABYLON.Vector3(0.2, 0.12, -0.04),
  ]) {
    const slice = BABYLON.MeshBuilder.CreateBox(
      `${project.id}_cheeseSlice_${offset.x}_${offset.z}`,
      { width: 0.16, height: 0.025, depth: 0.16 },
      scene
    );
    slice.position = cheeseBinBody.position.add(offset);
    slice.rotation.y = 0.28 + offset.x;
    slice.isPickable = false;
    slice.material = cheeseMaterial;
  }
  registerStation(
    "cheeseBin",
    cheeseHotspot,
    [cheeseHotspot],
    new BABYLON.Color3(1, 0.88, 0.28)
  );

  const saladBinBody = BABYLON.MeshBuilder.CreateBox(
    `${project.id}_saladBin`,
    { width: 0.92, height: 0.26, depth: 0.6 },
    scene
  );
  saladBinBody.position = toWorld(3.88, 1.1, 0.08);
  saladBinBody.rotation.y = yaw;
  saladBinBody.isPickable = false;
  saladBinBody.material = binMaterial;
  createCrateFrontLabel(
    `${project.id}_saladBinFront`,
    () => (currentLanguage === "fr" ? "SALADE" : "LETTUCE"),
    saladBinBody,
    0.26,
    0.6,
    new BABYLON.Color3(0.3, 0.95, 0.34)
  );
  const saladHotspot = createHotspot(
    `${project.id}_saladHotspot`,
    toWorld(3.88, 1.255, 0.08),
    0.72,
    0.4,
    new BABYLON.Color3(0.3, 0.95, 0.34)
  );
  for (const offset of [
    new BABYLON.Vector3(-0.22, 0.15, -0.06),
    new BABYLON.Vector3(0.04, 0.14, 0.02),
    new BABYLON.Vector3(0.2, 0.16, -0.12),
    new BABYLON.Vector3(0.1, 0.13, 0.14),
  ]) {
    const leaf = BABYLON.MeshBuilder.CreateSphere(
      `${project.id}_saladLeaf_${offset.x}_${offset.z}`,
      { diameter: 0.18, segments: 10 },
      scene
    );
    leaf.position = saladBinBody.position.add(offset);
    leaf.scaling = new BABYLON.Vector3(1.2, 0.54, 0.92);
    leaf.isPickable = false;
    leaf.material = lettuceMaterial;
  }
  registerStation(
    "saladBin",
    saladHotspot,
    [saladHotspot],
    new BABYLON.Color3(0.3, 0.95, 0.34)
  );

  const tomatoBinBody = BABYLON.MeshBuilder.CreateBox(
    `${project.id}_tomatoBin`,
    { width: 0.92, height: 0.24, depth: 0.58 },
    scene
  );
  tomatoBinBody.position = toWorld(0.6, 1.09, rearIngredientCounterZ);
  tomatoBinBody.rotation.y = yaw;
  tomatoBinBody.isPickable = false;
  tomatoBinBody.material = binMaterial;
  createCrateFrontLabel(
    `${project.id}_tomatoBinFront`,
    () => (currentLanguage === "fr" ? "TOMATE" : "TOMATO"),
    tomatoBinBody,
    0.24,
    0.58,
    new BABYLON.Color3(0.94, 0.34, 0.28),
    "back"
  );
  const tomatoHotspot = createHotspot(
    `${project.id}_tomatoHotspot`,
    toWorld(0.6, 1.24, rearIngredientCounterZ),
    0.72,
    0.4,
    new BABYLON.Color3(0.94, 0.34, 0.28)
  );
  for (const offset of [
    new BABYLON.Vector3(-0.18, 0.12, -0.02),
    new BABYLON.Vector3(0.04, 0.12, 0.08),
    new BABYLON.Vector3(0.2, 0.12, -0.08),
  ]) {
    const slice = BABYLON.MeshBuilder.CreateCylinder(
      `${project.id}_tomatoSlice_${offset.x}_${offset.z}`,
      { diameter: 0.14, height: 0.03, tessellation: 18 },
      scene
    );
    slice.position = tomatoBinBody.position.add(offset);
    slice.isPickable = false;
    slice.material = tomatoMaterial;
  }
  registerStation(
    "tomatoBin",
    tomatoHotspot,
    [tomatoHotspot],
    new BABYLON.Color3(0.94, 0.34, 0.28)
  );

  const grillBase = BABYLON.MeshBuilder.CreateBox(
    `${project.id}_grillBase`,
    { width: 0.92, height: 0.16, depth: 0.7 },
    scene
  );
  grillBase.position = toWorld(3.45, 1.06, 5.48);
  grillBase.rotation.y = yaw;
  grillBase.isPickable = false;
  grillBase.material = steelMaterial;
  createCrateFrontLabel(
    `${project.id}_grillFront`,
    () => (currentLanguage === "fr" ? "CUISSON" : "GRILL"),
    grillBase,
    0.16,
    0.7,
    new BABYLON.Color3(1, 0.42, 0.18),
    "back"
  );
  const grillHotspot = createHotspot(
    `${project.id}_grillHotspot`,
    toWorld(3.45, 1.16, 5.48),
    0.78,
    0.54,
    new BABYLON.Color3(1, 0.42, 0.18)
  );
  const grillGlow = BABYLON.MeshBuilder.CreateDisc(
    `${project.id}_grillGlow`,
    { radius: 0.28, tessellation: 28 },
    scene
  );
  grillGlow.position = toWorld(3.45, 1.125, 5.48);
  grillGlow.rotation.x = Math.PI / 2;
  grillGlow.isPickable = false;
  grillGlow.material = createMaterial(
    scene,
    `${project.id}_grillGlowMat`,
    new BABYLON.Color3(0.18, 0.06, 0.02),
    new BABYLON.Color3(0.32, 0.08, 0.02),
    0.72
  );
  const grillPatty = BABYLON.MeshBuilder.CreateCylinder(
    `${project.id}_grillPatty`,
    { diameter: 0.34, height: 0.09, tessellation: 20 },
    scene
  );
  grillPatty.position = toWorld(3.45, 1.16, 5.48);
  grillPatty.isPickable = false;
  grillPatty.material = rawSteakMaterial.clone(`${project.id}_grillPattyMat`) ?? rawSteakMaterial;
  grillPatty.setEnabled(false);
  registerStation(
    "grill",
    grillHotspot,
    [grillHotspot, grillGlow],
    new BABYLON.Color3(1, 0.42, 0.18)
  );

  const prepBoard = BABYLON.MeshBuilder.CreateBox(
    `${project.id}_prepBoardGameplay`,
    { width: 1.08, height: 0.07, depth: 0.58 },
    scene
  );
  prepBoard.position = toWorld(3.05, 1.04, 0.48);
  prepBoard.rotation.y = yaw;
  prepBoard.isPickable = false;
  prepBoard.material = createMaterial(
    scene,
    `${project.id}_prepBoardGameplayMat`,
    new BABYLON.Color3(0.5, 0.32, 0.16),
    project.color.scale(0.04)
  );
  const prepHotspot = createHotspot(
    `${project.id}_prepHotspot`,
    toWorld(3.05, 1.105, 0.48),
    1.02,
    0.52,
    new BABYLON.Color3(1, 0.76, 0.32)
  );
  registerStation(
    "prep",
    prepHotspot,
    [prepHotspot],
    new BABYLON.Color3(1, 0.76, 0.32)
  );

  const serveTray = BABYLON.MeshBuilder.CreateBox(
    `${project.id}_serveTray`,
    { width: 1.4, height: 0.06, depth: 0.62 },
    scene
  );
  serveTray.position = toWorld(0, 1.03, -4.46);
  serveTray.rotation.y = yaw;
  serveTray.isPickable = false;
  serveTray.material = steelMaterial;
  const serveHotspot = createHotspot(
    `${project.id}_serveHotspot`,
    toWorld(0, 1.09, -4.46),
    1.26,
    0.48,
    new BABYLON.Color3(0.34, 0.88, 1)
  );
  const serveBell = BABYLON.MeshBuilder.CreateSphere(
    `${project.id}_serveBell`,
    { diameter: 0.22, segments: 12 },
    scene
  );
  serveBell.position = toWorld(0.42, 1.18, -4.46);
  serveBell.scaling.y = 0.62;
  serveBell.isPickable = false;
  serveBell.material = steelMaterial;
  registerStation(
    "serve",
    serveHotspot,
    [serveHotspot],
    new BABYLON.Color3(0.34, 0.88, 1)
  );

  const trashCan = BABYLON.MeshBuilder.CreateCylinder(
    `${project.id}_trashCan`,
    { diameterTop: 0.52, diameterBottom: 0.62, height: 0.86, tessellation: 18 },
    scene
  );
  trashCan.position = toWorld(-5.08, 0.43, -1.18);
  trashCan.rotation.y = yaw + 0.12;
  trashCan.isPickable = false;
  trashCan.material = darkMetalMaterial;
  trashCan.checkCollisions = true;
  const trashLabel = BABYLON.MeshBuilder.CreatePlane(
    `${project.id}_trashLabel`,
    { width: 0.5, height: 0.16, sideOrientation: BABYLON.Mesh.FRONTSIDE },
    scene
  );
  trashLabel.parent = trashCan;
  trashLabel.position = new BABYLON.Vector3(0.34, 0.04, 0);
  trashLabel.rotation.y = -Math.PI / 2;
  trashLabel.isPickable = false;
  const trashLabelTexture = new BABYLON.DynamicTexture(
    `${project.id}_trashLabelTexture`,
    { width: 384, height: 120 },
    scene,
    true
  );
  trashLabelTexture.hasAlpha = true;
  const trashLabelContext = trashLabelTexture.getContext() as CanvasRenderingContext2D;
  registerLocaleRefresher(() => {
    trashLabelContext.clearRect(0, 0, 384, 120);
    trashLabelContext.fillStyle = "rgba(10, 12, 18, 0.92)";
    trashLabelContext.fillRect(8, 8, 368, 104);
    trashLabelContext.strokeStyle = "rgba(230, 82, 82, 0.92)";
    trashLabelContext.lineWidth = 3;
    trashLabelContext.strokeRect(8, 8, 368, 104);
    trashLabelContext.fillStyle = "rgba(244, 247, 255, 0.96)";
    trashLabelContext.font = "700 30px Segoe UI";
    trashLabelContext.textAlign = "center";
    trashLabelContext.textBaseline = "middle";
    trashLabelContext.fillText(
      currentLanguage === "fr" ? "POUBELLE" : "TRASH",
      192,
      60
    );
    trashLabelTexture.update();
  });
  const trashLabelMaterial = new BABYLON.StandardMaterial(
    `${project.id}_trashLabelMat`,
    scene
  );
  trashLabelMaterial.diffuseTexture = trashLabelTexture;
  trashLabelMaterial.emissiveTexture = trashLabelTexture;
  trashLabelMaterial.opacityTexture = trashLabelTexture;
  trashLabelMaterial.disableLighting = true;
  trashLabelMaterial.backFaceCulling = false;
  trashLabel.material = trashLabelMaterial;
  const trashHotspot = createHotspot(
    `${project.id}_trashHotspot`,
    toWorld(-5.08, 0.93, -1.18),
    0.54,
    0.54,
    new BABYLON.Color3(0.9, 0.28, 0.28)
  );
  registerStation(
    "trash",
    trashHotspot,
    [trashHotspot],
    new BABYLON.Color3(0.9, 0.28, 0.28)
  );

  for (let index = 0; index < VR_COOKING_ORDER_COUNT; index += 1) {
    const localX = -0.86 + index * 1.72;
    const body = BABYLON.MeshBuilder.CreateCylinder(
      `${project.id}_clientBody_${index}`,
      { diameter: 0.48, height: 1.1, tessellation: 16 },
      scene
    );
    body.position = toWorld(localX, 0.58, -5.85);
    body.isPickable = false;
    body.material = createMaterial(
      scene,
      `${project.id}_clientBodyMat_${index}`,
      new BABYLON.Color3(0.14, 0.16, 0.2),
      new BABYLON.Color3(0.06, 0.08, 0.12),
      0.94
    );

    const head = BABYLON.MeshBuilder.CreateSphere(
      `${project.id}_clientHead_${index}`,
      { diameter: 0.38, segments: 12 },
      scene
    );
    head.position = toWorld(localX, 1.38, -5.85);
    head.isPickable = false;
    head.material = createMaterial(
      scene,
      `${project.id}_clientHeadMat_${index}`,
      new BABYLON.Color3(0.2, 0.22, 0.26),
      new BABYLON.Color3(0.04, 0.06, 0.09),
      0.96
    );

    const badge = BABYLON.MeshBuilder.CreatePlane(
      `${project.id}_clientBadge_${index}`,
      { width: 0.54, height: 0.2, sideOrientation: BABYLON.Mesh.DOUBLESIDE },
      scene
    );
    badge.position = toWorld(localX, 1.9, -5.82);
    badge.rotation.y = yaw + Math.PI;
    badge.isPickable = false;
    badge.material = createMaterial(
      scene,
      `${project.id}_clientBadgeMat_${index}`,
      new BABYLON.Color3(0.16, 0.18, 0.2),
      new BABYLON.Color3(0.24, 0.26, 0.3),
      0.88
    );

    clientSlots.push({ body, head, badge });
  }

  refillOrders();
  updateOrderBoard();
  applyStationHighlights();

  const isPlayerInsideZone = () => {
    const local = toLocal(camera.position);
    return (
      Math.abs(local.x) <= zoneHalfWidth - 0.7 &&
      local.z >= -zoneHalfDepth + 0.9 &&
      local.z <= zoneHalfDepth - 0.6
    );
  };

  const resolveBurgerType = (): VRCookingOrderType => {
    const hasCheese = inventory.cheese;
    const hasSalad = inventory.lettuce;
    const hasTomato = inventory.tomato;

    if (hasCheese && hasSalad && hasTomato) {
      return "deluxe";
    }
    if (hasCheese && hasSalad) {
      return "cheeseSalad";
    }
    if (hasCheese && hasTomato) {
      return "cheeseTomato";
    }
    if (hasSalad && hasTomato) {
      return "fresh";
    }
    if (hasCheese) {
      return "cheese";
    }
    if (hasSalad) {
      return "salad";
    }
    if (hasTomato) {
      return "tomato";
    }
    return "classic";
  };

  const getHintForStation = () => {
    if (locked) {
      return currentLanguage === "fr"
        ? "Cuisine verrouillee - la partie est terminee."
        : "Kitchen locked - the run is over.";
    }

    if (!focusedStationId) {
      return currentLanguage === "fr"
        ? "Vise une station et clique ou appuie sur E pour interagir."
        : "Aim at a station and click or press E to interact.";
    }

    switch (focusedStationId) {
      case "bunBin":
        return inventory.burger
          ? currentLanguage === "fr"
            ? "Burger pret - sers-le d'abord ou vide le plateau."
            : "Burger ready - serve it first or clear your tray."
          : inventory.bun
            ? currentLanguage === "fr"
              ? "Tu as deja un pain sur le plateau."
              : "You already have a bun on the tray."
            : currentLanguage === "fr"
              ? "Clic / E - prendre un pain burger"
              : "Click / E - take a burger bun";
      case "steakBin":
        return inventory.burger
          ? currentLanguage === "fr"
            ? "Burger deja monte - impossible de reprendre des ingredients."
            : "Burger already assembled - you cannot pick more ingredients."
          : inventory.rawSteak || inventory.cookedSteak
            ? currentLanguage === "fr"
              ? "Tu as deja un steak sur le plateau."
              : "You already have a patty on the tray."
            : currentLanguage === "fr"
              ? "Clic / E - prendre un steak cru"
              : "Click / E - take a raw patty";
      case "saladBin":
        return inventory.burger
          ? currentLanguage === "fr"
            ? "Burger deja monte - sers-le au comptoir."
            : "Burger already assembled - serve it at the counter."
          : inventory.lettuce
            ? currentLanguage === "fr"
              ? "Tu as deja pris de la salade."
              : "You already picked lettuce."
            : currentLanguage === "fr"
              ? "Clic / E - prendre de la salade"
              : "Click / E - take lettuce";
      case "cheeseBin":
        return inventory.burger
          ? currentLanguage === "fr"
            ? "Burger deja monte - sers-le au comptoir."
            : "Burger already assembled - serve it at the counter."
          : inventory.cheese
            ? currentLanguage === "fr"
              ? "Tu as deja pris du fromage."
              : "You already picked cheese."
            : currentLanguage === "fr"
              ? "Clic / E - prendre du fromage"
              : "Click / E - take cheese";
      case "tomatoBin":
        return inventory.burger
          ? currentLanguage === "fr"
            ? "Burger deja monte - sers-le au comptoir."
            : "Burger already assembled - serve it at the counter."
          : inventory.tomato
            ? currentLanguage === "fr"
              ? "Tu as deja pris de la tomate."
              : "You already picked tomato."
            : currentLanguage === "fr"
              ? "Clic / E - prendre de la tomate"
              : "Click / E - take tomato";
      case "grill":
        if (grillReady) {
          return inventory.rawSteak || inventory.cookedSteak || inventory.burger
            ? currentLanguage === "fr"
              ? "Libere le plateau pour recuperer le steak cuit."
              : "Clear your tray to pick up the cooked patty."
            : currentLanguage === "fr"
              ? "Clic / E - recuperer le steak cuit"
              : "Click / E - pick up the cooked patty";
        }
        if (grillActive) {
          return currentLanguage === "fr"
            ? `Cuisson en cours - ${Math.max(1, Math.ceil((1 - grillProgress) * VR_COOKING_GRILL_TIME))} s`
            : `Cooking in progress - ${Math.max(1, Math.ceil((1 - grillProgress) * VR_COOKING_GRILL_TIME))} s`;
        }
        return inventory.rawSteak
          ? currentLanguage === "fr"
            ? "Clic / E - lancer la cuisson du steak"
            : "Click / E - start cooking the patty"
          : currentLanguage === "fr"
            ? "Prends un steak cru avant le grill."
            : "Grab a raw patty before using the grill.";
      case "prep":
        if (inventory.burger) {
          return currentLanguage === "fr"
            ? "Burger pret - direction le comptoir client."
            : "Burger ready - head to the customer counter.";
        }
        if (inventory.bun && inventory.cookedSteak) {
          return currentLanguage === "fr"
            ? `Clic / E - assembler ${getRecipeInfo(resolveBurgerType()).title.toLowerCase()}`
            : `Click / E - assemble ${getRecipeInfo(resolveBurgerType()).title.toLowerCase()}`;
        }
        return currentLanguage === "fr"
          ? "Assemble pain + steak cuit, puis ajoute fromage, salade ou tomate."
          : "Assemble bun + cooked patty, then add cheese, lettuce or tomato.";
      case "serve":
        return inventory.burger
          ? currentLanguage === "fr"
            ? "Clic / E - servir la commande en cours"
            : "Click / E - serve the current order"
          : currentLanguage === "fr"
            ? "Les clients attendent un burger conforme."
            : "Customers are waiting for the correct burger.";
      case "trash":
        return isInventoryEmpty()
          ? currentLanguage === "fr"
            ? "Plateau vide."
            : "Tray already empty."
          : currentLanguage === "fr"
            ? "Clic / E - vider le plateau et recommencer"
            : "Click / E - clear the tray and restart";
      default:
        return currentLanguage === "fr"
          ? "Vise une station et clique ou appuie sur E pour interagir."
          : "Aim at a station and click or press E to interact.";
    }
  };

  const interact = () => {
    if (
      locked ||
      !isPlayerInsideZone() ||
      !isPointerLocked ||
      !projectPanel.classList.contains("hidden") ||
      isOverviewOpen() ||
      isLeaderboardOpen() ||
      !focusedStationId
    ) {
      return false;
    }

    switch (focusedStationId) {
      case "bunBin":
        if (inventory.burger) {
          showCookingPopup(
            currentLanguage === "fr"
              ? "Sers ton burger avant de reprendre des ingredients"
              : "Serve your burger before taking more ingredients"
          );
          return true;
        }
        if (inventory.bun) {
          showCookingPopup(
            currentLanguage === "fr" ? "Tu as deja un pain" : "You already have a bun"
          );
          return true;
        }
        inventory.bun = true;
        showCookingPopup(
          currentLanguage === "fr" ? "Pain burger recupere" : "Burger bun picked up"
        );
        return true;
      case "steakBin":
        if (inventory.burger) {
          showCookingPopup(
            currentLanguage === "fr"
              ? "Impossible : burger deja monte"
              : "Impossible: burger already assembled"
          );
          return true;
        }
        if (inventory.rawSteak || inventory.cookedSteak) {
          showCookingPopup(
            currentLanguage === "fr"
              ? "Tu as deja un steak sur le plateau"
              : "You already have a patty on the tray"
          );
          return true;
        }
        inventory.rawSteak = true;
        showCookingPopup(
          currentLanguage === "fr" ? "Steak cru recupere" : "Raw patty picked up"
        );
        return true;
      case "saladBin":
        if (inventory.burger) {
          showCookingPopup(
            currentLanguage === "fr"
              ? "Le burger est deja monte"
              : "The burger is already assembled"
          );
          return true;
        }
        if (inventory.lettuce) {
          showCookingPopup(
            currentLanguage === "fr"
              ? "Tu as deja pris de la salade"
              : "You already picked lettuce"
          );
          return true;
        }
        inventory.lettuce = true;
        showCookingPopup(
          currentLanguage === "fr" ? "Salade recuperee" : "Lettuce picked up"
        );
        return true;
      case "cheeseBin":
        if (inventory.burger) {
          showCookingPopup(
            currentLanguage === "fr"
              ? "Le burger est deja monte"
              : "The burger is already assembled"
          );
          return true;
        }
        if (inventory.cheese) {
          showCookingPopup(
            currentLanguage === "fr"
              ? "Tu as deja pris du fromage"
              : "You already picked cheese"
          );
          return true;
        }
        inventory.cheese = true;
        showCookingPopup(
          currentLanguage === "fr" ? "Fromage recupere" : "Cheese picked up"
        );
        return true;
      case "tomatoBin":
        if (inventory.burger) {
          showCookingPopup(
            currentLanguage === "fr"
              ? "Le burger est deja monte"
              : "The burger is already assembled"
          );
          return true;
        }
        if (inventory.tomato) {
          showCookingPopup(
            currentLanguage === "fr"
              ? "Tu as deja pris de la tomate"
              : "You already picked tomato"
          );
          return true;
        }
        inventory.tomato = true;
        showCookingPopup(
          currentLanguage === "fr" ? "Tomate recuperee" : "Tomato picked up"
        );
        return true;
      case "grill":
        if (grillReady) {
          if (inventory.rawSteak || inventory.cookedSteak || inventory.burger) {
            showCookingPopup(
              currentLanguage === "fr"
                ? "Libere ton plateau pour recuperer le steak cuit"
                : "Clear your tray to pick up the cooked patty",
              "warning"
            );
            return true;
          }
          grillReady = false;
          grillActive = false;
          grillProgress = 0;
          inventory.cookedSteak = true;
          grillPatty.setEnabled(false);
          orderBoardDirty = true;
          showCookingPopup(
            currentLanguage === "fr" ? "Steak cuit recupere" : "Cooked patty picked up",
            "success"
          );
          return true;
        }
        if (grillActive) {
          showCookingPopup(
            currentLanguage === "fr"
              ? `Cuisson en cours - ${Math.max(1, Math.ceil((1 - grillProgress) * VR_COOKING_GRILL_TIME))} s`
              : `Cooking in progress - ${Math.max(1, Math.ceil((1 - grillProgress) * VR_COOKING_GRILL_TIME))} s`,
            "warning"
          );
          return true;
        }
        if (!inventory.rawSteak) {
          showCookingPopup(
            currentLanguage === "fr"
              ? "Prends un steak cru avant d'utiliser le grill"
              : "Grab a raw patty before using the grill",
            "warning"
          );
          return true;
        }
        inventory.rawSteak = false;
        grillActive = true;
        grillProgress = 0;
        grillPatty.setEnabled(true);
        orderBoardDirty = true;
        showCookingPopup(
          currentLanguage === "fr" ? "Steak en cuisson" : "Patty cooking",
          "warning"
        );
        return true;
      case "prep":
        if (inventory.burger) {
          showCookingPopup(
            currentLanguage === "fr" ? "Burger deja pret" : "Burger already ready",
            "warning"
          );
          return true;
        }
        if (!inventory.bun || !inventory.cookedSteak) {
          showCookingPopup(
            currentLanguage === "fr"
              ? "Il faut un pain et un steak cuit"
              : "You need a bun and a cooked patty",
            "warning"
          );
          return true;
        }
        inventory.bun = false;
        inventory.cookedSteak = false;
        const burgerType = resolveBurgerType();
        inventory.burger = burgerType;
        inventory.cheese = false;
        inventory.lettuce = false;
        inventory.tomato = false;
        showCookingPopup(
          currentLanguage === "fr"
            ? `${getRecipeInfo(burgerType).title} assemble`
            : `${getRecipeInfo(burgerType).title} assembled`,
          "success"
        );
        return true;
      case "serve": {
        if (!inventory.burger) {
          showCookingPopup(
            currentLanguage === "fr" ? "Aucun burger a servir" : "No burger to serve",
            "warning"
          );
          return true;
        }
        const orderIndex = orderQueue.findIndex((order) => order.type === inventory.burger);
        if (orderIndex < 0) {
          comboStreak = 0;
          comboExpiresAt = 0;
          inventory.burger = null;
          registerFailure(1);
          showCookingPopup(
            currentLanguage === "fr" ? "Mauvaise commande" : "Wrong order",
            "error",
            1050
          );
          return true;
        }
        const now = performance.now();
        const [servedOrder] = orderQueue.splice(orderIndex, 1);
        comboStreak = now <= comboExpiresAt ? comboStreak + 1 : 1;
        comboExpiresAt = now + VR_COOKING_COMBO_WINDOW * 1000;
        const comboBonus = getComboBonus();
        const totalReward = servedOrder.reward + comboBonus;
        score += totalReward;
        awardLeaderboardPoints("cooking", totalReward);
        inventory.burger = null;
        refillOrders();
        orderBoardDirty = true;
        showCookingPopup(
          comboBonus > 0
            ? `Combo x${comboStreak} +${totalReward}`
            : currentLanguage === "fr"
              ? `Service valide +${totalReward}`
              : `Correct order +${totalReward}`,
          "success",
          1150
        );
        return true;
      }
      case "trash":
        if (isInventoryEmpty()) {
          showCookingPopup(
            currentLanguage === "fr" ? "Plateau deja vide" : "Tray already empty",
            "warning"
          );
          return true;
        }
        resetInventory();
        showCookingPopup(
          currentLanguage === "fr" ? "Plateau vide" : "Tray cleared",
          "warning"
        );
        return true;
      default:
        return false;
    }
  };

  return {
    interact,
    isPlayerInsideZone,
    isLocked() {
      return locked;
    },
    getFailureCount() {
      return failedOrders;
    },
    update() {
      const dt = Math.min(scene.getEngine().getDeltaTime() / 1000, 0.05);
      const now = performance.now();
      const visible =
        isPlayerInsideZone() &&
        projectPanel.classList.contains("hidden") &&
        !isOverviewOpen() &&
        !isLeaderboardOpen();

      if (comboStreak > 0 && now > comboExpiresAt) {
        comboStreak = 0;
      }

      if (visible && unlockedClientCount < VR_COOKING_ORDER_COUNT) {
        cookingActiveElapsedMs += dt * 1000;
        if (cookingActiveElapsedMs >= VR_COOKING_SECOND_CLIENT_DELAY * 1000) {
          unlockedClientCount = VR_COOKING_ORDER_COUNT;
          refillOrders();
          orderBoardDirty = true;
          showCookingPopup(
            currentLanguage === "fr"
              ? "Client B arrive au comptoir"
              : "Client B arrives at the counter",
            "success",
            1200
          );
        }
      }

      if (visible && orderQueue.length > 0) {
        for (const order of orderQueue) {
          order.remainingMs = Math.max(0, order.remainingMs - dt * 1000);
        }

        const expiredOrders: VRCookingOrder[] = [];
        for (let index = orderQueue.length - 1; index >= 0; index -= 1) {
          if (orderQueue[index].remainingMs <= 0) {
            expiredOrders.push(...orderQueue.splice(index, 1));
          }
        }
        if (expiredOrders.length > 0) {
          const penalty = expiredOrders.length * VR_COOKING_TIMEOUT_PENALTY;
          score = Math.max(0, score - penalty);
          awardLeaderboardPoints("cooking", -penalty);
          comboStreak = 0;
          comboExpiresAt = 0;
          registerFailure(expiredOrders.length);
          refillOrders();
          orderBoardDirty = true;
          showCookingPopup(
            expiredOrders.length > 1
              ? currentLanguage === "fr"
                ? `${expiredOrders.length} commandes perdues -${expiredOrders.length * VR_COOKING_TIMEOUT_PENALTY}`
                : `${expiredOrders.length} orders lost -${expiredOrders.length * VR_COOKING_TIMEOUT_PENALTY}`
              : currentLanguage === "fr"
                ? `Commande perdue -${VR_COOKING_TIMEOUT_PENALTY}`
                : `Order lost -${VR_COOKING_TIMEOUT_PENALTY}`,
            "error",
            1200
          );
        }
      }

      if (grillActive && !grillReady && dt > 0) {
        grillProgress = Math.min(1, grillProgress + dt / VR_COOKING_GRILL_TIME);
        if (grillProgress >= 1) {
          grillReady = true;
          orderBoardDirty = true;
          showCookingPopup(
            currentLanguage === "fr"
              ? "Steak cuit - retourne au grill"
              : "Cooked patty - go back to the grill",
            "success",
            1050
          );
        }
      }

      if (grillGlow.material instanceof BABYLON.StandardMaterial) {
        const glowPulse = grillReady
          ? 1.18 + Math.sin(now * 0.01) * 0.12
          : grillActive
            ? 0.78 + grillProgress * 0.64
            : 0.18;
        grillGlow.material.emissiveColor = new BABYLON.Color3(
          0.42 * glowPulse,
          0.12 * glowPulse,
          0.04 * glowPulse
        );
        grillGlow.material.alpha = grillReady ? 0.88 : grillActive ? 0.68 : 0.28;
      }

      if (grillPatty.material instanceof BABYLON.StandardMaterial) {
        grillPatty.material.diffuseColor = (grillReady ? cookedSteakMaterial : rawSteakMaterial).diffuseColor.clone();
        grillPatty.material.emissiveColor = (grillReady ? cookedSteakMaterial : rawSteakMaterial).emissiveColor.clone();
      }
      if (grillPatty.isEnabled()) {
        grillPatty.position.y = 1.16 + Math.sin(now * 0.008) * 0.012;
      }

      if (
        orderBoardDirty ||
        (grillActive && now - lastBoardRefreshAt > 160) ||
        (visible && orderQueue.length > 0 && now - lastBoardRefreshAt > 180)
      ) {
        updateOrderBoard(now);
      }

      if (cookingPopup.classList.contains("visible") && now >= cookingPopupHideAt) {
        cookingPopup.classList.remove("visible");
      }

      cookingHud.classList.toggle("hidden", !visible);
      updateHeldVisuals(visible && isPointerLocked, now);

      if (visible && isPointerLocked) {
        const pick = scene.pickWithRay(
          camera.getForwardRay(VR_COOKING_INTERACTION_DISTANCE),
          (mesh) =>
            Boolean((mesh.metadata as { vrCookingStationId?: VRCookingStationType } | undefined)?.vrCookingStationId)
        );
        focusedStationId =
          pick?.hit && (pick.distance ?? Number.POSITIVE_INFINITY) <= VR_COOKING_INTERACTION_DISTANCE
            ? (pick.pickedMesh?.metadata as { vrCookingStationId?: VRCookingStationType } | undefined)?.vrCookingStationId ?? null
            : null;
      } else {
        focusedStationId = null;
      }

      applyStationHighlights(now);

      if (visible) {
        cookingScore.textContent = score.toString().padStart(4, "0");
        updateCookingHudState(now);
        cookingHeld.textContent = getHeldLabel();
        cookingHint.textContent = getHintForStation();
      } else {
        cookingHud.classList.remove("urgent", "danger");
        cookingRush.classList.remove("warning", "danger");
        cookingCombo.classList.remove("active");
      }
    },
  };
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
  registerLocaleRefresher(() => {
    const projectText = getProjectText(project);
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
      context.fillStyle = `rgba(255, 255, 255, ${0.012 + (line % 3) * 0.006})`;
      context.fillRect(96, 88 + line * 30, 1344, 1);
    }

    context.strokeStyle = "rgba(69, 255, 191, 0.55)";
    context.lineWidth = 4;
    context.strokeRect(96, 88, 1344, 720);

    context.fillStyle = "rgba(127, 231, 203, 0.96)";
    context.font = "600 38px Segoe UI";
    context.fillText(
      currentLanguage === "fr" ? "TRAILER / CAPTURE GAMEPLAY" : "TRAILER / GAMEPLAY CAPTURE",
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

function createProjectWipSign(scene: BABYLON.Scene, project: ProjectData) {
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
      currentLanguage === "fr" ? "Contenu en cours d'iteration" : "Content still being iterated",
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
    {
      width: config.width,
      height: 1.08,
      sideOrientation: BABYLON.Mesh.DOUBLESIDE,
    },
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
function getDrivingRoadRects() {
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
    new BABYLON.Color3(0.14, 0.16, 0.18),
    accentColor.scale(0.04)
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
    new BABYLON.Color3(0.08, 0.09, 0.11),
    new BABYLON.Color3(0.01, 0.01, 0.012)
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
    new BABYLON.Color3(0.09, 0.1, 0.12),
    accentColor.scale(0.06)
  );

  const windowMaterial = createMaterial(
    scene,
    `${name}_windowMat`,
    new BABYLON.Color3(0.18, 0.24, 0.28),
    accentColor.scale(0.22),
    0.92
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

  enableCollisions(shell, plinth, roof);
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

function createDrivingCar(
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
    new BABYLON.Color3(0.34, 0.35, 0.37),
    new BABYLON.Color3(0.02, 0.02, 0.024)
  );
  const asphaltMaterial = createMaterial(
    scene,
    `${project.id}_asphaltMat`,
    new BABYLON.Color3(0.075, 0.08, 0.095),
    new BABYLON.Color3(0.008, 0.01, 0.014)
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
    { name: "southWestRetail", x: -12.0, z: -8.1, width: 10.2, depth: 3.4, height: 4.0, rotation: yaw },
    { name: "southEastRetail", x: 12.0, z: -8.1, width: 10.2, depth: 3.4, height: 4.2, rotation: yaw },
    { name: "marketWestOffice", x: -12.0, z: 11.2, width: 10.0, depth: 5.0, height: 5.3, rotation: yaw },
    { name: "marketEastOffice", x: 12.0, z: 11.2, width: 10.0, depth: 5.0, height: 5.5, rotation: yaw },
    { name: "westSouthCorner", x: -32.0, z: -8.0, width: 5.4, depth: 2.2, height: 5.0, rotation: yaw + Math.PI / 2 },
    { name: "westMidCorner", x: -32.0, z: 11.2, width: 5.4, depth: 2.2, height: 5.9, rotation: yaw + Math.PI / 2 },
    { name: "westRearTower", x: -32.0, z: 31.4, width: 6.0, depth: 2.2, height: 7.3, rotation: yaw + Math.PI / 2 },
    { name: "eastSouthCorner", x: 32.0, z: -8.0, width: 5.4, depth: 2.2, height: 4.8, rotation: yaw - Math.PI / 2 },
    { name: "eastMidCorner", x: 32.0, z: 11.2, width: 5.4, depth: 2.2, height: 5.6, rotation: yaw - Math.PI / 2 },
    { name: "eastRearTower", x: 32.0, z: 31.4, width: 6.0, depth: 2.2, height: 7.4, rotation: yaw - Math.PI / 2 },
    { name: "rearWestBlock", x: -12.0, z: 31.4, width: 10.2, depth: 4.4, height: 5.7, rotation: yaw + Math.PI },
    { name: "rearCenterStation", x: 0, z: 31.4, width: 10.8, depth: 4.4, height: 4.8, rotation: yaw + Math.PI },
    { name: "rearEastBlock", x: 12.0, z: 31.4, width: 10.2, depth: 4.4, height: 5.9, rotation: yaw + Math.PI },
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

  for (const parked of [
    {
      name: "parkedWestSouth",
      x: -15.6,
      z: -18.2,
      rot: yaw,
      color: new BABYLON.Color3(0.14, 0.3, 0.62),
      scale: 0.94,
    },
    {
      name: "parkedEastSouth",
      x: 15.6,
      z: -18.2,
      rot: yaw,
      color: new BABYLON.Color3(0.66, 0.66, 0.7),
      scale: 0.9,
    },
    {
      name: "parkedWestMarket",
      x: -15.2,
      z: 1.8,
      rot: yaw,
      color: new BABYLON.Color3(0.3, 0.44, 0.26),
      scale: 0.92,
    },
    {
      name: "parkedEastMarket",
      x: 15.2,
      z: 1.8,
      rot: yaw,
      color: new BABYLON.Color3(0.64, 0.3, 0.18),
      scale: 0.9,
    },
    {
      name: "parkedNorthWest",
      x: -24.1,
      z: 30.2,
      rot: yaw + Math.PI / 2,
      color: new BABYLON.Color3(0.18, 0.46, 0.34),
      scale: 0.92,
    },
    {
      name: "parkedNorthEast",
      x: 24.1,
      z: 30.2,
      rot: yaw - Math.PI / 2,
      color: new BABYLON.Color3(0.42, 0.32, 0.62),
      scale: 0.92,
    },
  ]) {
    createDrivingCar(
      scene,
      project,
      toWorld(parked.x, 0.02, parked.z),
      parked.rot,
      {
        interactive: false,
        scale: parked.scale,
        bodyColor: parked.color,
      }
    );
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
  const root = new BABYLON.TransformNode(`${name}_root`, scene);
  root.position.copyFrom(position);
  root.rotation.y = rotationY;

  const barrier = BABYLON.MeshBuilder.CreateBox(
    name,
    size,
    scene
  );
  barrier.parent = root;
  barrier.isPickable = false;
  barrier.checkCollisions = true;
  const barrierMaterial = createMaterial(
    scene,
    `${name}_mat`,
    color.scale(0.2),
    color.scale(0.34),
    0.78
  );
  barrierMaterial.disableLighting = true;
  barrier.material = barrierMaterial;

  const labelTexture = new BABYLON.DynamicTexture(
    `${name}_labelTexture`,
    { width: 768, height: 196 },
    scene,
    true
  );
  labelTexture.hasAlpha = true;
  const labelContext = labelTexture.getContext() as CanvasRenderingContext2D;
  const drawLabel = () => {
    labelContext.clearRect(0, 0, 768, 196);
    labelContext.fillStyle = "rgba(8, 12, 18, 0.88)";
    labelContext.fillRect(12, 12, 744, 172);
    labelContext.strokeStyle = rgbString(color);
    labelContext.lineWidth = 3;
    labelContext.strokeRect(12, 12, 744, 172);
    labelContext.fillStyle = "rgba(244, 247, 255, 0.96)";
    labelContext.font = "700 54px Segoe UI";
    labelContext.textAlign = "center";
    labelContext.textBaseline = "middle";
    labelContext.fillText(getTitle(), 384, 76);
    labelContext.fillStyle = "rgba(210, 224, 244, 0.88)";
    labelContext.font = "500 26px Segoe UI";
    labelContext.fillText(getSubtitle(), 384, 132);
    labelTexture.update();
  };
  registerLocaleRefresher(drawLabel);
  drawLabel();

  const labelMaterial = new BABYLON.StandardMaterial(`${name}_labelMat`, scene);
  labelMaterial.diffuseTexture = labelTexture;
  labelMaterial.emissiveTexture = labelTexture;
  labelMaterial.opacityTexture = labelTexture;
  labelMaterial.disableLighting = true;
  labelMaterial.backFaceCulling = false;

  const label = BABYLON.MeshBuilder.CreatePlane(
    `${name}_label`,
    { width: Math.max(2.8, size.width * 0.72), height: 0.72, sideOrientation: BABYLON.Mesh.DOUBLESIDE },
    scene
  );
  label.parent = root;
  label.position = new BABYLON.Vector3(0, size.height * 0.5 + 0.46, -size.depth * 0.5 - 0.03);
  label.rotation.y = Math.PI;
  label.isPickable = false;
  label.material = labelMaterial;

  root.setEnabled(false);
  return root;
}

function createSlimeEnemySystem(
  scene: BABYLON.Scene,
  project: ProjectData,
  camera: BABYLON.UniversalCamera,
  playerController: PlayerController
): SlimeEnemySystem {
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

  const entranceBarrier = createZoneLockBarrier(
    scene,
    `${project.id}_lockBarrier`,
    toWorld(0, 1.42, -SLIME_ARENA_HALF_SIZE + 1.98),
    yaw,
    { width: 6.1, height: 2.84, depth: 0.32 },
    project.color,
    () => (currentLanguage === "fr" ? "QUARANTAINE" : "QUARANTINED"),
    () =>
      currentLanguage === "fr"
        ? "4 impacts subis - acces bloque"
        : "4 hits taken - area locked"
  );

  const enemies: SlimeEnemy[] = [];
  let spawnTimer = 0;
  let score = 0;
  let playerHitCount = 0;
  let locked = false;

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

  function lockArena() {
    if (locked) {
      return;
    }

    locked = true;
    entranceBarrier.setEnabled(true);
    disposeAll();
    showCombatPopup(currentLanguage === "fr" ? "Arene perdue" : "Arena failed");
    updateStatus(
      currentLanguage === "fr"
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
          if (distance <= SLIME_PLAYER_CONTACT_DISTANCE) {
            playerHitCount += 1;
            showCombatPopup(
              currentLanguage === "fr"
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
    enemySystem.isPlayerInsideArena() &&
    projectPanel.classList.contains("hidden") &&
    !isOverviewOpen() &&
    !isLeaderboardOpen();

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
    const entranceLateralOffset = 0;
    label.position = project.position
      .add(inward.scale(entranceOffset))
      .add(right.scale(entranceLateralOffset))
      .add(new BABYLON.Vector3(0, entranceHeight, 0));
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
  createProjectWipSign(scene, project);
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
    isDrivingVehicle = true;
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
    isDrivingVehicle = false;
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
        !isPointerLocked
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
      const canControl = visible && isPointerLocked;

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
        if (visible && isPointerLocked) {
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
          ? currentLanguage === "fr"
            ? "Au volant"
            : "Driving"
          : focusedInteraction === "car"
            ? currentLanguage === "fr"
              ? "Vehicule pret"
              : "Vehicle ready"
            : getCurrentUiText().drivingModeOnFoot;
        drivingMode.classList.toggle("active", driving);
        drivingHint.textContent = driving
          ? currentLanguage === "fr"
            ? "ZQSD / WASD pour accelerer et tourner. Space freine, E pour sortir du vehicule."
            : "ZQSD / WASD to accelerate and steer. Space brakes, E exits the vehicle."
          : focusedInteraction === "car"
            ? currentLanguage === "fr"
              ? "Clique ou appuie sur E pour entrer dans la voiture et lancer un tour."
              : "Click or press E to enter the car and start a run."
            : currentLanguage === "fr"
              ? "Approche-toi de la voiture rouge pour prendre le controle du vehicule."
              : "Get close to the red car to take control of the vehicle.";
      } else {
        drivingMode.classList.remove("active");
      }
    },
  };
}

function lookAtTarget(camera: BABYLON.UniversalCamera, target: BABYLON.Vector3) {
  const direction = target.subtract(camera.position);
  const distanceXZ = Math.sqrt(direction.x * direction.x + direction.z * direction.z);
  camera.rotation.y = Math.atan2(direction.x, direction.z);
  camera.rotation.x = -Math.atan2(direction.y, distanceXZ);
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
      const hitCount = slimeEnemySystem.getPlayerHitCount();
      combatStatus.textContent = slimeEnemySystem.isLocked()
        ? currentLanguage === "fr"
          ? "Arene verrouillee - 4 impacts subis."
          : "Arena locked - 4 hits taken."
        : enemyCount > 0
          ? currentLanguage === "fr"
            ? `${enemyCount} slime${enemyCount > 1 ? "s" : ""} actif${enemyCount > 1 ? "s" : ""} - ${SLIME_PLAYER_HIT_LIMIT - hitCount} impact${SLIME_PLAYER_HIT_LIMIT - hitCount > 1 ? "s" : ""} restant${SLIME_PLAYER_HIT_LIMIT - hitCount > 1 ? "s" : ""}`
            : `${enemyCount} active slime${enemyCount > 1 ? "s" : ""} - ${SLIME_PLAYER_HIT_LIMIT - hitCount} hit${SLIME_PLAYER_HIT_LIMIT - hitCount > 1 ? "s" : ""} left`
          : currentLanguage === "fr"
            ? "Zone securisee pour l'instant - les slimes repopent tant que tu restes dans l'arene"
            : "Area secured for now - slimes keep respawning while you stay in the arena";
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

























