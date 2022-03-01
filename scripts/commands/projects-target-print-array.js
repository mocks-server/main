import { command, prependOption, targetOption } from "../cli/commands.js";

import { catchCommandError } from "../common/utils.js";
import { printProjectsTargetArray } from "../nx/projects.js";

const { prepend, target } = command({ options: [prependOption, targetOption] });

catchCommandError(printProjectsTargetArray({ prepend, target }));
