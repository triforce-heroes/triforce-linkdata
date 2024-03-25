import { existsSync, readdirSync, writeFileSync } from "node:fs";

import { fatal } from "@triforce-heroes/triforce-core/Console";
import { normalize } from "@triforce-heroes/triforce-core/Path";

import { processEntries } from "../Rebuilder.js";

export function RebuildCommand(
  path: string,
  linkData: string,
  linkInfo: string,
) {
  if (!existsSync(path)) {
    fatal(`Directory not found: ${linkData}`);
  }

  process.stdout.write(
    `Rebuilding ${normalize(linkData)} to ${linkData} and ${linkInfo}... `,
  );

  const now = Date.now();

  const { indexes, blocks } = processEntries(path, readdirSync(path));

  writeFileSync(linkInfo, indexes);
  writeFileSync(linkData, blocks);

  process.stdout.write(`OK (${((Date.now() - now) / 1000).toFixed(2)}s)\n`);
}
