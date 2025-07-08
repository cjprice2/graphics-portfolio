/*jshint esversion: 6 */
// @ts-check
/**
 * I used Gemini 2.5 to generate base code for each of the machines, but I had to fine tune quite a lot of code
 * to get the machines looking and working as I wanted. 
 */

import * as T from "../libs/CS559-Three/build/three.module.js";
import { GrObject } from "../libs/CS559-Framework/GrObject.js";

function degreesToRadians(deg) {
  return (deg * Math.PI) / 180;
}

let craneObCtr = 0;

// A simple crane
/**
 * @typedef CraneProperties
 * @type {object}
 * @property {number} [x=0]
 * @property {number} [y=0]
 * @property {number} [z=0]
 * @property {number} [size=1]
 */
export class GrCrane extends GrObject {
  /**
   * @param {CraneProperties} params
   */
  constructor(params = {}) {
    let crane = new T.Group();

    let exSettings = {
      steps: 2,
      depth: 0.5,
      bevelEnabled: false
    };

    // first, we define the base of the crane.
    // Just draw a curve for the shape, then use three's "ExtrudeGeometry"
    // to create the shape itself.
    /**@type T.Shape */
    let base_curve = new T.Shape();
    base_curve.moveTo(-0.5, 0);
    base_curve.lineTo(-0.5, 2);
    base_curve.lineTo(-0.25, 2.25);
    base_curve.lineTo(-0.25, 5);
    base_curve.lineTo(-0.2, 5);
    base_curve.lineTo(-0.2, 5.5);
    base_curve.lineTo(0.2, 5.5);
    base_curve.lineTo(0.2, 5);
    base_curve.lineTo(0.25, 5);
    base_curve.lineTo(0.25, 2.25);
    base_curve.lineTo(0.5, 2);
    base_curve.lineTo(0.5, 0);
    base_curve.lineTo(-0.5, 0);
    let base_geom = new T.ExtrudeGeometry(base_curve, exSettings);
    let crane_mat = new T.MeshStandardMaterial({
      color: "yellow",
      metalness: 0.5,
      roughness: 0.7
    });
    let base = new T.Mesh(base_geom, crane_mat);
    crane.add(base);
    base.translateZ(-0.25);

    // Use a similar process to create the cross-arm.
    // Note, we create a group for the arm, and move it to the proper position.
    // This ensures rotations will behave nicely,
    // and we just have that one point to work with for animation/sliders.
    let arm_group = new T.Group();
    crane.add(arm_group);
    arm_group.translateY(4.5);
    let arm_curve = new T.Shape();
    arm_curve.moveTo(-1.5, 0);
    arm_curve.lineTo(-1.5, 0.25);
    arm_curve.lineTo(-0.5, 0.5);
    arm_curve.lineTo(4, 0.4);
    arm_curve.lineTo(4, 0);
    arm_curve.lineTo(-1.5, 0);
    let arm_geom = new T.ExtrudeGeometry(arm_curve, exSettings);
    let arm = new T.Mesh(arm_geom, crane_mat);
    arm_group.add(arm);
    arm.translateZ(-0.25);

    // Finally, add the hanging "wire" for the crane arm,
    // which is what carries materials in a real crane.
    // The extrusion makes this not look very wire-like, but that's fine for what we're doing.
    let wire_group = new T.Group();
    arm_group.add(wire_group);
    wire_group.translateX(3);
    let wire_curve = new T.Shape();
    wire_curve.moveTo(-0.25, 0);
    wire_curve.lineTo(-0.25, -0.25);
    wire_curve.lineTo(-0.05, -0.3);
    wire_curve.lineTo(-0.05, -3);
    wire_curve.lineTo(0.05, -3);
    wire_curve.lineTo(0.05, -0.3);
    wire_curve.lineTo(0.25, -0.25);
    wire_curve.lineTo(0.25, 0);
    wire_curve.lineTo(-0.25, 0);
    let wire_geom = new T.ExtrudeGeometry(wire_curve, exSettings);
    let wire_mat = new T.MeshStandardMaterial({
      color: "#888888",
      metalness: 0.6,
      roughness: 0.3
    });
    let wire = new T.Mesh(wire_geom, wire_mat);
    wire_group.add(wire);
    wire.translateZ(-0.25);

    // note that we have to make the Object3D before we can call
    // super and we have to call super before we can use this
    // This is also where we define parameters for UI sliders.
    // These have format "name," "min", "max", "starting value."
    // Sliders are standardized to have 30 "steps" per slider,
    // so if your starting value does not fall on one of the 30 steps,
    // the starting value in the UI may be slightly different from the starting value you gave.
    super(`Crane-${craneObCtr++}`, crane, [
      ["x", -4, 4, 0],
      ["z", -4, 4, 0],
      ["theta", 0, 360, 0],
      ["wire", 1, 3.5, 2],
      ["arm_rotation", 0, 360, 0]
    ]);
    // Here, we store the crane, arm, and wire groups as part of the "GrCrane" object.
    // This allows us to modify transforms as part of the update function.
    this.whole_ob = crane;
    this.arm = arm_group;
    this.wire = wire_group;

    // put the object in its place
    this.whole_ob.position.x = params.x ? Number(params.x) : 0;
    this.whole_ob.position.y = params.y ? Number(params.y) : 0;
    this.whole_ob.position.z = params.z ? Number(params.z) : 0;
    let scale = params.size ? Number(params.size) : 1;
    crane.scale.set(scale, scale, scale);
  }

  // Wire up the wire position and arm rotation to match parameters,
  // given in the call to "super" above.
  update(paramValues) {
    this.whole_ob.position.x = paramValues[0];
    this.whole_ob.position.z = paramValues[1];
    this.whole_ob.rotation.y = degreesToRadians(paramValues[2]);
    this.wire.position.x = paramValues[3];
    this.arm.rotation.y = degreesToRadians(paramValues[4]);
  }
}

let excavatorObCtr = 0;

// A simple excavator
/**
 * @typedef ExcavatorProperties
 * @type {object}
 * @property {number} [x=0]
 * @property {number} [y=0]
 * @property {number} [z=0]
 * @property {number} [size=1]
 */
