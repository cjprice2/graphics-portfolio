/*jshint esversion: 6 */
// @ts-check

/**
 * Graphics Town Framework - "Main" File
 *
 * This is the main file - it creates the world, populates it with
 * objects and behaviors, and starts things running
 *
 * The initial distributed version has a pretty empty world.
 * There are a few simple objects thrown in as examples.
 *
 * It is the students job to extend this by defining new object types
 * (in other files), then loading those files as modules, and using this
 * file to instantiate those objects in the world.
 */

import { GrWorld } from "../libs/CS559-Framework/GrWorld.js";
import { WorldUI } from "../libs/CS559-Framework/WorldUI.js";
import { GrObject } from "../libs/CS559-Framework/GrObject.js"; // Import GrObject for object creation
import * as T from "../libs/CS559-Three/build/three.module.js"; // Import T for CubeTextureLoader and TextureLoader
import * as InputHelpers from "../libs/CS559/inputHelpers.js"; // Import InputHelpers
import { LuigiTrack } from "./objects/luigiTrack.js";
import { FlameRunner } from "./objects/flameRunner.js";
import { Tree } from "./objects/tree.js"; // Import the Tree class
import { Stands } from "./objects/stands.js"; // Import the Stands class
import { Pipe } from "./objects/pipe.js"; // Import the Pipe class
import { BigBuilding } from "./objects/bigBuilding.js"; // Import the BigBuilding class
import { FinishBanner } from "./objects/finishBanner.js"; // Import the FinishBanner class
import { TallBuilding } from "./objects/tallBuilding.js"; // Import the TallBuilding class
import { Lake } from "./objects/lake.js"; // Import the Lake class
import { WildWing } from "./objects/wildWing.js";
import { BoostPanel } from "./objects/boostPanel.js"; // Import the BoostPanel class
import { Island } from "./objects/island.js"; // Import the Island class
import { Luigi } from "./objects/luigi.js"; // Import the Luigi class
import { SandPatch } from "./objects/sand.js"; // Import the SandPatch class
import { ConcreteFloor } from "./objects/concreteFloor.js"; // Import the ConcreteFloor class

let isSelectingPoints = false; 
const loggedPoints = []; // Array to store points
const markerMeshes = []; // Array to store visual markers
const raycaster = new T.Raycaster();
const mouse = new T.Vector2();
// Adjust ground plane Y slightly if needed to match lake level (0.2)
const groundPlane = new T.Plane(new T.Vector3(0, 1, 0)); 

/** Helper function to enable shadows for all meshes within a GrObject (from main.js) */
function enableShadows(grObject) {
    grObject.objects.forEach(obj => {
        obj.traverse(node => {
            if (node instanceof T.Mesh) {
                node.castShadow = true;
                node.receiveShadow = true;
            }
        });
    });
}

// Place the world canvas inside the HTML placeholder div
const container = /** @type {HTMLElement} */ (document.getElementById("canvas1"));
if (!container) throw new Error("Div #canvas1 not found in HTML");

let world = new GrWorld({
    where: container,
    width: 800,
    height: 600,
    groundplanesize: 25,
    renderparams: { preserveDrawingBuffer: true }
});

// --- Start of code moved from main.js ---

// --- Enable Shadows in Renderer ---
world.renderer.shadowMap.enabled = true;
world.renderer.shadowMap.type = T.PCFSoftShadowMap; // Optional: for softer shadows

// --- Lighting ---
// Reduce ambient light intensity significantly to make shadows darker
const ambientLight = new T.AmbientLight(0xffffff, 0.3); // Lowered from 0.8
world.scene.add(ambientLight);

// Increase directional light intensity and adjust position for potentially longer shadows
const directionalLight = new T.DirectionalLight(0xffffff, 1.2); // Increased from 0.8
// Lower the Y position slightly relative to X/Z for a lower angle
directionalLight.position.set(25, 30, 15); // Lowered Y from 40
directionalLight.castShadow = true;
// Keep shadow map settings
directionalLight.shadow.mapSize.width = 2048;
directionalLight.shadow.mapSize.height = 2048;
directionalLight.shadow.camera.near = 0.5;
directionalLight.shadow.camera.far = 100;
directionalLight.shadow.camera.left = -50;
directionalLight.shadow.camera.right = 50;
directionalLight.shadow.camera.top = 50;
directionalLight.shadow.camera.bottom = -50;
world.scene.add(directionalLight);

