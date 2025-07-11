import { Object3D } from "../../core/Object3D.js";
import Node from "../core/Node.js";
import { ShaderNodeObject } from "../tsl/TSLCore.js";

export default class Object3DNode extends Node {
    scope: string;
    object3d: Object3D | null;

    constructor(scope: string, object3d?: Object3D | null);

    static WORLD_MATRIX: "worldMatrix";
    static POSITION: "position";
    static SCALE: "scale";
    static VIEW_POSITION: "viewPosition";
    static DIRECTION: "direction";
}

export const objectDirection: (object3d: Object3D) => ShaderNodeObject<Object3DNode>;
export const objectWorldMatrix: (object3d: Object3D) => ShaderNodeObject<Object3DNode>;
export const objectPosition: (object3d: Object3D) => ShaderNodeObject<Object3DNode>;
export const objectScale: (object3d: Object3D) => ShaderNodeObject<Object3DNode>;
export const objectViewPosition: (object3d: Object3D) => ShaderNodeObject<Object3DNode>;
