/*jshint esversion: 6 */
// @ts-check

import * as T from "../libs/CS559-Three/build/three.module.js";
import { GrObject } from "../libs/CS559-Framework/GrObject.js";

// Textures and Materials 
let textureLoader = new T.TextureLoader();

// Wall materials
const pyramidWallMaterial = new T.MeshStandardMaterial({
    color: "beige", 
    roughness: 0.5
});
const openGableWallMaterial = new T.MeshStandardMaterial({
    color: "lightblue",
    roughness: 0.5
});

// Door Texture and Material
let doorTexturePath = "../textures/door.png";
let doorTexture = textureLoader.load(doorTexturePath, undefined, undefined, (err) => {
    console.error("Error loading door texture:", err);
});
let doorMaterial = new T.MeshStandardMaterial({
    map: doorTexture,
    roughness: 0.75,
    color: "white" // Fallback color
});

// Window Texture and Material 
let windowTexturePath = "../textures/window.png";
let windowTexture = textureLoader.load(windowTexturePath, undefined, undefined, (err) => {
    console.error("Error loading window texture:", err);
});
let windowMaterial = new T.MeshStandardMaterial({
    map: windowTexture,
    roughness: 0.75,
    color: "white"
});

// Roof Texture and Materials
let roofTexturePath = "../textures/roof.png";
let roofTexture = textureLoader.load(roofTexturePath, undefined, undefined, (err) => {
    console.error("Error loading roof texture:", err);
});
let pyramidRoofMaterial = new T.MeshStandardMaterial({
    map: roofTexture,
    roughness: 0.75,
    color: "brown", // Fallback color
});
let openGableRoofMaterial = new T.MeshStandardMaterial({
    map: roofTexture,
    roughness: 0.75,
    color: "gray", // Fallback color
});



// Simple Tree class (Pine Tree)
export class GrPineTree extends GrObject {
    constructor() {
        let group = new T.Group();
        let trunkH = 0.5, trunkR = 0.08, topH = 1, topR = 0.4;

        let trunkGeo = new T.CylinderGeometry(trunkR, trunkR, trunkH);
        let trunkMat = new T.MeshStandardMaterial({ color: "#8B4513", roughness: 0.9 });
        let trunkMesh = new T.Mesh(trunkGeo, trunkMat);
        trunkMesh.position.y = trunkH / 2;
        group.add(trunkMesh);

        let topGeo = new T.ConeGeometry(topR, topH);
        let topMat = new T.MeshStandardMaterial({ color: "#228B22", roughness: 0.8 });
        let topMesh = new T.Mesh(topGeo, topMat);
        topMesh.position.y = trunkH + topH / 2;
        group.add(topMesh);

        super("PineTree", group);
    }
}

