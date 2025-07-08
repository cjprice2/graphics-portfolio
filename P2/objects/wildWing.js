/*jshint esversion: 6 */
// @ts-check

import * as T from "../../libs/CS559-Three/build/three.module.js";
import { GrObject } from "../../libs/CS559-Framework/GrObject.js";
import { GLTFLoader } from "../../libs/CS559-Three/examples/jsm/loaders/GLTFLoader.js";
import { LuigiTrack } from "./luigiTrack.js"; // Make sure LuigiTrack is imported if needed for type hints

// Removed wildWingCount and wildWingModel cache

export class WildWing extends GrObject {
    /**
     * @param {Object} params
     * @param {string} [params.name="WildWing"] - Name of the object
     * @param {LuigiTrack} params.track - The track object to follow
     * @param {number} [params.s=0.01] - Scale of the model
     * @param {number} [params.speed=1.0] - Base speed factor
     * @param {number} [params.uOffset=0.05] - Initial offset along the track (0 to 1)
     * @param {GrObject} [params.firstBoostPanel] - Reference to the first boost panel
     * @param {GrObject} [params.lastBoostPanel] - Reference to the last boost panel
     */
    constructor(params) {
        // Check track validity early
        if (!params.track || typeof params.track.eval !== 'function') {
             console.error(`WildWing created WITHOUT a valid track object!`);
        }

        let wildWingGroup = new T.Group();
        // Use provided name or default to "WildWing"
        super(params.name || "WildWing", wildWingGroup);

        this.track = params.track;
        // Start slightly behind FlameRunner
        this.u = params.uOffset === undefined ? 0.05 : params.uOffset;

        // Store boost panels
        this.firstBoostPanel = params.firstBoostPanel;
        this.lastBoostPanel = params.lastBoostPanel;

        // Boost state & Speed setup using countdown and flag
        this.isBoosted = false;
        this.boostCountdown = 0; // Countdown timer in milliseconds
        this.awaitingBoostEnd = false; // Flag to indicate last panel was hit
        this.normalSpeed = (params.speed || 1.0) * (0.8 / 10); // Changed 1.0 to 0.8
        this.boostSpeed = this.normalSpeed * 1.8; // Boost speed will also scale down
        this.speed = this.normalSpeed; // Current speed used for movement
        this.targetSpeed = this.normalSpeed; // Target speed to interpolate towards

        // Set rideable to the main group that moves
        this.rideable = wildWingGroup;

        // Load the model directly for this instance
        console.log(`WildWing ${this.name}: Loading model...`); // Log start
        const loader = new GLTFLoader();
        loader.load(
            "../models/wild_wing_mario_kart_wii.glb",
            (gltf) => { // Success callback
                console.log(`WildWing ${this.name}: Model loaded successfully!`);
                const model = gltf.scene; // Use a local variable for the loaded model
                // Apply scale here, inside the loader callback
                const scale = params.s || 1;
                model.scale.set(scale, scale, scale);
                model.traverse((child) => {
                    if (child instanceof T.Mesh) {
                        child.castShadow = true;
                        child.receiveShadow = true;
                    }
                });
                // Add the model to this instance's group
                wildWingGroup.add(model);

                // Rotate the front of the WildWing upwards slightly
                model.rotation.x = -Math.PI / 20; // Adjust the angle as needed (10 degrees here)

                console.log(`WildWing ${this.name}: Added model to group.`);
                // Removed logic for adding model to subsequent instances
            },
            undefined, // Progress callback (optional)
            (error) => { // Error callback
                console.error(`WildWing ${this.name}: Error loading model:`, error);
            }
        );
        // Removed the 'else' block for cached model
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
                // console.log(`${this.name} Boost START -> Target: Boost Speed`);
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
                    // console.log(`${this.name} Hit last panel. Countdown SET to: 300ms (Dist: ${distToLast.toFixed(2)})`);
                }
            }

            // Check if boost duration (countdown) has expired
            // Only end if we were boosted, awaiting the end, and countdown finished
            if (this.isBoosted && this.awaitingBoostEnd && this.boostCountdown <= 0) {
                 // console.log(`${this.name} Boost END -> Target: Normal Speed`);
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
        // Optional: Clamp speed if it overshoots slightly due to discrete steps
        // if (this.targetSpeed > this.normalSpeed) this.speed = Math.min(this.speed, this.targetSpeed);
        // else this.speed = Math.max(this.speed, this.targetSpeed);

        // --- Movement Logic ---
        if (this.track && typeof this.track.eval === 'function' && typeof this.track.tangent === 'function') {
            const deltaSeconds = delta / 1000;
            // Use the current speed (which might be normal or boosted)
            this.u += this.speed * deltaSeconds;

            // Ensure u stays within a reasonable range if track length is known
            // Example if track length corresponds to points array length:
            // this.u %= this.track.points.length;

            const currentU = this.u;
            const pos = this.track.eval(currentU);
            const tan = this.track.tangent(currentU);

            const currentPos = new T.Vector3(pos[0], pos[1], pos[2]);
            this.objects[0].position.copy(currentPos);

            // Adjust Y position slightly above the calculated track point
            this.objects[0].position.y += 0.2; // Raise above ground (Keep existing value)

            const lookAtPos = new T.Vector3(
                currentPos.x + tan[0],
                currentPos.y + tan[1], // Use tangent Y for lookAt direction
                currentPos.z + tan[2]
            );

            // Ensure lookAt is applied only to the WildWing object group
            this.objects[0].lookAt(lookAtPos);
        }
    }
}
