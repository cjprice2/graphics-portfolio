/*jshint esversion: 6 */
// @ts-check

import * as T from "../../libs/CS559-Three/build/three.module.js";
import { GrObject } from "../../libs/CS559-Framework/GrObject.js";

// Define a simple material for the island
const islandMat = new T.MeshStandardMaterial({
    color: "gray",
    roughness: 0.9,
    metalness: 0.1,
});

let islandCount = 0;

export class Island extends GrObject {
    /**
     * A simple cylindrical island.
     * @param {Object} params
     * @param {number} [params.x=0]
     * @param {number} [params.y=0] - Note: This will be the center Y of the cylinder. Adjust based on desired water level.
     * @param {number} [params.z=0]
     * @param {number} [params.radius=5] - Radius of the island cylinder.
     * @param {number} [params.height=0.5] - Height (thickness) of the island cylinder.
     */
    constructor(params = {}) {
        const radius = params.radius || 2;
        const height = params.height || 0.5;
        const name = `Island-${++islandCount}`;

        // Create the cylinder geometry
        const islandGeom = new T.CylinderGeometry(radius, radius, height, 32); // 32 segments for smoothness

        // Create the mesh
        const islandMesh = new T.Mesh(islandGeom, islandMat);

        // Call super constructor with the mesh
        super(name, islandMesh);

        // Set the position
        // The params.y sets the center of the cylinder. If the lake surface is at y=0,
        // you might want to set the island's y position to height / 2 so its bottom is at y=0.
        islandMesh.position.set(params.x || 0, (params.y || 0) + height / 2, params.z || 0);

        // Optional: Add properties if needed later
        this.radius = radius;
        this.height = height;
    }

    // No stepWorld needed for a static island
}
