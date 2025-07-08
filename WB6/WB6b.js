// @ts-check

import * as T from "../libs/CS559-Three/build/three.module.js";
import { OrbitControls } from "../libs/CS559-Three/examples/jsm/controls/OrbitControls.js";
import { setupBasicScene } from "./WB6helpers.js";
import { OBJLoader } from "../libs/CS559-Three/examples/jsm/loaders/OBJLoader.js";

/** Setup the window */
/** @type {number} */
let wid = 670; // window.innerWidth;
/** @type {number} */
let ht = 500; // window.innerHeight;
/** @type {T.WebGLRenderer} */
let renderer = new T.WebGLRenderer({ preserveDrawingBuffer: true });
renderer.setSize(wid, ht);
renderer.shadowMap.enabled = true;

let container = document.getElementById("canvas2");
if (container) {
  container.appendChild(renderer.domElement);
}
renderer.domElement.id = "canvas";


// Helper Functions

// Enable shadow casting and receiving for every mesh in a model
function enableShadows(model) {
  model.traverse(child => {
    if (child instanceof T.Mesh) {
      child.castShadow = true;
      child.receiveShadow = true;
    }
  });
}

// Load an object, set its position, rotation, scale, and material, enable shadows, and add it to the scene
// The callback (if provided) is called with the loaded model
function loadModel(url, position, rotation, scale, newMaterial, callback) {
  const loader = new OBJLoader();
  loader.load(url, function (model) {
    model.position.copy(position);
    model.rotation.copy(rotation);
    model.scale.set(scale, scale, scale);
    
    // Traverse the model and assign the new material to each mesh, if provided
    model.traverse(child => {
      if (child instanceof T.Mesh) {
        child.geometry.center(); // Prevents the model from rotating around its corner
        child.castShadow = true; // Set shadow casting for each mesh
        child.receiveShadow = true; // Set shadow receiving for each mesh
        if (newMaterial) {
          child.material = newMaterial;
        }
      }
    });
    
    scene.add(model);
    if (callback) { // Call the callback if provided (useful for setting spotlight targets and calling vars for animations)
      callback(model);
    }
  });
}


// Scene Setup
/* setupBasicScene creates a scene and puts the pedestals in place */
/** @type {T.Scene} */
let scene = setupBasicScene();


// Spotlights (made them brighter for better visibility)
let spotlight_1 = new T.SpotLight(0xaaaaff, 50);
spotlight_1.angle = Math.PI / 16;
spotlight_1.position.set(2, 5, 2);
spotlight_1.castShadow = true;
scene.add(spotlight_1);

let spotlight_2 = new T.SpotLight(0xaaaaff, 50);
spotlight_2.angle = Math.PI / 16;
spotlight_2.position.set(-2, 5, 2);
spotlight_2.castShadow = true;
scene.add(spotlight_2);

let spotlight_3 = new T.SpotLight(0xaaaaff, 50);
spotlight_3.angle = Math.PI / 16;
spotlight_3.position.set(2, 5, -2);
spotlight_3.castShadow = true;
scene.add(spotlight_3);

let spotlight_4 = new T.SpotLight(0xaaaaff, 50);
spotlight_4.angle = Math.PI / 16;
spotlight_4.position.set(-2, 5, -2);
spotlight_4.castShadow = true;
scene.add(spotlight_4);


// Global variables for loaded models
let astronaut, suzanne, teapot;


// Load first object: Astronaut
let astronautMaterial = new T.MeshLambertMaterial({
  color: "green",
  emissive: "green",
  emissiveIntensity: 0.5,
});

loadModel(
  "objects/07-astronaut.obj",
  new T.Vector3(2, 1.8, 2),
  new T.Euler(2 * Math.PI, 0, 0),
  0.15, // scale factor
  astronautMaterial,
  function (model) {
    astronaut = model;
    spotlight_1.target = astronaut;
  }
);

// Second Object: SpongeBob (built from primitives)

/** @type {T.Material} */
let spongeMaterial = new T.MeshPhongMaterial({
  color: "#ffaa00",
  shininess: 15,
  specular: "#ffff00",
});
/** @type {T.BufferGeometry} */
let spongeGeometry = new T.BoxGeometry(0.6, 0.2, 0.85);
/** @type {T.Mesh} */
let sponge = new T.Mesh(spongeGeometry, spongeMaterial);
sponge.position.set(-2, 2, 2);
sponge.rotation.set(Math.PI / 2, 0, 0);

// Arms
let armGeo = new T.CylinderGeometry(0.05, 0.05, 0.3, 16);
armGeo.translate(0, -0.2, 0); // shift pivot to the top end

let leftArm = new T.Mesh(armGeo, spongeMaterial);
leftArm.rotation.z = Math.PI / 2;
leftArm.rotation.y = Math.PI;
leftArm.position.set(0.25, 0, 0);
sponge.add(leftArm);

