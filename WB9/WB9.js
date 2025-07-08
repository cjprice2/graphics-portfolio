/*jshint esversion: 6 */
// @ts-check

import * as T from "../libs/CS559-Three/build/three.module.js";
import { GrWorld } from "../libs/CS559-Framework/GrWorld.js";
import { GrObject } from "../libs/CS559-Framework/GrObject.js";
import * as Simple from "../libs/CS559-Framework/SimpleObjects.js"; 
import { FunkyKong } from "./WB9funkyhelper.js"; 

function scene() {
  // Use the placeholder div inside the HTML page
  const parentOfCanvas = /** @type {HTMLElement} */ (document.getElementById("canvas1"));
  if (!parentOfCanvas) throw new Error("Div #canvas1 not found in HTML");
  const world = new GrWorld({
      where: parentOfCanvas,
      width: 600,
      height: 400,
      renderparams: { preserveDrawingBuffer: true }
  });

  // Load the static cube map for background
  const cubeTextureLoader = new T.CubeTextureLoader();
  const bgTexture = cubeTextureLoader
      .setPath("../textures/forestCube/") // Path to the cube map textures; got from https://polyhaven.com/a/snowy_forest
      .load([
          "px.png", "nx.png", 
          "py.png", "ny.png", 
          "pz.png", "nz.png"  
      ]);
  world.scene.background = bgTexture; 

  // Create a moving torus knot
  let spinningTorus = new Simple.GrTorusKnot({ x: 6, y: 3.0, size: 0.3, color: "purple" }); 
  spinningTorus.objects[0].rotation.y = -Math.PI / 2; // Rotate to initially face the origin (sphere)
  world.add(spinningTorus);
  // Initialize Torus animation state
  let torusTime = 0;
  const torusMoveRangeZ = 1.5; 
  const torusMoveSpeed = 0.6;
  const torusRotateRangeY = Math.PI / 6; // Max rotation angle (30 degrees left/right)
  const torusRotateSpeed = 0.6; 
  const torusBaseX = 6.0; 
  const torusBaseZ = 0.0; 
  const torusInitialYRotation = -Math.PI / 2; // Store initial rotation

  // Sphere CubeCamera and Render Target
  const sphereRenderTarget = new T.WebGLCubeRenderTarget(256, { 
      format: T.RGBFormat,
      generateMipmaps: true,
      minFilter: T.LinearMipmapLinearFilter
  });
  const sphereCubeCamera = new T.CubeCamera(1.1, 1000, sphereRenderTarget); 
  const spherePosition = new T.Vector3(0, 1.5, 0); 
  sphereCubeCamera.position.copy(spherePosition);

  // Cube CubeCamera and Render Target
  const cubeRenderTarget = new T.WebGLCubeRenderTarget(256, { 
      format: T.RGBFormat,
      generateMipmaps: true,
      minFilter: T.LinearMipmapLinearFilter
  });
  const cubeCubeCamera = new T.CubeCamera(1.1, 1000, cubeRenderTarget);
  const cubePosition = new T.Vector3(0, 2.0, 3.0); 
  cubeCubeCamera.position.copy(cubePosition); 

  // Video Camera and Render Targets for Ping Pong
  const videoRenderTargetA = new T.WebGLRenderTarget(512, 512); // Target A
  const videoRenderTargetB = new T.WebGLRenderTarget(512, 512); // Target B
  const videoCamera = new T.PerspectiveCamera(60, 1.0, 0.1, 1000); 
  // Initial position will be set relative to torus in stepWorld

  // Create Video Screen with Border
  const screenWidth = 8; 
  const screenHeight = 6;
  const borderThickness = 0.2;
  const screenGroup = new T.Group(); // Group for screen and border

  // Screen Geometry and Materials (A and B)
  const screenGeometry = new T.PlaneGeometry(screenWidth, screenHeight); 
  const screenMaterialA = new T.MeshBasicMaterial({ // Material using Target A
      map: videoRenderTargetA.texture 
  });
  const screenMaterialB = new T.MeshBasicMaterial({ // Material using Target B
      map: videoRenderTargetB.texture 
  });
  const screenMesh = new T.Mesh(screenGeometry, screenMaterialA); // Start with Material A
  screenMesh.position.z = 0.01; // Place screen slightly in front of border
  screenGroup.add(screenMesh);

  // Border Geometry and Material
  const borderGeometry = new T.PlaneGeometry(screenWidth + borderThickness * 2, screenHeight + borderThickness * 2);
  const borderMaterial = new T.MeshBasicMaterial({ color: "black", side: T.DoubleSide });
  const borderMesh = new T.Mesh(borderGeometry, borderMaterial);
  screenGroup.add(borderMesh);

  let videoScreen = new GrObject("VideoScreen", screenGroup); // Use the group
  videoScreen.setPos(0, 3, -8); // Position the screen group at z=-8
  world.add(videoScreen);

  // Variables for Ping-Ponging Render Targets
  let currentTarget = videoRenderTargetA; // Start rendering TO A
  let sourceMaterial = screenMaterialB;   // Start displaying B

  // Create the reflective sphere
  const sphereGeometry = new T.SphereGeometry(1, 32, 32); 
  const sphereMaterial = new T.MeshStandardMaterial({ 
      envMap: sphereRenderTarget.texture, // Use sphere's dynamic target
      metalness: 1,
      roughness: 0,
  });
  const sphereMesh = new T.Mesh(sphereGeometry, sphereMaterial);
  let reflectiveSphere = new GrObject("ReflectiveSphere", sphereMesh); 
  reflectiveSphere.setPos(spherePosition.x, spherePosition.y, spherePosition.z); 
  world.add(reflectiveSphere);

  // Create Reflective Cube
  const cubeGeometry = new T.BoxGeometry(1, 1, 1); 
  const cubeMaterial = new T.MeshStandardMaterial({ 
      envMap: cubeRenderTarget.texture, // Use cube's render target
      metalness: 1, 
      roughness: 0, 
  });
  const cubeMesh = new T.Mesh(cubeGeometry, cubeMaterial); 
  let reflectiveCube = new GrObject("ReflectiveCube", cubeMesh); 
  reflectiveCube.setPos(cubePosition.x, cubePosition.y, cubePosition.z);
  world.add(reflectiveCube); 
  // Initialize Cube animation state
  let cubeTime = 0; 
  const cubeBobHeight = 0.4; 
  const cubeBobSpeed = 1; 
  const cubeSpinSpeed = 0.2; 
  const cubeBaseY = cubePosition.y; 

  // Add Funky Kong instance
  let funky = new FunkyKong(); 
  funky.setPos(-3, 1, 0); 
  world.add(funky);
  // Initialize Funky Kong animation state
  funky.time = 0; 
  funky.spinSpeed = 1.5; 
  funky.bobHeight = 0.5;
  funky.bobSpeed = 2.0;
  funky.moveRange = 2.0; 
  funky.moveSpeed = 0.8;
  funky.baseY = 1.0; 
  funky.baseX = -3; 

  // Implement world.stepWorld for animations and camera updates
  world.stepWorld = function(delta) {
      
      // Torus Animation
      torusTime += delta / 1000;
      // Side-to-side movement (along Z)
      const torusMoveOffsetZ = torusMoveRangeZ * Math.sin(torusTime * torusMoveSpeed * Math.PI * 2); 
      spinningTorus.objects[0].position.x = torusBaseX; 
      spinningTorus.objects[0].position.z = torusBaseZ + torusMoveOffsetZ; 
      // Left-to-right rotation (around local Y axis, relative to initial rotation)
      const torusRotateAngleY = torusRotateRangeY * Math.sin(-torusTime * torusRotateSpeed * Math.PI * 2); 
      spinningTorus.objects[0].rotation.y = torusInitialYRotation + torusRotateAngleY; // Apply rotation around Y, adding to initial
      spinningTorus.objects[0].rotation.x = 0; // Ensure no X rotation remains

      // Funky Kong Animation 
      funky.time += delta / 1000; 
      if (funky.group && funky.model) { 
          // Bobbing
          const bobOffset = funky.bobHeight * Math.sin(funky.time * funky.bobSpeed * Math.PI * 2);
          // Side-to-side movement (along Z axis)
          const moveOffset = funky.moveRange * Math.sin(funky.time * funky.moveSpeed * Math.PI * 2);
          
          funky.group.position.y = funky.baseY + bobOffset;
          funky.group.position.z = moveOffset; 
          funky.group.position.x = funky.baseX; 

          // Spinning
          funky.group.rotateY(((funky.spinSpeed * delta) / 1000) * Math.PI * 2);
      }

      // Cube Animation 
      cubeTime += delta / 1000; 
      const cubeBobOffset = cubeBobHeight * Math.sin(cubeTime * cubeBobSpeed * Math.PI * 2); 
      // Update cube position for bobbing and move camera with it
      reflectiveCube.objects[0].position.y = cubeBaseY + cubeBobOffset; 
      cubeCubeCamera.position.y = cubeBaseY + cubeBobOffset; 
      // Spinning
      reflectiveCube.objects[0].rotateY(((cubeSpinSpeed * delta) / 1000) * Math.PI * 2); 

      // Update Video Camera Position/Orientation (Attached to TORUS)
      const torusWorldPos = spinningTorus.objects[0].getWorldPosition(new T.Vector3()); 
      const torusWorldQuat = spinningTorus.objects[0].getWorldQuaternion(new T.Quaternion()); 

      // Define a local offset for the camera relative to the torus
      const localCameraOffset = new T.Vector3(0, 0, -0.2); 
      // Apply torus rotation and position to the offset to get world camera position
      const worldCameraOffset = localCameraOffset.clone().applyQuaternion(torusWorldQuat);
      videoCamera.position.copy(torusWorldPos).add(worldCameraOffset);

      // Determine look direction based on torus rotation
      const lookDirection = new T.Vector3(0, -0.1, 1); 
      lookDirection.applyQuaternion(torusWorldQuat); 
      const lookAtPos = new T.Vector3().addVectors(videoCamera.position, lookDirection); 

      videoCamera.lookAt(lookAtPos);

      // Render Scene to Video Target (Ping Pong method)
      // Use ping-ponging (alternating between two render targets, A and B) 
      // to achieve the recursive screen-in-screen effect.
      // This avoids rendering TO and reading FROM the same texture simultaneously.
      // We render TO the currentTarget while displaying the sourceMaterial (previous frame).

      // Set the screen mesh to use the SOURCE material (texture from previous frame)
      screenMesh.material = sourceMaterial;

      // Hide the torus itself so it doesn't block the camera view in the render target
      spinningTorus.objects.forEach(obj => obj.visible = false); 

      // Render the scene to the CURRENT (destination) target
      world.renderer.setRenderTarget(currentTarget);
      world.renderer.render(world.scene, videoCamera); 
      world.renderer.setRenderTarget(null); // Reset renderer

      // Make hidden objects visible again for the main render pass
      spinningTorus.objects.forEach(obj => obj.visible = true); 

      // Swap targets and materials for the next frame
      // The target we just rendered TO becomes the source for the next frame's display,
      // and the target we just displayed FROM becomes the destination for the next render.
      if (currentTarget === videoRenderTargetA) {
          currentTarget = videoRenderTargetB; // Next frame, render TO B
          sourceMaterial = screenMaterialA;   // Next frame, display FROM A
      } else {
          currentTarget = videoRenderTargetA; // Next frame, render TO A
          sourceMaterial = screenMaterialB;   // Next frame, display FROM B
      }

      // Sphere CubeCamera Update
      reflectiveSphere.objects.forEach(obj => obj.visible = false);
      sphereCubeCamera.update(world.renderer, world.scene);
      reflectiveSphere.objects.forEach(obj => obj.visible = true);

      // Cube CubeCamera Update
      // Hide the cube before rendering its environment map
      reflectiveCube.objects.forEach(obj => obj.visible = false); 
      // Update the cube's cube camera
      cubeCubeCamera.update(world.renderer, world.scene); 
      // Make the cube visible again
      reflectiveCube.objects.forEach(obj => obj.visible = true); 
  };

  world.go(); 
}
scene();

