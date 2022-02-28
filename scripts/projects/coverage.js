import { readFile, writeFile, fileExists } from "../common/utils.js";

import { projectFilePath, projectRelativePath } from "./utils.js";

export async function coverageToRelative(projectName) {
  const projectCoverageFile = await projectFilePath(projectName, "coverage", "lcov.info");
  if (fileExists(projectCoverageFile)) {
    const pathToRemove = await projectRelativePath(projectName);

    const coverageContent = await readFile(projectCoverageFile);
    const regex = new RegExp(`SF\\:${pathToRemove}\\/`, "gim");
    return writeFile(projectCoverageFile, coverageContent.replace(regex, ""));
  }
}
