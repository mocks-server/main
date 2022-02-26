import path from "node:path";

import { pnpmWorskpaceProjectConfig, pnpmWorskpaceConfig } from "../pnpm/config.js";
import { readJson, readFile } from "../common/utils.js";
import { ROOT_PATH } from "../common/paths.js";

export async function projectPath(projectName) {
  const projectPathBasedOnPnpmConfig = await pnpmWorskpaceProjectConfig(projectName);
  return path.resolve(ROOT_PATH, projectPathBasedOnPnpmConfig);
}

export async function readProjectJson(projectName, fileName) {
  const projectConfigPath = await projectPath(projectName);
  return readJson(path.resolve(projectConfigPath, fileName));
}

export async function readProjectFile(projectName, fileName) {
  const projectConfigPath = await projectPath(projectName);
  return readFile(path.resolve(projectConfigPath, fileName));
}

export async function allProjectNames() {
  const workspaceConfig = await pnpmWorskpaceConfig();
  return Object.keys(workspaceConfig.projects);
}
