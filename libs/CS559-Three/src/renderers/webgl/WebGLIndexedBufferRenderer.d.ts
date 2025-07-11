export class WebGLIndexedBufferRenderer {
    constructor(gl: WebGLRenderingContext, extensions: any, info: any);

    setMode: (value: any) => void;
    setIndex: (index: any) => void;
    render: (start: any, count: number) => void;
    renderInstances: (start: any, count: number, primcount: number) => void;
    renderMultiDraw: (starts: Int32Array, counts: Int32Array, drawCount: number) => void;
    renderMultiDrawInstances: (
        starts: Int32Array,
        counts: Int32Array,
        drawCount: number,
        primcount: Int32Array,
    ) => void;
}
