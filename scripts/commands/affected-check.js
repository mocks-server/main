import { program, Option } from "commander";

import { catchCommandError } from "../common/utils.js";
import { checkAffected } from "../nx/affected.js";

program.addOption(new Option("--base <base>", "Base of the current branch"));

const { base } = program.parse(process.argv).opts();

catchCommandError(checkAffected({ base }));
