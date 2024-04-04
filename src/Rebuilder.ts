import { BufferBuilder } from "@triforce-heroes/triforce-core/BufferBuilder";

export function rebuild(files: Record<string, Buffer>) {
  const indexes = new BufferBuilder();
  const blocks = new BufferBuilder();

  blocks.write(16);

  for (const [file, fileBuffer] of Object.entries(files)) {
    const [, entryHash, entryHashSub] = file.slice(0, -5).split("_") as [
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
      Buffer.from(entryHash, "hex"),
      Buffer.from(entryHashSub, "hex"),
    );

    blocks.push(fileBuffer);
    blocks.pad(16);
  }

  return { indexes: indexes.build(), blocks: blocks.build() };
}