let rightArm = new T.Mesh(armGeo, spongeMaterial);
rightArm.rotation.z = Math.PI / 2;
rightArm.rotation.y = Math.PI;
rightArm.position.set(-0.25, 0, 0);
sponge.add(rightArm);

// Legs
let legGeo = new T.CylinderGeometry(0.05, 0.05, 0.5, 16);
let leftLeg = new T.Mesh(legGeo, spongeMaterial);
leftLeg.position.set(-0.2, 0, 0.5);
leftLeg.rotation.x = Math.PI / 2;
sponge.add(leftLeg);

let rightLeg = new T.Mesh(legGeo, spongeMaterial);
rightLeg.position.set(0.2, 0, 0.5);
rightLeg.rotation.x = Math.PI / 2;
sponge.add(rightLeg);

// Shoes
let leftShoeGeo = new T.BoxGeometry(0.15, 0.3, 0.15);
let shoeMaterial = new T.MeshPhongMaterial({
  color: "#000000",
  shininess: 15,
  specular: "#000000",
});
let leftShoe = new T.Mesh(leftShoeGeo, shoeMaterial);
leftShoe.position.set(-0.2, 0.05, 0.7);
sponge.add(leftShoe);

let rightShoeGeo = new T.BoxGeometry(0.15, 0.3, 0.15);
let rightShoe = new T.Mesh(rightShoeGeo, shoeMaterial);
rightShoe.position.set(0.2, 0.05, 0.7);
sponge.add(rightShoe);

// Eyes
let outEyeGeo = new T.SphereGeometry(0.1, 16, 16); // outer white of eye
let inEyeGeo = new T.SphereGeometry(0.05, 16, 16); // inner black of eye
let outEyeMaterial = new T.MeshPhongMaterial({
  color: "#ffffff",
  shininess: 15,
  specular: "#ffffff",
});
let inEyeMaterial = new T.MeshPhongMaterial({
  color: "#000000",
  shininess: 15,
  specular: "#000000",
});
let leftInEye = new T.Mesh(inEyeGeo, inEyeMaterial);
let leftEye = new T.Mesh(outEyeGeo, outEyeMaterial);
leftEye.position.set(0.15, 0.08, -0.2);
leftInEye.position.set(0.15, 0.14, -0.2);
sponge.add(leftInEye);
sponge.add(leftEye);

let rightEye = new T.Mesh(outEyeGeo, outEyeMaterial);
let rightInEye = new T.Mesh(inEyeGeo, inEyeMaterial);
rightEye.position.set(-0.15, 0.08, -0.2);
rightInEye.position.set(-0.15, 0.14, -0.2);
sponge.add(rightEye);
sponge.add(rightInEye);

// Nose
let noseGeo = new T.CylinderGeometry(0.04, 0.04, 0.3, 16);
let nose = new T.Mesh(noseGeo, spongeMaterial);
nose.position.set(0, 0.15, -0.1);
sponge.add(nose);

// Mouth and Cap
let mouthGeo = new T.CylinderGeometry(0.15, 0.15, 0.05, 16, 1, false, -Math.PI / 2, Math.PI); // thin half cylinder
let mouthMaterial = new T.MeshPhongMaterial({
  color: "#000000",
  shininess: 15,
  specular: "#000000",
});
let mouth = new T.Mesh(mouthGeo, mouthMaterial);
mouth.position.set(0, 0.1, -0.02);
let mouthCapGeo = new T.BoxGeometry(0.3, 0.05, 0.02);
let mouthCap = new T.Mesh(mouthCapGeo, mouthMaterial); // covers the unclosed top space of mouth
mouthCap.position.set(0, 0.1, 0);
sponge.add(mouthCap);
sponge.add(mouth);

// Teeth
let toothGeo = new T.BoxGeometry(0.08, 0.045, 0.07);
let toothMaterial = new T.MeshPhongMaterial({
  color: "#ffffff",
  shininess: 15,
  specular: "#ffffff",
});
let tooth1 = new T.Mesh(toothGeo, toothMaterial);
let tooth2 = new T.Mesh(toothGeo, toothMaterial);
tooth1.position.set(-0.05, 0.11, 0.03);
tooth2.position.set(0.05, 0.11, 0.03);
sponge.add(tooth1);
sponge.add(tooth2);

// Pants
let pantsGeo = new T.BoxGeometry(0.65, 0.23, 0.25);
let pantsMaterial = new T.MeshPhongMaterial({
  color: "#8B4513",
  shininess: 15,
  specular: "#8B2313",
});
let pants = new T.Mesh(pantsGeo, pantsMaterial);
pants.position.set(0, 0, 0.32);
sponge.add(pants);

