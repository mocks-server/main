import { program, Option } from "commander";

import { catchCommandError } from "../common/utils.js";
import { printAffectedReport } from "../nx/affected.js";
import { REPORT_FORMAT_HTML, REPORT_FORMAT_TEXT } from "../common/constants.js";

program
  .addOption(
    new Option("--format <format>", "Format of the report")
      .choices([REPORT_FORMAT_TEXT, REPORT_FORMAT_HTML])
      .default(REPORT_FORMAT_TEXT)
  )
  .addOption(new Option("--prepend <prepend>", "Prepend text to the report"));

const { format, prepend } = program.parse(process.argv).opts();

catchCommandError(printAffectedReport({ format, prepend }));