// Building 1: Pyramid Hip Roof House (Base + Pyramid Roof)
export class GrPyramidHipHouse extends GrObject {
    constructor() {
        let group = new T.Group();
        let wallH = 1.0, roofH = 0.7, width = 1.5, depth = 1.5;
        let w2 = width / 2, d2 = depth / 2;

        // Base Box
        let baseGeo = new T.BoxGeometry(width, wallH, depth);
        let baseMesh = new T.Mesh(baseGeo, pyramidWallMaterial);
        baseMesh.position.y = wallH / 2;
        group.add(baseMesh);

        // Pyramid Roof
        let roofGeo = new T.BufferGeometry();
        // 5 unique positions needed
        const baseFL = [-w2, 0, d2]; // Base Front Left
        const baseFR = [ w2, 0, d2]; // Base Front Right
        const baseBR = [ w2, 0,-d2]; // Base Back Right
        const baseBL = [-w2, 0,-d2]; // Base Back Left
        const peak   = [ 0, roofH, 0]; // Peak

        // Arrays for buffer attributes
        const roofPositions = [];
        const roofUVs = [];

        // Define each face by adding its 3 vertices (positions and UVs)
        // We define UVs so V=0 at base, V=1 at peak
        // U goes 0 to 1 along the base edge of each triangle, peak is U=0.5
        // Front Face (+Z)
        roofPositions.push(baseFL[0], baseFL[1], baseFL[2]); roofUVs.push(0.0, 0.0); // Base Left Corner -> U=0, V=0
        roofPositions.push(baseFR[0], baseFR[1], baseFR[2]); roofUVs.push(1.0, 0.0); // Base Right Corner -> U=1, V=0
        roofPositions.push(peak[0], peak[1], peak[2]);       roofUVs.push(0.5, 1.0); // Peak -> U=0.5, V=1

        // Right Face (+X)
        roofPositions.push(baseFR[0], baseFR[1], baseFR[2]); roofUVs.push(0.0, 0.0); // Base Front Corner -> U=0, V=0
        roofPositions.push(baseBR[0], baseBR[1], baseBR[2]); roofUVs.push(1.0, 0.0); // Base Back Corner -> U=1, V=0
        roofPositions.push(peak[0], peak[1], peak[2]);       roofUVs.push(0.5, 1.0); // Peak -> U=0.5, V=1

        // Back Face (-Z)
        roofPositions.push(baseBR[0], baseBR[1], baseBR[2]); roofUVs.push(0.0, 0.0); // Base Right Corner -> U=0, V=0
        roofPositions.push(baseBL[0], baseBL[1], baseBL[2]); roofUVs.push(1.0, 0.0); // Base Left Corner -> U=1, V=0
        roofPositions.push(peak[0], peak[1], peak[2]);       roofUVs.push(0.5, 1.0); // Peak -> U=0.5, V=1

        // Left Face (-X)
        roofPositions.push(baseBL[0], baseBL[1], baseBL[2]); roofUVs.push(0.0, 0.0); // Base Back Corner -> U=0, V=0
        roofPositions.push(baseFL[0], baseFL[1], baseFL[2]); roofUVs.push(1.0, 0.0); // Base Front Corner -> U=1, V=0
        roofPositions.push(peak[0], peak[1], peak[2]);       roofUVs.push(0.5, 1.0); // Peak -> U=0.5, V=1

        // Set attributes
        roofGeo.setAttribute('position', new T.Float32BufferAttribute(roofPositions, 3));
        roofGeo.setAttribute('uv', new T.Float32BufferAttribute(roofUVs, 2));

        // Set indices - triangles are defined sequentially now (0,1,2 then 3,4,5 etc.)
        roofGeo.setIndex([
            0, 1, 2,  // Front face indices
            3, 4, 5,  // Right face indices
            6, 7, 8,  // Back face indices
            9, 10, 11 // Left face indices
        ]);


        roofGeo.setAttribute('uv', new T.Float32BufferAttribute(roofUVs, 2)); // Set the UVs for texture mapping
        roofGeo.computeVertexNormals(); // Compute normals for lighting
        let roofMesh = new T.Mesh(roofGeo, pyramidRoofMaterial);
        roofMesh.position.y = wallH;
        group.add(roofMesh);
        
        // Add features if available
        if (doorMaterial && windowMaterial) {
            let doorW = 0.4, doorH = 0.7;
            let winW = 0.3, winH = 0.4;
            let offset = 0.01;

            // Door on front (+Z)
            let doorGeo = new T.PlaneGeometry(doorW, doorH);
            let doorMesh = new T.Mesh(doorGeo, doorMaterial);
            doorMesh.position.set(0, doorH / 2, depth / 2 + offset);
            group.add(doorMesh);

            // Windows on front (+Z) - To the sides of the door
            let winGeo = new T.PlaneGeometry(winW, winH);
            let winMesh1 = new T.Mesh(winGeo, windowMaterial);
            let winMesh2 = new T.Mesh(winGeo, windowMaterial);
            winMesh1.position.set(width * 0.3, wallH * 0.6, depth / 2 + offset);
            winMesh2.position.set(-width * 0.3, wallH * 0.6, depth / 2 + offset);
            group.add(winMesh1);
            group.add(winMesh2);

            // Windows on sides (-X and +X)
            let sideWinMesh1 = new T.Mesh(winGeo, windowMaterial);
            let sideWinMesh2 = new T.Mesh(winGeo, windowMaterial);
            let sideWinMesh3 = new T.Mesh(winGeo, windowMaterial);
            let sideWinMesh4 = new T.Mesh(winGeo, windowMaterial);
            sideWinMesh1.position.set(-width * 0.5 - offset, wallH * 0.6, depth / 4);
            sideWinMesh2.position.set(width * 0.5 + offset, wallH * 0.6, depth / 4);
            sideWinMesh3.position.set(-width * 0.5 - offset, wallH * 0.6, -depth / 4);
            sideWinMesh4.position.set(width * 0.5 + offset, wallH * 0.6, -depth / 4);
            sideWinMesh1.rotation.y = -Math.PI / 2; // Rotate to face -X direction
            sideWinMesh2.rotation.y = Math.PI / 2; // Rotate to face +X direction
            sideWinMesh3.rotation.y = -Math.PI / 2; // Rotate to face -X direction
            sideWinMesh4.rotation.y = Math.PI / 2; // Rotate to face +X direction
            group.add(sideWinMesh1);
            group.add(sideWinMesh2);
            group.add(sideWinMesh3);
            group.add(sideWinMesh4);
        }

        super("PyramidHipHouse", group);
    }
}