export class GrExcavator extends GrObject {
  /**
   * @param {ExcavatorProperties} params
   */
  constructor(params = {}) {
    let excavator = new T.Group();

    let exSettings = {
      steps: 2,
      depth: 0.4,
      bevelEnabled: true,
      bevelThickness: 0.2,
      bevelSize: 0.1,
      bevelSegments: 2
    };

    // As with the crane, we define the base (treads) of the excavator.
    // We draw a line, then extrude the line with ExtrudeGeometry,
    // to get the "cutout" style object.
    // Note, for this object, we translate each piece by 0.25 on the negative x-axis.
    // This makes rotation about the y-axis work nicely
    // (since the extrusion happens along +z, a y-rotation goes around an axis on the back face of the piece,
    //  rather than an axis through the center of the piece).
    /**@type T.Shape */
    let base_curve = new T.Shape();
    base_curve.moveTo(-1, 0);
    base_curve.lineTo(-1.2, 0.2);
    base_curve.lineTo(-1.2, 0.4);
    base_curve.lineTo(-1, 0.6);
    base_curve.lineTo(1, 0.6);
    base_curve.lineTo(1.2, 0.4);
    base_curve.lineTo(1.2, 0.2);
    base_curve.lineTo(1, 0);
    base_curve.lineTo(-1, 0);
    let base_geom = new T.ExtrudeGeometry(base_curve, exSettings);
    let excavator_mat = new T.MeshStandardMaterial({
      color: "yellow",
      metalness: 0.5,
      roughness: 0.7
    });
    let base = new T.Mesh(base_geom, excavator_mat);
    excavator.add(base);
    base.translateZ(-0.2);

    // We'll add the "pedestal" piece for the cab of the excavator to sit on.
    // It can be considered a part of the treads, to some extent,
    // so it doesn't need a group of its own.
    let pedestal_curve = new T.Shape();
    pedestal_curve.moveTo(-0.35, 0);
    pedestal_curve.lineTo(-0.35, 0.25);
    pedestal_curve.lineTo(0.35, 0.25);
    pedestal_curve.lineTo(0.35, 0);
    pedestal_curve.lineTo(-0.35, 0);
    let pedestal_geom = new T.ExtrudeGeometry(pedestal_curve, exSettings);
    let pedestal = new T.Mesh(pedestal_geom, excavator_mat);
    excavator.add(pedestal);
    pedestal.translateY(0.6);
    pedestal.translateZ(-0.2);

    // For the cab, we create a new group, since the cab should be able to spin on the pedestal.
    let cab_group = new T.Group();
    excavator.add(cab_group);
    cab_group.translateY(0.7);
    let cab_curve = new T.Shape();
    cab_curve.moveTo(-1, 0);
    cab_curve.lineTo(1, 0);
    cab_curve.lineTo(1.2, 0.35);
    cab_curve.lineTo(1, 0.75);
    cab_curve.lineTo(0.25, 0.75);
    cab_curve.lineTo(0, 1.5);
    cab_curve.lineTo(-0.8, 1.5);
    cab_curve.lineTo(-1, 1.2);
    cab_curve.lineTo(-1, 0);
    let cab_geom = new T.ExtrudeGeometry(cab_curve, exSettings);
    let cab = new T.Mesh(cab_geom, excavator_mat);
    cab_group.add(cab);
    cab.translateZ(-0.2);

    // Next up is the first part of the bucket arm.
    // In general, each piece is just a series of line segments,
    // plus a bit of extra to get the geometry built and put into a group.
    // We always treat the group as the "pivot point" around which the object should rotate.
    // It is helpful to draw the lines for extrusion with the zero at our desired "pivot point."
    // This minimizes the fiddling needed to get the piece placed correctly relative to its parent's origin.
    // The remaining few pieces are very similar to the arm piece.
    let arm_group = new T.Group();
    cab_group.add(arm_group);
    arm_group.position.set(-0.8, 0.5, 0);
    let arm_curve = new T.Shape();
    arm_curve.moveTo(-2.25, 0);
    arm_curve.lineTo(-2.35, 0.15);
    arm_curve.lineTo(-1, 0.5);
    arm_curve.lineTo(0, 0.25);
    arm_curve.lineTo(-0.2, 0);
    arm_curve.lineTo(-1, 0.3);
    arm_curve.lineTo(-2.25, 0);
    let arm_geom = new T.ExtrudeGeometry(arm_curve, exSettings);
    let arm_mat = new T.MeshStandardMaterial({
      color: "#888888",
      metalness: 0.6,
      roughness: 0.3
    });
    let arm = new T.Mesh(arm_geom, arm_mat);
    arm_group.add(arm);
    arm.translateZ(-0.2);

    let forearm_group = new T.Group();
    arm_group.add(forearm_group);
    forearm_group.position.set(-2.1, 0, 0);
    let forearm_curve = new T.Shape();
    forearm_curve.moveTo(-1.5, 0);
    forearm_curve.lineTo(-1.5, 0.1);
    forearm_curve.lineTo(0, 0.15);
    forearm_curve.lineTo(0.15, 0);
    forearm_curve.lineTo(-1.5, 0);
    let forearm_geom = new T.ExtrudeGeometry(forearm_curve, exSettings);
    let forearm = new T.Mesh(forearm_geom, arm_mat);
    forearm_group.add(forearm);
    forearm.translateZ(-0.2);

    let bucket_group = new T.Group();
    forearm_group.add(bucket_group);
    bucket_group.position.set(-1.4, 0, 0);
    let bucket_curve = new T.Shape();
    bucket_curve.moveTo(-0.25, -0.9);
    bucket_curve.lineTo(-0.5, -0.5);
    bucket_curve.lineTo(-0.45, -0.3);
    bucket_curve.lineTo(-0.3, -0.2);
    bucket_curve.lineTo(-0.15, 0);
    bucket_curve.lineTo(0.1, 0);
    bucket_curve.lineTo(0.05, -0.2);
    bucket_curve.lineTo(0.5, -0.7);
    bucket_curve.lineTo(-0.25, -0.9);
    let bucket_geom = new T.ExtrudeGeometry(bucket_curve, exSettings);
    let bucket = new T.Mesh(bucket_geom, arm_mat);
    bucket_group.add(bucket);
    bucket.translateZ(-0.2);

    // note that we have to make the Object3D before we can call
    // super and we have to call super before we can use this
    // The parameters for sliders are also defined here.
    super(`Excavator-${excavatorObCtr++}`, excavator, [
      ["x", -10, 10, 0],
      ["z", -10, 10, 0],
      ["theta", 0, 360, 0],
      ["spin", 0, 360, 0],
      ["arm_rotate", 0, 50, 45],
      ["forearm_rotate", 0, 90, 45],
      ["bucket_rotate", -90, 45, 0]
    ]);
    // As with the crane, we save the "excavator" group as the "whole object" of the GrExcavator class.
    // We also save the groups of each object that may be manipulated by the UI.
    this.whole_ob = excavator;
    this.cab = cab_group;
    this.arm = arm_group;
    this.forearm = forearm_group;
    this.bucket = bucket_group;

    // put the object in its place
    this.whole_ob.position.x = params.x ? Number(params.x) : 0;
    this.whole_ob.position.y = params.y ? Number(params.y) : 0;
    this.whole_ob.position.z = params.z ? Number(params.z) : 0;
    let scale = params.size ? Number(params.size) : 1;
    excavator.scale.set(scale, scale, scale);
  }

  // As with the crane, we wire up each saved group with the appropriate parameter defined in the "super" call.
  // Note, with the forearm, there is an extra bit of rotation added, which allows us to create a rotation offset,
  // while maintaining a nice 0-90 range for the slider itself.
  update(paramValues) {
    this.whole_ob.position.x = paramValues[0];
    this.whole_ob.position.z = paramValues[1];
    this.whole_ob.rotation.y = degreesToRadians(paramValues[2]);
    this.cab.rotation.y = degreesToRadians(paramValues[3]);
    this.arm.rotation.z = degreesToRadians(-paramValues[4]);
    this.forearm.rotation.z = degreesToRadians(paramValues[5]) + Math.PI / 16;
    this.bucket.rotation.z = degreesToRadians(paramValues[6]);
  }
}

let forkliftObCtr = 0;
// A simple forklift :)
/**
 * @typedef ForkliftProperties
 * @type {object}
 * @property {number} [x=0]
 * @property {number} [y=0]
 * @property {number} [z=0]
 * @property {number} [size=1]
 */
