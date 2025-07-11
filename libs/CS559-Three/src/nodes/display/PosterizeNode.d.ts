import Node from "../core/Node.js";
import { NodeRepresentation, ShaderNodeObject } from "../tsl/TSLCore.js";

export default class PosterizeNode extends Node {
    sourceNode: Node;
    stepsNode: Node;

    constructor(sourceNode: Node, stepsNode: Node);
}

export const posterize: (
    sourceNode: NodeRepresentation,
    stepsNode: NodeRepresentation,
) => ShaderNodeObject<PosterizeNode>;
