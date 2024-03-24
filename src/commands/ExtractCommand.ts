import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import { fatal } from "@triforce-heroes/triforce-core/Console";
import { normalize } from "@triforce-heroes/triforce-core/Path";

import { getEntries, processEntry } from "../Reader.js";

export function ExtractCommand(
  linkData: string,
  linkInfo: string,
  output?: string,
) {
  if (!existsSync(linkData)) {
    fatal(`File not found: ${linkData}`);
  }

  if (!existsSync(linkInfo)) {
    fatal(`File not found: ${linkInfo}`);
  }

  const outputPath = normalize(output ?? `${linkData}_contents`);

  if (!existsSync(outputPath)) {
    mkdirSync(outputPath);
  }

  process.stdout.write(
    `Extracting ${normalize(linkData)} to ${outputPath}... `,
  );

  const now = Date.now();

  const data = readFileSync(linkData);
  const entries = getEntries(Buffer.from(readFileSync(linkInfo)));

  for (const entry of entries) {
    for (const dataEntry of processEntry(data, entry)) {
      writeFileSync(join(outputPath, dataEntry.name), dataEntry.data);
    }
  }

  process.stdout.write(`OK (${((Date.now() - now) / 1000).toFixed(2)}s)\n`);
}
