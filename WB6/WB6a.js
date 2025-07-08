// @ts-check

import * as T from "../libs/CS559-Three/build/three.module.js";
import { OrbitControls } from "../libs/CS559-Three/examples/jsm/controls/OrbitControls.js";


let renderer = new T.WebGLRenderer({preserveDrawingBuffer:true});
renderer.setSize(500, 500);
let container = document.getElementById("canvas1");
if (container) {
  container.appendChild(renderer.domElement);
}
renderer.domElement.id = "canvas";

let scene = new T.Scene();
let camera = new T.PerspectiveCamera();
camera.position.z = 10;
camera.position.y = 5;
camera.position.x = 5;
camera.lookAt(0, 3, 0);
scene.add(new T.AmbientLight("white", 1));
let sun = new T.DirectionalLight("#FFFFBB", 1);
sun.position.set(20, 10, 15);
scene.add(sun);

scene.background = new T.Color("lightblue");
// make a ground plane
let groundBox = new T.BoxGeometry(10, 0.1, 10);
let groundMesh = new T.Mesh(
groundBox,
new T.MeshStandardMaterial({color: "white"})
);
// put the top of the box at the ground level (0)
groundMesh.position.y = -0.05;
scene.add(groundMesh);

// Bottom snowball 
let snowball1 = new T.Mesh(
    new T.SphereGeometry(1, 20, 20),
    new T.MeshStandardMaterial({color: "white"})
);
// Middle snowball
let snowball2 = new T.Mesh(
    new T.SphereGeometry(.7, 20, 20),
    new T.MeshStandardMaterial({color: "white"})
);
// Top snowball
let snowball3 = new T.Mesh(
    new T.SphereGeometry(.5, 20, 20),
    new T.MeshStandardMaterial({color: "white"})
);

// Left arm
let leftArm = new T.Mesh(
    new T.CylinderGeometry(.05, .05, .8, 20),
    new T.MeshStandardMaterial({color: "brown"})
);

// Right arm
let rightArm = new T.Mesh(
    new T.CylinderGeometry(.05, .05, .8, 20),
    new T.MeshStandardMaterial({color: "brown"})
);

// Hat
let hat = new T.Mesh(
    new T.CylinderGeometry(.35, .35, .8, 20),
    new T.MeshStandardMaterial({color: "black"}),
);
let hatRim = new T.Mesh(
    new T.CylinderGeometry(.6, .6, .06, 20),
    new T.MeshStandardMaterial({color: "black"}),
);

// Eyes
let eye1 = new T.Mesh(
    new T.SphereGeometry(.05, 20, 20),
    new T.MeshStandardMaterial({color: "black"})
);
let eye2 = new T.Mesh(
    new T.SphereGeometry(.05, 20, 20),
    new T.MeshStandardMaterial({color: "black"})
);

// Nose
let nose = new T.Mesh(
    new T.ConeGeometry(.05, .2, 20),
    new T.MeshPhongMaterial({color: "orange"})
);

// Mouth
const mouth = new T.Group();
let sphereGeometry = new T.SphereGeometry(0.03, 20, 20);
let sphereMaterial = new T.MeshStandardMaterial({color: "black"});

// Arrange spheres in an arc for the mouth
const positions = [
    {x: -0.15, y: 3.17, z: 0.48},
    {x: -0.075, y: 3.12, z: 0.47},
    {x: 0, y: 3.1, z: 0.46},
    {x: 0.075, y: 3.12, z: 0.47},
    {x: 0.15, y: 3.17, z: 0.48}
]; 

// For each position, create a sphere and add it to the mouth group
positions.forEach(pos => {
    let sphere = new T.Mesh(sphereGeometry, sphereMaterial);
    sphere.position.set(pos.x, pos.y, pos.z);
    mouth.add(sphere);
});

// Buttons
let buttonGeometry = new T.SphereGeometry(0.05, 20, 20);
let buttonMaterial = new T.MeshStandardMaterial({color: "black"});
let button1 = new T.Mesh(buttonGeometry, buttonMaterial);
let button2 = new T.Mesh(buttonGeometry, buttonMaterial);
let button3 = new T.Mesh(buttonGeometry, buttonMaterial);

// Position the snowballs
snowball1.position.set(0, .9, 0);
snowball2.position.set(0, 2.3, 0);
snowball3.position.set(0, 3.3, 0);

// Position and rotate the arms
leftArm.position.set(-.8, 2.8, 0);
leftArm.rotation.z = Math.PI / 4; // rotates the arm 45 deg around the z-axis
rightArm.position.set(.8, 2.8, 0);
rightArm.rotation.z = -Math.PI / 4; // rotates the arm 45 deg around the z-axis

// Position the hat
hat.position.set(0, 3.8, 0);
hatRim.position.set(0, 3.7, 0);

// Position the eyes
eye1.position.set(-.15, 3.4, .45);
eye2.position.set(.15, 3.4, .45);

// Position and rotate the nose
nose.position.set(0, 3.3, .59);
nose.rotation.x = Math.PI / 2; // rotates the nose 90 deg around the x-axis

// Position the buttons
button1.position.set(0, 2.3, .69);
button2.position.set(0, 2.5, .66);
button3.position.set(0, 2.7, .58);

// Group the snowman parts
let snowmanGroup = new T.Group();
// Add the objects to the snowman group
snowmanGroup.add(snowball1);
snowmanGroup.add(snowball2);
snowmanGroup.add(snowball3);
snowmanGroup.add(leftArm);
snowmanGroup.add(rightArm);
snowmanGroup.add(hat);
snowmanGroup.add(hatRim);
snowmanGroup.add(eye1);
snowmanGroup.add(eye2);
snowmanGroup.add(nose);
snowmanGroup.add(mouth);
snowmanGroup.add(button1);
snowmanGroup.add(button2);
snowmanGroup.add(button3);
scene.add(snowmanGroup);

// Add orbit controls 
let controls = new OrbitControls(camera, renderer.domElement);

let lastTimestamp; // undefined to start

// Animate the scene
function animate(timestamp) {
    let speed = timestamp / 500; // increased speed
    let radius = 2;
    // Horizontal circular movement
    snowmanGroup.position.x = radius * Math.cos(speed);
    snowmanGroup.position.z = radius * Math.sin(speed);
    // Vertical bounce with offset to keep above ground!
    snowmanGroup.position.y = 0.5 * Math.sin(speed * 2) + 0.6;

    // Convert time change from milliseconds to seconds
    let timeDelta = 0.001 * (lastTimestamp ? timestamp - lastTimestamp : 0);
    lastTimestamp = timestamp;

    renderer.render(scene, camera);

    window.requestAnimationFrame(animate);
}
window.requestAnimationFrame(animate);