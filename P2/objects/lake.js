/*jshint esversion: 6 */
// @ts-check

import * as T from "../../libs/CS559-Three/build/three.module.js";
import { GrObject } from "../../libs/CS559-Framework/GrObject.js";

export class Lake extends GrObject {

    constructor(params = {}) {
        const lakeGroup = new T.Group();
        super("Lake", lakeGroup);

        // Define the lake shape using a custom Shape with only curves
        const lakeShape = new T.Shape();
        
        // --- Define points from provided coordinates (x, y) ---
        const points = [
            new T.Vector2(0.14, 8.45),
            new T.Vector2(-0.85, 8.22),
            new T.Vector2(-1.82, 7.73),
            new T.Vector2(-2.32, 6.90),
            new T.Vector2(-2.62, 5.98),
            new T.Vector2(-2.27, 4.94),
            new T.Vector2(-1.59, 3.94),
            new T.Vector2(-0.89, 3.44),
            new T.Vector2(-0.06, 3.15),
            new T.Vector2(0.78, 3.50),
            new T.Vector2(1.51, 4.06),
            new T.Vector2(2.19, 4.57),
            new T.Vector2(2.98, 5.27),
            new T.Vector2(3.50, 5.79),
            new T.Vector2(4.29, 6.55),
            new T.Vector2(4.95, 7.14),
            new T.Vector2(5.59, 7.96),
            new T.Vector2(5.48, 8.66),
            new T.Vector2(5.10, 9.37),
            new T.Vector2(4.71, 9.85),
            new T.Vector2(4.12, 10.36),
            new T.Vector2(3.29, 10.63),
            new T.Vector2(2.51, 10.19),
            new T.Vector2(1.57, 9.52),
            new T.Vector2(0.81, 8.99)
        ];

        // Create the shape using splineThru
        lakeShape.moveTo(points[0].x, points[0].y); // Move to the first point
        lakeShape.splineThru(points.slice(1)); // Create a spline through the rest of the points
        // Explicitly close the path back to the start point if splineThru doesn't do it reliably
        lakeShape.lineTo(points[0].x, points[0].y); 

        // Define extrusion settings for a small thickness
        const extrudeSettings = {
            steps: 1,          // Number of steps along the extrusion depth
            depth: 0.05,        // The thickness of the lake
            bevelEnabled: false // No bevel for a simple extrusion
        };

        // Use ExtrudeGeometry instead of ShapeGeometry
        const lakeGeom = new T.ExtrudeGeometry(lakeShape, extrudeSettings);

        // Load the normal map texture
        const textureLoader = new T.TextureLoader();
        const waterNormalMap = textureLoader.load(
            "../textures/waternormals.jpg",
            undefined, // onLoad callback (optional)
            undefined, // onProgress callback (optional)
            (err) => { // onError callback
                console.error("Error loading water normal map texture:", err);
                // Potentially set material's normalMap to null or use a fallback
            }
        );
        waterNormalMap.wrapS = T.RepeatWrapping; // Enable tiling/repeating
        waterNormalMap.wrapT = T.RepeatWrapping;
        // Adjust texture repeat for finer waves
        waterNormalMap.repeat.set(2, 2); 

        // Create a standard material with the normal map and other effects
        const lakeMaterial = new T.MeshStandardMaterial({
            color: 0x5a90c0, // Slightly adjusted blue color
            metalness: 0.7,  // Water is not metallic
            roughness: 0.15, // Slightly increase roughness for softer reflections
            normalMap: waterNormalMap,
            normalScale: new T.Vector2(3,3), // Subtle waves
            side: T.DoubleSide, // Render both sides
            
            // --- Water Effects ---
            envMap: params.envMap || null, // Use skybox for reflections
            transparent: true, // Enable transparency
            opacity: 0.9,      // Make it less transparent (closer to 1.0)
            envMapIntensity: 0.8, // Control the intensity of the environment map reflection
            emissive: 0x102030, // Add a subtle dark blue emissive color
            emissiveIntensity: 0.9 // Control the emissive strength
            // Optional: Transmission for light passing through (can be performance intensive)
            // transmission: 0.9, 
            // ior: 1.33, // Index of refraction for water
        });

        const lakeMesh = new T.Mesh(lakeGeom, lakeMaterial);
        lakeMesh.rotation.x = -Math.PI / 2; // Rotate to lay flat on XZ plane
        // Adjust Y position so the bottom surface is slightly above the sand (y=0.01)
        // Since extrusion depth is 0.1 and it's rotated, the bottom is at local y=0.
        lakeMesh.position.y = 0.02; // Place bottom slightly above sand
        lakeGroup.add(lakeMesh);

        // Manually apply position, rotation, and scale from params
        lakeGroup.position.set(params.x || 0, params.y || 0, params.z || 0);
        lakeGroup.rotation.set(params.rx || 0, params.ry || 0, params.rz || 0);
        const scale = params.s || 1;
        lakeGroup.scale.set(scale, scale, scale);

        // Store references properly
        this.lakeMesh = lakeMesh;
        this.material = lakeMaterial;
    }

    stepWorld(delta) {
        // Animate the normal map texture offset
        if (this.material && this.material.normalMap) {
            const speed = 0.0001; // Adjust speed of animation
            this.material.normalMap.offset.x += speed * delta;
            this.material.normalMap.offset.y += speed * delta * 0.5; // Slightly different speed for y
        }
    }
}
