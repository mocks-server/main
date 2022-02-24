import { catchCommandError } from "../common/utils.js";

import { printAffectedReport } from "../nx/affected.js";

catchCommandError(printAffectedReport());
