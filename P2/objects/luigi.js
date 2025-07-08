/*jshint esversion: 11 */
// @ts-check

import * as T from "../../libs/CS559-Three/build/three.module.js";
import { GrObject } from "../../libs/CS559-Framework/GrObject.js";
import { GLTFLoader } from "../../libs/CS559-Three/examples/jsm/loaders/GLTFLoader.js";

let luigiCount = 0;

export class Luigi extends GrObject {
    /**
     * @param {Object} params
     * @param {number} [params.x=0]
     * @param {number} [params.y=0]
     * @param {number} [params.z=0]
     * @param {number} [params.s=1] - Scale factor for the model
     * @param {number} [params.rotateSpeed=0.5] - Rotation speed in radians per second
     * @param {T.CubeTexture} [params.envMap] - The environment map texture
     */
    constructor(params = {}) {
        let group = new T.Group();
        super(`Luigi-${++luigiCount}`, group);

        this.group = group;
        this.rotateSpeed = params.rotateSpeed === undefined ? 0.5 : params.rotateSpeed;
        this.angle = 0; // Current rotation angle
        const envMap = params.envMap; // Keep envMap param

        // Define the metallic material - Use white for neutral reflections
        const metalMat = new T.MeshStandardMaterial({
            color: "#AAAAAA", // Light gray for a metallic look
            envMap: envMap,
            metalness: 0.99,  // High metalness
            roughness: 0.01,  // Low roughness for sharp reflections
        });

        // Use GLTFLoader
        const loader = new GLTFLoader();
        loader.load(
            "../models/luigi.glb", // Update path to the .glb file
            (gltf) => {
                const loadedScene = gltf.scene; // The loaded model scene

                // Scale the model - GLB might need different scaling
                const scale = params.s || 0.5; // Adjust default scale if needed
                loadedScene.scale.set(scale, scale, scale);

                // Add the loaded scene to the group
                group.add(loadedScene);

                // Enable shadows and replace materials
                loadedScene.traverse((child) => {
                    if (child instanceof T.Mesh) {
                        child.castShadow = true;
                        child.receiveShadow = true;
                        child.material = metalMat;
                    }
                });

                // Store reference if needed
                this.gltfScene = loadedScene;
            },
            undefined, // onProgress callback (optional)
            (error) => {
                console.error(`Error loading luigi.glb: ${error}`);
            }
        );

        // Set initial position of the main group
        group.position.set(params.x || 0, params.y || 0, params.z || 0);
    }

    /**
     * Rotates Luigi around the Y axis.
     * @param {number} delta Time delta in milliseconds
     */
    stepWorld(delta) {
        const deltaSeconds = delta / 1000;
        this.angle += this.rotateSpeed * deltaSeconds;
        // This line rotates the main group, which contains the Luigi model.
        // Since the model is centered within the group, this effectively
        // rotates Luigi around his own vertical axis.
        this.group.rotation.y = this.angle;
    }
}
