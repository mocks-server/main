import { program, Option } from "commander";

import { catchCommandError } from "../common/utils.js";
import { printProjectsArray } from "../nx/projects.js";

program.addOption(new Option("--prepend <prepend>", "Prepend text to the report"));

const { prepend } = program.parse(process.argv).opts();

catchCommandError(printProjectsArray({ prepend }));
