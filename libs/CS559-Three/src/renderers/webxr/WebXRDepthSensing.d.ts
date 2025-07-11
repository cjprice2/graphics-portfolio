import { Mesh } from "../../objects/Mesh.js";
import { Texture } from "../../textures/Texture.js";
import { WebGLRenderer } from "../WebGLRenderer.js";
import { WebXRArrayCamera } from "./WebXRManager.js";

export class WebXRDepthSensing {
    texture: Texture | null;
    mesh: Mesh | null;

    depthNear: number;
    depthFar: number;

    constructor();

    init(renderer: WebGLRenderer, depthData: XRWebGLDepthInformation, renderState: XRRenderState): void;

    getMesh(cameraXR: WebXRArrayCamera): Mesh | null;

    reset(): void;

    getDepthTexture(): Texture | null;
}
