import{existsSync as o,mkdirSync as t,readFileSync as r,writeFileSync as e}from"node:fs";import{join as i}from"node:path";import{fatal as n}from"@triforce-heroes/triforce-core/Console";import{normalize as f}from"@triforce-heroes/triforce-core/Path";import{extract as c}from"../Extractor.js";export function ExtractCommand(m,s,a){o(m)||n(`File not found: ${m}`),o(s)||n(`File not found: ${s}`);let d=f(a??`${m}_contents`);o(d)||t(d),process.stdout.write(`Extracting ${f(m)} to ${d}... `);let p=Date.now();for(let o of c(r(m),r(s)))e(i(d,o.name),o.data);process.stdout.write(`OK (${((Date.now()-p)/1e3).toFixed(2)}s)
`)}