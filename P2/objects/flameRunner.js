/*jshint esversion: 6 */
// @ts-check

import * as T from "../../libs/CS559-Three/build/three.module.js";
import { GrObject } from "../../libs/CS559-Framework/GrObject.js";
import { LuigiTrack } from "./luigiTrack.js"; // Import LuigiTrack for type hints if needed

// Define materials for the bike parts
const bodyMat  = new T.MeshStandardMaterial({ color: "#d4a017", roughness: 0.7, metalness: 0.3 }); // Slightly darker yellow
const greenMat = new T.MeshStandardMaterial({ color: "darkgreen", roughness: 0.6, metalness: 0.4 });
const redMat   = new T.MeshStandardMaterial({ color: "red", roughness: 0.5, metalness: 0.5 });
const blackMat = new T.MeshStandardMaterial({ color: "black", roughness: 0.8, metalness: 0.2 });
const greyMat  = new T.MeshStandardMaterial({ color: "grey", roughness: 0.4, metalness: 0.6 });
const whiteMat = new T.MeshStandardMaterial({ color: "white", roughness: 0.9, metalness: 0.1 });
const lightMat = new T.MeshStandardMaterial({ color: "white", roughness: 0.5, metalness: 0.5 });

export class FlameRunner extends GrObject {
    /**
     * @param {Object} [params={}] 
     * @param {number} [params.s=1] - Scale
     * @param {number} [params.x=0] - Initial X position (if no track)
     * @param {number} [params.y=0] - Initial Y position (if no track)
     * @param {number} [params.z=0] - Initial Z position (if no track)
     * @param {number} [params.rx=0] - Initial X rotation (if no track)
     * @param {number} [params.ry=0] - Initial Y rotation (if no track)
     * @param {number} [params.rz=0] - Initial Z rotation (if no track)
     * @param {number} [params.speed=1.0] - Speed factor
     * @param {GrObject} [params.firstBoostPanel] - Reference to the first boost panel
     * @param {GrObject} [params.lastBoostPanel] - Reference to the last boost panel
     * @param {LuigiTrack} [track=undefined] - The track object to follow
     */
    constructor(params = {}, track = undefined) { // Add track parameter
        const bikeGroup = new T.Group();

        // Main Body
        const bodyGeom = new T.BoxGeometry(2, 0.5, 0.5);
        bodyGeom.rotateY(Math.PI/2);
        const mainBody = new T.Mesh(bodyGeom, bodyMat);
        mainBody.position.set(0, 0.8, 0);
        bikeGroup.add(mainBody);

        // Wheels
        const wheelRadius = 0.4;
        const wheelThickness = 0.3;
        const wheelGeom = new T.CylinderGeometry(wheelRadius, wheelRadius, wheelThickness, 32);
        const frontWheel = new T.Mesh(wheelGeom, blackMat);
        frontWheel.rotation.z = Math.PI / 2;
        frontWheel.position.set(0, wheelRadius, 1);
        bikeGroup.add(frontWheel);

        const rearWheel = new T.Mesh(wheelGeom.clone(), blackMat);
        rearWheel.rotation.z = Math.PI / 2;
        rearWheel.position.set(0, wheelRadius, -1);
        bikeGroup.add(rearWheel);

        // Green Back Section
        const greenGeom = new T.BoxGeometry(0.9, 0.2, 0.4);
        greenGeom.rotateY(Math.PI/2);
        const greenPart = new T.Mesh(greenGeom, greenMat);
        greenPart.position.set(0, 1.15, -0.5);
        bikeGroup.add(greenPart);

        // Seat
        const seatGeom = new T.BoxGeometry(0.3, 0.1, 0.6);
        const seat = new T.Mesh(seatGeom, blackMat);
        seat.position.set(0, 1.3, -0.5);
        bikeGroup.add(seat);

        // Head
        const headRadius = 0.35;
        const headGeom = new T.SphereGeometry(headRadius, 32, 16);
        const head = new T.Mesh(headGeom, bodyMat);
        head.position.set(0, 1.3, 1);
        bikeGroup.add(head);

        // Headlights
        const lightGeom = new T.SphereGeometry(0.08, 16, 16);
        const leftLight = new T.Mesh(lightGeom, lightMat);
        leftLight.position.set(headRadius * 0.4, head.position.y + headRadius * 0.3, head.position.z + headRadius * 0.7);
        bikeGroup.add(leftLight);

        const rightLight = new T.Mesh(lightGeom.clone(), lightMat);
        rightLight.position.set(-headRadius * 0.4, head.position.y + headRadius * 0.3, head.position.z + headRadius * 0.7);
        bikeGroup.add(rightLight);

        // Horns
        const hornGeom = new T.ConeGeometry(0.08, 0.25, 16);
        const leftHorn = new T.Mesh(hornGeom, whiteMat);
        leftHorn.position.set(headRadius * 0.5, head.position.y + headRadius * 1.0, head.position.z + headRadius * 0.5);
        leftHorn.rotation.set(Math.PI / 6, 0, -Math.PI / 6);
        bikeGroup.add(leftHorn);

        const rightHorn = new T.Mesh(hornGeom.clone(), whiteMat);
        rightHorn.position.set(-headRadius * 0.5, head.position.y + headRadius * 1.0, head.position.z + headRadius * 0.5);
        rightHorn.rotation.set(Math.PI / 6, 0, Math.PI / 6);
        bikeGroup.add(rightHorn);

        // Exhaust Pipes
        const exhaustGeom = new T.CylinderGeometry(0.15, 0.05, 1, 16);
        const leftExhaust = new T.Mesh(exhaustGeom, greyMat);
        leftExhaust.position.set(0.2, 1, -1);
        leftExhaust.rotation.set(-Math.PI / 3, -Math.PI / 10, -Math.PI / 12);
        bikeGroup.add(leftExhaust);

        const rightExhaust = new T.Mesh(exhaustGeom.clone(), greyMat);
        rightExhaust.position.set(-0.2, 1, -1);
        rightExhaust.rotation.set(-Math.PI / 3, Math.PI / 10, Math.PI / 12);
        bikeGroup.add(rightExhaust);


        // Handlebars
        const handleGeom = new T.CylinderGeometry(0.08, 0.08, 1.2, 16);
        const handlebars = new T.Mesh(handleGeom, greyMat);
        handlebars.position.set(0, head.position.y + headRadius * 0.2, head.position.z - headRadius * 0.5);
        handlebars.rotation.set(Math.PI / 2, 0, Math.PI / 2);
        bikeGroup.add(handlebars);

        // Scale and position
        const scale = params.s || 1;
        bikeGroup.scale.set(scale, scale, scale);
        bikeGroup.position.set(params.x || 0, params.y || 0, params.z || 0);
        bikeGroup.rotation.set(params.rx || 0, params.ry || 0, params.rz || 0);

        super("FlameRunner", bikeGroup);
        this.track = track;
        this.u = 0;

        this.firstBoostPanel = params.firstBoostPanel;
        this.lastBoostPanel = params.lastBoostPanel;

        this.isBoosted = false;
        this.boostCountdown = 0;
        this.awaitingBoostEnd = false;
        this.normalSpeed = (params.speed || 1.0) * (0.8 / 10);
        this.boostSpeed = this.normalSpeed * 1.8;
        this.speed = this.normalSpeed;
        this.targetSpeed = this.normalSpeed;

        this.rideable = bikeGroup;
    }

