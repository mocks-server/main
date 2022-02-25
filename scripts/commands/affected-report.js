import { program, Option } from "commander";

import { catchCommandError } from "../common/utils.js";
import { printAffectedReport } from "../nx/affected.js";

program.addOption(
  new Option("--format <format>", "Format of the report").choices(["text", "html"]).default("text")
);

const { format } = program.parse(process.argv).opts();

catchCommandError(printAffectedReport(format));