export class GrForklift extends GrObject {
  /**
   * @param {ForkliftProperties} params
   */
  constructor(params = {}) {
    let forklift = new T.Group();

    // === Materials ===
    let redMat = new T.MeshStandardMaterial({ color: "red", metalness: 0.5, roughness: 0.6 });
    let darkMat = new T.MeshStandardMaterial({ color: "#222222", metalness: 0.5, roughness: 0.6, side: T.DoubleSide });
    let grayMat = new T.MeshStandardMaterial({ color: "#666666", metalness: 0.6, roughness: 0.4 });
    let tireMat = new T.MeshStandardMaterial({ color: "black", metalness: 0.4, roughness: 0.9 });
    let glassMat = new T.MeshStandardMaterial({
      color: "#88ccee",
      metalness: 0.2,
      roughness: 0.1,
      transparent: true,
      opacity: 0.35,
      side: T.DoubleSide
    });
    // FIX: Define beacon material separately to store reference
    let beaconMat = new T.MeshStandardMaterial({
        color: "orange",
        emissive: "orange",
        emissiveIntensity: 0.8, // Initial intensity (will blink)
      });

    // === Body ===
    let base = new T.Mesh(new T.BoxGeometry(2, 0.2, 1), redMat);
    base.position.y = 0.6
    forklift.add(base);

    // === Back base ===
    let backBase = new T.Mesh(new T.BoxGeometry(0.6, 0.5, 1), redMat);
    backBase.position.set(-.7, 0.3, 0);
    base.add(backBase);

    // === Bottom base ===
    let bottomBase = new T.Mesh(new T.BoxGeometry(2, 0.45, 0.3), redMat);
    bottomBase.position.set(0, -0.3, 0);
    base.add(bottomBase);
    let bottomBase2 = new T.Mesh(new T.BoxGeometry(0.6, 0.45, 1), redMat);
    bottomBase2.position.set(0, -0.3, 0);
    base.add(bottomBase2);
    let frontBottomBase = new T.Mesh(new T.BoxGeometry(0.1, 0.45, 1), redMat);
    frontBottomBase.position.set(0.95, -0.3, 0);
    base.add(frontBottomBase);
    let backBottomBase = new T.Mesh(new T.BoxGeometry(0.1, 0.45, 1), redMat);
    backBottomBase.position.set(-0.95, -0.3, 0);
    base.add(backBottomBase);

    // === Cabin ===
    let cabin = new T.Group();
    cabin.position.set(0.25, 0.125, 0);
    base.add(cabin);

    let postHeight = 1.5;
    let cabinTopY = 0 + postHeight;
    let cabinBottomY = 0;
    let beamWidth = 1.2;
    let beamDepth = 0.8;
    let beamThickness = 0.05;

    let postGeom = new T.BoxGeometry(beamThickness, postHeight, beamThickness); // Use thickness for posts too
    let beamGeomX = new T.BoxGeometry(beamWidth, beamThickness, beamThickness);
    let beamGeomZ = new T.BoxGeometry(beamThickness, beamThickness, beamDepth);

    let postPositions = [
      [ beamWidth / 2, postHeight / 2,  beamDepth / 2],
      [-beamWidth / 2, postHeight / 2,  beamDepth / 2],
      [ beamWidth / 2, postHeight / 2, -beamDepth / 2],
      [-beamWidth / 2, postHeight / 2, -beamDepth / 2],
    ];
    for (let [x, y, z] of postPositions) {
      let post = new T.Mesh(postGeom, darkMat);
      post.position.set(x, y, z);
      cabin.add(post);
    }

    // Top beams
    let topBeamFront = new T.Mesh(beamGeomX, darkMat);
    topBeamFront.position.set(0, cabinTopY, beamDepth / 2);
    cabin.add(topBeamFront);
    let topBeamBack = topBeamFront.clone();
    topBeamBack.position.z = -beamDepth / 2;
    cabin.add(topBeamBack);
    let topBeamLeft = new T.Mesh(beamGeomZ, darkMat);
    topBeamLeft.position.set(-beamWidth / 2, cabinTopY, 0);
    cabin.add(topBeamLeft);
    let topBeamRight = topBeamLeft.clone();
    topBeamRight.position.x = beamWidth / 2;
    cabin.add(topBeamRight);

    // Bottom beams
    let bottomBeamFront = topBeamFront.clone();
    bottomBeamFront.position.y = cabinBottomY;
    cabin.add(bottomBeamFront);
    let bottomBeamBack = bottomBeamFront.clone();
    bottomBeamBack.position.y = cabinBottomY;
    bottomBeamBack.position.z = -beamDepth / 2;
    cabin.add(bottomBeamBack);
    let bottomBeamLeft = topBeamLeft.clone();
    bottomBeamLeft.position.y = cabinBottomY;
    cabin.add(bottomBeamLeft);
    let bottomBeamRight = topBeamRight.clone();
    bottomBeamRight.position.y = cabinBottomY;
    cabin.add(bottomBeamRight);

    // Glass panes
    let glassHeight = postHeight - beamThickness;
    let glassWidth = beamWidth - beamThickness;
    let glassDepth = beamDepth - beamThickness;
    let glassY = postHeight / 2; // Center glass vertically

    let frontGlass = new T.Mesh(new T.PlaneGeometry(glassWidth, glassHeight), glassMat);
    frontGlass.position.set(0, glassY, beamDepth / 2 + 0.01);
    cabin.add(frontGlass);
    let backGlass = frontGlass.clone();
    backGlass.rotation.y = Math.PI;
    backGlass.position.z = -beamDepth / 2 - 0.01;
    cabin.add(backGlass);
    let sideGlassLeft = new T.Mesh(new T.PlaneGeometry(glassDepth, glassHeight), glassMat);
    sideGlassLeft.rotation.y = -Math.PI / 2;
    sideGlassLeft.position.set(-beamWidth / 2 - 0.01, glassY, 0);
    cabin.add(sideGlassLeft);
    let sideGlassRight = sideGlassLeft.clone();
    sideGlassRight.rotation.y = Math.PI / 2;
    sideGlassRight.position.x = beamWidth / 2 + 0.01;
    cabin.add(sideGlassRight);

    // Use PlaneGeometry on the XY plane, size it to fit inside top beams
    let roofGeom = new T.PlaneGeometry(beamWidth - beamThickness, beamDepth - beamThickness);
    let roofPane = new T.Mesh(roofGeom, darkMat); // Use dark material like beams
    roofPane.rotation.x = -Math.PI / 2; // Rotate flat
    roofPane.position.y = cabinTopY - beamThickness / 2; // Position just below top surface of beams
    cabin.add(roofPane);

    // === Mast ===
    let mastHeight = 2.0;
    let mastWidth = 0.1;
    let mastDepth = 0.1;
    let mastSpacing = 0.6;
    let mastGroup = new T.Group();
    mastGroup.position.set(1.05, 0.15, 0);
    forklift.add(mastGroup);
    let mastPostGeom = new T.BoxGeometry(mastWidth, mastHeight, mastDepth);
    let mastLeft = new T.Mesh(mastPostGeom, grayMat);
    let mastRight = mastLeft.clone();
    mastLeft.position.set(0, mastHeight / 2, mastSpacing / 2);
    mastRight.position.set(0, mastHeight / 2, -mastSpacing / 2);
    mastGroup.add(mastLeft, mastRight);
    let mastTop = new T.Mesh(new T.BoxGeometry(mastWidth, 0.1, mastSpacing), grayMat);
    mastTop.position.set(0, mastHeight - 0.05, 0);
    mastGroup.add(mastTop);

    // === Forks ===
    let forkLength = 1.5;
    let forkHeight = 0.1;
    let forkWidth = 0.1;
    let forkSpacing = 0.6;
    let forkGroup = new T.Group();
    let initialForkY = 0.05; // Initial height of the forks
    forkGroup.position.set(mastWidth / 2, initialForkY, 0);
    mastGroup.add(forkGroup);
    let forkGeom = new T.BoxGeometry(forkLength, forkHeight, forkWidth);
    let fork1 = new T.Mesh(forkGeom, grayMat);
    let fork2 = fork1.clone();
    fork1.position.set(forkLength / 2, 0, forkSpacing / 2);
    fork2.position.set(forkLength / 2, 0, -forkSpacing / 2);
    forkGroup.add(fork1, fork2);

    // === Wheels ===
    let wheelRadius = 0.25;
    let wheelWidth = 0.3;
    let wheelGeom = new T.CylinderGeometry(wheelRadius, wheelRadius, wheelWidth, 16);
    let wheelY = wheelRadius;
    let frontWheelX = 0.6;
    let backWheelX = -0.6;
    let wheelZ = 0.2 + wheelWidth / 2;
    let frontWheelLeft = new T.Mesh(wheelGeom, tireMat);
    frontWheelLeft.rotation.x = Math.PI / 2;
    frontWheelLeft.position.set(frontWheelX, wheelY, wheelZ);
    forklift.add(frontWheelLeft);
    let frontWheelRight = frontWheelLeft.clone();
    frontWheelRight.position.z = -wheelZ;
    forklift.add(frontWheelRight);
    let backWheelLeft = frontWheelLeft.clone();
    backWheelLeft.position.x = backWheelX;
    forklift.add(backWheelLeft);
    let backWheelRight = frontWheelRight.clone();
    backWheelRight.position.x = backWheelX;
    forklift.add(backWheelRight);

    // === Finalize ===
    let maxLiftY = 1.9;
    super(`Forklift-${forkliftObCtr++}`, forklift, [
      ["x", -10, 10, params.x ?? 0],
      ["z", -10, 10, params.z ?? 0],
      ["theta", 0, 360, 0],
      ["lift", initialForkY, maxLiftY, initialForkY],
    ]);

    this.whole_ob = forklift;
    this.fork_group = forkGroup;

    this.whole_ob.position.set(params.x ?? 0, params.y ?? 0, params.z ?? 0);
    let scale = params.size ?? 1;
    this.whole_ob.scale.set(scale, scale, scale);
    this.fork_group.position.y = initialForkY;
    // Beacon Light - Cylinder Shape and Blinking Setup
    let beaconHeight = 0.14;
    let beaconRadiusBottom = 0.08;
    let beaconRadiusTop = 0.05; // Smaller top radius
    let beaconGeom = new T.CylinderGeometry(
        beaconRadiusTop,
        beaconRadiusBottom,
        beaconHeight,
        );
    this.beacon = new T.Mesh(beaconGeom, beaconMat); // Use the stored material
    // Position beacon on top of the cabin roof pane
    // Origin of cylinder is its center, so position center Y = roof Y + half beacon height
    this.beacon.position.set(0, roofPane.position.y + beamThickness / 2 + beaconHeight / 2, 0);
    cabin.add(this.beacon);
    
  }

