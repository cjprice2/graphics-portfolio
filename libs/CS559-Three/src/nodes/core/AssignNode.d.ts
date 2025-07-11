import { NodeRepresentation, ShaderNodeObject } from "../tsl/TSLCore.js";
import Node from "./Node.js";
import NodeBuilder from "./NodeBuilder.js";
import TempNode from "./TempNode.js";

export default class AssignNode extends TempNode {
    constructor(targetNode: Node, sourceNode: Node);

    needsSplitAssign(builder: NodeBuilder): boolean;
}

export const assign: (targetNode: NodeRepresentation, sourceNode: NodeRepresentation) => ShaderNodeObject<AssignNode>;

declare module "../tsl/TSLCore.js" {
    interface NodeElements {
        assign: typeof assign;
    }
}
