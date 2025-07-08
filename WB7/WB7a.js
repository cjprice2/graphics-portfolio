/*jshint esversion: 6 */
// @ts-check

/**
 * 3D QuadCopter assignment -- Colin Price!
 */

import * as T from "../libs/CS559-Three/build/three.module.js";
import { OrbitControls } from "../libs/CS559-Three/examples/jsm/controls/OrbitControls.js";


let renderer = new T.WebGLRenderer({preserveDrawingBuffer:true});
renderer.setSize(600, 400);
let container = /** @type {HTMLElement} */ (document.getElementById("canvas1"));
if (container) {
  container.appendChild(renderer.domElement);
}
renderer.domElement.id = "canvas1";

let scene = new T.Scene();
let camera = new T.PerspectiveCamera(
        40,
        renderer.domElement.width / renderer.domElement.height,
        1,
        1000
    );

camera.position.z = 15;
camera.position.y = 8;
camera.position.x = 8;
camera.lookAt(0, 0, 0);

// since we're animating, add OrbitControls
let controls = new OrbitControls(camera, renderer.domElement);

scene.add(new T.AmbientLight("white", 0.2));

// two lights - both a little off white to give some contrast
let dirLight1 = new T.DirectionalLight(0xf0e0d0, 1);
dirLight1.position.set(1, 1, 0);
scene.add(dirLight1);

let dirLight2 = new T.DirectionalLight(0xd0e0f0, 1);
dirLight2.position.set(-1, 1, -0.2);
scene.add(dirLight2);

// make a ground plane
let groundBox = new T.BoxGeometry(15, 0.1, 15);
let groundMesh = new T.Mesh(
        groundBox,
        new T.MeshStandardMaterial({ color: 0x88b888, roughness: 0.9 })
    );
// put the top of the box at the ground level (0)
groundMesh.position.y = -0.05;
scene.add(groundMesh);

// Radar Dish class :)
class RadarDish {
    constructor(x, z, target, color = "gray") {
        this.group = new T.Group();

        // Radar base
        this.base = new T.Mesh(new T.CylinderGeometry(0.03, 0.03, 0.3), new T.MeshStandardMaterial({color: "black"}));
        this.baseSphere = new T.Mesh(new T.SphereGeometry(0.07), new T.MeshStandardMaterial({color: "red"}));
        this.base.position.set(x, 0.05, z); // position the base at the bottom of the dish
        this.baseSphere.position.set(0, 0.18, 0); // position the sphere at the top of the base
        this.group.add(this.base);
        this.base.add(this.baseSphere); // add the sphere to the base


        // Lathe dish geometry
        let points = [];
        for (let i = 0; i <= 10; i++) {
            points.push(new T.Vector2(Math.sin(i * 0.2) * 0.1 + 0.05, (i - 5) * 0.02));
        }
        this.dish = new T.Mesh(
            new T.LatheGeometry(points),
            new T.MeshStandardMaterial({ color: color, side: T.DoubleSide })
        );
        this.dish.rotation.x = Math.PI / 2;
        this.dish.position.set(0, 0, 0.12);
        
        // Pivot for rotating the dish around the red sphere
        this.pivot = new T.Group();
        this.pivot.position.set(0, 0, 0); // relative to the base sphere
        this.pivot.add(this.dish); // attach dish to the pivot
        this.baseSphere.add(this.pivot); // attach pivot to the sphere

        // Create a visible beam as a translucent cylinder extending from the dish
        this.beam = new T.Mesh(
            new T.CylinderGeometry(2.5, 0.05, 10),
            new T.MeshBasicMaterial({ color: "yellow", transparent: true, opacity: 0.03, side: T.DoubleSide })
        );
        this.beam.position.set(0, 0, 5.1); // position the beam target in front of the dish
        this.beam.rotation.x = Math.PI / 2; // rotate the beam to point forward
        this.pivot.add(this.beam); // attach the beam to the pivot

        this.target = target; 

        scene.add(this.group);

        
    }

    update() {
        if (this.target && this.target.position) {
            let worldPos = this.target.position.clone(); // get the target's world position
            let localTarget = this.group.worldToLocal(worldPos); // convert to local coordinates
            this.pivot.lookAt(localTarget); // make the dish face the target
            
        }
    }
}

