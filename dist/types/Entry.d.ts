/// <reference types="node" resolution-mode="require"/>
export interface Entry {
    index: string;
    name: string;
    hash: string;
    hashSub: string;
    data: Buffer;
}
