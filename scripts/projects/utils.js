import path from "node:path";

import { pnpmWorskpaceProjectConfig, pnpmWorskpaceConfig } from "../pnpm/config.js";
import { readJson, readFile } from "../common/utils.js";
import { ROOT_PATH } from "../common/paths.js";

export async function projectPath(projectName) {
  const projectPathBasedOnPnpmConfig = await pnpmWorskpaceProjectConfig(projectName);
  return path.resolve(ROOT_PATH, projectPathBasedOnPnpmConfig);
}

export async function projectFilePath(projectName, relativeFilePath) {
  const projectRootPath = await projectPath(projectName);
  return path.resolve(projectRootPath, relativeFilePath);
}

export async function readProjectJson(projectName, fileName) {
  const projectJson = await projectFilePath(projectName, fileName);
  return readJson(projectJson);
}

export async function readProjectFile(projectName, fileName) {
  const projectFile = await projectFilePath(projectName, fileName);
  return readFile(projectFile);
}

export async function allProjectNames() {
  const workspaceConfig = await pnpmWorskpaceConfig();
  return Object.keys(workspaceConfig.projects);
}
