/*jshint esversion: 6 */
// @ts-check

/*
 * Graphics Town Mario Kart - Luigi's Circuit Track
 */
import * as T from "../../libs/CS559-Three/build/three.module.js";
import { GrObject } from "../../libs/CS559-Framework/GrObject.js";

// Define control points for the track path, approximating Luigi's Circuit (MKWii)
// Coordinates are approximate, Y is constant to keep it flat.
const trackY = 0.05; // Y coordinate for the track (flat on the XZ plane)
const controlPoints = [
  // Start/Finish Line Area (straight)
  new T.Vector3(-12, trackY, 4),
  new T.Vector3(-10.5, trackY, -9),

  // Big Turn 1 (to the right)
  new T.Vector3(0, trackY, -12),
  
  // Top right corner
  new T.Vector3(6, trackY, -17),
  new T.Vector3(12, trackY, -11),
  
  // Bottom right straightaway
  new T.Vector3(0, trackY, 2),

  // Straight downwards
  new T.Vector3(-1, trackY, 11),

  // Semi circle loop back to start
  new T.Vector3(-2, trackY, 15),
  new T.Vector3(-6, trackY, 17),
  new T.Vector3(-11.5, trackY, 14),
];

// Create a closed curve (the constructor handles the loop)
const curve = new T.CatmullRomCurve3(
  controlPoints, // Use the array directly
  true, // closed loop
  "catmullrom", // type
  0.6 // tension
);

// Define the shape of the track cross-section (a wide rectangle)
const trackWidth = 4.0;
const trackThickness = 0.1;
const shape = new T.Shape();
shape.moveTo(-trackThickness / 2, -trackWidth / 2);
shape.lineTo(trackThickness / 2, -trackWidth / 2);
shape.lineTo(trackThickness / 2, trackWidth / 2);
shape.lineTo(-trackThickness / 2, trackWidth / 2);
shape.lineTo(-trackThickness / 2, -trackWidth / 2);

// Extrusion settings
const steps = 200;
const extrudeSettings = {
  steps: steps,
  bevelEnabled: false,
  extrudePath: curve,
};

// --- PBR Texture Loading and Material ---
const textureLoader = new T.TextureLoader();

// Define texture file paths
const diffuseMapPath = '../textures/asphalt_track_diff_1k.png'; 
const normalMapPath = '../textures/asphalt_track_nor_gl_1k.png';  
const roughnessMapPath = '../textures/asphalt_track_rough_1k.png'; 

// Load the textures
const diffuseMap = textureLoader.load(diffuseMapPath);
const normalMap = textureLoader.load(normalMapPath);
const roughnessMap = textureLoader.load(roughnessMapPath);

// --- Configure Texture Tiling (Apply to ALL maps) ---
// DECREASE these values to make the texture pattern larger
const repeatH = 0.1;  // How many times to repeat ACROSS the track width (try lower values like 1, 2, 3)
const repeatV = 0.1; // How many times to repeat ALONG the track length (try lower values like 10, 20, 30)
const anisotropyLevel = 16; // For sharper textures at angles

[diffuseMap, normalMap, roughnessMap].forEach(texture => {
    if (texture) { // Check if texture loaded (in case optional ones aren't used)
        texture.wrapS = T.RepeatWrapping;
        texture.wrapT = T.RepeatWrapping;
        texture.repeat.set(repeatH, repeatV);
        texture.anisotropy = anisotropyLevel;
    }
});

// Create the geometry
const geometry = new T.ExtrudeGeometry(shape, extrudeSettings);
// Note: For aoMap to work correctly, geometry might need a second set of UVs (uv2).
// ExtrudeGeometry doesn't create uv2 automatically.

// Create the PBR material using the loaded textures
const material = new T.MeshStandardMaterial({
  map: diffuseMap,         // Base color
  normalMap: normalMap,       // Simulates surface detail
  normalScale: new T.Vector2(5, 5), // Adjust normal map strength (default is 1, 1)
  roughnessMap: roughnessMap, // Controls shininess/dullness
  metalness: 0.1,          // Low metalness for non-metallic road
});


/**
 * A track object shaped similarly to Luigi's Circuit from Mario Kart Wii.
 * The track lies flat on the XZ plane because the control points are defined that way.
 * Objects can follow this track using the eval and tangent methods.
 */
export class LuigiTrack extends GrObject {
  constructor(params = {}) {
    const mesh = new T.Mesh(geometry, material);


    // Apply transformations from params (position, rotation, scale of the whole track)
    mesh.position.set(params.x || 0, params.y || 0, params.z || 0);
    mesh.rotation.set(params.rx || 0, params.ry || 0, params.rz || 0); // Standard rotation
    mesh.scale.set(params.s || 1, params.s || 1, params.s || 1);

    super("LuigiTrack", mesh);
    this.curve = curve;
  }

  /**
   * Evaluate the position on the track for a given parameter u (0 to 1).
   * Returns the position in world coordinates, considering the object's transform.
   * @param {number} u Parameter value between 0 and 1.
   * @returns {Array<number>} The [x, y, z] position on the track in world space.
   */
  eval(u) {
    const point = this.curve.getPointAt(u % 1); // Point relative to object origin (already flat)
    const worldPos = new T.Vector3(point.x, point.y, point.z);

    // Apply the object's world matrix to the local point
    this.objects[0].updateWorldMatrix(true, false);
    worldPos.applyMatrix4(this.objects[0].matrixWorld);

    return [worldPos.x, worldPos.y, worldPos.z];
  }

  /**
   * Get the tangent vector (direction) on the track for a given parameter u.
   * Returns the tangent in world coordinates, considering the object's rotation.
   * @param {number} u Parameter value between 0 and 1.
   * @returns {Array<number>} The normalized [dx, dy, dz] tangent vector in world space.
   */
  tangent(u) {
    const tangent = this.curve.getTangentAt(u % 1).normalize(); // Tangent relative to object origin (already flat)
    const worldTan = new T.Vector3(tangent.x, tangent.y, tangent.z);

    // Apply only the rotation part of the object's world matrix
    const rotationMatrix = new T.Matrix4();
    this.objects[0].updateWorldMatrix(true, false);
    rotationMatrix.extractRotation(this.objects[0].matrixWorld);
    worldTan.applyMatrix4(rotationMatrix).normalize();

    return [worldTan.x, worldTan.y, worldTan.z];
  }
}