// Plane class :O
class Plane {
    constructor(color = "red", speed = 1, rollSpeed = Math.PI * 2) {

        this.flightSpeed = speed; // speed of the plane

        // Outer group: moves and orients the plane
        this.group = new T.Group();

        // Inner group: used to barrel roll the plane
        this.rollGroup = new T.Group();
        this.group.add(this.rollGroup); // nest it inside

        // Barrel roll setup
        this.barrelAngle = 0;
        this.barrelRollSpeed = rollSpeed; // speed of the barrel roll

        // Main body
        this.body = new T.Mesh(new T.CylinderGeometry(0.2, 0.2, 0.8), new T.MeshStandardMaterial({ color: color, roughness: 0.5 }));
        this.body.rotation.z = Math.PI / 2;
        this.rollGroup.add(this.body);

        // Front body
        this.front = new T.Mesh(new T.CylinderGeometry(0.05, 0.2, 0.4), new T.MeshStandardMaterial({ color: color, roughness: 0.5 }));
        this.front.position.set(0.6, 0, 0);
        this.front.rotation.z = -Math.PI / 2;
        this.rollGroup.add(this.front);

        // Back body
        this.back = new T.Mesh(new T.CylinderGeometry(0.1, 0.2, 0.8), new T.MeshStandardMaterial({ color: color, roughness: 0.5 }));
        this.back.position.set(-0.8, 0, 0);
        this.back.rotation.z = Math.PI / 2;
        this.rollGroup.add(this.back);

        // Wings
        this.frontWings = new T.Mesh(new T.BoxGeometry(0.35, 0.05, 1.25), new T.MeshStandardMaterial({ color: color, roughness: 0.5 }));
        this.frontWings.position.set(0, 0.05, 0);
        this.rollGroup.add(this.frontWings);

        this.tailWing = new T.Mesh(new T.BoxGeometry(0.2, 0.05, 0.75), new T.MeshStandardMaterial({ color: color, roughness: 0.5 }));
        this.tailWing.position.set(-1.05, 0.1, 0);
        this.rollGroup.add(this.tailWing);

        // Tail fin
        this.tailFin = new T.Mesh(new T.BoxGeometry(0.1, 0.2, 0.5), new T.MeshStandardMaterial({ color: color, roughness: 0.5 }));
        this.tailFin.position.set(-1.1, 0.2, 0);
        this.tailFin.rotation.set(Math.PI / 2, Math.PI / 6, Math.PI / 2);
        this.rollGroup.add(this.tailFin);

        // Front propeller
        this.frontPropeller = new T.Mesh(new T.BoxGeometry(0.05, 0.1, 0.5), new T.MeshStandardMaterial({ color: "white", roughness: 0.5 }));
        this.frontPropeller.position.set(0.75, 0, 0);
        this.rollGroup.add(this.frontPropeller);

        // Left propeller
        this.leftPropeller = new T.Mesh(new T.BoxGeometry(0.04, 0.02, 0.2), new T.MeshStandardMaterial({ color: "white", roughness: 0.5 }));
        this.leftPropeller.position.set(0.25, 0.05, 0.6);
        this.leftPropeller.rotation.z = Math.PI / 2;
        this.rollGroup.add(this.leftPropeller);

        // Left propeller cylinder
        this.leftPropellerCylinder = new T.Mesh(new T.CylinderGeometry(0.02, 0.02, 0.2), new T.MeshStandardMaterial({ color: color, roughness: 0.5 }));
        this.leftPropellerCylinder.position.set(0.2, 0.05, 0.6);
        this.leftPropellerCylinder.rotation.z = Math.PI / 2;
        this.rollGroup.add(this.leftPropellerCylinder);

        // Right propeller
        this.rightPropeller = new T.Mesh(new T.BoxGeometry(0.04, 0.02, 0.2), new T.MeshStandardMaterial({ color: "white", roughness: 0.5 }));
        this.rightPropeller.position.set(0.25, 0.05, -0.6);
        this.rightPropeller.rotation.z = Math.PI / 2;
        this.rollGroup.add(this.rightPropeller);

        // Right propeller cylinder
        this.rightPropellerCylinder = new T.Mesh(new T.CylinderGeometry(0.02, 0.02, 0.2), new T.MeshStandardMaterial({ color: color, roughness: 0.5 }));
        this.rightPropellerCylinder.position.set(0.2, 0.05, -0.6);
        this.rightPropellerCylinder.rotation.z = Math.PI / 2;
        this.rollGroup.add(this.rightPropellerCylinder);
        
        scene.add(this.group);
    }

    updatePosition(theta, radius = 3, height = 3, delta = 0) {
        // Circular motion
        let x = radius * Math.cos(theta * this.flightSpeed);
        let z = radius * Math.sin(theta * this.flightSpeed);
        this.group.position.set(x, height, z);
        this.group.lookAt(0, height, 0); // face center

        // Barrel roll (around local forward axis)
        this.barrelAngle += this.barrelRollSpeed * delta;
        this.rollGroup.rotation.x = this.barrelAngle;

        // Spin propellers
        this.frontPropeller.rotation.x += 0.4;
        this.leftPropeller.rotation.x += 0.4;
        this.rightPropeller.rotation.x += 0.4;
    }
    get position() {
        return this.group.position;
    }
}

