/*jshint esversion: 6 */
// @ts-check

import * as T from "../../libs/CS559-Three/build/three.module.js";
import { GrObject } from "../../libs/CS559-Framework/GrObject.js";
import { Person } from "./person.js"; // Import the Person class

// Define materials
const mainMat = new T.MeshStandardMaterial({ color: "#B0C4DE", roughness: 0.8 }); // Light Steel Blue for main structure
const roofMat = new T.MeshStandardMaterial({ color: "#D3D3D3", roughness: 0.7 }); // Light Grey for roof panel
const pillarMat = new T.MeshStandardMaterial({ color: "#808080", roughness: 0.6 }); // Grey for pillars/truss
const seatMat = new T.MeshStandardMaterial({ color: "#A9A9A9", roughness: 0.9 }); // Darker Grey for seat area

let standsCount = 0;

export class Stands extends GrObject {
    constructor(params = {}) {
        const standsGroup = new T.Group();
        // Call super, passing the name from params directly
        super(params.name || `Stands-${++standsCount}`, standsGroup);

        const length = params.length || 10;
        const depth = 4; // Total depth available (may not be fully used by base)
        const tierHeight = 0.6; // Height of each step
        const tierDepth = 0.8; // Depth of each step
        const numTiers = 4; // Number of steps
        const baseHeight = 0.1; // Small base platform height
        const roofOverhang = 0.5;
        const roofSupportHeight = 1.8; // Height of pillars above the last tier
        const pillarSize = 0.15; // Thickness of pillars/beams
        const pillarSpacing = 2.5; // Spacing between vertical supports

        // Calculate actual depth used by tiers
        const tiersTotalDepth = numTiers * tierDepth;
        const sideWallThickness = 0.1; // Thickness of the side walls

        // --- Base Platform ---
        // Use tiersTotalDepth for the base's depth
        const baseGeom = new T.BoxGeometry(length, baseHeight, tiersTotalDepth);
        const base = new T.Mesh(baseGeom, mainMat);
        base.position.y = baseHeight / 2;
        // Position base so its back aligns with the back of the last tier
        base.position.z = depth - tiersTotalDepth / 2;
        standsGroup.add(base);

        // --- Stepped Tiers ---
        for (let i = 0; i < numTiers; i++) {
            const yPos = baseHeight + i * tierHeight + tierHeight / 2;
            const zPos = depth - (i * tierDepth + tierDepth / 2); // Position from back

            const tierGeom = new T.BoxGeometry(length, tierHeight, tierDepth);
            const tier = new T.Mesh(tierGeom, mainMat);
            tier.position.set(0, yPos, zPos);
            standsGroup.add(tier);

            // Simple seat area visual - Raised slightly to avoid z-fighting
            const seatGeom = new T.BoxGeometry(length * 0.95, 0.05, tierDepth * 0.7);
            const seats = new T.Mesh(seatGeom, seatMat);
            // Increased Y offset slightly (e.g., 0.026 instead of 0.025)
            seats.position.set(0, yPos + tierHeight / 2 - 0.025 + 0.001, zPos);
            standsGroup.add(seats);
        }

        const totalStandHeight = baseHeight + numTiers * tierHeight;
        const roofLevelY = totalStandHeight + roofSupportHeight;
        const backWallZ = depth - tiersTotalDepth + pillarSize * 0.4; // Align with back of base/tiers

        // --- Add Side Walls ---
        // Remove previous side wall implementation
        // const sideWallGeom = new T.BoxGeometry(sideWallThickness, tierHeight, tierDepth);
        // ... (removed loop and base side wall code) ...

        // Create a shape for the side profile
        const sideShape = new T.Shape();
        sideShape.moveTo(0, 0); // Start at bottom front corner (relative Z=depth)
        sideShape.lineTo(0, baseHeight); // Up base height
        for (let i = 0; i < numTiers; i++) {
            sideShape.lineTo(- (i * tierDepth), baseHeight + i * tierHeight); // Back along tier bottom
            sideShape.lineTo(- (i * tierDepth), baseHeight + (i + 1) * tierHeight); // Up tier height
            sideShape.lineTo(- ((i + 1) * tierDepth), baseHeight + (i + 1) * tierHeight); // Back along next tier bottom
        }
        // Close the shape at the back bottom
        sideShape.lineTo(-tiersTotalDepth, baseHeight);
        sideShape.lineTo(-tiersTotalDepth, 0);
        sideShape.lineTo(0, 0);

        const extrudeSettings = {
            steps: 1,
            depth: sideWallThickness,
            bevelEnabled: false
        };

        const sideWallGeom = new T.ExtrudeGeometry(sideShape, extrudeSettings);

        // Left Side Wall
        const leftWall = new T.Mesh(sideWallGeom, mainMat);
        // Position the origin (bottom-front of the shape) at the correct world coordinate
        // Rotate around Y so the shape's X (depth) aligns with world -Z
        // The extrusion (local Z) will then align with world +X (outwards)
        leftWall.position.set(-length / 2, 0, depth);
        leftWall.rotation.y = -Math.PI / 2; // Rotate the other way
        standsGroup.add(leftWall);

        // Right Side Wall
        const rightWall = new T.Mesh(sideWallGeom, mainMat);
        // Position the origin (bottom-front of the shape) at the correct world coordinate
        // Rotate around Y so the shape's X (depth) aligns with world -Z
        // The extrusion (local Z) will then align with world +X (outwards)
        // Need to offset position by thickness because extrusion happens in positive local Z
        rightWall.position.set(length / 2 + sideWallThickness, 0, depth);
        rightWall.rotation.y = -Math.PI / 2; // Rotate the same way as left wall
        standsGroup.add(rightWall);

        // --- Support Pillars ---
        const numPillars = Math.ceil(length / pillarSpacing) + 1;
        const pillarGeom = new T.BoxGeometry(pillarSize, roofLevelY, pillarSize); // Front pillars go up to roof level

        for (let i = 0; i < numPillars; i++) {
            // Calculate pillar X position, ensuring pillars at both ends
            let pillarX = -length / 2 + i * pillarSpacing;
            if (i === numPillars - 1) pillarX = length / 2; // Ensure last pillar is at the end

            // Front Pillars
            const frontPillar = new T.Mesh(pillarGeom, pillarMat);
            // Adjusted front pillar Z slightly back and Y slightly down
            frontPillar.position.set(pillarX, (roofLevelY / 2) - 0.01, depth - pillarSize * 0.6); // Moved back slightly
            standsGroup.add(frontPillar);
        }

        // --- Add Back Wall ---
        // Increase height to reach roof level
        const backWallHeight = roofLevelY - baseHeight;
        const backWallGeom = new T.BoxGeometry(length + 2 * sideWallThickness, backWallHeight, pillarSize * 0.8); // Extend wall to cover side walls
        const backWall = new T.Mesh(backWallGeom, mainMat);
        // Positioned at the back of the tiers
        backWall.position.set(0, baseHeight + backWallHeight / 2, backWallZ);
        standsGroup.add(backWall);

        // --- Roof Structure ---
        // Adjusted roof depth and position to align with pillars/back wall
        const roofActualDepth = depth; // From front pillar to back wall + overhang 
        const roofZPos = depth - roofActualDepth / 2 + roofOverhang / 2; // Adjust center for the extra width, keeping front alignment

        // Flat Roof Panel
        const roofGeom = new T.BoxGeometry(length + 0.5, pillarSize, roofActualDepth);
        const roof = new T.Mesh(roofGeom, roofMat);
        // Raise roof slightly to prevent z-fighting with pillars/wall
        roof.position.set(0, roofLevelY - (pillarSize / 2) + 0.01, roofZPos);
        standsGroup.add(roof);

        // --- Add People ---
        this.people = []; // Array to hold Person GrObject instances
        const personScale = 0.35; // Scale of each person
        const personSpacing = 0.5; // Spacing between people along the length
        const numPeople = Math.floor(length / personSpacing);

        for (let i = 0; i < numTiers; i++) {
            const currentLevelY = baseHeight + i * tierHeight + tierHeight / 2; // Top surface of the level
            const currentLevelZ = depth - (i * tierDepth + tierDepth / 2);     // Front edge of the level

            for (let j = 0; j < numPeople; j++) {
                // Calculate position relative to the standsGroup origin
                const personX = -length / 2 + personSpacing / 2 + j * personSpacing;
                const personY = currentLevelY + 0.3; // Place base of person on the level surface
                const personZ = currentLevelZ - tierDepth * 0.3; // Place slightly back on the level

                const person = new Person({ x: personX, y: personY, z: personZ, s: personScale });

                // Add the visual part (person.objects[0]) to the standsGroup
                standsGroup.add(person.objects[0]);

                // Store the GrObject instance for animation
                this.people.push(person);
            }
        }

        // --- Final Transformations ---
        standsGroup.position.set(params.x || 0, params.y || 0, params.z || 0);
        standsGroup.rotation.set(params.rx || 0, params.ry || 0, params.rz || 0);

        // super() moved to the top of the constructor
    }
} // This closing brace ends the 'Stands' class
