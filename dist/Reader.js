import{unzipSync as e}from"node:zlib";import{BufferConsumer as r}from"@triforce-heroes/triforce-core/BufferConsumer";export function getEntries(e){let t=[],n=new r(e);for(;!n.isConsumed();)t.push({index:t.length,offset:n.readUnsignedInt32(),sizeCompressed:n.skip(4).readUnsignedInt32(),size:n.skip(4).readUnsignedInt32(),isCompressed:1===n.skip(4).readUnsignedInt32(),group:n.skip(4).read(4),groupSub:n.read(4)});return t}export function processEntry(t,n){let i=t.subarray(n.offset,n.offset+n.size),s=[String(n.index).padStart(4,"0"),n.group.toString("hex").toUpperCase().padStart(8,"0"),n.groupSub.toString("hex").toUpperCase().padStart(8,"0")].join("_");if(!n.isCompressed)return[{index:n.index,name:`${s}.koei`,data:i}];let d=new r(i),a=d.skip(2).readUnsignedInt16(),o=d.readUnsignedInt32();d.skip(4);let p=[];for(let e=0;e<o;e++)p.push(d.readUnsignedInt32());d.skipPadding(128);let g=[];for(let r=0;r<o;r++){let t=`${s}_${String(a).padStart(2,"0")}_${String(r).padStart(4,"0")}`,i=d.read(p[r]),o=120===i.at(4);g.push({index:n.index,indexSub:r,raw:!o,name:`${t+(o?"":"_raw")}.koei`,data:o?e(i.subarray(4)):i}),d.skipPadding(128)}return g}