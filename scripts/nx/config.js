import path from "node:path";

import { ROOT_PATH } from "../common/paths";
import workspace from "../../workspace.json";

const PROJECTS_CONFIG = workspace.projects;
export const PROJECTS = Object.keys(workspace.projects);

export function projectPath(projectName) {
  return path.resolve(ROOT_PATH, PROJECTS_CONFIG[projectName]);
}
