/// <reference types="node" resolution-mode="require"/>
export declare function rebuild(files: Record<string, Buffer>): {
    indexes: Buffer;
    blocks: Buffer;
};