  update(paramValues) {
    this.whole_ob.position.x = paramValues[0];
    this.whole_ob.position.z = paramValues[1];
    this.whole_ob.rotation.y = degreesToRadians(paramValues[2]);
    this.fork_group.position.y = paramValues[3];
  }
  /**
   * Updates the world state.
   */
  stepWorld() {
    // Access `this` properties here (safe after constructor completes)
    const blinkRate = 1000;
    let currentTime = performance.now();
    this.lastTime = this.lastTime || currentTime; // Ensure lastTime is initialized
    this.lastTime = currentTime;

    let cycleTime = currentTime % blinkRate;
    let isOn = cycleTime < blinkRate / 2;

    if (this.beacon) {
        this.beacon.material.emissiveIntensity = isOn ? 1.0 : 0.0;
    }
  }
}

let bulldozerObCtr = 0;
// Bulldozer class!
/**
 * @typedef BulldozerProperties
 * @type {object}
 * @property {number} [x=0]
 * @property {number} [y=0]
 * @property {number} [z=0]
 * @property {number} [size=1]
 */
export class GrBulldozer extends GrObject {
  /**
   * @param {BulldozerProperties} params
   */
  constructor(params = {}) {
    // === Groups ===
    let bulldozer = new T.Group();
    let lowerBladePivotArm = new T.Group(); // Group for lower blade lifting pivot (raises/lowers blade)
    let bladeGroup = new T.Group(); // Group for blade tilt/nod pivot (tilts/nods blade relative to arm)
    let upperBladePivotArm1 = new T.Group(); // Group for upper blade lifting pivot (raises/lowers blade)
    let upperBladePivotArm2 = new T.Group(); // Group for upper blade nodding pivot (tilts/nods blade relative to arm)

    // === Materials ===
    let yellowMat = new T.MeshStandardMaterial({
        color: "#FDD835", metalness: 0.6, roughness: 0.6,
    });
    let darkMat = new T.MeshStandardMaterial({
        color: "#222222", metalness: 0.7, roughness: 0.7,
    });
    let blackMat = new T.MeshStandardMaterial({ // Blade material
        color: "#000000", metalness: 0.5, roughness: 0.8,
    });
    let glassMat = new T.MeshStandardMaterial({
      color: "#88ccee", metalness: 0.2, roughness: 0.1,
      transparent: true, opacity: 0.35, side: T.DoubleSide
    });
    let beaconMat = new T.MeshStandardMaterial({
        color: "orange", emissive: "darkorange", emissiveIntensity: 0.0,
    });
    let pistonMat = new T.MeshStandardMaterial({
        color: "#CCCCCC", metalness: 0.9, roughness: 0.2
    });

    // === Geometry Constants ===
    let bodyLength = 2.5;
    let bodyWidth = 1.4;
    let bodyHeight = 1.0;
    let trackHeight = 0.8;
    let trackWidth = 0.5;
    let trackLength = bodyLength * 1.1;
    let trackZ = bodyWidth / 2 + trackWidth / 2;
    let lowerArmLength = 2.5; // 
    let armSize = 0.2; // Arm size for the blade pivot arm
    let upperArm1Length = 1; // Length of the upper arm going up
    let upperArm2Length = 1.75; // Length of the upper arm going down
    let engineCoverWidth = bodyWidth * 0.8; // Width of the engine cover

    // --- Main Body & Engine ---
    let mainBody = new T.Mesh(new T.BoxGeometry(bodyLength, bodyHeight, bodyWidth), yellowMat);
    mainBody.position.y = 0.75; // Center of body sits 1.0 unit high
    bulldozer.add(mainBody);

    let engineCover = new T.Mesh(new T.BoxGeometry(bodyLength * 0.4, bodyHeight * 0.3, engineCoverWidth), yellowMat); // Engine cover
    engineCover.position.set(bodyLength * 0.3, 0.65, 0); // Relative to mainBody center
    mainBody.add(engineCover);

   // === Cabin ===
   let cabin = new T.Group();
   cabin.position.set(-0.4, 0.5, 0);
   mainBody.add(cabin);

   let postHeight = 1;
   let cabinBottomY = 0;
   let beamWidth = 1.2;
   let beamDepth = 0.8;
   let beamThickness = 0.05;

   let postGeom = new T.BoxGeometry(beamThickness, postHeight, beamThickness); // Use thickness for posts too
   let beamGeomX = new T.BoxGeometry(beamWidth, beamThickness, beamThickness);
   let beamGeomZ = new T.BoxGeometry(beamThickness, beamThickness, beamDepth);

   let postPositions = [
     [ beamWidth / 2, postHeight / 2,  beamDepth / 2],
     [-beamWidth / 2, postHeight / 2,  beamDepth / 2],
     [ beamWidth / 2, postHeight / 2, -beamDepth / 2],
     [-beamWidth / 2, postHeight / 2, -beamDepth / 2],
   ];
   for (let [x, y, z] of postPositions) {
     let post = new T.Mesh(postGeom, darkMat);
     post.position.set(x, y, z);
     cabin.add(post);
   }

   // Top beams
   let topBeamFront = new T.Mesh(beamGeomX, darkMat);
   topBeamFront.position.set(0, postHeight, beamDepth / 2);
   cabin.add(topBeamFront);
   let topBeamBack = topBeamFront.clone();
   topBeamBack.position.z = -beamDepth / 2;
   cabin.add(topBeamBack);
   let topBeamLeft = new T.Mesh(beamGeomZ, darkMat);
   topBeamLeft.position.set(-beamWidth / 2, postHeight, 0);
   cabin.add(topBeamLeft);
   let topBeamRight = topBeamLeft.clone();
   topBeamRight.position.x = beamWidth / 2;
   cabin.add(topBeamRight);

   // Bottom beams
   let bottomBeamFront = topBeamFront.clone();
   bottomBeamFront.position.y = cabinBottomY;
   cabin.add(bottomBeamFront);
   let bottomBeamBack = bottomBeamFront.clone();
   bottomBeamBack.position.y = cabinBottomY;
   bottomBeamBack.position.z = -beamDepth / 2;
   cabin.add(bottomBeamBack);
   let bottomBeamLeft = topBeamLeft.clone();
   bottomBeamLeft.position.y = cabinBottomY;
   cabin.add(bottomBeamLeft);
   let bottomBeamRight = topBeamRight.clone();
   bottomBeamRight.position.y = cabinBottomY;
   cabin.add(bottomBeamRight);

   // Glass panes
   let glassHeight = postHeight - beamThickness;
   let glassWidth = beamWidth - beamThickness;
   let glassDepth = beamDepth - beamThickness;
   let glassY = postHeight / 2; // Center glass vertically

   let frontGlass = new T.Mesh(new T.PlaneGeometry(glassWidth, glassHeight), glassMat);
   frontGlass.position.set(0, glassY, beamDepth / 2 + 0.01);
   cabin.add(frontGlass);
   let backGlass = frontGlass.clone();
   backGlass.rotation.y = Math.PI;
   backGlass.position.z = -beamDepth / 2 - 0.01;
   cabin.add(backGlass);
   let sideGlassLeft = new T.Mesh(new T.PlaneGeometry(glassDepth, glassHeight), glassMat);
   sideGlassLeft.rotation.y = -Math.PI / 2;
   sideGlassLeft.position.set(-beamWidth / 2 - 0.01, glassY, 0);
   cabin.add(sideGlassLeft);
   let sideGlassRight = sideGlassLeft.clone();
   sideGlassRight.rotation.y = Math.PI / 2;
   sideGlassRight.position.x = beamWidth / 2 + 0.01;
   cabin.add(sideGlassRight);

   // Use PlaneGeometry on the XY plane, size it to fit inside top beams
   let roofGeom = new T.PlaneGeometry(beamWidth - beamThickness, beamDepth - beamThickness);
   let roofPane = new T.Mesh(roofGeom, darkMat); // Use dark material like beams
   roofPane.rotation.x = -Math.PI / 2; // Rotate flat
   roofPane.position.y = postHeight - beamThickness / 2; // Position just below top surface of beams
   cabin.add(roofPane);


  // --- Beacon ---
  let beaconHeight = 0.14;
  let beaconRadius = 0.08;
  let localBeaconLight = new T.Mesh(new T.CylinderGeometry(beaconRadius*0.7, beaconRadius, beaconHeight), beaconMat);
  // Position on top of the cabin frame
  localBeaconLight.position.y = postHeight + beaconHeight / 2;
  cabin.add(localBeaconLight);

  // --- Tracks ---
  let trackY = trackHeight / 2;
  let trackFrameGeom = new T.BoxGeometry(trackLength, trackHeight, trackWidth);
  let leftTrack = new T.Mesh(trackFrameGeom, yellowMat);
  leftTrack.position.set(0, trackY, trackZ);
  bulldozer.add(leftTrack);
  let rightTrack = new T.Mesh(trackFrameGeom, yellowMat);
  rightTrack.position.set(0, trackY, -trackZ);
  bulldozer.add(rightTrack);

  let trackSurfaceGeom = new T.BoxGeometry(trackLength * 0.9, trackHeight * 0.8, trackWidth * 1.01);
  let leftTrackSurface = new T.Mesh(trackSurfaceGeom, blackMat);
  leftTrack.add(leftTrackSurface);
  let rightTrackSurface = new T.Mesh(trackSurfaceGeom, blackMat);
  rightTrack.add(rightTrackSurface);



  // --- Lower Blade Arms ---
  // Pivot point for the whole arm assembly (raising/lowering) relative to bulldozer body center
  lowerBladePivotArm.position.set(0, 0.2, 0);
  bulldozer.add(lowerBladePivotArm);

  let bladeArmGeom = new T.BoxGeometry(lowerArmLength, armSize, armSize * 0.5);
  let leftPivotArmMesh = new T.Mesh(bladeArmGeom, yellowMat);
  // Position the visual arm pieces relative to lowerBladePivotArm's origin
  leftPivotArmMesh.position.set(lowerArmLength * 0.4, 0.2, trackZ * 1.3); // Centered along length, offset side
  lowerBladePivotArm.add(leftPivotArmMesh);

  let rightPivotArmMesh = leftPivotArmMesh.clone();
  rightPivotArmMesh.position.z = -trackZ * 1.3; // Offset to the other side
  lowerBladePivotArm.add(rightPivotArmMesh);

  // --- Upper Blade Arms --- 
  // Pivot point for the upper arm 1 connected to the upper engine cover
  upperBladePivotArm1.position.set(0, 0, 0); // Relative to engine cover center
  engineCover.add(upperBladePivotArm1);
  // Upper arm 1 (going up) relative to upperBladePivotArm1's origin
  let upperBladeArm1Geom = new T.BoxGeometry(upperArm1Length, armSize * 0.5, armSize * 0.5);
  let leftUpperArm1Mesh = new T.Mesh(upperBladeArm1Geom, darkMat);
  leftUpperArm1Mesh.position.set(0, 0.4, engineCoverWidth / 2 + armSize * 0.25); // Centered along length, offset side
  leftUpperArm1Mesh.rotation.z = Math.PI / 3; // Rotate to be pointing up
  upperBladePivotArm1.add(leftUpperArm1Mesh);
  
  let rightUpperArm1Mesh = new T.Mesh(upperBladeArm1Geom, darkMat);
  rightUpperArm1Mesh.position.set(0, 0.4, -engineCoverWidth / 2 - armSize * 0.25); // Centered along length, offset side
  rightUpperArm1Mesh.rotation.z = Math.PI / 3; // Rotate to be pointing up
  upperBladePivotArm1.add(rightUpperArm1Mesh);

  // Pivot point for the upper arm 2 connected to the top of the upper arm 1s
  upperBladePivotArm2.position.set(Math.cos(Math.PI / 3) * upperArm1Length / 2, Math.sin(Math.PI / 3) * upperArm1Length / 2 + 0.4, 0); // Relative to upper blade arm 1 pivot
  upperBladePivotArm1.add(upperBladePivotArm2);
  // Upper arm 2s (going down) relative to the top of the upper arm 1s
  let upperBladeArm2Geom = new T.BoxGeometry(upperArm2Length, armSize * 0.75, armSize * 0.75);
  let leftUpperArm2Mesh = new T.Mesh(upperBladeArm2Geom, darkMat);
  leftUpperArm2Mesh.position.set(Math.cos(-Math.PI / 3) * upperArm2Length / 2, Math.sin(-Math.PI / 3) * upperArm2Length / 2, engineCoverWidth / 2); // Centered along length, offset side
  leftUpperArm2Mesh.rotation.z = -Math.PI / 3; // Rotate to be pointing down
  upperBladePivotArm2.add(leftUpperArm2Mesh);
  upperBladePivotArm2.add(bladeGroup);

  let rightUpperArm2Mesh = new T.Mesh(upperBladeArm2Geom, darkMat);
  rightUpperArm2Mesh.position.set(Math.cos(-Math.PI / 3) * upperArm2Length / 2, Math.sin(-Math.PI / 3) * upperArm2Length / 2, -engineCoverWidth / 2);
  rightUpperArm2Mesh.rotation.z = -Math.PI / 3; // Rotate to be pointing down
  upperBladePivotArm2.add(rightUpperArm2Mesh);
  

  // --- Blade ---
  let bladeWidth = bodyWidth + 2 * trackWidth + 0.5;
  let bladeHeight = 1.2;
  let bladeDepth = 0.4;
  let bladeMesh = new T.Mesh(new T.BoxGeometry(bladeDepth, bladeHeight, bladeWidth), blackMat); // Use black material

  // Position the blade group at the end of the arm assembly, relative to lowerBladePivotArm
  bladeGroup.position.set(lowerArmLength * 0.9, 0.5, 0);
  lowerBladePivotArm.add(bladeGroup); // Blade group is child of the arm pivot
  bladeGroup.add(bladeMesh);     // Blade mesh is child of the blade group (for tilting)

  

  super(`Bulldozer-${bulldozerObCtr++}`, bulldozer, [
    ["x", -10, 10, 0],
    ["z", -10, 10, 0],
    ["theta", 0, 360, 0],
    ["blade_raise", 0, 25, 0], // Controls lowerBladePivotArm rotation around Z (up/down)
    ["blade_nod", -15, 15, 0]   // Controls bladeGroup rotation around Z (up/down nod)
  ]);

  // === Assign Groups to `this` AFTER super() ===
  this.whole_ob = bulldozer;
  this.bladePivotArm = lowerBladePivotArm; // For raising/lowering
  this.upperBladePivotArm1 = upperBladePivotArm1; // For raising/lowering
  this.upperBladePivotArm2 = upperBladePivotArm2; // For nodding
  this.bladeGroup = bladeGroup;       // For tilting/nodding
  this.beaconLight = localBeaconLight; // Assign the locally created beacon
  this.lastTime = 0; // Initialize animation timer

  // === Set Initial State using `this.value` AFTER super() ===
  this.whole_ob.position.set(params.x || 0, params.y || 0, params.z || 0);
  let scale = params.size || 1;
  this.whole_ob.scale.set(scale, scale, scale);
}

update(paramValues) {
  // Update the bulldozer position and rotation based on parameter values
  this.whole_ob.position.x = paramValues[0];
  this.whole_ob.position.z = paramValues[1];
  this.whole_ob.rotation.y = degreesToRadians(paramValues[2]);
  // Update blade raise/lower (arm pivot)
  this.bladePivotArm.rotation.z = degreesToRadians(paramValues[3]);
  this.bladePivotArm.position.x = degreesToRadians(paramValues[4]); // Adjust position based on rotation
  // Update blade tilt/nod (blade group pivot)
  this.bladeGroup.rotation.z = degreesToRadians(paramValues[4]); // Use Z axis for nod
  this.upperBladePivotArm1.rotation.z = degreesToRadians(paramValues[3] * 2.7 - paramValues[4] * .5 + 10); // Use Z axis arm pivot
  this.upperBladePivotArm2.rotation.z = degreesToRadians(-paramValues[3] * 1.1 + 20 + paramValues[4] * .5 - 8); // Use Z axis for nod

}
/**
 * Updates the world state (for blinking light).
 */
stepWorld() {
  // Access `this` properties here (safe after constructor completes)
  const blinkRate = 1000; // milliseconds
  let currentTime = performance.now();
  this.lastTime = this.lastTime || currentTime; // Ensure lastTime is initialized
  this.lastTime = currentTime;

  let cycleTime = currentTime % blinkRate;
  let isOn = cycleTime < blinkRate / 2;

  if (this.beaconLight && this.beaconLight.material) {
      // Make sure material is accessible and has emissiveIntensity property
      if (typeof this.beaconLight.material.emissiveIntensity !== 'undefined') {
            this.beaconLight.material.emissiveIntensity = isOn ? 1.0 : 0.0;
      }
    }
  }
}

