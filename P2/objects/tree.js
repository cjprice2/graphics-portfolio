/*jshint esversion: 6 */
// @ts-check

import * as T from "../../libs/CS559-Three/build/three.module.js";
import { GrObject } from "../../libs/CS559-Framework/GrObject.js";

// Load Trunk Textures
const textureLoader = new T.TextureLoader();
const trunkColorTexture = textureLoader.load("../textures/pine_bark_diff_1k.png"); 
const trunkNormalTexture = textureLoader.load("../textures/pine_bark_nor_gl_1k.png"); 
const trunkRoughnessTexture = textureLoader.load("../textures/pine_bark_rough_1k.png"); 

// Define Trunk Material with Textures
const trunkMat = new T.MeshStandardMaterial({
    map: trunkColorTexture,
    normalMap: trunkNormalTexture,
    roughnessMap: trunkRoughnessTexture,
    // roughness: 0.8, // You might remove or adjust this depending on your roughness map
});

// Load Foliage Textures
const foliageColorTexture = textureLoader.load("../textures/Stylized_Leaves_002_basecolor.jpg");
const foliageNormalTexture = textureLoader.load("../textures/Stylized_Leaves_002_normal.jpg");
const foliageRoughnessTexture = textureLoader.load("../textures/Stylized_Leaves_002_roughness.jpg");

// Define Foliage Material with Textures
const foliageMat = new T.MeshStandardMaterial({
    map: foliageColorTexture,
    normalMap: foliageNormalTexture,
    roughnessMap: foliageRoughnessTexture,
});

export class Tree extends GrObject {
    constructor(params = {}) {
        const treeGroup = new T.Group();

        // Trunk
        const trunkRadius = 0.2;
        const trunkHeight = 0.5;
        const trunkGeom = new T.CylinderGeometry(trunkRadius * 0.8, trunkRadius, trunkHeight, 16);
        const trunk = new T.Mesh(trunkGeom, trunkMat); // Material is now textured
        trunk.position.y = trunkHeight / 2; // Position base at y=0
        treeGroup.add(trunk);

        // Foliage (approximated as a sphere)
        const foliageRadius = 1.0;
        const foliageGeom = new T.SphereGeometry(foliageRadius, 32, 16);
        const foliage = new T.Mesh(foliageGeom, foliageMat); // Use the updated material
        // Position foliage on top of the trunk
        const initialFoliageY = trunkHeight + foliageRadius * 0.8; // Adjust overlap
        foliage.position.y = initialFoliageY;
        treeGroup.add(foliage);
        
        // Call super, passing the name from params directly
        super(params.name || "Tree", treeGroup); 

        // Store foliage mesh and initial position for animation
        this.foliage = foliage;
        this.initialFoliageY = initialFoliageY;
        this.swayTime = 0; // Initialize time accumulator for sway
        // Add a random factor to the sway speed for variation
        this.swaySpeedFactor = 0.8 + Math.random() * 0.4; // Range: 0.8 to 1.2

        // Apply transformations from params
        const scale = params.s || 1;
        treeGroup.scale.set(scale, scale, scale);
        treeGroup.position.set(params.x || 0, params.y || 0, params.z || 0);
        treeGroup.rotation.set(params.rx || 0, params.ry || 0, params.rz || 0);
    }

    stepWorld(delta) {
        // Increment the internal time using delta (convert ms to seconds)
        this.swayTime += delta / 1000;

        // Simple sway animation for foliage
        const swayAmplitude = 0.05; // How far it moves side to side
        const baseSwaySpeed = 3;   // Base speed before randomization
        const bobAmplitude = 0.01; // How much it moves down at the peaks

        // Apply the instance-specific speed factor
        const swaySpeed = baseSwaySpeed * this.swaySpeedFactor;

        // Calculate horizontal sway offset using sine wave
        const swayOffset = Math.sin(this.swayTime * swaySpeed) * swayAmplitude;

        // Calculate vertical bob offset using cosine (double frequency)
        // Cosine goes from 1 (center) to -1 (peaks). We want it to be 0 at center and 1 at peaks.
        // (1 - cos(2*angle)) / 2 maps the range [1, -1] to [0, 1]
        const bobOffset = (1 - Math.cos(this.swayTime * swaySpeed * 2)) / 2 * bobAmplitude;

        // Apply the offsets
        this.foliage.position.x = swayOffset;
        // Subtract the bob offset from the initial Y position
        this.foliage.position.y = this.initialFoliageY - bobOffset;
    }
}
