import path from "node:path";

import { pnpmWorskpaceProjectConfig, pnpmWorskpaceConfig } from "../pnpm/config.js";
import { readJson, readFile, copyFile } from "../common/utils.js";
import { workspacePath } from "../common/paths.js";

export async function projectRelativePath(projectName) {
  return pnpmWorskpaceProjectConfig(projectName);
}

export async function projectPath(projectName) {
  const projectPathBasedOnPnpmConfig = await projectRelativePath(projectName);
  return workspacePath(projectPathBasedOnPnpmConfig);
}

export async function projectFilePath(projectName, ...rest) {
  const projectRootPath = await projectPath(projectName);
  return path.resolve.apply(path, [projectRootPath, ...rest]);
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
  relativePathInProject
) {
  const dest = await projectFilePath(projectName, relativePathInProject || workspaceRelativePath);
  return copyFile(workspacePath(workspaceRelativePath), dest);
}
