import { readFile, writeFile, fileExists } from "../common/utils.js";

import { projectFilePath, projectRelativePath } from "./utils.js";

export async function modifyCoverageFile(projectName, converter) {
  const projectCoverageFile = await projectFilePath(projectName, "coverage", "lcov.info");
  if (fileExists(projectCoverageFile)) {
    const projectPath = await projectRelativePath(projectName);
    const coverageContent = await readFile(projectCoverageFile);
    const newContent = converter(coverageContent, projectPath);
    return writeFile(projectCoverageFile, newContent);
  }
}

function removeWorkspacePathFromCoverage(coverageContent, projectPath) {
  const regex = new RegExp(`SF\\:${projectPath}\\/`, "gim");
  return coverageContent.replace(regex, "SF:");
}

function addWorkspacePathToCoverage(coverageContent, projectPath) {
  return coverageContent.replace(/SF:/gim, `SF:${projectPath}/`);
}

export async function coverageToRelative(projectName) {
  return modifyCoverageFile(projectName, removeWorkspacePathFromCoverage);
}

export async function coverageToWorkspace(projectName) {
  return modifyCoverageFile(projectName, addWorkspacePathToCoverage);
}
