/// <reference types="node" resolution-mode="require"/>
import { LinkDataEntry } from "./types/LinkDataEntry.js";
import { LinkInfoEntry } from "./types/LinkInfoEntry.js";
export declare function getEntries(info: Buffer): LinkInfoEntry[];
export declare function processEntry(data: Buffer, info: LinkInfoEntry): LinkDataEntry[];