let backhoeObCtr = 0; 
// Backhoe class :)
/**
 * A Backhoe GrObject class
 * @typedef BackhoeProperties
 * @type {object}
 * @property {number} [x=0]
 * @property {number} [y=0]
 * @property {number} [z=0]
 * @property {number} [size=1]
 */
export class GrBackhoe extends GrObject { 
  /**
   * @param {BackhoeProperties} params
   */
  constructor(params = {}) {
    let backhoe = new T.Group();

    // === Materials ===
    let yellowMat = new T.MeshStandardMaterial({ color: "#FDBA30", metalness: 0.5, roughness: 0.6 }); // Main body, engine cover
    let blackMat = new T.MeshStandardMaterial({ color: "#1A1A1A", metalness: 0.4, roughness: 0.7 }); // Tires, buckets, frames
    let grayMat = new T.MeshStandardMaterial({ color: "#555555", metalness: 0.6, roughness: 0.5 }); // Darker details, chassis
    let glassMat = new T.MeshStandardMaterial({ color: "#88ccee", metalness: 0.2, roughness: 0.1, transparent: true, opacity: 0.35, side: T.DoubleSide }); // Glass panes
    let yellowRimMat = new T.MeshStandardMaterial({ color: "#FDBA30", metalness: 0.6, roughness: 0.5 }); // Yellow rims

    // === Dimensions ===
    let baseHeight = 0.4; // Lower chassis height
    let baseWidth = 1.6; // Wider chassis/base
    let baseLength = 2.4;
    let upperBodyWidth = 1.2; // Main yellow body width
    let upperBodyLength = 2.3;
    let upperBodyHeight = 0.8; // Height of main yellow body part
    let rearWheelRadius = 0.55;
    let frontWheelRadius = 0.35;
    let wheelWidth = 0.35;
    let frontWheelX = 1.1; // Adjusted X positions for wheels
    let rearWheelX = -1.1;
    // Wheel Z offset based on wider baseWidth
    let wheelZ = baseWidth / 2 + wheelWidth*0.1; // Position wheels relative to base

    // Backhoe Arm
    let boomLength = 1.7;
    let boomWidth = 0.2;
    let boomDepth = 0.3;
    let dipperLength = 1.5;
    let dipperWidth = 0.18;
    let dipperDepth = 0.25;
    let backhoeBucketWidth = 0.7;
    let backhoeBucketDepth = 0.5;
    let backhoeBucketHeight = 0.5;
    // Front Loader Arm
    let frontArmLength = 1.8;
    let frontArmSize = 0.18;
    let frontBucketWidth = upperBodyWidth * 1.2; // Bucket slightly wider than upper body
    let frontBucketDepth = 0.8;
    let frontBucketHeight = 0.7;

    // === Body Assembly ===
    let bodyGroup = new T.Group();
    // Set base position slightly above ground, accounting for largest wheel radius
    bodyGroup.position.y = rearWheelRadius;
    backhoe.add(bodyGroup);

    // --- Lower Chassis (Grey) ---
    let baseGeom = new T.BoxGeometry(baseLength, baseHeight, baseWidth);
    let baseMesh = new T.Mesh(baseGeom, grayMat);
    baseMesh.position.y = baseHeight / 2; // Center of chassis sits half its height above bodyGroup origin
    bodyGroup.add(baseMesh);

    // --- Upper Body (Yellow) ---
    let upperBodyGeom = new T.BoxGeometry(upperBodyLength, upperBodyHeight, upperBodyWidth);
    let upperBodyMesh = new T.Mesh(upperBodyGeom, yellowMat);
    // Position upper body on top of the base chassis
    upperBodyMesh.position.y = baseHeight + upperBodyHeight / 2;
    bodyGroup.add(upperBodyMesh);


    // === Cabin === (Positioned on Upper Body)
    let cabin = new T.Group();
    // Position relative to bodyGroup origin, sitting on upperBodyMesh
    cabin.position.set(-upperBodyLength * 0.2, baseHeight + upperBodyHeight, 0);
    bodyGroup.add(cabin);

    let postHeight = 1.1; // Taller cabin
    let cabinBottomY = 0; // Relative to cabin group origin
    let beamWidth = 1.1;
    let beamDepth = 0.9;
    let beamThickness = 0.05;

    let postGeom = new T.BoxGeometry(beamThickness, postHeight, beamThickness);
    let beamGeomX = new T.BoxGeometry(beamWidth, beamThickness, beamThickness);
    let beamGeomZ = new T.BoxGeometry(beamThickness, beamThickness, beamDepth);

    let postPositions = [ /* Same post positions */
          [ beamWidth / 2, postHeight / 2,  beamDepth / 2],
          [-beamWidth / 2, postHeight / 2,  beamDepth / 2],
          [ beamWidth / 2, postHeight / 2, -beamDepth / 2],
          [-beamWidth / 2, postHeight / 2, -beamDepth / 2],
    ];
    for (let [x, y, z] of postPositions) {
        let post = new T.Mesh(postGeom, blackMat);
        post.position.set(x, y, z);
        cabin.add(post);
    }
    // Top beams
    let topBeamFront = new T.Mesh(beamGeomX, blackMat); topBeamFront.position.set(0, postHeight, beamDepth / 2); cabin.add(topBeamFront);
    let topBeamBack = topBeamFront.clone(); topBeamBack.position.z = -beamDepth / 2; cabin.add(topBeamBack);
    let topBeamLeft = new T.Mesh(beamGeomZ, blackMat); topBeamLeft.position.set(-beamWidth / 2, postHeight, 0); cabin.add(topBeamLeft);
    let topBeamRight = topBeamLeft.clone(); topBeamRight.position.x = beamWidth / 2; cabin.add(topBeamRight);
    // Bottom beams
    let bottomBeamFront = topBeamFront.clone(); bottomBeamFront.position.y = cabinBottomY; cabin.add(bottomBeamFront);
    let bottomBeamBack = bottomBeamFront.clone(); bottomBeamBack.position.y = cabinBottomY; bottomBeamBack.position.z = -beamDepth / 2; cabin.add(bottomBeamBack);
    let bottomBeamLeft = topBeamLeft.clone(); bottomBeamLeft.position.y = cabinBottomY; cabin.add(bottomBeamLeft);
    let bottomBeamRight = topBeamRight.clone(); bottomBeamRight.position.y = cabinBottomY; cabin.add(bottomBeamRight);
    // Glass panes
    let glassHeight = postHeight - beamThickness; let glassWidth = beamWidth - beamThickness; let glassDepth = beamDepth - beamThickness; let glassY = postHeight / 2;
    let frontGlass = new T.Mesh(new T.PlaneGeometry(glassWidth, glassHeight), glassMat); frontGlass.position.set(0, glassY, beamDepth / 2 + 0.01); cabin.add(frontGlass);
    let backGlass = frontGlass.clone(); backGlass.rotation.y = Math.PI; backGlass.position.z = -beamDepth / 2 - 0.01; cabin.add(backGlass);
    let sideGlassLeft = new T.Mesh(new T.PlaneGeometry(glassDepth, glassHeight), glassMat); sideGlassLeft.rotation.y = -Math.PI / 2; sideGlassLeft.position.set(-beamWidth / 2 - 0.01, glassY, 0); cabin.add(sideGlassLeft);
    let sideGlassRight = sideGlassLeft.clone(); sideGlassRight.rotation.y = Math.PI / 2; sideGlassRight.position.x = beamWidth / 2 + 0.01; cabin.add(sideGlassRight);
    // Roof Pane
    let roofGeom = new T.PlaneGeometry(beamWidth - beamThickness, beamDepth - beamThickness); let roofPane = new T.Mesh(roofGeom, blackMat); roofPane.rotation.x = -Math.PI / 2; roofPane.position.y = postHeight - beamThickness / 2; cabin.add(roofPane);

    // === Wheels === (Positioned relative to backhoe root origin)
    let frontWheelGeom = new T.CylinderGeometry(frontWheelRadius, frontWheelRadius, wheelWidth, 24); frontWheelGeom.rotateX(Math.PI / 2);
    let rearWheelGeom = new T.CylinderGeometry(rearWheelRadius, rearWheelRadius, wheelWidth, 24); rearWheelGeom.rotateX(Math.PI / 2);
    let rimGeomFront = new T.CylinderGeometry(frontWheelRadius * 0.8, frontWheelRadius * 0.85, wheelWidth * 1.1, 24); rimGeomFront.rotateX(Math.PI / 2);
    let rimGeomRear = new T.CylinderGeometry(rearWheelRadius * 0.8, rearWheelRadius * 0.85, wheelWidth * 1.1, 24); rimGeomRear.rotateX(Math.PI / 2);

    let wheelFL = new T.Mesh(frontWheelGeom, blackMat); wheelFL.position.set(frontWheelX, frontWheelRadius, wheelZ); backhoe.add(wheelFL);
    let rimFL = new T.Mesh(rimGeomFront, yellowRimMat); wheelFL.add(rimFL);

    let wheelFR = new T.Mesh(frontWheelGeom, blackMat); wheelFR.position.set(frontWheelX, frontWheelRadius, -wheelZ); backhoe.add(wheelFR);
    let rimFR = new T.Mesh(rimGeomFront, yellowRimMat); wheelFR.add(rimFR);

    let wheelRL = new T.Mesh(rearWheelGeom, blackMat); wheelRL.position.set(rearWheelX, rearWheelRadius, wheelZ); backhoe.add(wheelRL);
    let rimRL = new T.Mesh(rimGeomRear, yellowRimMat); wheelRL.add(rimRL);

    let wheelRR = new T.Mesh(rearWheelGeom, blackMat); wheelRR.position.set(rearWheelX, rearWheelRadius, -wheelZ); backhoe.add(wheelRR);
    let rimRR = new T.Mesh(rimGeomRear, yellowRimMat); wheelRR.add(rimRR);


    // === Front Loader Assembly ===
    let frontArmPivot = new T.Group();
    // Pivot relative to bodyGroup origin, visually mounted on side of upperBodyMesh
    frontArmPivot.position.set(upperBodyLength * 0.2, baseHeight + upperBodyHeight * 0.5, 0);
    bodyGroup.add(frontArmPivot);

    let frontArmGeom = new T.BoxGeometry(frontArmLength, frontArmSize, frontArmSize);
    let frontArmYOffset = 0;
    let frontArmZ = upperBodyWidth / 2 + frontArmSize; // Arms outside the main body

    let frontArmL = new T.Mesh(frontArmGeom, yellowMat);
    frontArmL.position.set(frontArmLength / 2, frontArmYOffset, frontArmZ);
    frontArmPivot.add(frontArmL);
    let frontArmR = frontArmL.clone();
    frontArmR.position.z = -frontArmZ;
    frontArmPivot.add(frontArmR);

    // Front Bucket Pivot (at end of arms)
    let frontBucketPivot = new T.Group();
    frontBucketPivot.position.x = frontArmLength + 0.05;
    frontBucketPivot.position.y = frontArmYOffset; // Match arm offset
    frontArmPivot.add(frontBucketPivot);

    // Front Bucket Geometry
    let fbFloor = new T.Mesh(new T.BoxGeometry(frontBucketDepth, 0.1, frontBucketWidth), blackMat);
    fbFloor.position.y = -frontBucketHeight * 0.4;
    let fbBack = new T.Mesh(new T.BoxGeometry(0.1, frontBucketHeight, frontBucketWidth), blackMat);
    fbBack.position.x = -frontBucketDepth * 0.5; // Position relative to pivot
    let fbSideL = new T.Mesh(new T.BoxGeometry(frontBucketDepth, frontBucketHeight, 0.1), blackMat);
    fbSideL.position.set(0, 0, frontBucketWidth/2);
    let fbSideR = fbSideL.clone();
    fbSideR.position.z = -frontBucketWidth/2;

    frontBucketPivot.add(fbFloor);
    frontBucketPivot.add(fbBack);
    frontBucketPivot.add(fbSideL);
    frontBucketPivot.add(fbSideR);

    // === Backhoe Arm Assembly ===
    let swingPivot = new T.Group();
    // Mount relative to bodyGroup origin, at the back
    swingPivot.position.set(-upperBodyLength / 2 * 0.9, baseHeight + upperBodyHeight * 0.3, 0);
    bodyGroup.add(swingPivot);

    // --- Boom Arm (Box) ---
    let boomArm = new T.Group();
    swingPivot.add(boomArm);
    let boomGeom = new T.BoxGeometry(boomLength, boomDepth, boomWidth);
    let boomMesh = new T.Mesh(boomGeom, yellowMat);
    boomMesh.position.set(boomLength / 2, 0, 0);
    boomArm.add(boomMesh);

    // --- Dipper Arm (Box) ---
    let dipperArm = new T.Group();
    dipperArm.position.x = boomLength;
    boomArm.add(dipperArm);
    let dipperGeom = new T.BoxGeometry(dipperLength, dipperDepth, dipperWidth);
    let dipperMesh = new T.Mesh(dipperGeom, yellowMat);
    dipperMesh.position.x = dipperLength / 2;
    dipperArm.rotation.z = degreesToRadians(360); // Rotate to be parallel to boom arm
    dipperArm.add(dipperMesh);

    // --- Bucket ---
    let bucketGroup = new T.Group();
    bucketGroup.position.x = dipperLength + 0.1;
    bucketGroup.position.y = 0.1; // Position slightly below dipper arm
    bucketGroup.rotation.z = degreesToRadians(90); // Rotate to face downwards
    dipperArm.add(bucketGroup);
    // Bucket Geometry
    let bbFloor = new T.Mesh(new T.BoxGeometry(backhoeBucketDepth, 0.08, backhoeBucketWidth), blackMat); bbFloor.position.set(backhoeBucketDepth*0.4, -backhoeBucketHeight*0.4, 0);
    let bbBack = new T.Mesh(new T.BoxGeometry(0.08, backhoeBucketHeight, backhoeBucketWidth), blackMat); bbBack.position.set(-backhoeBucketDepth*0.1, 0, 0);
    let bbSideL = new T.Mesh(new T.BoxGeometry(backhoeBucketDepth, backhoeBucketHeight, 0.08), blackMat); bbSideL.position.set(backhoeBucketDepth*0.4, 0, backhoeBucketWidth/2);
    let bbSideR = bbSideL.clone(); bbSideR.position.z = -backhoeBucketWidth/2;
    let bbLinkPlateL = new T.Mesh(new T.BoxGeometry(0.2, 0.3, 0.05), grayMat); bbLinkPlateL.position.set(0, 0.1, backhoeBucketWidth*0.3);
    let bbLinkPlateR = bbLinkPlateL.clone(); bbLinkPlateR.position.z = -backhoeBucketWidth*0.3;
    bucketGroup.add(bbFloor); bucketGroup.add(bbBack); bucketGroup.add(bbSideL); bucketGroup.add(bbSideR); bucketGroup.add(bbLinkPlateL); bucketGroup.add(bbLinkPlateR);

    // === Slider Definitions ===
    super(`Backhoe-${backhoeObCtr++}`, backhoe, [
        ["x", -10, 10, 0],
        ["z", -10, 10, 0],
        ["theta", 0, 360, 0],        // Vehicle orientation
        ["front_lift", -20, 45, 0],  // Front Arm rotation Z
        ["front_tilt", -80, 30, 0],  // Front Bucket rotation Z
        ["swing", -90, 90, 0],       // Arm assembly rotation Y
        ["boom_lift", 150, 250, 210],  // Boom rotation Z
        ["dipper_angle", -20, 120, 45],// Dipper rotation Z relative to Boom
        ["bucket_tilt", 270, 360, 270] // Backhoe Bucket rotation Z relative to Dipper
    ]);

    // === Store References ===
    this.whole_ob = backhoe;
    this.swingPivot = swingPivot;
    this.boomArm = boomArm;
    this.dipperArm = dipperArm;
    this.bucketGroup = bucketGroup;
    this.frontArmPivot = frontArmPivot;
    this.frontBucketPivot = frontBucketPivot;

    // === Initial State ===
    this.whole_ob.position.set(params.x ?? 0, params.y ?? 0, params.z ?? 0);
    let scale = params.size ?? 1;
    this.whole_ob.scale.set(scale, scale, scale);
}


update(paramValues) {
    this.whole_ob.position.x = paramValues[0];
    this.whole_ob.position.z = paramValues[1];
    this.whole_ob.rotation.y = degreesToRadians(paramValues[2]);

    // Front loader controls
    this.frontArmPivot.rotation.z = degreesToRadians(paramValues[3]); // Negate for lift
    this.frontBucketPivot.rotation.z = degreesToRadians(paramValues[4]);

    // Backhoe controls
    this.swingPivot.rotation.y = degreesToRadians(-paramValues[5]);
    this.boomArm.rotation.z = degreesToRadians(-paramValues[6]); // Negate for lift
    this.dipperArm.rotation.z = degreesToRadians(paramValues[7]);
    this.bucketGroup.rotation.z = degreesToRadians(paramValues[8]);
  }
}