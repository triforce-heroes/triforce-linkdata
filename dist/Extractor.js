import{BufferConsumer as e}from"@triforce-heroes/triforce-core/BufferConsumer";import{inflate as r}from"pako";export function extract(t,a){let n=[],i=new e(a);for(;!i.isConsumed();){let a=i.readUnsignedInt32(),s=i.skip(12).readUnsignedInt32(),o=1===i.skip(4).readUnsignedInt32(),d=i.skip(4).read(4).toString("hex"),p=i.read(4).toString("hex"),f=String(n.length).padStart(4,"0"),h=d.toUpperCase().padStart(8,"0"),u=p.toUpperCase().padStart(8,"0"),g=`${[f,h,u].join("_")}.koei`,m=t.subarray(a,a+s);if(!o){n.push({index:f,name:g,hash:h,hashSub:u,data:m});continue}let k=new e(m),l=k.skip(4).readUnsignedInt32();k.skip(4);let c=[];for(let e=0;e<l;e++)c.push(k.readUnsignedInt32());k.skipPadding(128);let S=[];for(let e=0;e<l;e++){let t=k.read(c[e]);120===t.at(4)?S.push(Buffer.from(r(Uint8Array.from(t.subarray(4))))):S.push(t),k.skipPadding(128)}n.push({index:f,name:g,hash:h,hashSub:u,data:Buffer.concat(S)})}return n}