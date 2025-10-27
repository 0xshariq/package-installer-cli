import { Engine, Scene, ArcRotateCamera, HemisphericLight, MeshBuilder, Vector3 } from "babylonjs";

const canvas = document.getElementById("renderCanvas");
const engine = new Engine(canvas, true);

const createScene = () => {
  const scene = new Scene(engine);

  const camera = new ArcRotateCamera("camera", Math.PI / 2, Math.PI / 4, 5, Vector3.Zero(), scene);
  camera.attachControl(canvas, true);

  const light = new HemisphericLight("light", new Vector3(1, 1, 0), scene);
  MeshBuilder.CreateBox("box", {}, scene);

  return scene;
};

const scene = createScene();
engine.runRenderLoop(() => scene.render());
window.addEventListener("resize", () => engine.resize());
