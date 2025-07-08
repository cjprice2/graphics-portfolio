import * as T from "../libs/CS559-Three/build/three.module.js"; 
import { GrObject } from "../libs/CS559-Framework/GrObject.js"; 
import { ColladaLoader } from "../libs/CS559-Three/examples/jsm/loaders/ColladaLoader.js";
import { TextureLoader } from "../libs/CS559-Three/build/three.module.js"; 

// Define FunkyKong GrObject
export class FunkyKong extends GrObject {
    constructor(params = {}) {
        let group = new T.Group();
        super("FunkyKong", group);
        this.group = group;
        this.radius = params.radius || 4; // Radius of the circle
        this.speed = params.speed || 0.0005; // Speed of rotation
        this.angle = 0; // Initial angle
        this.y_pos = params.y || 0.5; // Height off the ground
        this.bobSpeed = params.bobSpeed || 2.0; // Cycles per second for bobbing
        this.bobHeight = params.bobHeight || 0.5; // Height of bobbing
        this.spinSpeed = params.spinSpeed || 1.0; // Rotations per second for spinning
        this.moveRange = params.moveRange || 2.0; // How far side-to-side (along Z)
        this.moveSpeed = params.moveSpeed || 1.0; // Cycles per second for side-to-side movement
        this.baseY = params.y || 1.0; // Base height for bobbing
        this.baseX = params.x || 0; // Base X position
        this.baseZ = params.z || 0; // Base Z position
        this.time = 0; // Initialize time for animation state

        // Create a texture loader
        const textureLoader = new TextureLoader();
        const funkyTexture = textureLoader.load("../textures/funky_all.png", texture => {
            texture.flipY = true; // NEEDS to be flipped
            texture.needsUpdate = true;
            console.log("Funky Kong texture loaded.");
        }, undefined, error => {
            console.error("Error loading Funky Kong texture:", error);
        });

        let loader = new ColladaLoader();
        // Ensure texture files referenced within funkyKong.dae are correctly located.
        loader.load("../models/funkyKong.dae", (collada) => {
            let dae = collada.scene;
            // Scale and position the model
            dae.scale.set(0.01, 0.01, 0.01); // Adjust scale as needed
            dae.rotation.x = 0; // Rotate to face upwards 

            // Traverse the loaded model to apply the texture uniformly
            dae.traverse((node) => {
                // Use instanceof to check if the node is a Mesh
                if (node instanceof T.Mesh) {
                    // Ensure materials are always processed as an array
                    const materials = Array.isArray(node.material) ? node.material : [node.material];
                    materials.forEach(material => {
                        // Check if the material exists before modifying
                        if (material) {
                            material.map = funkyTexture; // Apply the loaded texture
                            material.needsUpdate = true; // Ensure the material updates visually
                        }
                    });
                }
            });

            // We'll set the group's position in stepWorld, no need to set dae position y here
            this.group.add(dae);
            this.model = dae; // Store reference if needed later, e.g., for specific animations
            console.log("Funky Kong model loaded.");
        }, undefined, (error) => {
            console.error("Error loading Funky Kong model:", error);
        });
        // Set initial height
        this.group.position.y = this.y_pos;
    }
}