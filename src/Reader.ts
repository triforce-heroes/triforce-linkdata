import { unzipSync } from "node:zlib";

import { BufferConsumer } from "@triforce-heroes/triforce-core/BufferConsumer";

import { LinkDataEntry } from "./types/LinkDataEntry.js";
import { LinkInfoEntry } from "./types/LinkInfoEntry.js";

export function getEntries(info: Buffer) {
  const entries = new Array<LinkInfoEntry>();
  const consumer = new BufferConsumer(info);

  while (!consumer.isConsumed()) {
    entries.push({
      index: entries.length,
      offset: consumer.readUnsignedInt32(),
      sizeCompressed: consumer.skip(4).readUnsignedInt32(),
      size: consumer.skip(4).readUnsignedInt32(),
      isCompressed: consumer.skip(4).readUnsignedInt32() === 1,
      group: consumer.skip(4).read(4),
      groupSub: consumer.read(4),
    });
  }

  return entries;
}

export function processEntry(
  data: Buffer,
  info: LinkInfoEntry,
): LinkDataEntry[] {
  const infoData = data.subarray(info.offset, info.offset + info.size);
  const infoPath = [
    String(info.index).padStart(4, "0"),
    info.group.toString("hex").toUpperCase().padStart(8, "0"),
    info.groupSub.toString("hex").toUpperCase().padStart(8, "0"),
  ].join("_");

  if (!info.isCompressed) {
    return [
      {
        index: info.index,
        name: `${infoPath}.koei`,
        data: infoData,
      },
    ];
  }

  const consumer = new BufferConsumer(infoData);

  const consumerUnknown = consumer.skip(2).readUnsignedInt16();
  const consumerEntries = consumer.readUnsignedInt32();

  consumer.skip(4); // Size (total).

  const consumerSizes: number[] = [];

  for (let i = 0; i < consumerEntries; i++) {
    consumerSizes.push(consumer.readUnsignedInt32());
  }

  consumer.skipPadding(128);

  const entries: LinkDataEntry[] = [];

  for (let i = 0; i < consumerEntries; i++) {
    const entryName = `${infoPath}_${String(consumerUnknown).padStart(2, "0")}_${String(i).padStart(4, "0")}`;
    const entryData = consumer.read(consumerSizes[i]);
    const entryCompressed = entryData.at(4) === 0x78;

    entries.push({
      index: info.index,
      indexSub: i,
      raw: !entryCompressed,
      name: `${entryName + (entryCompressed ? "" : "_raw")}.koei`,
      data: entryCompressed ? unzipSync(entryData.subarray(4)) : entryData,
    });

    consumer.skipPadding(128);
  }

  return entries;
}
