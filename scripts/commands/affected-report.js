import { program, Option } from "commander";

import { catchCommandError } from "../common/utils.js";
import { printAffectedReport } from "../nx/affected.js";

program.addOption(
  new Option("--format <format>", "Format of the report")
    .choices(["text", "markdown"])
    .default("text")
);

const { format } = program.parse(process.argv).opts();

console.log(format);

catchCommandError(printAffectedReport(format));
