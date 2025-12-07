import * as THREE from "https://unpkg.com/three@0.165.0/build/three.module.js";

let scene, camera, renderer, cube;

init();
animate();

function init() {
  // Scene
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x111111);

  // Camera
  camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.z = 3;

  // Renderer
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  // Cube
  const geometry = new THREE.BoxGeometry(1, 1, 1);
  const material = new THREE.MeshStandardMaterial({ color: 0x00ff88 });
  cube = new THREE.Mesh(geometry, material);
  scene.add(cube);

  // Light
  const light = new THREE.DirectionalLight(0xffffff, 1);
  light.position.set(3, 3, 5);
  scene.add(light);

  // Resize handling
  window.addEventListener("resize", onWindowResize);
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
  requestAnimationFrame(animate);

  cube.rotation.x += 0.01;
  cube.rotation.y += 0.015;

  renderer.render(scene, camera);
}
