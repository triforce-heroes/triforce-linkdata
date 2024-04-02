import { Command } from "commander";

import { ExtractCommand } from "./ExtractCommand.js";
import { RebuildCommand } from "./RebuildCommand.js";

export function makeProgram() {
  const program = new Command();

  program
    .command("rebuild")
    .description("rebuild a LinkData/LinkInfo from compatible directory")
    .argument("<path>", "Compatible directory")
    .argument("<LinkData>", "LinkData file output")
    .argument("<LinkInfo>", "LinkInfo file output")
    .action(RebuildCommand);

  program
    .command("extract")
    .description("extract a LinkData file")
    .argument("<LinkData>", "LinkData file")
    .argument("<LinkInfo>", "LinkInfo file")
    .argument("[output]", "output directory")
    .action(ExtractCommand);

  return program;
}
