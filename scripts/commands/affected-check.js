import { command, baseOption } from "../cli/commands.js";
import { catchCommandError } from "../common/utils.js";
import { checkAffected } from "../nx/projects.js";

const { base } = command({ options: [baseOption] });

catchCommandError(checkAffected({ base }));
