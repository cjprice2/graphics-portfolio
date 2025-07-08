/*jshint esversion: 6 */
// @ts-check

import * as T from "../../libs/CS559-Three/build/three.module.js";
import { GrObject } from "../../libs/CS559-Framework/GrObject.js";
import { shaderMaterial } from "../../libs/CS559-Framework/shaderHelper.js"; // Import shaderMaterial helper

let boostPanelCount = 0;

// Define border material outside constructor
const borderMat = new T.MeshStandardMaterial({
    color: "#A0522D", // Dark Orange/Brownish color (Sienna)
    roughness: 0.3,   // Lower roughness for more reflection
    metalness: 0.5   // Slightly higher metalness for reflectivity
});

export class BoostPanel extends GrObject {
    /**
     * @param {Object} params
     * @param {string} [params.name="BoostPanel"]
     * @param {number} [params.x=0]
     * @param {number} [params.y=0]
     * @param {number} [params.z=0]
     * @param {number} [params.ry=0]
     * @param {number} [params.rx=0]
     * @param {number} [params.rz=0]
     * @param {number} [params.width=1]
     * @param {number} [params.depth=2]
     * @param {number} [params.height=0.05]
     */
    constructor(params) {
        const width = params.width || 1;
        const depth = params.depth || 2;
        const height = params.height || 0.05;
        const name = params.name || `BoostPanel-${++boostPanelCount}`;

        // Create the ShaderMaterial for the animated part
        let boostMat = shaderMaterial("../shaders/boostPanel.vs", "../shaders/boostPanel.fs", {
            side: T.DoubleSide,
            uniforms: {
                u_time: { value: 0.0 }
            }
        });

        // Create geometry and mesh for the animated part
        const geometry = new T.BoxGeometry(width, height, depth);
        const mesh = new T.Mesh(geometry, boostMat);
        // UV adjustment loop (if needed, though likely not affecting the border)
        const uvAttribute = geometry.attributes.uv;
        for (let i = 0; i < uvAttribute.count; i++) {
            const u = uvAttribute.getX(i);
            const v = uvAttribute.getY(i);
            // This depends on how BoxGeometry maps UVs. You might need to inspect
            // and adjust based on which faces correspond to the top/bottom.
            // For simplicity, we assume default UVs work for a top-down animation.
        }
        geometry.attributes.uv.needsUpdate = true;

        // Create geometry and mesh for the border
        const borderThickness = 0.2; // How much larger the border is
        const borderGeom = new T.BoxGeometry(
            width + borderThickness,
            height - 0.02,
            depth + borderThickness
        );
        const borderMesh = new T.Mesh(borderGeom, borderMat);

        // Group to hold both parts
        const panelGroup = new T.Group();
        panelGroup.add(mesh);       // Add animated part first (optional, but logical)
        panelGroup.add(borderMesh); // Add border

        // Pass the group to the super constructor
        super(name, panelGroup);

        // Store material reference for updating time (still points to the animated material)
        this.material = boostMat;

        // Set initial position and rotation for the whole group
        panelGroup.position.set(params.x || 0, (params.y || 0) + height / 2, params.z || 0);
        panelGroup.rotation.set(params.rx || 0, params.ry || 0, params.rz || 0);

        // Add time tracking property
        this.time = 0;
    }

    /**
     * Update the time uniform for the shader animation.
     * @param {number} delta Time delta in milliseconds
     */
    stepWorld(delta) {
        this.time += delta / 1000; // Increment time in seconds
        // Update the uniform on the correct material
        if (this.material && this.material.uniforms.u_time) {
            this.material.uniforms.u_time.value = this.time;
        }
    }
}
