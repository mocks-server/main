import { command, prependOption } from "../cli/commands.js";

import { catchCommandError } from "../common/utils.js";
import { printProjectsArray } from "../nx/projects.js";

const { prepend } = command({ options: [prependOption] });

catchCommandError(printProjectsArray({ prepend }));
