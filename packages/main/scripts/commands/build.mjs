import { PROJECT_NAME } from "../constants.mjs";
import { copyWorkspaceFileToProject } from "../../../../scripts/projects/utils.js";

copyWorkspaceFileToProject(PROJECT_NAME, "README.md");
