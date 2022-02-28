import { catchCommandError } from "../common/utils.js";
import { coverageToRelative } from "../projects/coverage.js";
import { command, projectOption } from "../cli/commands.js";

const { project } = command({ options: [projectOption] });

catchCommandError(coverageToRelative(project));
