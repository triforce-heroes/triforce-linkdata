import { readFileSync } from "node:fs";
import { join } from "node:path";

import { BufferBuilder } from "@triforce-heroes/triforce-core/BufferBuilder";

export function processEntries(path: string, files: string[]) {
  const indexes = new BufferBuilder();
  const blocks = new BufferBuilder();

  blocks.write(16);

  for (const file of files) {
    const fileBuffer = readFileSync(join(path, file));

    const [, entryGroup, entryGroupSub] = file.slice(0, -5).split("_") as [
      never,
      string,
      string,
    ];

    indexes.writeUnsignedInt32(blocks.length);
    indexes.write(4);
    indexes.writeUnsignedInt32(fileBuffer.length);
    indexes.write(4);
    indexes.writeUnsignedInt32(fileBuffer.length);
    indexes.write(12);
    indexes.push(
      Buffer.from(entryGroup, "hex"),
      Buffer.from(entryGroupSub, "hex"),
    );

    blocks.push(fileBuffer);
    blocks.pad(16);
  }

  return { indexes: indexes.build(), blocks: blocks.build() };
}