// Building 2: Open Gable Roof House (Base + Prism Roof)
export class GrOpenGableHouse extends GrObject {
    constructor() {
        let group = new T.Group();
        let wallH = 1.0, roofH = 0.5, width = 2.0, depth = 1.0;
        let w2 = width / 2, d2 = depth / 2;

        // Base Box
        let baseGeo = new T.BoxGeometry(width, wallH, depth);
        let baseMesh = new T.Mesh(baseGeo, openGableWallMaterial);
        baseMesh.position.y = wallH / 2;
        group.add(baseMesh);

        const roofGeo = new T.BufferGeometry();

        // 6 unique positions needed for the prism shape
        const posFL = [-w2, 0,  d2]; // 0: Base Front Left
        const posFR = [ w2, 0,  d2]; // 1: Base Front Right
        const posBR = [ w2, 0, -d2]; // 2: Base Back Right
        const posBL = [-w2, 0, -d2]; // 3: Base Back Left
        const posRL = [-w2, roofH, 0]; // 4: Ridge Left
        const posRR = [ w2, roofH, 0]; // 5: Ridge Right

        // Arrays for buffer attributes - we need 14 vertices total
        // (4 for front slope, 4 for back slope, 3 for left gable, 3 for right gable)
        const roofPositions = [];
        const roofUVs = [];

        // Define V=0 at roof base (Y=0 relative), V=1 at ridge (Y=roofH relative)
        // Define U=0..1 across the width or depth of each face

        // Front Slope (+Z side face, quad using 0,1,5,4) -> Use X for U, Y for V
        roofPositions.push(posFL[0], posFL[1], posFL[2]); roofUVs.push(0.0, 0.0); // Vertex 0 (Base Front left)
        roofPositions.push(posFR[0], posFR[1], posFR[2]); roofUVs.push(1.0, 0.0); // Vertex 1 (Base Front right)
        roofPositions.push(posRR[0], posRR[1], posRR[2]); roofUVs.push(1.0, 1.0); // Vertex 2 (Ridge right)
        roofPositions.push(posRL[0], posRL[1], posRL[2]); roofUVs.push(0.0, 1.0); // Vertex 3 (Ridge left)

        // Back Slope (-Z side face, quad using 3,2,5,4) -> Use X for U, Y for V
        roofPositions.push(posBR[0], posBR[1], posBR[2]); roofUVs.push(1.0, 0.0); // Vertex 4 (Base Back right)
        roofPositions.push(posBL[0], posBL[1], posBL[2]); roofUVs.push(0.0, 0.0); // Vertex 5 (Base Back left)
        roofPositions.push(posRL[0], posRL[1], posRL[2]); roofUVs.push(0.0, 1.0); // Vertex 6 (Ridge left)
        roofPositions.push(posRR[0], posRR[1], posRR[2]); roofUVs.push(1.0, 1.0); // Vertex 7 (Ridge right)

        // Left Gable End (-X side face, triangle using 3,0,4) -> Use Z for U, Y for V
        roofPositions.push(posBL[0], posBL[1], posBL[2]); roofUVs.push(0.0, 0.0); // Vertex 8 (Base Back) Z=-d2 -> U=0
        roofPositions.push(posFL[0], posFL[1], posFL[2]); roofUVs.push(1.0, 0.0); // Vertex 9 (Base Front) Z= d2 -> U=1
        roofPositions.push(posRL[0], posRL[1], posRL[2]); roofUVs.push(0.5, 1.0); // Vertex 10 (Ridge) Z=0 -> U=0.5, V=1

        // Right Gable End (+X side face, triangle using 1,2,5) -> Use Z for U, Y for V
        roofPositions.push(posFR[0], posFR[1], posFR[2]); roofUVs.push(1.0, 0.0); // Vertex 11 (Base Front) Z= d2 -> U=1
        roofPositions.push(posBR[0], posBR[1], posBR[2]); roofUVs.push(0.0, 0.0); // Vertex 12 (Base Back) Z=-d2 -> U=0
        roofPositions.push(posRR[0], posRR[1], posRR[2]); roofUVs.push(0.5, 1.0); // Vertex 13 (Ridge) Z=0 -> U=0.5, V=1


        // Set attributes
        roofGeo.setAttribute('position', new T.Float32BufferAttribute(roofPositions, 3));
        roofGeo.setAttribute('uv', new T.Float32BufferAttribute(roofUVs, 2));

        // Indices for the faces using the new vertex order (0-13)
        const roofIndices = [
            // Front Slope (vertices 0, 1, 2, 3) - two triangles
            0, 1, 2,   0, 2, 3,
            // Back Slope (vertices 4, 5, 6, 7) - two triangles
            4, 5, 6,   4, 6, 7,
            // Left Gable (vertices 8, 9, 10) - one triangle
            8, 9, 10,
            // Right Gable (vertices 11, 12, 13) - one triangle
            11, 12, 13
        ];
        roofGeo.setIndex(roofIndices); // Total 18 indices (6 triangles)

        roofGeo.computeVertexNormals(); // Compute normals for lighting

        let roofMesh = new T.Mesh(roofGeo, openGableRoofMaterial);
        roofMesh.position.y = wallH;
        group.add(roofMesh);

        // Add textures if available
        if (doorMaterial && windowMaterial) {
            let doorW = 0.4, doorH = 0.7;
            let winW = 0.3, winH = 0.4;
            let offset = 0.01;

            // Door on front (+Z)
            let doorGeo = new T.PlaneGeometry(doorW, doorH);
            let doorMesh = new T.Mesh(doorGeo, doorMaterial);
            doorMesh.position.set(0, doorH / 2, depth / 2 + offset);
            group.add(doorMesh);

            // Windows on front (+Z) - To the sides of the door
            let winGeo = new T.PlaneGeometry(winW, winH);
            let winMesh1 = new T.Mesh(winGeo, windowMaterial);
            let winMesh2 = new T.Mesh(winGeo, windowMaterial);
            winMesh1.position.set(width * 0.3, wallH * 0.6, depth / 2 + offset);
            winMesh2.position.set(-width * 0.3, wallH * 0.6, depth / 2 + offset);
            group.add(winMesh1);
            group.add(winMesh2);

            // Windows on sides (-X and +X)
            let sideWinMesh1 = new T.Mesh(winGeo, windowMaterial);
            let sideWinMesh2 = new T.Mesh(winGeo, windowMaterial);
            sideWinMesh1.position.set(-width * 0.5 - offset, wallH * 0.6, 0);
            sideWinMesh2.position.set(width * 0.5 + offset, wallH * 0.6, 0);
            sideWinMesh1.rotation.y = -Math.PI / 2; // Rotate to face -X direction
            sideWinMesh2.rotation.y = Math.PI / 2; // Rotate to face +X direction
            group.add(sideWinMesh1);
            group.add(sideWinMesh2);
        }

        super("OpenGableHouse", group);
    }
}
