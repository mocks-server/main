import path from "node:path";

import { pnpmWorskpaceProjectConfig, pnpmWorskpaceConfig } from "../pnpm/config.js";
import { readJson, readFile, copyFile } from "../common/utils.js";
import { workspacePath } from "../common/paths.js";

export async function projectPath(projectName) {
  const projectPathBasedOnPnpmConfig = await pnpmWorskpaceProjectConfig(projectName);
  return workspacePath(projectPathBasedOnPnpmConfig);
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

export async function copyWorkspaceFileToProject(
  projectName,
  workspaceRelativePath,
  projectRelativePath
) {
  console.log({ workspaceRelativePath, projectRelativePath });
  const dest = await projectFilePath(projectName, projectRelativePath || workspaceRelativePath);
  console.log({ dest });
  return copyFile(workspacePath(workspaceRelativePath), dest);
}
