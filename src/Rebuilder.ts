import { BufferBuilder } from "@triforce-heroes/triforce-core/BufferBuilder";
import { DeflateFunctionOptions, deflate } from "pako";

type CompressionLevel = DeflateFunctionOptions["level"];

export function rebuild(
  files: Record<string, Buffer>,
  level: CompressionLevel = 1,
) {
  const indexes = new BufferBuilder();
  const blocks = new BufferBuilder();

  blocks.write(16);

  for (const [file, fileBuffer] of Object.entries(files)) {
    const [, entryGroup, entryGroupSub] = file.slice(0, -5).split("_") as [
      never,
      string,
      string,
    ];

    const fileCompressed = Buffer.from(deflate(fileBuffer, { level }));

    if (fileCompressed.length >= fileBuffer.length) {
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

      continue;
    }

    const fileBlock = new BufferBuilder();

    fileBlock.writeUnsignedInt32(0xff_ff + 1);
    fileBlock.writeUnsignedInt32(1);
    fileBlock.writeUnsignedInt32(fileBuffer.length);
    fileBlock.writeUnsignedInt32(fileCompressed.length + 4);
    fileBlock.pad(128);

    fileBlock.writeUnsignedInt32(fileCompressed.length);
    fileBlock.push(fileCompressed);
    fileBlock.pad(128);

    indexes.writeUnsignedInt32(blocks.length);
    indexes.write(4);
    indexes.writeUnsignedInt32(fileBuffer.length);
    indexes.write(4);
    indexes.writeUnsignedInt32(fileBlock.length);
    indexes.write(4);
    indexes.writeUnsignedInt32(1);
    indexes.write(4);
    indexes.push(
      Buffer.from(entryGroup, "hex"),
      Buffer.from(entryGroupSub, "hex"),
    );

    blocks.push(fileBlock.build());
  }

  return { indexes: indexes.build(), blocks: blocks.build() };
}