// --- Skybox ---
const loader = new T.CubeTextureLoader();
const texture = loader
    .setPath('../textures/skyCube/') // Path to the skybox folder, texture from https://polyhaven.com/a/kloofendal_48d_partly_cloudy_puresky
    .load([
        'px.png', 'nx.png', 'py.png', 'ny.png', 'pz.png', 'nz.png'
    ]);
world.scene.background = texture;

// --- Ground Plane Shadows and Texture ---
if (world.groundplane && world.groundplane.mesh) {
    const groundMesh = world.groundplane.mesh;
    groundMesh.receiveShadow = true; 

    const textureLoader = new T.TextureLoader();
    const grassTexture = textureLoader.load('../textures/seamlessGrass.jpg'); 
    grassTexture.wrapS = T.RepeatWrapping;
    grassTexture.wrapT = T.RepeatWrapping;
    const repeatValue = 1.5; 
    grassTexture.repeat.set(repeatValue, repeatValue);

    const groundMaterial = new T.MeshStandardMaterial({
        map: grassTexture,
        roughness: 0.8, 
        metalness: 0.1  
    });
    groundMesh.material = groundMaterial;
}

// --- Track and Objects ---
const luigiTrack = new LuigiTrack();
enableShadows(luigiTrack); 
luigiTrack.objects[0].receiveShadow = true;
world.add(luigiTrack);

const finishBanner = new FinishBanner({ x: -12.05, z: 4, ry: Math.PI / 2 }); 
enableShadows(finishBanner);
world.add(finishBanner);

// Add Boost Panels (and store them)
const boostPanels = []; // Array to hold the panels
const boostPanelPositions = [
    { x: -2.9, z: 16, ry: Math.PI / 5 },    // First panel
    { x: -5, z: 17, ry: Math.PI / 15 },
    { x: -7.5, z: 17, ry: -Math.PI / 20 },
    { x: -9.9, z: 16, ry: -Math.PI / 5 },
    { x: -11.4, z: 14, ry: -Math.PI / 2.7 }      // Last panel
];
boostPanelPositions.forEach((params, index) => {
    const panel = new BoostPanel({ name: `BoostPanel-${index + 1}`, y: 0.07, ...params });
    enableShadows(panel);
    world.add(panel);
    boostPanels.push(panel); // Store the panel object
});

// Pass the first and last panels to the vehicles
const firstBoostPanel = boostPanels[0];
const lastBoostPanel = boostPanels[boostPanels.length - 1];

const flameRunner = new FlameRunner(
    { s: 0.4, firstBoostPanel: firstBoostPanel, lastBoostPanel: lastBoostPanel}, luigiTrack
);
enableShadows(flameRunner);
world.add(flameRunner);

let wildWing = new WildWing({
    name: "WildWing",
    track: luigiTrack, s: .5, speed: 1, uOffset: 0.1,
    firstBoostPanel: firstBoostPanel, // Pass panels in params
    lastBoostPanel: lastBoostPanel
});
enableShadows(wildWing);
world.add(wildWing);

let lake = new Lake({ x: 0, z: 0, s: 1.0, envMap: texture });
world.add(lake);

// Add the island
const island = new Island({ x: 1.5, z: -6.7, y: 0, radius: 1.5, height: 0.2 });
enableShadows(island); // Enable shadows for the island
world.add(island);

// Add Luigi above the island
// Adjust scale (s) and y position as needed for size and height
const luigi = new Luigi({
    x: island.objects[0].position.x, // Center Luigi on the island's X
    y: 0.3,                           // Position Luigi above the island's surface (island top is at y=0.2)
    z: island.objects[0].position.z, // Center Luigi on the island's Z
    s: 8,                         // Scale factor (adjust as needed)
    envMap: texture                   // Pass the skybox texture for reflections
});
enableShadows(luigi);
world.add(luigi);

