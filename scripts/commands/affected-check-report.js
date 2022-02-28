import { catchCommandError } from "../common/utils.js";
import { printAffectedCheckReport } from "../nx/projects.js";
import { command, formatOption, prependOption, baseOption } from "../cli/commands.js";

const { format, prepend, base } = command({ options: [formatOption, prependOption, baseOption] });

catchCommandError(printAffectedCheckReport({ format, prepend, base }));
