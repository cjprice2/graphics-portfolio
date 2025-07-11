import { LineSegments, Object3D } from '../../../build/three.module.js';

export class VertexTangentsHelper extends LineSegments {
    constructor(object: Object3D, size?: number, hex?: number);

    object: Object3D;
    size: number;

    update(): void;

    dispose(): void;
}
