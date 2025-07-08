/*jshint esversion: 6 */
// @ts-check

import * as T from "../../libs/CS559-Three/build/three.module.js";
import { GrObject } from "../../libs/CS559-Framework/GrObject.js";
import { ShapeUtils } from "../../libs/CS559-Three/build/three.module.js"; // Import ShapeUtils

let concreteFloorCount = 0;

export class ConcreteFloor extends GrObject {
    /**
     * A flat patch of concrete defined by a custom shape or a default square.
     * @param {Object} params
     * @param {T.Vector2[]} [params.shapePoints] - An array of T.Vector2 points defining the outline in the XZ plane (Vector2.y corresponds to world Z). If omitted, a default 1x1 square is used.
     * @param {number} [params.x=0] - X position offset for the entire shape.
     * @param {number} [params.y=0.01] - Y position of the *top* surface (slightly above ground).
     * @param {number} [params.z=0] - Z position offset for the entire shape.
     * @param {number} [params.repeat=1] - How many times the texture repeats (approximate, based on bounding box).
     */
    constructor(params = {}) {
        const group = new T.Group();
        const name = `ConcreteFloor-${++concreteFloorCount}`;
        super(name, group);

        let shapePoints = params.shapePoints;
        if (!shapePoints || shapePoints.length < 3) {
            // ... (default square shapePoints creation remains the same) ...
            const halfSize = 0.5;
            shapePoints = [
                new T.Vector2(-halfSize, -halfSize), new T.Vector2( halfSize, -halfSize),
                new T.Vector2( halfSize,  halfSize), new T.Vector2(-halfSize,  halfSize),
                // No need to close the loop for ShapeUtils.triangulateShape
            ];
        } else {
             // Ensure shapePoints doesn't have the closing point if it was added
             if (shapePoints.length > 3 && shapePoints[0].equals(shapePoints[shapePoints.length - 1])) {
                 shapePoints = shapePoints.slice(0, -1);
             }
        }

        // Note: Height is not used for BufferGeometry approach
        const yPos = params.y === undefined ? 0.001 : params.y;
        const repeat = params.repeat || 0.25;
        const offsetX = params.x || 0;
        const offsetZ = params.z || 0;

        let texturesLoaded = 0;
        const totalTextures = 3;
        const textureLoader = new T.TextureLoader();
        let diffMap, normMap, roughMap;

        const checkLoadingComplete = () => {
            if (texturesLoaded === totalTextures) {
                try {
                    // --- Texture Setup (same as before) ---
                    diffMap.wrapS = diffMap.wrapT = T.RepeatWrapping;
                    normMap.wrapS = normMap.wrapT = T.RepeatWrapping;
                    roughMap.wrapS = roughMap.wrapT = T.RepeatWrapping;

                    const shapeBox = new T.Box2().setFromPoints(shapePoints);
                    const shapeWidth = shapeBox.max.x - shapeBox.min.x;
                    const shapeDepth = shapeBox.max.y - shapeBox.min.y; // Vector2.y is world Z
                    const maxDim = Math.max(shapeWidth, shapeDepth);
                    // Ensure repeat values are positive
                    const repeatX = Math.max(0.01, repeat * (maxDim > 0 ? shapeWidth / maxDim : 1));
                    const repeatY = Math.max(0.01, repeat * (maxDim > 0 ? shapeDepth / maxDim : 1));
                    diffMap.repeat.set(repeatX, repeatY);
                    normMap.repeat.set(repeatX, repeatY);
                    roughMap.repeat.set(repeatX, repeatY);

                    const anisotropyLevel = 8;
                    diffMap.anisotropy = anisotropyLevel;
                    normMap.anisotropy = anisotropyLevel;
                    roughMap.anisotropy = anisotropyLevel;
                    diffMap.minFilter = T.LinearMipmapLinearFilter;
                    normMap.minFilter = T.LinearMipmapLinearFilter;
                    roughMap.minFilter = T.LinearMipmapLinearFilter;
                    diffMap.magFilter = T.LinearFilter;
                    normMap.magFilter = T.LinearFilter;
                    roughMap.magFilter = T.LinearFilter;
                    diffMap.needsUpdate = true;
                    normMap.needsUpdate = true;
                    roughMap.needsUpdate = true;
                    // --- End Texture Setup ---

                    // --- Material (same as before) ---
                    const concreteMat = new T.MeshStandardMaterial({
                        map: diffMap,
                        normalMap: normMap,
                        roughnessMap: roughMap,
                        metalness: 0.0,
                        roughness: 0.9,
                        color: 0xbbbbbb,
                        side: T.DoubleSide // Use DoubleSide initially, can change if needed
                    });
                    // --- End Material ---

                    // --- Geometry Creation using BufferGeometry ---
                    const geometry = new T.BufferGeometry();

                    // 1. Vertices (Position Attribute) - Directly in XZ plane
                    const vertices = [];
                    shapePoints.forEach(p => {
                        vertices.push(p.x, 0, p.y); // Use Vector2.x for X, 0 for Y, Vector2.y for Z
                    });
                    geometry.setAttribute('position', new T.Float32BufferAttribute(vertices, 3));

                    // 2. UVs (UV Attribute) - Map XZ to UV
                    const uvs = [];
                    shapePoints.forEach(p => {
                        const u = (p.x - shapeBox.min.x) / shapeWidth;
                        const v = (p.y - shapeBox.min.y) / shapeDepth; // Use Vector2.y (world Z) for V
                        uvs.push(u, v);
                    });
                    geometry.setAttribute('uv', new T.Float32BufferAttribute(uvs, 2));

                    // 3. Indices (Triangulation)
                    // ShapeUtils.triangulateShape expects an array of Vector2 and returns face indices
                    const faces = ShapeUtils.triangulateShape(shapePoints, []);
                    const indices = [];
                    faces.forEach(face => {
                        indices.push(face[0], face[1], face[2]);
                    });
                    geometry.setIndex(indices);

                    // 4. Normals - Since it's flat on XZ, normals point up (0, 1, 0)
                    geometry.computeVertexNormals(); // Or manually set normals to [0, 1, 0] for all vertices

                    // --- End Geometry Creation ---

                    // Create the mesh
                    const concreteMesh = new T.Mesh(geometry, concreteMat);

                    // Position the Mesh - No rotation needed!
                    // Apply offsets and the base Y position.
                    concreteMesh.position.set(offsetX, yPos, offsetZ);

                    // Enable shadows
                    concreteMesh.castShadow = false;
                    concreteMesh.receiveShadow = true;

                    group.clear();
                    group.add(concreteMesh);
                    console.log(`ConcreteFloor ${name} mesh added successfully using BufferGeometry.`);

                } catch (e) {
                    console.error(`Error creating geometry/mesh for ConcreteFloor ${name}:`, e);
                    console.error("Shape points used:", shapePoints);
                }
            }
        };

        // --- Texture Loading (same as before) ---
        diffMap = textureLoader.load("../textures/concrete_floor_worn_001_diff_1k.png", () => {
            texturesLoaded++;
            checkLoadingComplete();
        }, undefined, (err) => { console.error(`Error loading concrete diff map for ${name}:`, err); });
        normMap = textureLoader.load("../textures/concrete_floor_worn_001_nor_gl_1k.png", () => {
            texturesLoaded++;
            checkLoadingComplete();
        }, undefined, (err) => { console.error(`Error loading concrete norm map for ${name}:`, err); });
        roughMap = textureLoader.load("../textures/concrete_floor_worn_001_rough_1k.png", () => {
            texturesLoaded++;
            checkLoadingComplete();
        }, undefined, (err) => { console.error(`Error loading concrete rough map for ${name}:`, err); });
        // --- End Texture Loading ---
    }
}
