import { BufferConsumer } from "@triforce-heroes/triforce-core/BufferConsumer";
import { inflate } from "pako";

import { Entry } from "./types/Entry.js";

export function getEntries(data: Buffer, info: Buffer) {
  const entries: Entry[] = [];

  const infoConsumer = new BufferConsumer(info);

  while (!infoConsumer.isConsumed()) {
    const infoOffset = infoConsumer.readUnsignedInt32();
    const infoSizeBlock = infoConsumer.skip(12).readUnsignedInt32();
    const infoCompressed = infoConsumer.skip(4).readUnsignedInt32() === 1;
    const infoHashDirectory = infoConsumer.skip(4).read(4).toString("hex");
    const infoHashFile = infoConsumer.read(4).toString("hex");

    const infoIndex = String(entries.length).padStart(4, "0");
    const infoHash = infoHashDirectory.toUpperCase().padStart(8, "0");
    const infoHashSub = infoHashFile.toUpperCase().padStart(8, "0");

    const infoName = `${[infoIndex, infoHash, infoHashSub].join("_")}.koei`;

    const infoData = data.subarray(infoOffset, infoOffset + infoSizeBlock);

    if (!infoCompressed) {
      entries.push({
        index: infoIndex,
        name: infoName,
        hash: infoHash,
        hashSub: infoHashSub,
        data: infoData,
      });

      continue;
    }

    const dataConsumer = new BufferConsumer(infoData);
    const dataEntries = dataConsumer.skip(4).readUnsignedInt32();

    dataConsumer.skip(4);

    const consumerSizes: number[] = [];

    for (let i = 0; i < dataEntries; i++) {
      consumerSizes.push(dataConsumer.readUnsignedInt32());
    }

    dataConsumer.skipPadding(128);

    const dataBuffers: Buffer[] = [];

    for (let i = 0; i < dataEntries; i++) {
      const entryData = dataConsumer.read(consumerSizes[i]);
      const entryCompressed = entryData.at(4) === 0x78;

      if (entryCompressed) {
        dataBuffers.push(
          Buffer.from(inflate(Uint8Array.from(entryData.subarray(4)))),
        );
      } else {
        dataBuffers.push(entryData);
      }

      dataConsumer.skipPadding(128);
    }

    entries.push({
      index: infoIndex,
      name: infoName,
      hash: infoHash,
      hashSub: infoHashSub,
      data: Buffer.concat(dataBuffers),
    });
  }

  return entries;
}
