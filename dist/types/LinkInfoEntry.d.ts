/// <reference types="node" resolution-mode="require"/>
export interface LinkInfoEntry {
    index: number;
    offset: number;
    sizeCompressed: number;
    size: number;
    isCompressed: boolean;
    group: Buffer;
    groupSub: Buffer;
}
