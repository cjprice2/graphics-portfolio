import { Line, PositionalAudio } from '../../../build/three.module.js';

export class PositionalAudioHelper extends Line {
    constructor(audio: PositionalAudio, range?: number, divisionsInnerAngle?: number, divisionsOuterAngle?: number);

    audio: PositionalAudio;
    range: number;
    divisionsInnerAngle: number;
    divisionsOuterAngle: number;

    dispose(): void;
    update(): void;
}
