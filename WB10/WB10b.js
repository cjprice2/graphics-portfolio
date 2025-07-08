/*jshint esversion: 6 */
// @ts-check

import * as T from "../libs/CS559-Three/build/three.module.js";
import { GrWorld } from "../libs/CS559-Framework/GrWorld.js";
import { GrObject } from "../libs/CS559-Framework/GrObject.js";
import * as InputHelpers from "../libs/CS559/inputHelpers.js";
import * as SimpleObjects from "../libs/CS559-Framework/SimpleObjects.js";
import { shaderMaterial } from "../libs/CS559-Framework/shaderHelper.js";

{
  const container = /** @type {HTMLElement} */ (document.getElementById("canvas2"));
  if (!container) throw new Error("Div #canvas2 not found in HTML");

  const world = new GrWorld({
      where: container,
      width: 600,
      height: 400,
      renderparams: { preserveDrawingBuffer: true }
  });
  
  // set up loading texture
  let textureLoader = new T.TextureLoader();
  let texture = textureLoader.load("../textures/coolPattern.jpg");
  // Replace these files with your own shaders!
  
  let shaderMat = shaderMaterial("../shaders/10-10-01.vs", "../shaders/10-10-01.fs", {
    side: T.DoubleSide,
    uniforms: {
        lightdir: { value: new T.Vector3(0.5, 0.5, 0.5) }, // Example light direction
        lightcolor: { value: new T.Color(1.0, 1.0, 1.0) }, // White light
        objcolor: { value: new T.Color(1.0, 1.0, 1.0) }, // White base object color
        time: { value: 0.0 },
        tex: { value: texture },
        resolution: { value: new T.Vector2(.5, .5) }, // Resolution to match base example on ShaderFrog
    },
  });

  world.add(new SimpleObjects.GrSphere({ x: -2, y: 1, material: shaderMat, widthSegments: 100, heightSegments: 100}));
  world.add(new SimpleObjects.GrSquareSign({ x: 2, y: 1, size: 1, material: shaderMat }));

  // Variable to accumulate delta time
  let accumulatedTime = 0.0;

  // use stepWorld to update the time uniform by accumulating delta
  world.stepWorld = function(delta, timeOfDay) {
    accumulatedTime += delta / 1000.0; // Add delta time (in seconds)
    shaderMat.uniforms.time.value = accumulatedTime; 
  };

  world.go();
}
