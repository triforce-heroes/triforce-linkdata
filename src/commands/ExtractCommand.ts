import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import { fatal } from "@triforce-heroes/triforce-core/Console";
import { normalize } from "@triforce-heroes/triforce-core/Path";

import { extract } from "../Extractor.js";

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

  for (const entry of extract(readFileSync(linkData), readFileSync(linkInfo))) {
    writeFileSync(join(outputPath, entry.name), entry.data);
  }

  process.stdout.write(`OK (${((Date.now() - now) / 1000).toFixed(2)}s)\n`);
}
