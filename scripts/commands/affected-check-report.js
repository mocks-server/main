import { program, Option } from "commander";

import { catchCommandError } from "../common/utils.js";
import { printAffectedCheckReport } from "../nx/projects.js";
import { REPORT_FORMAT_HTML, REPORT_FORMAT_TEXT } from "../common/constants.js";

program
  .addOption(
    new Option("--format <format>", "Format of the report")
      .choices([REPORT_FORMAT_TEXT, REPORT_FORMAT_HTML])
      .default(REPORT_FORMAT_TEXT)
  )
  .addOption(new Option("--prepend <prepend>", "Prepend text to the report"))
  .addOption(new Option("--base <base>", "Base of the current branch"));

const { format, prepend, base } = program.parse(process.argv).opts();

catchCommandError(printAffectedCheckReport({ format, prepend, base }));
