/*jshint esversion: 6 */
// @ts-check

import * as T from "../../libs/CS559-Three/build/three.module.js";
import { GrObject } from "../../libs/CS559-Framework/GrObject.js";

// Define materials
// Load textures for the body
const textureLoader = new T.TextureLoader();
const bodyBaseColorTexture = textureLoader.load("../textures/plaster_brick_pattern_diff_1k.png");
const bodyNormalMapTexture = textureLoader.load("../textures/plaster_brick_pattern_nor_gl_1k.png");
const bodyRoughnessMapTexture = textureLoader.load("../textures/plaster_brick_pattern_rough_1k.png");

// Load textures for the roof/lip
const roofBaseColorTexture = textureLoader.load("../textures/painted_concrete_02_diff_1k.png");
const roofNormalMapTexture = textureLoader.load("../textures/painted_concrete_02_nor_gl_1k.png");
const roofRoughnessMapTexture = textureLoader.load("../textures/painted_concrete_02_rough_1k.png");


// Create textured material for the body sections
const bodyMat = new T.MeshStandardMaterial({
    map: bodyBaseColorTexture,
    normalMap: bodyNormalMapTexture,
    normalScale: new T.Vector2(20, 20),
    roughnessMap: bodyRoughnessMapTexture,
    roughness: 0.8,
    metalness: 0.1
});

// Create textured material for the roof/lip
const roofMat = new T.MeshStandardMaterial({
    map: roofBaseColorTexture,
    normalMap: roofNormalMapTexture,
    roughnessMap: roofRoughnessMapTexture,
    roughness: 0.9, // Adjust as needed for roof material
    metalness: 0.0  // Adjust as needed for roof material
});

export class TallBuilding extends GrObject {
    constructor(params = {}) {
        const buildingGroup = new T.Group();
        // Call super constructor first, passing the group
        super(params.name || "TallBuilding", buildingGroup); 

        // Base Level Dimensions
        const baseWidth = params.baseWidth || 8;
        const baseHeight = params.baseHeight || 5;
        const baseDepth = params.baseDepth || 6;
        const baseRoofHeight = params.baseRoofHeight || 0.4;
        const baseRoofOverhang = params.baseRoofOverhang || 0.3;

        // Top Level Dimensions
        const topWidth = params.topWidth || baseWidth * 0.8; // Narrower than base
        const topHeight = params.topHeight || 4;
        const topDepth = params.topDepth || baseDepth * 0.8; // Shallower than base
        const topRoofHeight = params.topRoofHeight || 0.3;
        const topRoofOverhang = params.topRoofOverhang || 0.2;

        // --- Base Level ---
        const baseGeom = new T.BoxGeometry(baseWidth, baseHeight, baseDepth);
        const base = new T.Mesh(baseGeom, bodyMat); // Apply textured material
        base.position.y = baseHeight / 2; // Base at y=0
        buildingGroup.add(base);

        // --- Base Roof/Lip ---
        const baseRoofWidth = baseWidth + 2 * baseRoofOverhang;
        const baseRoofDepth = baseDepth + 2 * baseRoofOverhang;
        const baseRoofGeom = new T.BoxGeometry(baseRoofWidth, baseRoofHeight, baseRoofDepth);
        const baseRoof = new T.Mesh(baseRoofGeom, roofMat); // Use roof material
        baseRoof.position.y = baseHeight + baseRoofHeight / 2;
        buildingGroup.add(baseRoof);

        // --- Top Level ---
        const topLevelYOffset = baseHeight + baseRoofHeight; // Start top level above base roof
        const topGeom = new T.BoxGeometry(topWidth, topHeight, topDepth);
        const topLevel = new T.Mesh(topGeom, bodyMat); // Apply textured material
        topLevel.position.y = topLevelYOffset + topHeight / 2;
        buildingGroup.add(topLevel);

        // --- Top Roof/Lip ---
        const topRoofWidth = topWidth + 2 * topRoofOverhang;
        const topRoofDepth = topDepth + 2 * topRoofOverhang;
        const topRoofGeom = new T.BoxGeometry(topRoofWidth, topRoofHeight, topRoofDepth);
        const topRoof = new T.Mesh(topRoofGeom, roofMat); // Use roof material
        topRoof.position.y = topLevelYOffset + topHeight + topRoofHeight / 2;
        buildingGroup.add(topRoof);

        // Scale and position the whole building
        const scale = params.s || 1;
        buildingGroup.scale.set(scale, scale, scale);
        buildingGroup.position.set(params.x || 0, params.y || 0, params.z || 0);
        buildingGroup.rotation.set(params.rx || 0, params.ry || 0, params.rz || 0);
    }
}
