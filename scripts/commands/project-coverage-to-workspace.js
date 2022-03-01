import { catchCommandError } from "../common/utils.js";
import { coverageToWorkspace } from "../projects/coverage.js";
import { command, projectOption } from "../cli/commands.js";

const { project } = command({ options: [projectOption] });

catchCommandError(coverageToWorkspace(project));