// Add the first sand patch based on logged points
const sandShapePoints1 = [
    new T.Vector2(-10.13, -11.34), new T.Vector2(-9.41, -11.33),  new T.Vector2(-8.63, -11.28), new T.Vector2(-7.87, -11.32),
    new T.Vector2(-6.95, -11.33),  new T.Vector2(-6.27, -11.24),  new T.Vector2(-5.42, -11.07),  new T.Vector2(-4.65, -10.97),
    new T.Vector2(-3.80, -10.84),  new T.Vector2(-3.01, -10.77),  new T.Vector2(-3.05, -11.32),  new T.Vector2(-3.08, -11.96),
    new T.Vector2(-3.13, -12.71),  new T.Vector2(-3.23, -13.40),  new T.Vector2(-3.64, -13.88),  new T.Vector2(-3.94, -14.27),
    new T.Vector2(-4.44, -14.65),  new T.Vector2(-4.84, -14.90),  new T.Vector2(-5.46, -15.15),  new T.Vector2(-6.30, -15.13),
    new T.Vector2(-7.17, -14.98),  new T.Vector2(-7.82, -14.87),  new T.Vector2(-8.60, -14.65),  new T.Vector2(-9.13, -14.26),
    new T.Vector2(-9.57, -13.75),  new T.Vector2(-9.91, -13.19),  new T.Vector2(-10.15, -12.60), new T.Vector2(-10.41, -12.12),
    new T.Vector2(-10.56, -11.37), new T.Vector2(-10.13, -11.34)
];
const sandPatch1 = new SandPatch({
    shapePoints: sandShapePoints1,
    y: 0.05,
});
world.add(sandPatch1);

// Define points for the second sand patch (Corrected Y values)
const sandShapePoints2 = [
    new T.Vector2(-1.42, -1.18), new T.Vector2(-2.33, -0.72), new T.Vector2(-3.08, -0.15), new T.Vector2(-3.63, 0.35),
    new T.Vector2(-3.78, 1.33),  new T.Vector2(-3.85, 2.50),  new T.Vector2(-3.85, 3.62),  new T.Vector2(-3.87, 4.93),
    new T.Vector2(-4.53, 4.94),  new T.Vector2(-5.50, 4.98),  new T.Vector2(-6.34, 5.03),  new T.Vector2(-7.24, 5.01),
    new T.Vector2(-7.99, 4.94),  new T.Vector2(-8.62, 4.89),  new T.Vector2(-9.52, 4.99),  new T.Vector2(-10.08, 5.03),
    new T.Vector2(-10.19, 6.53), new T.Vector2(-9.61, 8.04),  new T.Vector2(-8.64, 8.88),  new T.Vector2(-7.75, 9.33),
    new T.Vector2(-6.69, 9.48),  new T.Vector2(-5.54, 9.67),  new T.Vector2(-4.33, 9.80),  new T.Vector2(-3.12, 10.05),
    new T.Vector2(-1.91, 10.33), new T.Vector2(-0.76, 10.74), new T.Vector2(0.56, 11.52),  new T.Vector2(2.16, 12.44),
    new T.Vector2(3.29, 13.51),  new T.Vector2(3.91, 13.18),  new T.Vector2(4.71, 12.54),  new T.Vector2(5.48, 11.86),
    new T.Vector2(6.43, 11.29),  new T.Vector2(7.50, 10.43), new T.Vector2(8.26, 9.79),   new T.Vector2(8.87, 8.96),
    new T.Vector2(7.77, 7.81),   new T.Vector2(6.41, 6.57),  new T.Vector2(4.32, 4.67),   new T.Vector2(1.75, 2.19),
    new T.Vector2(-0.22, 0.08),  new T.Vector2(-1.42, -1.18)
];

// Add the second sand patch using the defined points
const sandPatch2 = new SandPatch({
    shapePoints: sandShapePoints2
});
world.add(sandPatch2);

