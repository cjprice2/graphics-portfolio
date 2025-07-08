/*jshint esversion: 6 */
// @ts-check

import * as T from "../../libs/CS559-Three/build/three.module.js";
import { GrObject } from "../../libs/CS559-Framework/GrObject.js";

let sandPatchCount = 0;

export class SandPatch extends GrObject {
    /**
     * A flat patch of sand defined by a custom shape or a default square.
     * @param {Object} params
     * @param {T.Vector2[]} [params.shapePoints] - An array of T.Vector2 points defining the outline in the XZ plane. If omitted, a default 1x1 square is used.
     * @param {number} [params.x=0] - X position offset for the entire shape.
     * @param {number} [params.y=0.01] - Y position of the *top* surface (slightly above ground).
     * @param {number} [params.z=0] - Z position offset for the entire shape.
     * @param {number} [params.height=0.02] - Thickness of the patch.
     * @param {number} [params.repeat=1] - How many times the texture repeats (approximate, based on bounding box).
     */
    constructor(params = {}) {
        // Create an empty group initially. We'll add the mesh later in the callback.
        const group = new T.Group();
        const name = `SandPatch-${++sandPatchCount}`;
        super(name, group); // Call super with the empty group

        // --- Handle shapePoints: Use provided or default to a square ---
        let shapePoints = params.shapePoints;
        if (!shapePoints || shapePoints.length < 3) {
            if (shapePoints) { // Log if it was provided but invalid
                 console.warn(`SandPatch ${name}: Invalid 'shapePoints' provided. Using default square.`);
            } else {
                 console.warn(`SandPatch ${name}: 'shapePoints' not provided. Using default 1x1 square.`);
            }
            // Default 1x1 square centered at origin (before offset)
            const halfSize = 0.5;
            shapePoints = [
                new T.Vector2(-halfSize, -halfSize),
                new T.Vector2( halfSize, -halfSize),
                new T.Vector2( halfSize,  halfSize),
                new T.Vector2(-halfSize,  halfSize),
                new T.Vector2(-halfSize, -halfSize) // Close the loop
            ];
        }
        // --- End shapePoints handling ---

        const height = params.height || 0.005;
        const yPos = params.y === undefined ? 0.001 : params.y;
        const repeat = params.repeat || 1;
        const offsetX = params.x || 0;
        const offsetZ = params.z || 0;

        // Keep track of loaded textures
        let texturesLoaded = 0;
        const totalTextures = 3;
        const textureLoader = new T.TextureLoader();
        let diffMap, normMap, roughMap; // Declare texture variables

        const checkLoadingComplete = () => {
            if (texturesLoaded === totalTextures) {
                // --- All textures loaded, now create material and mesh ---
                try { // Add error handling for geometry creation
                    // Set texture wrapping and repeat
                    diffMap.wrapS = diffMap.wrapT = T.RepeatWrapping;
                    normMap.wrapS = normMap.wrapT = T.RepeatWrapping;
                    roughMap.wrapS = roughMap.wrapT = T.RepeatWrapping;

                    // Texture repeating based on bounding box
                    const shapeBox = new T.Box2().setFromPoints(shapePoints); // Use the potentially defaulted shapePoints
                    const shapeWidth = shapeBox.max.x - shapeBox.min.x;
                    const shapeDepth = shapeBox.max.y - shapeBox.min.y;
                    const repeatX = repeat * (shapeWidth / Math.max(shapeWidth, shapeDepth) || 1);
                    const repeatY = repeat * (shapeDepth / Math.max(shapeWidth, shapeDepth) || 1);
                    diffMap.repeat.set(repeatX, repeatY);
                    normMap.repeat.set(repeatX, repeatY);
                    roughMap.repeat.set(repeatX, repeatY);

                   

                    // Create the material
                    const sandMat = new T.MeshStandardMaterial({
                        map: diffMap,
                        normalMap: normMap,
                        roughnessMap: roughMap,
                        metalness: 0.1,
                        roughness: 0.5,
                        side: T.DoubleSide
                    });

                    // Create the shape
                    const sandShape = new T.Shape(shapePoints); // Use the potentially defaulted shapePoints

                    // Define extrusion settings
                    const extrudeSettings = {
                        steps: 1,
                        depth: height,
                        bevelEnabled: false,
                    };

                    // Create the geometry
                    const sandGeom = new T.ExtrudeGeometry(sandShape, extrudeSettings);

                    // Create the mesh
                    const sandMesh = new T.Mesh(sandGeom, sandMat);

                    // Position and Orient the Mesh
                    sandMesh.rotation.x = -Math.PI / 2;
                    sandMesh.position.set(offsetX, yPos, offsetZ);

                    // Enable shadows
                 
                    sandMesh.receiveShadow = true;
                    // Add the mesh to the group AFTER it's fully created
                    group.clear(); // Clear any placeholders if needed
                    group.add(sandMesh);
                    console.log(`SandPatch ${name} mesh added successfully.`);

                } catch (e) {
                    console.error(`Error creating geometry/mesh for SandPatch ${name}:`, e);
                    console.error("Shape points used:", shapePoints);
                }
                // --- End creation ---
            }
        };

        // Load textures with callbacks
        diffMap = textureLoader.load("../textures/sand_01_diff_1k.png", () => {
            texturesLoaded++;
            checkLoadingComplete();
        }, undefined, (err) => { console.error(`Error loading sand diff map for ${name}:`, err); });
        normMap = textureLoader.load("../textures/sand_01_nor_gl_1k.png", () => {
            texturesLoaded++;
            checkLoadingComplete();
        }, undefined, (err) => { console.error(`Error loading sand norm map for ${name}:`, err); });
        roughMap = textureLoader.load("../textures/sand_01_rough_1k.png", () => {
            texturesLoaded++;
            checkLoadingComplete();
        }, undefined, (err) => { console.error(`Error loading sand rough map for ${name}:`, err); });
    }

    // No stepWorld needed for a static patch
}
