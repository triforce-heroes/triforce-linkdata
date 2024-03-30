import { existsSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import { fatal } from "@triforce-heroes/triforce-core/Console";
import { normalize } from "@triforce-heroes/triforce-core/Path";

import { rebuild } from "../Rebuilder.js";

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

  const { indexes, blocks } = rebuild(
    Object.fromEntries(
      readdirSync(path).map((file) => [file, readFileSync(join(path, file))]),
    ),
  );

  writeFileSync(linkInfo, indexes);
  writeFileSync(linkData, blocks);

  process.stdout.write(`OK (${((Date.now() - now) / 1000).toFixed(2)}s)\n`);
}