// Define points for the third sand patch
const sandShapePoints3 = [
    new T.Vector2(13.05, 10.25), new T.Vector2(14.37, 10.24), new T.Vector2(15.52, 10.43), new T.Vector2(17.37, 10.83),
    new T.Vector2(18.55, 11.07), new T.Vector2(18.40, 9.28),  new T.Vector2(17.91, 7.45),  new T.Vector2(17.30, 5.72),
    new T.Vector2(16.56, 4.33),  new T.Vector2(15.85, 3.39),  new T.Vector2(15.08, 2.11),  new T.Vector2(13.85, 1.03),
    new T.Vector2(12.97, -0.32), new T.Vector2(11.71, -1.55), new T.Vector2(10.17, -2.74), new T.Vector2(8.70, -3.90),
    new T.Vector2(7.22, -5.25),  new T.Vector2(6.26, -6.37),  new T.Vector2(5.85, -7.69),  new T.Vector2(5.63, -8.55),
    new T.Vector2(4.24, -9.18),  new T.Vector2(2.62, -9.34),  new T.Vector2(0.20, -9.63),  new T.Vector2(-0.17, -7.37),
    new T.Vector2(0.03, -5.22),  new T.Vector2(0.75, -2.83),  new T.Vector2(2.29, -0.90),  new T.Vector2(3.59, 0.86),
    new T.Vector2(5.54, 2.38),   new T.Vector2(7.21, 4.32),   new T.Vector2(9.15, 6.00),   new T.Vector2(10.51, 7.64),
    new T.Vector2(11.71, 9.04),  new T.Vector2(13.05, 10.25)
];

// Add the third sand patch using the defined points
const sandPatch3 = new SandPatch({
    shapePoints: sandShapePoints3
});
world.add(sandPatch3);

// Define points for the concrete floor
const concreteShapePoints = [
    new T.Vector2(-2.91, 10.98), new T.Vector2(-3.46, 11.03), new T.Vector2(-4.30, 11.15), new T.Vector2(-4.89, 11.29),
    new T.Vector2(-5.79, 11.34), new T.Vector2(-6.89, 11.46), new T.Vector2(-7.84, 11.48), new T.Vector2(-8.70, 11.51),
    new T.Vector2(-9.39, 11.47), new T.Vector2(-10.03, 11.50), new T.Vector2(-10.37, 11.45), new T.Vector2(-10.56, 10.41),
    new T.Vector2(-10.55, 9.27), new T.Vector2(-10.53, 7.62), new T.Vector2(-10.54, 6.29), new T.Vector2(-10.42, 3.58),
    new T.Vector2(-10.53, 1.21), new T.Vector2(-10.58, -0.54), new T.Vector2(-10.61, -2.06), new T.Vector2(-10.53, -3.61),
    new T.Vector2(-10.37, -4.94), new T.Vector2(-10.10, -5.63), new T.Vector2(-9.22, -5.56), new T.Vector2(-8.15, -5.50),
    new T.Vector2(-6.52, -5.39), new T.Vector2(-5.40, -5.59), new T.Vector2(-4.43, -5.54), new T.Vector2(-3.62, -5.43),
    new T.Vector2(-3.50, -4.32), new T.Vector2(-3.52, -3.47), new T.Vector2(-3.60, -2.50), new T.Vector2(-3.54, -1.56),
    new T.Vector2(-3.49, -0.73), new T.Vector2(-3.96, -0.08), new T.Vector2(-4.87, -0.06), new T.Vector2(-5.48, -0.02),
    new T.Vector2(-5.56, 1.23), new T.Vector2(-5.87, 2.23), new T.Vector2(-6.35, 3.35), new T.Vector2(-6.55, 4.48),
    new T.Vector2(-6.66, 5.51), new T.Vector2(-6.67, 6.75), new T.Vector2(-6.63, 7.42), new T.Vector2(-5.85, 7.40),
    new T.Vector2(-4.89, 7.37), new T.Vector2(-3.89, 7.25), new T.Vector2(-2.98, 7.10), new T.Vector2(-2.74, 8.31),
    new T.Vector2(-2.62, 9.75), new T.Vector2(-2.91, 10.98) // Close the loop
];

