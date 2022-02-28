import { command, prependOption, baseOption } from "../cli/commands.js";
import { catchCommandError } from "../common/utils.js";
import { printAffectedArray } from "../nx/projects.js";

const { prepend, base } = command({ options: [prependOption, baseOption] });

catchCommandError(printAffectedArray({ prepend, base }));
