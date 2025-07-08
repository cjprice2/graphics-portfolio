/*jshint esversion: 6 */
// @ts-check

import * as T from "../../libs/CS559-Three/build/three.module.js";
import { GrObject } from "../../libs/CS559-Framework/GrObject.js";

// Define materials (simple placeholders)
const poleMat = new T.MeshStandardMaterial({ color: "#696969", roughness: 0.7, metalness: 0.5 }); // Dim Grey

// Load the texture
const textureLoader = new T.TextureLoader();
const bannerTexture = textureLoader.load("../textures/colinKart.png"); // Use relative path

// Use DoubleSide for the PlaneGeometry banner and apply the texture
const bannerMat = new T.MeshStandardMaterial({
    color: "white", // Base color if texture fails to load
    map: bannerTexture, // Apply the loaded texture
    roughness: 0.9,
    side: T.DoubleSide
});
const speakerMat = new T.MeshStandardMaterial({ color: "#404040", roughness: 0.6 }); // Dark Grey

export class FinishBanner extends GrObject {
    constructor(params = {}) {
        const bannerGroup = new T.Group();
        // Call super constructor first, passing the group
        super("FinishBanner", bannerGroup);

        const poleHeight = params.poleHeight || 2;
        const poleRadius = params.poleRadius || 0.1;
        const bannerWidth = params.bannerWidth || 4.5; // Width spanning the track
        const bannerHeight = params.bannerHeight || .6;
        // No bannerDepth needed for PlaneGeometry
        const speakerSize = params.speakerSize || 0.4; // Cube size for speakers
        const speakerOffset = params.speakerOffset || 0.05; // How far speakers stick out from banner sides

        // Segments for the PlaneGeometry
        const bannerWidthSegments = params.widthSegments || 20;
        const bannerHeightSegments = params.heightSegments || 20; 

        // Support Poles
        const poleGeom = new T.CylinderGeometry(poleRadius, poleRadius, poleHeight, 12);
        const pole1 = new T.Mesh(poleGeom, poleMat);
        pole1.position.set(-bannerWidth / 2, poleHeight / 2, 0);
        bannerGroup.add(pole1);

        const pole2 = new T.Mesh(poleGeom, poleMat);
        pole2.position.set(bannerWidth / 2, poleHeight / 2, 0);
        bannerGroup.add(pole2);

        // Banner Plane Geometry
        this.bannerGeom = new T.PlaneGeometry(bannerWidth, bannerHeight, bannerWidthSegments, bannerHeightSegments);
        // Store original vertices for animation
        this.originalVertices = this.bannerGeom.attributes.position.array.slice();
        const banner = new T.Mesh(this.bannerGeom, bannerMat); // Use the material with the texture
        // Position the center of the plane correctly relative to the poles (at Z=0 locally)
        banner.position.y = poleHeight - bannerHeight / 2 - 0.1; 
        bannerGroup.add(banner);

        // Speaker Boxes
        const speakerGeom = new T.BoxGeometry(speakerSize, speakerSize, speakerSize);
        const speaker1 = new T.Mesh(speakerGeom, speakerMat);
        // Position attached to the end of the banner, slightly offset outwards
        speaker1.position.set(-bannerWidth / 2 - speakerSize / 2 - speakerOffset, poleHeight - bannerHeight / 2, 0);
        bannerGroup.add(speaker1);

        const speaker2 = new T.Mesh(speakerGeom, speakerMat);
        speaker2.position.set(bannerWidth / 2 + speakerSize / 2 + speakerOffset, poleHeight - bannerHeight / 2, 0);
        bannerGroup.add(speaker2);

        bannerGroup.position.set(params.x || 0, params.y || 0, params.z || 0);

        this.time = 0; // Initialize time for animation
    }

    /**
     * @param {number} delta - time since last update in milliseconds
     */
    stepWorld(delta) {
        // Ensure delta is a valid number
        if (isNaN(delta) || delta <= 0) return;

        this.time += delta / 1000; // Increment time in seconds

        const positionAttribute = this.bannerGeom.attributes.position;
        const vertices = positionAttribute.array;
        const originalVertices = this.originalVertices;
        const bannerWidth = this.bannerGeom.parameters.width;

        const waveSpeed = 3;
        const waveFrequencyX = 2 * Math.PI / bannerWidth;
        const waveFrequencyY = 2 * Math.PI / this.bannerGeom.parameters.height;
        // Increase amplitude for more pronounced wave
        const waveAmplitude = 0.15; // Increased from 0.1

        for (let i = 0; i < vertices.length; i += 3) {
            const originalX = originalVertices[i];     // Local X (width)
            const originalY = originalVertices[i + 1]; // Local Y (height)
            const originalZ = originalVertices[i + 2]; // Local Z (depth - initially 0 for plane)

            // Pinning factor based on local X
            const normalizedX = (originalX + bannerWidth / 2) / bannerWidth;
            const pinFactor = Math.sin(normalizedX * Math.PI); // 0 at ends, 1 in middle

            // Calculate displacement along the plane's local Z axis
            const displacement = Math.sin(originalX * waveFrequencyX + this.time * waveSpeed)
                * Math.cos(originalY * waveFrequencyY)
                * waveAmplitude
                * pinFactor;

            // Apply displacement to the Z coordinate (local Z)
            vertices[i + 2] = originalZ + displacement;
        }

        // Tell Three.js that the vertices have been updated
        positionAttribute.needsUpdate = true;
        // Recalculate normals for correct lighting after displacement
        this.bannerGeom.computeVertexNormals();
    }
}