// Add the concrete floor using the defined points
const concreteFloor = new ConcreteFloor({
    shapePoints: concreteShapePoints,
    y: 0.01, // Position slightly above ground, below track/sand
    repeat: 2 // Adjust texture repeat as needed
});
world.add(concreteFloor);


const treePositions = [
   { x: 10, z: 20, s: 1.0 }, { x: 12, z: 13, s: 1.1 }, { x: 8, z: 10, s: 0.9 }, { x: 7, z: 14, s: 1.3 }, { x: 15, z: 10, s: 1.2 }, 
   { x: -10, z: -15, s: 0.8 }, { x: 18, z: 18, s: 1.2 }, { x: 20, z: 15, s: 0.9 }, { x: 22, z: 10, s: 1.1 }, { x: 19, z: 5, s: 1.0 },
   { x: 23, z: 0, s: 1.3 }, { x: 20, z: -5, s: 0.8 }, { x: 21, z: -15, s: 1.0 }, { x: 15, z: -18, s: 1.2 }, { x: 10, z: -20, s: 0.9 },
   { x: 0, z: -22, s: 1.0 }, { x: -5, z: -20, s: 1.3 }, { x: -12, z: -18, s: 0.8 }, { x: -18, z: -15, s: 1.1 }, { x: -22, z: -10, s: 1.0 },
   { x: -20, z: -5, s: 1.2 }, { x: -23, z: 0, s: 0.9 }, { x: -22, z: 10, s: 1.0 }, { x: -21, z: 20, s: 0.8 }, { x: -15, z: 23, s: 1.1 },
   { x: 5, z: 20, s: 0.9 }, { x: 15, z: 22, s: 1.1 }, { x: 20, z: 20, s: 1.0 }, { x: -4.5, z: 2.5, s: 1.0 }, { x: -5.25, z: 5.5, s: 1.1 }, 
   { x: 12.5, z: 5.0, s: 0.9 }, { x: 17.5, z: 0.5, s: 1.2 }, { x: 18.5, z: -21.0, s: 1.0 }, { x: -18.5, z: -21.5, s: 0.8 }, { x: -22.0, z: -19.5, s: 1.1 }, 
   { x: -13.0, z: -22.5, s: 1.3 },
];
treePositions.forEach((params, index) => { 
    const tree = new Tree({ name: `Tree-${index + 1}`, ...params }); 
    enableShadows(tree); 
    world.add(tree);
});

const standsPositions = [
    { x: -20, z: 5, length: 15, ry: Math.PI / 2 },
    { x: -15.5, z: 19.5, length: 10, ry: -5 * Math.PI / 4 },
    { x: -3, z: 24.5, length: 10, ry: Math.PI }
];
standsPositions.forEach((params, index) => { 
    const stands = new Stands({name: `Stands-${index + 1}`, ...params}); 
    enableShadows(stands); 
    world.add(stands);
});

const pipePositions = [
    { x: -15, z: -5, s: 0.5 },    { x: 6.25, z: -13.5, s: 0.4 },  { x: -13, z: -11, s: 0.3, height: 5 }, { x: -15, z: -12, s: 0.4, height: 7 },
    { x: 11.81, z: 0.04, s: 0.3 }, { x: 10.86, z: 0.88, s: 0.3 },  { x: 9.94, z: 1.69, s: 0.3 }, { x: 6.78, z: 4.46, s: 0.3 },
    { x: 5.86, z: 5.51, s: 0.3 },  { x: 9.10, z: -12.23, s: 0.6 }, { x: 16.25, z: 3.45, s: 0.7 }, { x: 16.03, z: 5.08, s: 0.4 },
    { x: 6.83, z: -21.98, s: 0.7 },{ x: 8.71, z: -22.81, s: 0.4 }, { x: -4.30, z: 11.88, s: 0.35, height: 1.25 }, { x: -5.35, z: 13.72, s: 0.35, height: 1.25 },
    { x: -6.88, z: 13.17, s: 0.35, height: 1.25 },{ x: -8.27, z: 13.60, s: 0.35, height: 1.25 },{ x: -9.38, z: 11.78, s: 0.35, height: 1.25 }
];
pipePositions.forEach((params, index) => {
    const pipe = new Pipe({ name: `Pipe-${index + 1}`, ...params });
    enableShadows(pipe);
    world.add(pipe);
});

