import { program, Option } from "commander";

import { catchCommandError } from "../common/utils.js";
import { printAffectedArray } from "../nx/affected.js";

program
  .addOption(new Option("--prepend <prepend>", "Prepend text to the report"))
  .addOption(new Option("--base <base>", "Base of the current branch"));

const { prepend, base } = program.parse(process.argv).opts();

catchCommandError(printAffectedArray({ prepend, base }));
