/// <reference types="node" resolution-mode="require"/>
import { DeflateFunctionOptions } from "pako";
type CompressionLevel = DeflateFunctionOptions["level"];
export declare function rebuild(files: Record<string, Buffer>, level?: CompressionLevel): {
    indexes: Buffer;
    blocks: Buffer;
};
export {};
