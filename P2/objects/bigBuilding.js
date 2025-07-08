/*jshint esversion: 6 */
// @ts-check

import * as T from "../../libs/CS559-Three/build/three.module.js";
import { GrObject } from "../../libs/CS559-Framework/GrObject.js";

// Define materials
// Load textures for the body
const textureLoader = new T.TextureLoader();
const bodyBaseColorTexture = textureLoader.load("../textures/plaster_brick_pattern_diff_1k.png"); // Body Diffuse/Color map
const bodyNormalMapTexture = textureLoader.load("../textures/plaster_brick_pattern_nor_gl_1k.png"); // Body Normal map
const bodyRoughnessMapTexture = textureLoader.load("../textures/plaster_brick_pattern_rough_1k.png"); // Body Roughness map

// Load textures for the roof/lip
const roofBaseColorTexture = textureLoader.load("../textures/painted_concrete_02_diff_1k.png");
const roofNormalMapTexture = textureLoader.load("../textures/painted_concrete_02_nor_gl_1k.png");
const roofRoughnessMapTexture = textureLoader.load("../textures/painted_concrete_02_rough_1k.png");


// Create textured material for the body
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

export class BigBuilding extends GrObject {
    constructor(params = {}) {
        const buildingGroup = new T.Group();

        const width = params.width || 11;
        const height = params.height || 6;
        const depth = params.depth || 6;
        const lipHeight = params.lipHeight || 1;
        const lipOverhang = params.lipOverhang || 0.3; // How much the lip sticks out

        // Main Building Body
        const bodyGeom = new T.BoxGeometry(width, height, depth);
        const body = new T.Mesh(bodyGeom, bodyMat); // Use the new textured material
        body.position.y = height / 2; // Position base at y=0
        // Enable casting and receiving shadows for the body
        body.castShadow = true;
        body.receiveShadow = true;
        buildingGroup.add(body);

        // Top Lip
        const lipWidth = width + 2 * lipOverhang;
        const lipDepth = depth + 2 * lipOverhang;
        const lipGeom = new T.BoxGeometry(lipWidth, lipHeight, lipDepth);
        const lip = new T.Mesh(lipGeom, roofMat); // Use the new roof material
        lip.position.y = height + lipHeight / 2; // Position on top of the body
        // Enable casting and receiving shadows for the lip
        lip.castShadow = true;
        lip.receiveShadow = true;
        buildingGroup.add(lip);

        // Scale and position the whole building
        const scale = params.s || 1;
        buildingGroup.scale.set(scale, scale, scale);
        buildingGroup.position.set(params.x || 0, params.y || 0, params.z || 0);
        buildingGroup.rotation.set(params.rx || 0, params.ry || 0, params.rz || 0);

        super(params.name || "BigBuilding", buildingGroup);
    }
}
