import * as THREE from "three";
import { FontLoader } from "three/addons/loaders/FontLoader.js";
import { TextGeometry } from "three/addons/geometries/TextGeometry.js";

// Helper functions to change between deg and rad
const degToRad = (deg) => {
  return (Math.PI * deg) / 180;
};

const radToDeg = (rad) => {
  return 180 * (rad / Math.PI);
};

console.log(degToRad(30), radToDeg(degToRad(30)));

// Set up the scene, camera, and renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Create the airship geometry using a Shape
const shipBody = new THREE.Shape();
shipBody.moveTo(-3, 0);
shipBody.quadraticCurveTo(3, 3, 3, 0); // Top curve
shipBody.quadraticCurveTo(3, -3, -3, 0); // Bottom curve

const extrudeSettings = {
  depth: 0.2,
  bevelEnabled: true,
  bevelThickness: 0.2,
  bevelSize: 0.2,
  bevelSegments: 2,
};

const geometry = new THREE.ExtrudeGeometry(shipBody, extrudeSettings);
const material = new THREE.MeshBasicMaterial({
  color: 0x0077ff,
  side: THREE.DoubleSide,
});
const shipMesh = new THREE.Mesh(geometry, material);

const finShape = new THREE.Shape();

// Create a triangle shape for fins
finShape.lineTo(-1, 0);
finShape.lineTo(0, 1);
finShape.lineTo(1, 0);
finShape.lineTo(0, 0);

const topFinGeometry = new THREE.ExtrudeGeometry(finShape, extrudeSettings);
const bottomFinGeometry = new THREE.ExtrudeGeometry(finShape, extrudeSettings);

const finMaterial = new THREE.MeshBasicMaterial({
  color: 0x00ff6e,
  side: THREE.DoubleSide,
});

const topFinMesh = new THREE.Mesh(topFinGeometry, finMaterial);
topFinMesh.geometry.scale(0.5, 0.5, 0.5);
topFinMesh.geometry.translate(-2, 1.5, 0);
topFinMesh.geometry.rotateZ(degToRad(30));

const bottomFinMesh = new THREE.Mesh(bottomFinGeometry, finMaterial);
bottomFinMesh.geometry.scale(0.5, 0.5, 0.5);
bottomFinMesh.geometry.translate(2, 1.5, 0);
bottomFinMesh.geometry.rotateZ(degToRad(150));

// Add meshes to one parent, and add it to scene
const shipOrigin = new THREE.Object3D();
shipOrigin.add(shipMesh);

shipOrigin.add(shipMesh);
shipOrigin.add(topFinMesh);
shipOrigin.add(bottomFinMesh);
scene.add(shipOrigin);

// Create the text geometry
const loader = new FontLoader();
loader.load("fonts/CamingoCode.json", function (font) {
  const geometry = new TextGeometry("kelluu", {
    font: font,
    size: 0.6,
    depth: 0.1,
    curveSegments: 2,
    bevelEnabled: false,
  });

  const textMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
  const textMesh = new THREE.Mesh(geometry, textMaterial);
  textMesh.position.set(-1, 0, 0.4); // Position the text on the side of the airship
  shipOrigin.add(textMesh); // Add the text to the airship
});

// Set camera position
camera.position.z = 5;

const maxRotSpeed = 0.01;
const minRotSpeed = 0.001;
let rotSpeed = 0;
let maxAngle = 20;
let rotDir = "positive";

// Create formula for ease in out for rotation speed
const easeInOutQuadCoeff = (currentAngle) => {
  const t = Math.abs((Math.abs(currentAngle) - maxAngle) / maxAngle);
  return t < 0.5 ? 0.5 * Math.pow(2 * t, 2) : 1 - 0.5 * Math.pow(-2 * t + 2, 2);
};

// Animation loop
function animate() {
  requestAnimationFrame(animate);
  // horizontal rotation

  // Swap rotation direction at max angles
  if (shipOrigin.rotation.y >= degToRad(maxAngle)) {
    rotDir = "negative";
  } else if (shipOrigin.rotation.y <= degToRad(-maxAngle)) {
    rotDir = "positive";
  }

  // Adjust rotation speed based on rotation direction and the easeInOut coefficient
  if (rotDir === "negative") {
    rotSpeed =
      -1 *
      Math.max(
        minRotSpeed,
        maxRotSpeed * easeInOutQuadCoeff(radToDeg(shipOrigin.rotation.y))
      );
  } else {
    rotSpeed = Math.max(
      minRotSpeed,
      maxRotSpeed * easeInOutQuadCoeff(radToDeg(shipOrigin.rotation.y))
    );
  }

  shipOrigin.rotation.y += rotSpeed;

  renderer.render(scene, camera);
}
animate();