// Helicopter class!
class Helicopter {
    constructor(color = "blue", speed = 1) {
        this.group = new T.Group();
        this.flightSpeed = speed; // speed of the helicopter

        // Body
        this.bottomBody = new T.Mesh(new T.BoxGeometry(.4, .15, 0.5), new T.MeshPhongMaterial({color: color, shininess: 100}));
        this.topBody = new T.Mesh(new T.BoxGeometry(1, 0.6, 0.6), new T.MeshPhongMaterial({color: color, shininess: 100}));
        this.backBody1 = new T.Mesh(new T.BoxGeometry(0.4, 0.4, 0.4), new T.MeshPhongMaterial({color: color, shininess: 100}));
        this.backBody2 = new T.Mesh(new T.BoxGeometry(0.3, 0.3, 0.3), new T.MeshPhongMaterial({color: color, shininess: 100}));
        this.bottomBody.position.set(.4, 0, 0);
        this.topBody.position.set(-.1, 0.1, 0);
        this.backBody1.position.set(-.8, 0.05, 0);
        this.backBody2.position.set(-1, 0.05, 0);
        this.group.add(this.bottomBody);
        this.group.add(this.topBody);        
        this.group.add(this.backBody1);
        this.group.add(this.backBody2);

        // Top propeller
        this.topPropeller = new T.Mesh(new T.BoxGeometry(1.2, 0.05, 0.1), new T.MeshPhongMaterial({color: "white", shininess: 50}));
        this.topPropeller.position.y = 0.55;
        this.group.add(this.topPropeller);

        // Top propeller cylinder
        this.topPropellerCylinder = new T.Mesh(new T.CylinderGeometry(0.05, 0.05, 0.2), new T.MeshPhongMaterial({color: color, shininess: 50}));
        this.topPropellerCylinder.position.set(0, 0.5, 0);
        this.group.add(this.topPropellerCylinder);

        // Tail propeller cylinder
        this.tailPropellerCylinder = new T.Mesh(new T.CylinderGeometry(0.05, 0.05, 0.1), new T.MeshPhongMaterial({color: color, shininess: 50}));
        this.tailPropellerCylinder.position.set(-1.2, 0.35, -0.1);
        this.tailPropellerCylinder.rotation.x = Math.PI / 2;
        this.group.add(this.tailPropellerCylinder);

        // Tail propeller
        this.tailPropeller = new T.Mesh(new T.BoxGeometry(0.35, 0.05, 0.03), new T.MeshPhongMaterial({color: "white", shininess: 50}));
        this.tailPropeller.position.set(-1.2, 0.35, -0.1);
        this.group.add(this.tailPropeller);

        // Tail fin
        this.tailFin = new T.Mesh(new T.BoxGeometry(0.1, 0.2, 0.5), new T.MeshPhongMaterial({color: color, shininess: 100}));
        this.tailFin.position.set(-1.1, 0.3, 0);
        this.tailFin.rotation.x = Math.PI / 2;
        this.tailFin.rotation.z = Math.PI / 2;
        this.tailFin.rotation.y = Math.PI / 4;
        this.group.add(this.tailFin);

        scene.add(this.group);
    }

    updatePosition(theta, radius = 3, height = 2, bobUpNDown = false) {
        let t = theta * this.flightSpeed;
        let x = radius * Math.cos(t);
        let z = radius * Math.sin(t);
        let y = bobUpNDown ? height + 1 * Math.sin(t * 2) : height; // if bobUpNDown is true, add a sine wave to y

        this.group.position.set(x, y, z);
        this.group.lookAt(0, y, 0);

        this.topPropeller.rotation.y += 0.2;
        this.tailPropeller.rotation.z += 0.3;
    }

    get position() {
        return this.group.position;
    }
}

// Create objects
let helicopter1 = new Helicopter("blue", 1.5);
let helicopter2 = new Helicopter("green", 1);
let plane1 = new Plane("red", 2, Math.PI * 2);
let plane2 = new Plane("purple", 0.75, 0);

let radar1 = new RadarDish(0.5, 0.5, plane1);
let radar2 = new RadarDish(-0.5, 0.5, plane2);
let radar3 = new RadarDish(-0.5, -0.5, helicopter1);
let radar4 = new RadarDish(0.5, -0.5, helicopter2);

// animation loop
let lastTime = 0;
let theta = 0;
function animateLoop(timestamp) {
    let timeStep = timestamp - lastTime;
    lastTime = timestamp;
    let delta = timeStep / 1000; // convert to seconds
    theta += delta; // increment theta
    
    helicopter1.updatePosition(theta, 3, 6);
    helicopter2.updatePosition(theta, 7, 3, true);
    plane1.updatePosition(theta, 4, 4, delta);
    plane2.updatePosition(theta, 5, 2, delta);

    radar1.update();
    radar2.update();
    radar3.update();
    radar4.update();

    renderer.render(scene, camera);
    window.requestAnimationFrame(animateLoop);
}
window.requestAnimationFrame(animateLoop);