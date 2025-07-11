import { Combine, NormalMapTypes } from "../constants.js";
import { Color, ColorRepresentation } from "../math/Color.js";
import { Euler } from "../math/Euler.js";
import { Vector2 } from "../math/Vector2.js";
import { Texture } from "../textures/Texture.js";
import { Material, MaterialParameters } from "./Material.js";

export interface MeshPhongMaterialParameters extends MaterialParameters {
    /** geometry color in hexadecimal. Default is 0xffffff. */
    color?: ColorRepresentation | undefined;
    specular?: ColorRepresentation | undefined;
    shininess?: number | undefined;
    opacity?: number | undefined;
    map?: Texture | null | undefined;
    lightMap?: Texture | null | undefined;
    lightMapIntensity?: number | undefined;
    aoMap?: Texture | null | undefined;
    aoMapIntensity?: number | undefined;
    emissive?: ColorRepresentation | undefined;
    emissiveIntensity?: number | undefined;
    emissiveMap?: Texture | null | undefined;
    bumpMap?: Texture | null | undefined;
    bumpScale?: number | undefined;
    normalMap?: Texture | null | undefined;
    normalMapType?: NormalMapTypes | undefined;
    normalScale?: Vector2 | undefined;
    displacementMap?: Texture | null | undefined;
    displacementScale?: number | undefined;
    displacementBias?: number | undefined;
    specularMap?: Texture | null | undefined;
    alphaMap?: Texture | null | undefined;
    envMap?: Texture | null | undefined;
    envMapRotation?: Euler | undefined;
    combine?: Combine | undefined;
    reflectivity?: number | undefined;
    refractionRatio?: number | undefined;
    wireframe?: boolean | undefined;
    wireframeLinewidth?: number | undefined;
    wireframeLinecap?: string | undefined;
    wireframeLinejoin?: string | undefined;
    fog?: boolean | undefined;
    flatShading?: boolean | undefined;
}

export class MeshPhongMaterial extends Material {
    constructor(parameters?: MeshPhongMaterialParameters);

    /**
     * Read-only flag to check if a given object is of type {@link MeshPhongMaterial}.
     * @remarks This is a _constant_ value
     * @defaultValue `true`
     */
    readonly isMeshPhongMaterial: true;

    /**
     * @default new THREE.Color( 0xffffff )
     */
    color: Color;

    /**
     * @default new THREE.Color( 0x111111 )
     */
    specular: Color;

    /**
     * @default 30
     */
    shininess: number;

    /**
     * @default null
     */
    map: Texture | null;

    /**
     * @default null
     */
    lightMap: Texture | null;

    /**
     * @default null
     */
    lightMapIntensity: number;

    /**
     * @default null
     */
    aoMap: Texture | null;

    /**
     * @default null
     */
    aoMapIntensity: number;

    /**
     * @default new THREE.Color( 0x000000 )
     */
    emissive: Color;

    /**
     * @default 1
     */
    emissiveIntensity: number;

    /**
     * @default null
     */
    emissiveMap: Texture | null;

    /**
     * @default null
     */
    bumpMap: Texture | null;

    /**
     * @default 1
     */
    bumpScale: number;

    /**
     * @default null
     */
    normalMap: Texture | null;

    /**
     * @default THREE.TangentSpaceNormalMap
     */
    normalMapType: NormalMapTypes;

    /**
     * @default new Vector2( 1, 1 )
     */
    normalScale: Vector2;

    /**
     * @default null
     */
    displacementMap: Texture | null;

    /**
     * @default 1
     */
    displacementScale: number;

    /**
     * @default 0
     */
    displacementBias: number;

    /**
     * @default null
     */
    specularMap: Texture | null;

    /**
     * @default null
     */
    alphaMap: Texture | null;

    /**
     * @default null
     */
    envMap: Texture | null;

    /**
     * The rotation of the environment map in radians. Default is `(0,0,0)`.
     */
    envMapRotation: Euler;

    /**
     * @default THREE.MultiplyOperation
     */
    combine: Combine;

    /**
     * @default 1
     */
    reflectivity: number;

    /**
     * @default 0.98
     */
    refractionRatio: number;

    /**
     * @default false
     */
    wireframe: boolean;

    /**
     * @default 1
     */
    wireframeLinewidth: number;

    /**
     * @default 'round'
     */
    wireframeLinecap: string;

    /**
     * @default 'round'
     */
    wireframeLinejoin: string;

    /**
     * Define whether the material is rendered with flat shading. Default is false.
     * @default false
     */
    flatShading: boolean;

    /**
     * @deprecated Use {@link MeshStandardMaterial THREE.MeshStandardMaterial} instead.
     */
    metal: boolean;

    /**
     * Whether the material is affected by fog. Default is true.
     * @default fog
     */
    fog: boolean;

    setValues(parameters: MeshPhongMaterialParameters): void;
}
