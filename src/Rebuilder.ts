import { readFileSync } from "node:fs";
import { join } from "node:path";
import { deflateSync } from "node:zlib";

import { BufferBuilder } from "@triforce-heroes/triforce-core/BufferBuilder";

type File = [
  index: string,
  group: string,
  groupSub: string,
  compressionFlag: string,
  blockIndex: string,
  blockRaw: string | undefined,
];

function createIndex(
  offset: number,
  size: number,
  sizeCompressed: number,
  isCompressed: boolean,
  group: Buffer,
  groupSub: Buffer,
) {
  const buffer = Buffer.alloc(32);

  buffer.writeUInt32LE(offset, 0);
  buffer.writeUInt32LE(size, 8);
  buffer.writeUInt32LE(sizeCompressed, 16);
  buffer.writeUInt8(Number(isCompressed), 24);

  return Buffer.concat([buffer, group, groupSub]);
}

function pushFileRaw(
  offset: number,
  indexes: Buffer[],
  datas: Buffer[],
  path: string,
  fileIndex: number,
  file: string,
) {
  const [, entryGroup, entryGroupSub] = file.slice(0, -5).split("_") as File;
  const data = readFileSync(join(path, file));

  indexes[fileIndex] = createIndex(
    offset,
    data.length,
    data.length,
    false,
    Buffer.from(entryGroup, "hex"),
    Buffer.from(entryGroupSub, "hex"),
  );

  datas[fileIndex] = data;

  return data.length;
}

function pushFileCompressed(
  offset: number,
  indexes: Buffer[],
  datas: Buffer[],
  path: string,
  fileIndex: number,
  fileReference: string,
  files: string[],
) {
  const [, entryGroup, entryGroupSub] = fileReference
    .slice(0, -5)
    .split("_") as File;

  let sizeUncompressed = 0;

  const blocks: Buffer[] = [];
  const blocksSizes: number[] = [];

  for (const file of files) {
    const blockBuilder = new BufferBuilder();

    // eslint-disable-next-line unicorn/no-unreadable-array-destructuring
    const blockData = readFileSync(join(path, file));

    if (file.includes("_raw")) {
      blocksSizes.push(blockData.length);

      blockBuilder.push(blockData);

      sizeUncompressed += blockData.length;
    } else {
      const blockCompressed = deflateSync(blockData);

      blocksSizes.push(blockCompressed.length + 4);

      blockBuilder.writeUnsignedInt32(blockCompressed.length);
      blockBuilder.push(Buffer.from(blockCompressed));

      sizeUncompressed += blockData.length;
    }

    blockBuilder.pad(128);
    blocks.push(blockBuilder.build());
  }

  const header = new BufferBuilder();

  header.writeUnsignedInt16(0);
  header.writeUnsignedInt16(fileReference.includes("_01_") ? 1 : 2);
  header.writeUnsignedInt32(files.length);
  header.writeUnsignedInt32(sizeUncompressed);

  for (const blockSize of blocksSizes) {
    header.writeUnsignedInt32(blockSize);
  }

  header.pad(128);

  const headerBuilded = header.build();
  const blocksBuilded = Buffer.concat(blocks);

  indexes[fileIndex] = createIndex(
    offset,
    sizeUncompressed,
    headerBuilded.length + blocksBuilded.length,
    true,
    Buffer.from(entryGroup, "hex"),
    Buffer.from(entryGroupSub, "hex"),
  );

  datas[fileIndex] = Buffer.concat([headerBuilded, blocksBuilded]);

  return datas[fileIndex]!.length;
}

export function processEntries(path: string, files: string[]) {
  const indexes: Buffer[] = [];
  const datas: Buffer[] = [];

  const filesIndexes = Object.groupBy(files, (entry) =>
    Number(entry.slice(0, 4)),
  ) as Record<string, string[]>;

  let offset = 16;

  for (const [fileIndex, fileEntries] of Object.entries(filesIndexes)) {
    const fileEntry = fileEntries.at(0)!;

    // Compressed, based on file name length.
    if (fileEntry.length > 26) {
      pushFileCompressed(
        offset,
        indexes,
        datas,
        path,
        Number(fileIndex),
        fileEntry,
        fileEntries,
      );
    } else {
      pushFileRaw(offset, indexes, datas, path, Number(fileIndex), fileEntry);
    }

    offset += datas[Number(fileIndex)]!.length;
  }

  return { indexes, datas };
}