    /**
     * @param {number} delta Time delta in milliseconds.
     */
    stepWorld(delta) {
        // --- Boost Logic ---
        const boostCheckDistance = 1.0; // How close to be to trigger panel
        const vehiclePos = this.objects[0].position; // Get vehicle's world position

        // Handle countdown decrementing only if we are awaiting the end
        if (this.awaitingBoostEnd && this.boostCountdown > 0) {
            this.boostCountdown -= delta;
        }

        if (this.firstBoostPanel && this.lastBoostPanel) { // Check if panels were provided
            const firstPanelPos = new T.Vector3();
            this.firstBoostPanel.objects[0].getWorldPosition(firstPanelPos);
            const lastPanelPos = new T.Vector3();
            this.lastBoostPanel.objects[0].getWorldPosition(lastPanelPos);

            const distToFirst = vehiclePos.distanceTo(firstPanelPos);
            const distToLast = vehiclePos.distanceTo(lastPanelPos);

            // Check for hitting the first panel
            if (!this.isBoosted && distToFirst < boostCheckDistance) {
                // console.log(${this.name} Boost START -> Target: Boost Speed);
                this.isBoosted = true;
                this.targetSpeed = this.boostSpeed; // Set target speed
                this.boostCountdown = 0; // Reset countdown
                this.awaitingBoostEnd = false; // Not awaiting end yet
            }

            // Check for hitting the last panel (while boosted)
            if (this.isBoosted && distToLast < boostCheckDistance) {
                 // Only set countdown and flag if not already counting down from this hit
                if (!this.awaitingBoostEnd || this.boostCountdown <= 0) {
                    this.boostCountdown = 200; // Start/Restart 0.2 second countdown
                    this.awaitingBoostEnd = true; // Now we wait for the countdown
                    // console.log(${this.name} Hit last panel. Countdown SET to: 300ms (Dist: ${distToLast.toFixed(2)}));
                }
            }

            // Check if boost duration (countdown) has expired
            // Only end if we were boosted, awaiting the end, and countdown finished
            if (this.isBoosted && this.awaitingBoostEnd && this.boostCountdown <= 0) {
                 // console.log(${this.name} Boost END -> Target: Normal Speed);
                 this.isBoosted = false;
                 this.targetSpeed = this.normalSpeed; // Set target speed
                 this.boostCountdown = 0; // Explicitly set to 0
                 this.awaitingBoostEnd = false; // Reset flag
            }
        }
        // --- Speed Interpolation ---
        // Use a smaller factor for a more gradual transition
        const lerpFactor = 0.03; 
        this.speed += (this.targetSpeed - this.speed) * lerpFactor;
        // Clamp speed if it overshoots slightly due to discrete steps
        if (this.targetSpeed > this.normalSpeed) {
            this.speed = Math.min(this.speed, this.targetSpeed);
        } else {
            this.speed = Math.max(this.speed, this.targetSpeed);
        }
        // Movement logic
        if (this.track && typeof this.track.eval === 'function' && typeof this.track.tangent === 'function') { // Added tangent check back
            const deltaSeconds = delta / 1000;
            this.u += this.speed * deltaSeconds;
            const pos = this.track.eval(this.u);
            const tan = this.track.tangent(this.u);

            const currentPos = new T.Vector3(pos[0], pos[1], pos[2]);
            this.rideable.position.copy(currentPos);
            this.rideable.position.y += 0.05; // Apply vertical offset

            // Calculate the raw lookAt position based on the tangent
            const lookAtPosRaw = new T.Vector3(
                currentPos.x + tan[0],
                currentPos.y + tan[1], // Use currentPos.y here, not rideable's Y yet
                currentPos.z + tan[2]
            );

            // Create the final lookAt position, forcing its Y to match the rideable's Y
            // This prevents tilting (X-axis rotation) due to track slope
            const lookAtPos = new T.Vector3(
                lookAtPosRaw.x,
                this.rideable.position.y, // Use the bike's actual Y position
                lookAtPosRaw.z
            );

            // Orient +Z along the *horizontal component* of the tangent
            this.rideable.lookAt(lookAtPos);
        }
    }
}