// Add SpongeBob to the scene
scene.add(sponge);
// Enable shadows for SpongeBob
enableShadows(sponge);

// Load remaining Models

// Load third object: Suzanne 
let suzanneMaterial = new T.MeshStandardMaterial({
  color: "red",
  metalness: 0.3,
  roughness: 0.8,
});

loadModel(
  "objects/07-suzanne.obj",
  new T.Vector3(2, 1.5, -2),
  new T.Euler(Math.PI / 2, 0, 0),
  0.03, // scale factor
  suzanneMaterial,
  function (model) {
    suzanne = model;
    spotlight_3.target = suzanne;
  }
);

let teapotMaterial = new T.MeshPhysicalMaterial({
  color: "orange",
  metalness: 0.8,
  roughness: 0.8,
});

// Load fourth object: Teapot 
loadModel(
  "objects/07-teapot.obj",
  new T.Vector3(-2, 1.75, -2),
  new T.Euler(2 * Math.PI, 0, 0),
  0.02, // scale factor
  teapotMaterial,
  function (model) {
    teapot = model;
    spotlight_4.target = teapot;
  }
);

// For spotlight_2, set its target to SpongeBob
spotlight_2.target = sponge;


// Cameras and Controls
let main_camera = new T.PerspectiveCamera(60, wid / ht, 1, 100);
main_camera.position.set(0, 4, 6);
main_camera.rotation.set(-0.5, 0, 0);
let active_camera = main_camera;

// Additional cameras for each exhibit
let camera_1 = new T.PerspectiveCamera(60, wid / ht, 1, 100);
// For the Astronaut exhibit (located at approximately (2, 1.8, 2)):
camera_1.position.set(2, 3, 4);
camera_1.lookAt(new T.Vector3(2, 1.8, 2));

let camera_2 = new T.PerspectiveCamera(60, wid / ht, 1, 100);
// For SpongeBob (located at (-2, 2, 2)):
camera_2.position.set(-2, 3, 4);
camera_2.lookAt(new T.Vector3(-2, 2, 2));

let camera_3 = new T.PerspectiveCamera(60, wid / ht, 1, 100);
// For Suzanne (located at (2, 1.5, -2)):
camera_3.position.set(2, 3, -4);
camera_3.lookAt(new T.Vector3(2, 1.5, -2));

let camera_4 = new T.PerspectiveCamera(60, wid / ht, 1, 100);
// For Teapot (located at (-2, 1.75, -2)):
camera_4.position.set(-2, 3, -4);
camera_4.lookAt(new T.Vector3(-2, 1.75, -2));

let controls = new OrbitControls(main_camera, renderer.domElement);

function setupCamButton(name, camera) {
  const button = document.getElementById(name);
  if (!(button instanceof HTMLButtonElement))
    throw new Error(`Button ${name} doesn't exist`);
  button.onclick = function () {
    active_camera = camera;
    renderer.render(scene, active_camera);
  };
}
setupCamButton("main_cam", main_camera);
setupCamButton("cam_1", camera_1);
setupCamButton("cam_2", camera_2);
setupCamButton("cam_3", camera_3);
setupCamButton("cam_4", camera_4);


// Animation Loop
renderer.render(scene, active_camera);

let lastTimestamp; // undefined to start

function animate(timestamp) {
  // Convert time change from milliseconds to seconds
  let timeDelta = 0.001 * (lastTimestamp ? timestamp - lastTimestamp : 0);
  lastTimestamp = timestamp;

  // Animate loaded models if they exist
  if (astronaut) {
    let axis = new T.Vector3(1, 1, 0).normalize();
    astronaut.rotateOnWorldAxis(axis, timeDelta);
  }
  if (suzanne) {
    let axis = new T.Vector3(1, 1, 0).normalize();
    suzanne.rotateOnWorldAxis(axis, timeDelta);
  }
  if (teapot) {
    let axis = new T.Vector3(0, 0, 1).normalize();
    teapot.rotateOnWorldAxis(axis, timeDelta);
  }

  // Animate SpongeBob
  sponge.rotateOnWorldAxis(new T.Vector3(0, 1, 0), timeDelta);
  if (typeof sponge.userData.initialY === "undefined") {
    sponge.userData.initialY = sponge.position.y;
  }
  sponge.position.y = sponge.userData.initialY + 0.2 * Math.sin(timestamp / 300);

  // Animate SpongeBob's arms to wave
  leftArm.rotation.y = Math.PI / 4 + 0.3 * Math.sin(timestamp / 300);
  rightArm.rotation.y = (3 * Math.PI) / 4 - 0.3 * Math.sin(timestamp / 300);

  renderer.render(scene, active_camera);
  window.requestAnimationFrame(animate);
}
window.requestAnimationFrame(animate);
