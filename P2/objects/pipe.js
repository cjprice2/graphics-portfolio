/*jshint esversion: 6 */
// @ts-check

import * as T from "../../libs/CS559-Three/build/three.module.js";
import { GrObject } from "../../libs/CS559-Framework/GrObject.js";

// Define materials
const pipeMat = new T.MeshStandardMaterial({ color: "green", roughness: 0.9, metalness: 0.6 }); // Changed to green
const insideMat = new T.MeshStandardMaterial({ color: "black", roughness: 0.9 });

export class Pipe extends GrObject {
    constructor(params = {}) {
        const pipeGroup = new T.Group();

        const radius = params.radius || 0.8;
        const height = params.height || .8;
        const lipHeight = (params.lipHeight || 0.25); // Made lip slightly taller
        const lipRadius = radius * 1.2; // Made lip slightly wider
        const radialSegments = params.segments || 30; // Number of segments around the pipe

        // Main Pipe Body
        const bodyGeom = new T.CylinderGeometry(radius, radius, height, radialSegments);
        const body = new T.Mesh(bodyGeom, pipeMat);
        body.position.y = height / 2; // Position base at y=0
        pipeGroup.add(body);

        // Pipe Lip
        const lipGeom = new T.CylinderGeometry(lipRadius, lipRadius, lipHeight, radialSegments);
        const lip = new T.Mesh(lipGeom, pipeMat);
        lip.position.y = height + lipHeight / 2; // Position on top of the body
        pipeGroup.add(lip);

        // Top Black Opening (Hole)
        // Use a circle slightly smaller than the inner radius and slightly below the lip top
        const topGeom = new T.CircleGeometry(radius * 0.95, radialSegments);
        const top = new T.Mesh(topGeom, insideMat); // Ensure black material
        top.position.y = height + lipHeight + 0.01; // Position just above the top surface
        top.rotation.x = -Math.PI / 2; // Rotate to face upwards
        pipeGroup.add(top);

        // Call super, passing the name from params directly
        super(params.name || "Pipe", pipeGroup);

        // Scale and position the whole pipe
        const scale = params.s || 1;
        pipeGroup.scale.set(scale, scale, scale);
        pipeGroup.position.set(params.x || 0, params.y || 0, params.z || 0);
        pipeGroup.rotation.set(params.rx || 0, params.ry || 0, params.rz || 0);
    }
}
