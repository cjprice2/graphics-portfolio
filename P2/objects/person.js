/*jshint esversion: 6 */
// @ts-check

import * as T from "../../libs/CS559-Three/build/three.module.js";
import { GrObject } from "../../libs/CS559-Framework/GrObject.js";

// Simple function to generate a random bright HSL color
function getRandomBrightColor() {
    const hue = Math.random();
    const saturation = 0.7 + Math.random() * 0.3; // High saturation
    const lightness = 0.5 + Math.random() * 0.2; // Medium to high lightness
    return new T.Color().setHSL(hue, saturation, lightness);
}

let personCount = 0; // Unique ID counter

export class Person extends GrObject {
    /**
     * @param {Object} params
     * @param {number} [params.x=0]
     * @param {number} [params.y=0]
     * @param {number} [params.z=0]
     * @param {number} [params.s=1] - Scale
     */
    constructor(params = {}) {
        // The main group that GrObject manages
        const personRootGroup = new T.Group(); 

        // Appearance
        const color = getRandomBrightColor();
        const material = new T.MeshStandardMaterial({
            color: color,
            roughness: 0.8,
            metalness: 0.1
        });

        // Dimensions (relative to scale s)
        const bodyHeight = 0.8;
        const bodyRadius = 0.2;
        const headRadius = 0.3;

        // Body
        const bodyGeom = new T.CylinderGeometry(bodyRadius, bodyRadius, bodyHeight, 16);
        const body = new T.Mesh(bodyGeom, material);
        body.position.y = bodyHeight / 2; // Base at y=0 relative to root group
        personRootGroup.add(body); // Add directly to root group

        // Head
        const headGeom = new T.SphereGeometry(headRadius, 16, 16);
        const head = new T.Mesh(headGeom, material);
        head.position.y = bodyHeight + headRadius * 0.8; // Position on top of body
        personRootGroup.add(head); // Add directly to root group

        // REMOVED Arm creation code

        // Set initial transformations for the ROOT group
        const scale = params.s || 0.3; // Default scale if not provided
        personRootGroup.scale.set(scale, scale, scale);
        personRootGroup.position.set(params.x || 0, params.y || 0, params.z || 0);

        // Pass the ROOT group to the GrObject constructor
        super(`Person-${++personCount}`, personRootGroup); 
    }
}