const building1 = new BigBuilding({
    name: "BigBuilding-1", x: -8, z: 9, s: 0.3, ry: Math.PI / 2 
});
enableShadows(building1);
world.add(building1);

const building2 = new BigBuilding({
    name: "BigBuilding-2", x: -8, z: 5, s: 0.3, ry: Math.PI / 2 
});
enableShadows(building2);
world.add(building2);

const tallBuilding = new TallBuilding({ name: "TallBuilding-1", x: -7.5, z: 0, s: 0.35}); 
enableShadows(tallBuilding);
world.add(tallBuilding);

// --- Coordinate Logging Setup ---
document.addEventListener('keydown', (event) => {
    if (event.key === 'p' || event.key === 'P') {
        isSelectingPoints = !isSelectingPoints;
        console.log(`Point selection mode: ${isSelectingPoints ? 'ON' : 'OFF'}`);
        if (isSelectingPoints) {
            loggedPoints.length = 0;
            markerMeshes.forEach(marker => world.scene.remove(marker));
            markerMeshes.length = 0;
            console.log("Click points on the ground plane. Press 'P' again to finish and output coordinates.");
        } else {
            if (loggedPoints.length > 0) {
                const pointsString = loggedPoints.map(p => `new T.Vector2(${p.x}, ${p.y})`).join(',\n');
                console.log("Collected Shape Coordinates:\n[\n" + pointsString + "\n]");
            } else {
                console.log("No points collected.");
            }
            markerMeshes.forEach(marker => world.scene.remove(marker));
            markerMeshes.length = 0; 
        }
    }
});

world.renderer.domElement.addEventListener('click', (event) => {
    if (!isSelectingPoints) return; 
    const rect = world.renderer.domElement.getBoundingClientRect();
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    raycaster.setFromCamera(mouse, world.camera);
    const intersectPoint = new T.Vector3();
    raycaster.ray.intersectPlane(groundPlane, intersectPoint);
    if (intersectPoint) {
        const shapeX = intersectPoint.x.toFixed(2);
        const shapeY = (intersectPoint.z).toFixed(2); 
        loggedPoints.push({ x: shapeX, y: shapeY });
        console.log(`Added point: x: ${shapeX}, y: ${shapeY}`); 
        const markerGeom = new T.SphereGeometry(0.1, 8, 8);
        const markerMat = new T.MeshBasicMaterial({ color: 0xff0000 });
        const markerMesh = new T.Mesh(markerGeom, markerMat);
        markerMesh.position.set(intersectPoint.x, 0.25, intersectPoint.z); 
        world.scene.add(markerMesh);
        markerMeshes.push(markerMesh); 
    }
}, false);


///////////////////////////////////////////////////////////////
// because I did not store the objects I want to highlight in variables, I need to look them up by name
// This code is included since it might be useful if you want to highlight your objects here
function highlight(obName) {
    const toHighlight = world.objects.find(ob => ob.name === obName);
    if (toHighlight) {
        toHighlight.highlighted = true;
    } else {
        throw `no object named ${obName} for highlighting!`;
    }
}


highlight("Lake");
highlight("FinishBanner");
highlight("TallBuilding-1");
highlight("BigBuilding-1");
highlight("Stands-1");
highlight("Luigi-1");
highlight("BoostPanel-1");

///////////////////////////////////////////////////////////////
// build and run the UI
// only after all the objects exist can we build the UI
const controlsDiv = /** @type {HTMLElement} */ (document.getElementById("p2-controls"));
// @ts-ignore       // we're sticking a new thing into the world
world.ui = new WorldUI(world, 600, controlsDiv);



// now make it go!
world.go();
