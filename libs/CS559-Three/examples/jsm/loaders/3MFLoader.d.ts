import { Group, Loader, LoadingManager } from '../../../build/three.module.js';

export class ThreeMFLoader extends Loader<Group> {
    constructor(manager?: LoadingManager);
    availableExtensions: object[];

    parse(data: ArrayBuffer): Group;
    addExtension(extension: object): void;
}
