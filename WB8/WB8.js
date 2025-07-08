/*jshint esversion: 6 */
// @ts-check

import * as T from "../libs/CS559-Three/build/three.module.js";
import { GrWorld } from "../libs/CS559-Framework/GrWorld.js";
import { GrObject } from "../libs/CS559-Framework/GrObject.js";
import { GrPineTree, GrPyramidHipHouse, GrOpenGableHouse } from "./WB8Objects.js";

// Locate the placeholder div inside the workbook page
const container = /** @type {HTMLElement} */ (document.getElementById("canvas1"));
if (!container) throw new Error("Div #canvas1 not found in HTML");

// Create the Graphics Town world and tell it to place its canvas in this div
const world = new GrWorld({
  where: container,
  width: 600,
  height: 400,
  renderparams: { preserveDrawingBuffer: true }
});

// Place your buildings and trees into the world here

// --- Add Trees ---
let tree1 = new GrPineTree();
tree1.setPos(2, 0, -2); // Base is at y=0
world.add(tree1);

let tree2 = new GrPineTree();
tree2.setPos(-2, 0, -2.5);
world.add(tree2);

let tree3 = new GrPineTree();
tree3.setPos(0, 0, 3);
world.add(tree3);

// --- Add Buildings ---
let house1 = new GrPyramidHipHouse();
house1.setPos(-3, 0, 0); // Places base at Y=0
world.add(house1);

let house2 = new GrOpenGableHouse();
house2.setPos(3, 0, 2);  // Places base at Y=0
world.add(house2);

// Run the world simulation
world.go();