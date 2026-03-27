import * as BABYLON from "babylonjs";

import {
  PLAYER_HEIGHT,
  VR_COOKING_COMBO_BONUS_STEP,
  VR_COOKING_COMBO_MAX_BONUS,
  VR_COOKING_COMBO_WINDOW,
  VR_COOKING_DIFFICULTY_MAX_TIER,
  VR_COOKING_DIFFICULTY_STEP_SERVES,
  VR_COOKING_FAILURE_LIMIT,
  VR_COOKING_GRILL_TIME,
  VR_COOKING_INITIAL_CLIENT_COUNT,
  VR_COOKING_INTERACTION_DISTANCE,
  VR_COOKING_MIN_ORDER_TIME_LIMIT,
  VR_COOKING_ORDER_COUNT,
  VR_COOKING_ORDER_DANGER_TIME,
  VR_COOKING_ORDER_TIME_LIMIT,
  VR_COOKING_ORDER_WARNING_TIME,
  VR_COOKING_SECOND_CLIENT_DELAY,
  VR_COOKING_TIMEOUT_PENALTY,
  VR_COOKING_ZONE_DEPTH,
  VR_COOKING_ZONE_WIDTH,
} from "../core/constants";
import type {
  AppLanguage,
  CookingPopupTone,
  LeaderboardCategory,
  PlayerController,
  ProjectData,
  VRCookingInventory,
  VRCookingOrder,
  VRCookingOrderType,
  VRCookingStation,
  VRCookingStationType,
  VRCookingSystem,
  ZoneLockBarrierHandle,
} from "../core/types";
import {
  createKitchenCounterModule,
  createMaterial,
} from "../scene/builders";
import { getRoomBasis } from "../scene/room-basis";

