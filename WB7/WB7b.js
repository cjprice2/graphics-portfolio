import * as T from "../libs/CS559-Three/build/three.module.js";
import { GrWorld } from "../libs/CS559-Framework/GrWorld.js";
import { AutoUI } from "../libs/CS559-Framework/AutoUI.js";
import { GrCrane, GrExcavator, GrForklift, GrBulldozer, GrBackhoe } from "./WB7bObjects.js";

// Locate the placeholder div for this project
const container = /** @type {HTMLElement} */ (document.getElementById("canvas2"));
if (!container) throw new Error("Div #canvas2 not found in HTML");

// Separate div to hold the UI controls below the canvas
const controlsDiv = /** @type {HTMLElement} */ (document.getElementById("construction-controls")) || container;

// Create the world; GrWorld will append its renderer canvas into `container`
const world = new GrWorld({
  groundplanesize: 10,
  where: container,
  width: 600,
  height: 400,
  renderparams: { preserveDrawingBuffer: true }
});

// ---------------------------------------------------------------------------
// Add construction-site vehicles
// ---------------------------------------------------------------------------
const crane = new GrCrane({ x: 2, z: -2 });
crane.name = "Crane";
world.add(crane);
new AutoUI(crane, 100, controlsDiv, 1, true);

const excavator = new GrExcavator({ x: -2, z: 2 });
excavator.name = "Excavator";
world.add(excavator);
const e_ui = new AutoUI(excavator, 100, controlsDiv, 1, true);
e_ui.set("x", 6);
e_ui.set("z", 3);
e_ui.set("theta", 40);

const forklift = new GrForklift({ x: -2, z: -2 });
forklift.name = "Forklift";
world.add(forklift);
const f_ui = new AutoUI(forklift, 100, controlsDiv, 1, true);
f_ui.set("x", -6);
f_ui.set("z", -3);
f_ui.set("theta", 85);
f_ui.set("lift", 0);

const bulldozer = new GrBulldozer({ x: -6, z: 2 });
bulldozer.name = "Bulldozer";
world.add(bulldozer);
const b_ui = new AutoUI(bulldozer, 100, controlsDiv, 1, true);
b_ui.set("x", -2);
b_ui.set("z", 6);
b_ui.set("theta", 120);
b_ui.set("blade_raise", 0);
b_ui.set("blade_nod", 15);

const backhoe = new GrBackhoe({ x: 2, z: 6 });
backhoe.name = "Backhoe";
world.add(backhoe);
const ba_ui = new AutoUI(backhoe, 100, controlsDiv, 1, true);
ba_ui.set("x", 3);
ba_ui.set("z", -6);
ba_ui.set("theta", 36);
ba_ui.set("front_lift", 0);
ba_ui.set("front_tilt", 0);
ba_ui.set("swing", 0);
ba_ui.set("dipper_angle", 0);
ba_ui.set("bucket_tilt", 0);

// ---------------------------------------------------------------------------
// Kick off rendering
// ---------------------------------------------------------------------------
world.go();
