import * as BABYLON from "babylonjs";

import type { ZoneLockBarrierHandle } from "../core/types";
import { createMaterial } from "./builders";

export type ZoneLockBarrierDeps = {
  registerLocaleRefresher: (refresher: () => void) => void;
  rgbString: (color: BABYLON.Color3) => string;
};

export function createZoneLockBarrier(
  scene: BABYLON.Scene,
  name: string,
  position: BABYLON.Vector3,
  rotationY: number,
  size: { width: number; height: number; depth: number },
  color: BABYLON.Color3,
  getTitle: () => string,
  getSubtitle: () => string,
  deps: ZoneLockBarrierDeps
): ZoneLockBarrierHandle {
  const { registerLocaleRefresher, rgbString } = deps;
  const root = new BABYLON.TransformNode(`${name}_root`, scene);
  root.position.copyFrom(position);
  root.rotation.y = rotationY;

  const barrier = BABYLON.MeshBuilder.CreateBox(name, size, scene);
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
    {
      width: Math.max(2.8, size.width * 0.72),
      height: 0.72,
      sideOrientation: BABYLON.Mesh.DOUBLESIDE,
    },
    scene
  );
  label.parent = root;
  label.position = new BABYLON.Vector3(
    0,
    size.height * 0.5 + 0.46,
    -size.depth * 0.5 - 0.03
  );
  label.rotation.y = Math.PI;
  label.isPickable = false;
  label.material = labelMaterial;

  root.setEnabled(false);
  return root;
}
