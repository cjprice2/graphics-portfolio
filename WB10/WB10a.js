/*jshint esversion: 6 */
// @ts-check

import * as T from "../libs/CS559-Three/build/three.module.js";
import { GrWorld } from "../libs/CS559-Framework/GrWorld.js";
import { GrObject } from "../libs/CS559-Framework/GrObject.js";
import * as InputHelpers from "../libs/CS559/inputHelpers.js";
import * as SimpleObjects from "../libs/CS559-Framework/SimpleObjects.js";
import { shaderMaterial } from "../libs/CS559-Framework/shaderHelper.js";

// BO2 Dark Matter camo displacement map, looks pretty cool. Got the texture from: https://forum.plutonium.pw/topic/31551/paying-4-atomic-bo2-zombies
let image = new T.TextureLoader().load("../textures/clouds.jpg");
const initialDisplacementScale = 0.2;

/**
 *
 * @param {GrObject} obj
 * @param {number} [speed=1] - rotations per second
 */
function spinY(obj, speed = 1) {
  obj.stepWorld = function (delta, timeOfDay) {
    obj.objects.forEach((obj) =>
      obj.rotateY(((speed * delta) / 1000) * Math.PI)
    );
  };
  return obj;
}

{
  const container = /** @type {HTMLElement} */(document.getElementById("canvas1"));
  if (!container) throw new Error("Div #canvas1 not found in HTML");

  const world = new GrWorld({
      where: container,
      width: 600,
      height: 400,
      lightColoring: "white",
      renderparams: { preserveDrawingBuffer: true }
  });

  let sphereShaderMat = shaderMaterial("../shaders/10-09-03.vs", "../shaders/10-09-03.fs", {
    side: T.DoubleSide,
    uniforms: {
      colormap: { value: image },
      u_displacementScale: { value: initialDisplacementScale }
    }
  });

  let signShaderMat = shaderMaterial("../shaders/10-09-03.vs", "../shaders/10-09-03.fs", {
    side: T.DoubleSide,
    uniforms: {
      colormap: { value: image },
      u_displacementScale: { value: 0.0 } // No displacement for the sign
    }
  });

  console.log(sphereShaderMat.uniforms.colormap);

  world.add(
    spinY(
      new SimpleObjects.GrSphere({
        x: -2,
        y: 1,
        widthSegments: 100,
        heightSegments: 100,
        material: sphereShaderMat,
      })
    )
  );
  world.add(
    new SimpleObjects.GrSquareSign({ x: 2, y: 1, size: 1, material: signShaderMat })
  );

  if (world.ambient) {
    world.ambient.intensity = 0;
  }

  // Get slider and value display elements
  const displacementSlider = document.getElementById('displacementSlider');
  const displacementValueSpan = document.getElementById('displacementValue');

  // Add event listener to the slider
  if (displacementSlider instanceof HTMLInputElement) {
      displacementSlider.addEventListener('input', function() {
          const newScale = parseFloat(this.value);
          sphereShaderMat.uniforms.u_displacementScale.value = newScale;
          if (displacementValueSpan) {
              displacementValueSpan.textContent = newScale.toFixed(2);
          }
      });
      // Set initial value display
       if (displacementValueSpan) {
           displacementValueSpan.textContent = initialDisplacementScale.toFixed(2);
       }
  } else {
      console.error("Displacement slider element not found or not an input element.");
  }
  
  world.go();
}