export type VRCookingSystemDeps = {
  awardLeaderboardPoints: (category: LeaderboardCategory, delta: number) => void;
  createZoneLockBarrier: (
    scene: BABYLON.Scene,
    name: string,
    position: BABYLON.Vector3,
    rotationY: number,
    size: { width: number; height: number; depth: number },
    accentColor: BABYLON.Color3,
    title: () => string,
    subtitle: () => string
  ) => ZoneLockBarrierHandle;
  cookingCombo: HTMLSpanElement;
  cookingHeld: HTMLParagraphElement;
  cookingHint: HTMLParagraphElement;
  cookingHud: HTMLDivElement;
  cookingPopup: HTMLDivElement;
  cookingRush: HTMLSpanElement;
  cookingScore: HTMLSpanElement;
  getCookingPopupHideAt: () => number;
  getCurrentUiText: () => {
    cookingComboBase: string;
    cookingHeldEmpty: string;
    cookingRushStable: string;
  };
  getIsPointerLocked: () => boolean;
  isLeaderboardOpen: () => boolean;
  isOverviewOpen: () => boolean;
  languageState: { readonly currentLanguage: AppLanguage };
  projectPanel: HTMLDivElement;
  registerLocaleRefresher: (refresher: () => void) => void;
  rgbString: (color: BABYLON.Color3) => string;
  showCookingPopup: (
    message: string,
    tone?: CookingPopupTone,
    durationMs?: number
  ) => void;
  updateStatus: (message: string) => void;
};
export function createVRCookingSystem(
  scene: BABYLON.Scene,
  project: ProjectData,
  camera: BABYLON.UniversalCamera,
  playerController: PlayerController,
  deps: VRCookingSystemDeps
): VRCookingSystem {
  const {
    awardLeaderboardPoints,
    createZoneLockBarrier,
    cookingCombo,
    cookingHeld,
    cookingHint,
    cookingHud,
    cookingPopup,
    cookingRush,
    cookingScore,
    getCookingPopupHideAt,
    getCurrentUiText,
    getIsPointerLocked,
    isLeaderboardOpen,
    isOverviewOpen,
    languageState,
    projectPanel,
    registerLocaleRefresher,
    rgbString,
    showCookingPopup,
    updateStatus,
  } = deps;
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
  let servedOrders = 0;
  let difficultyTier = 1;
  let locked = false;

  const entranceBarrier = createZoneLockBarrier(
    scene,
    `${project.id}_lockBarrier`,
    toWorld(0, 1.34, -zoneHalfDepth + 1.72),
    yaw,
    { width: 4.96, height: 2.68, depth: 0.28 },
    project.color,
    () => (languageState.currentLanguage === "fr" ? "SERVICE FERME" : "SERVICE CLOSED"),
    () =>
      languageState.currentLanguage === "fr"
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
      languageState.currentLanguage === "fr" ? "Cuisine fermee" : "Kitchen closed",
      "error",
      1600
    );
    updateStatus(
      languageState.currentLanguage === "fr"
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
    languageState.currentLanguage === "fr"
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
      title: definition.titles[languageState.currentLanguage],
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
      return languageState.currentLanguage === "fr"
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
      ? languageState.currentLanguage === "fr"
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
    const timeLimitMs = getCurrentOrderTimeLimitMs();
    return {
      id: nextOrderId++,
      type,
      title: recipe.title,
      ingredients: recipe.ingredients,
      reward: recipe.reward,
      timeLimitMs,
      remainingMs: timeLimitMs,
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
  const getComputedDifficultyTier = () =>
    Math.min(
      VR_COOKING_DIFFICULTY_MAX_TIER,
      1 + Math.floor(servedOrders / VR_COOKING_DIFFICULTY_STEP_SERVES)
    );
  const getCurrentOrderTimeLimitMs = () =>
    Math.max(
      VR_COOKING_MIN_ORDER_TIME_LIMIT * 1000,
      (VR_COOKING_ORDER_TIME_LIMIT - Math.max(0, difficultyTier - 1) * 5) * 1000
    );
  const updateDifficultyTier = () => {
    const nextDifficultyTier = getComputedDifficultyTier();
    if (nextDifficultyTier === difficultyTier) {
      return;
    }

    difficultyTier = nextDifficultyTier;
    orderBoardDirty = true;
    showCookingPopup(
      languageState.currentLanguage === "fr"
        ? `Rush niveau ${difficultyTier}`
        : `Rush tier ${difficultyTier}`,
      "warning",
      1200
    );
  };

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
        languageState.currentLanguage === "fr" ? "SERVICE FERME" : "SERVICE CLOSED",
        640,
        326
      );
      boardContext.fillStyle = "rgba(255, 202, 202, 0.9)";
      boardContext.font = "600 36px Segoe UI";
      boardContext.fillText(
        languageState.currentLanguage === "fr"
          ? "3 clients mal servis ou perdus"
          : "3 customers served wrong or lost",
        640,
        406
      );
      boardContext.fillStyle = "rgba(223, 232, 248, 0.84)";
      boardContext.font = "500 28px Segoe UI";
      boardContext.fillText(
        languageState.currentLanguage === "fr"
          ? "La cuisine est verrouillee pour le reste de la visite."
          : "The kitchen is locked for the rest of the visit.",
        640,
        470
      );
      boardContext.fillStyle = "rgba(255, 216, 180, 0.95)";
      boardContext.font = "700 34px Segoe UI";
      boardContext.fillText(
        `${languageState.currentLanguage === "fr" ? "Score final" : "Final score"} ${score
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
      languageState.currentLanguage === "fr" ? "COMMANDES BURGER" : "BURGER ORDERS",
      94,
      112
    );

    boardContext.fillStyle = "rgba(221, 235, 255, 0.78)";
    boardContext.font = "500 24px Segoe UI";
    boardContext.fillText(
      languageState.currentLanguage === "fr"
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
      ? languageState.currentLanguage === "fr"
        ? "Grill : steak cuit pret"
        : "Grill: cooked patty ready"
      : grillActive
        ? languageState.currentLanguage === "fr"
          ? `Grill : ${Math.max(1, Math.ceil((1 - grillProgress) * VR_COOKING_GRILL_TIME))} s`
          : `Grill: ${Math.max(1, Math.ceil((1 - grillProgress) * VR_COOKING_GRILL_TIME))} s`
        : languageState.currentLanguage === "fr"
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
        `${languageState.currentLanguage === "fr" ? "CLIENT" : "CLIENT"} ${String.fromCharCode(65 + index)}`,
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
      languageState.currentLanguage === "fr"
        ? "Bacs infinis : pain, steak cru, fromage, salade, tomate | clic ou E pour interagir"
        : "Infinite bins: bun, raw patty, cheese, lettuce, tomato | click or E to interact",
      76,
      812
    );
    const clientReleaseText =
      unlockedClientCount < VR_COOKING_ORDER_COUNT
        ? languageState.currentLanguage === "fr"
          ? `Client B arrive dans ${Math.max(
              0,
              Math.ceil((VR_COOKING_SECOND_CLIENT_DELAY * 1000 - cookingActiveElapsedMs) / 1000)
            )} s`
          : `Client B arrives in ${Math.max(
              0,
              Math.ceil((VR_COOKING_SECOND_CLIENT_DELAY * 1000 - cookingActiveElapsedMs) / 1000)
            )} s`
        : languageState.currentLanguage === "fr"
          ? "Deux postes clients actifs"
          : "Two customer slots active";
    boardContext.fillText(clientReleaseText, 76, 850);
    boardContext.fillText(
      languageState.currentLanguage === "fr"
        ? `Niveau de rush ${difficultyTier}`
        : `Rush tier ${difficultyTier}`,
      760,
      850
    );

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
        languageState.currentLanguage === "fr" ? "Cuisine fermee" : "Kitchen closed";
      cookingCombo.textContent =
        languageState.currentLanguage === "fr"
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
    const tierLabel =
      languageState.currentLanguage === "fr"
        ? `Niv ${difficultyTier}`
        : `Lv ${difficultyTier}`;

    cookingHud.classList.toggle("urgent", Boolean(isWarning));
    cookingHud.classList.toggle("danger", Boolean(isDanger));
    cookingRush.classList.toggle("warning", Boolean(isWarning && !isDanger));
    cookingRush.classList.toggle("danger", Boolean(isDanger));
    cookingCombo.classList.toggle("active", comboActive);

    if (!hasUrgency) {
      cookingRush.textContent = `${tierLabel} | ${getCurrentUiText().cookingRushStable}`;
    } else if (isDanger) {
      cookingRush.textContent =
        languageState.currentLanguage === "fr"
          ? `${tierLabel} | Urgence ${Math.max(1, Math.ceil(nextExpiry / 1000))} s`
          : `${tierLabel} | Urgency ${Math.max(1, Math.ceil(nextExpiry / 1000))} s`;
    } else if (isWarning) {
      cookingRush.textContent =
        languageState.currentLanguage === "fr"
          ? `${tierLabel} | Rush ${Math.max(1, Math.ceil(nextExpiry / 1000))} s`
          : `${tierLabel} | Rush ${Math.max(1, Math.ceil(nextExpiry / 1000))} s`;
    } else {
      cookingRush.textContent =
        languageState.currentLanguage === "fr"
          ? `${tierLabel} | Prochaine commande ${Math.max(1, Math.ceil(nextExpiry / 1000))} s`
          : `${tierLabel} | Next order ${Math.max(1, Math.ceil(nextExpiry / 1000))} s`;
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
    () => (languageState.currentLanguage === "fr" ? "PAIN" : "BUN"),
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
    () => (languageState.currentLanguage === "fr" ? "STEAK" : "PATTY"),
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
    () => (languageState.currentLanguage === "fr" ? "FROMAGE" : "CHEESE"),
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
    () => (languageState.currentLanguage === "fr" ? "SALADE" : "LETTUCE"),
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
    () => (languageState.currentLanguage === "fr" ? "TOMATE" : "TOMATO"),
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
    () => (languageState.currentLanguage === "fr" ? "CUISSON" : "GRILL"),
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
      languageState.currentLanguage === "fr" ? "POUBELLE" : "TRASH",
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
      return languageState.currentLanguage === "fr"
        ? "Cuisine verrouillee - la partie est terminee."
        : "Kitchen locked - the run is over.";
    }

    if (!focusedStationId) {
      return languageState.currentLanguage === "fr"
        ? "Vise une station et clique ou appuie sur E pour interagir."
        : "Aim at a station and click or press E to interact.";
    }

    switch (focusedStationId) {
      case "bunBin":
        return inventory.burger
          ? languageState.currentLanguage === "fr"
            ? "Burger pret - sers-le d'abord ou vide le plateau."
            : "Burger ready - serve it first or clear your tray."
          : inventory.bun
            ? languageState.currentLanguage === "fr"
              ? "Tu as deja un pain sur le plateau."
              : "You already have a bun on the tray."
            : languageState.currentLanguage === "fr"
              ? "Clic / E - prendre un pain burger"
              : "Click / E - take a burger bun";
      case "steakBin":
        return inventory.burger
          ? languageState.currentLanguage === "fr"
            ? "Burger deja monte - impossible de reprendre des ingredients."
            : "Burger already assembled - you cannot pick more ingredients."
          : inventory.rawSteak || inventory.cookedSteak
            ? languageState.currentLanguage === "fr"
              ? "Tu as deja un steak sur le plateau."
              : "You already have a patty on the tray."
            : languageState.currentLanguage === "fr"
              ? "Clic / E - prendre un steak cru"
              : "Click / E - take a raw patty";
      case "saladBin":
        return inventory.burger
          ? languageState.currentLanguage === "fr"
            ? "Burger deja monte - sers-le au comptoir."
            : "Burger already assembled - serve it at the counter."
          : inventory.lettuce
            ? languageState.currentLanguage === "fr"
              ? "Tu as deja pris de la salade."
              : "You already picked lettuce."
            : languageState.currentLanguage === "fr"
              ? "Clic / E - prendre de la salade"
              : "Click / E - take lettuce";
      case "cheeseBin":
        return inventory.burger
          ? languageState.currentLanguage === "fr"
            ? "Burger deja monte - sers-le au comptoir."
            : "Burger already assembled - serve it at the counter."
          : inventory.cheese
            ? languageState.currentLanguage === "fr"
              ? "Tu as deja pris du fromage."
              : "You already picked cheese."
            : languageState.currentLanguage === "fr"
              ? "Clic / E - prendre du fromage"
              : "Click / E - take cheese";
      case "tomatoBin":
        return inventory.burger
          ? languageState.currentLanguage === "fr"
            ? "Burger deja monte - sers-le au comptoir."
            : "Burger already assembled - serve it at the counter."
          : inventory.tomato
            ? languageState.currentLanguage === "fr"
              ? "Tu as deja pris de la tomate."
              : "You already picked tomato."
            : languageState.currentLanguage === "fr"
              ? "Clic / E - prendre de la tomate"
              : "Click / E - take tomato";
      case "grill":
        if (grillReady) {
          return inventory.rawSteak || inventory.cookedSteak || inventory.burger
            ? languageState.currentLanguage === "fr"
              ? "Libere le plateau pour recuperer le steak cuit."
              : "Clear your tray to pick up the cooked patty."
            : languageState.currentLanguage === "fr"
              ? "Clic / E - recuperer le steak cuit"
              : "Click / E - pick up the cooked patty";
        }
        if (grillActive) {
          return languageState.currentLanguage === "fr"
            ? `Cuisson en cours - ${Math.max(1, Math.ceil((1 - grillProgress) * VR_COOKING_GRILL_TIME))} s`
            : `Cooking in progress - ${Math.max(1, Math.ceil((1 - grillProgress) * VR_COOKING_GRILL_TIME))} s`;
        }
        return inventory.rawSteak
          ? languageState.currentLanguage === "fr"
            ? "Clic / E - lancer la cuisson du steak"
            : "Click / E - start cooking the patty"
          : languageState.currentLanguage === "fr"
            ? "Prends un steak cru avant le grill."
            : "Grab a raw patty before using the grill.";
      case "prep":
        if (inventory.burger) {
          return languageState.currentLanguage === "fr"
            ? "Burger pret - direction le comptoir client."
            : "Burger ready - head to the customer counter.";
        }
        if (inventory.bun && inventory.cookedSteak) {
          return languageState.currentLanguage === "fr"
            ? `Clic / E - assembler ${getRecipeInfo(resolveBurgerType()).title.toLowerCase()}`
            : `Click / E - assemble ${getRecipeInfo(resolveBurgerType()).title.toLowerCase()}`;
        }
        return languageState.currentLanguage === "fr"
          ? "Assemble pain + steak cuit, puis ajoute fromage, salade ou tomate."
          : "Assemble bun + cooked patty, then add cheese, lettuce or tomato.";
      case "serve":
        return inventory.burger
          ? languageState.currentLanguage === "fr"
            ? "Clic / E - servir la commande en cours"
            : "Click / E - serve the current order"
          : languageState.currentLanguage === "fr"
            ? "Les clients attendent un burger conforme."
            : "Customers are waiting for the correct burger.";
      case "trash":
        return isInventoryEmpty()
          ? languageState.currentLanguage === "fr"
            ? "Plateau vide."
            : "Tray already empty."
          : languageState.currentLanguage === "fr"
            ? "Clic / E - vider le plateau et recommencer"
            : "Click / E - clear the tray and restart";
      default:
        return languageState.currentLanguage === "fr"
          ? "Vise une station et clique ou appuie sur E pour interagir."
          : "Aim at a station and click or press E to interact.";
    }
  };

  const interact = () => {
    if (
      locked ||
      !isPlayerInsideZone() ||
      !getIsPointerLocked() ||
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
            languageState.currentLanguage === "fr"
              ? "Sers ton burger avant de reprendre des ingredients"
              : "Serve your burger before taking more ingredients"
          );
          return true;
        }
        if (inventory.bun) {
          showCookingPopup(
            languageState.currentLanguage === "fr" ? "Tu as deja un pain" : "You already have a bun"
          );
          return true;
        }
        inventory.bun = true;
        showCookingPopup(
          languageState.currentLanguage === "fr" ? "Pain burger recupere" : "Burger bun picked up"
        );
        return true;
      case "steakBin":
        if (inventory.burger) {
          showCookingPopup(
            languageState.currentLanguage === "fr"
              ? "Impossible : burger deja monte"
              : "Impossible: burger already assembled"
          );
          return true;
        }
        if (inventory.rawSteak || inventory.cookedSteak) {
          showCookingPopup(
            languageState.currentLanguage === "fr"
              ? "Tu as deja un steak sur le plateau"
              : "You already have a patty on the tray"
          );
          return true;
        }
        inventory.rawSteak = true;
        showCookingPopup(
          languageState.currentLanguage === "fr" ? "Steak cru recupere" : "Raw patty picked up"
        );
        return true;
      case "saladBin":
        if (inventory.burger) {
          showCookingPopup(
            languageState.currentLanguage === "fr"
              ? "Le burger est deja monte"
              : "The burger is already assembled"
          );
          return true;
        }
        if (inventory.lettuce) {
          showCookingPopup(
            languageState.currentLanguage === "fr"
              ? "Tu as deja pris de la salade"
              : "You already picked lettuce"
          );
          return true;
        }
        inventory.lettuce = true;
        showCookingPopup(
          languageState.currentLanguage === "fr" ? "Salade recuperee" : "Lettuce picked up"
        );
        return true;
      case "cheeseBin":
        if (inventory.burger) {
          showCookingPopup(
            languageState.currentLanguage === "fr"
              ? "Le burger est deja monte"
              : "The burger is already assembled"
          );
          return true;
        }
        if (inventory.cheese) {
          showCookingPopup(
            languageState.currentLanguage === "fr"
              ? "Tu as deja pris du fromage"
              : "You already picked cheese"
          );
          return true;
        }
        inventory.cheese = true;
        showCookingPopup(
          languageState.currentLanguage === "fr" ? "Fromage recupere" : "Cheese picked up"
        );
        return true;
      case "tomatoBin":
        if (inventory.burger) {
          showCookingPopup(
            languageState.currentLanguage === "fr"
              ? "Le burger est deja monte"
              : "The burger is already assembled"
          );
          return true;
        }
        if (inventory.tomato) {
          showCookingPopup(
            languageState.currentLanguage === "fr"
              ? "Tu as deja pris de la tomate"
              : "You already picked tomato"
          );
          return true;
        }
        inventory.tomato = true;
        showCookingPopup(
          languageState.currentLanguage === "fr" ? "Tomate recuperee" : "Tomato picked up"
        );
        return true;
      case "grill":
        if (grillReady) {
          if (inventory.rawSteak || inventory.cookedSteak || inventory.burger) {
            showCookingPopup(
              languageState.currentLanguage === "fr"
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
            languageState.currentLanguage === "fr" ? "Steak cuit recupere" : "Cooked patty picked up",
            "success"
          );
          return true;
        }
        if (grillActive) {
          showCookingPopup(
            languageState.currentLanguage === "fr"
              ? `Cuisson en cours - ${Math.max(1, Math.ceil((1 - grillProgress) * VR_COOKING_GRILL_TIME))} s`
              : `Cooking in progress - ${Math.max(1, Math.ceil((1 - grillProgress) * VR_COOKING_GRILL_TIME))} s`,
            "warning"
          );
          return true;
        }
        if (!inventory.rawSteak) {
          showCookingPopup(
            languageState.currentLanguage === "fr"
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
          languageState.currentLanguage === "fr" ? "Steak en cuisson" : "Patty cooking",
          "warning"
        );
        return true;
      case "prep":
        if (inventory.burger) {
          showCookingPopup(
            languageState.currentLanguage === "fr" ? "Burger deja pret" : "Burger already ready",
            "warning"
          );
          return true;
        }
        if (!inventory.bun || !inventory.cookedSteak) {
          showCookingPopup(
            languageState.currentLanguage === "fr"
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
          languageState.currentLanguage === "fr"
            ? `${getRecipeInfo(burgerType).title} assemble`
            : `${getRecipeInfo(burgerType).title} assembled`,
          "success"
        );
        return true;
      case "serve": {
        if (!inventory.burger) {
          showCookingPopup(
            languageState.currentLanguage === "fr" ? "Aucun burger a servir" : "No burger to serve",
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
            languageState.currentLanguage === "fr" ? "Mauvaise commande" : "Wrong order",
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
        servedOrders += 1;
        updateDifficultyTier();
        awardLeaderboardPoints("cooking", totalReward);
        inventory.burger = null;
        refillOrders();
        orderBoardDirty = true;
        showCookingPopup(
          comboBonus > 0
            ? `Combo x${comboStreak} +${totalReward}`
            : languageState.currentLanguage === "fr"
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
            languageState.currentLanguage === "fr" ? "Plateau deja vide" : "Tray already empty",
            "warning"
          );
          return true;
        }
        resetInventory();
        showCookingPopup(
          languageState.currentLanguage === "fr" ? "Plateau vide" : "Tray cleared",
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
            languageState.currentLanguage === "fr"
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
              ? languageState.currentLanguage === "fr"
                ? `${expiredOrders.length} commandes perdues -${expiredOrders.length * VR_COOKING_TIMEOUT_PENALTY}`
                : `${expiredOrders.length} orders lost -${expiredOrders.length * VR_COOKING_TIMEOUT_PENALTY}`
              : languageState.currentLanguage === "fr"
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
            languageState.currentLanguage === "fr"
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

      if (cookingPopup.classList.contains("visible") && now >= getCookingPopupHideAt()) {
        cookingPopup.classList.remove("visible");
      }

      cookingHud.classList.toggle("hidden", !visible);
      updateHeldVisuals(visible && getIsPointerLocked(), now);

      if (visible && getIsPointerLocked()) {
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


