import { command, prependOption, baseOption, targetOption } from "../cli/commands.js";
import { catchCommandError } from "../common/utils.js";
import { printAffectedTargetArray } from "../nx/projects.js";

const { prepend, base, target } = command({ options: [prependOption, baseOption, targetOption] });

catchCommandError(printAffectedTargetArray({ prepend, base, target }));
