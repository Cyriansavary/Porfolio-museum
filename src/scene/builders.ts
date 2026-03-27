import * as BABYLON from "babylonjs";

export function createMaterial(
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

export function enableCollisions(...meshes: BABYLON.AbstractMesh[]) {
  meshes.forEach((mesh) => {
    mesh.checkCollisions = true;
  });
}

export function createPathLight(
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

export function createColumn(
  scene: BABYLON.Scene,
  x: number,
  z: number,
  height = 6
) {
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

export function createDecorColumn(
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

export function createDecorScreen(
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

export function createKitchenCounterModule(
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

export function createKitchenTallUnit(
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

export function createKitchenPendantLight(
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
