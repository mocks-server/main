import { versionIsPublished } from "../npm/check.js";

import { readProjectJson, readProjectFile, projectFilePath } from "./utils.js";
import { fileExists } from "../common/utils.js";

const PACKAGE_JSON = "package.json";
const CHANGELOG = "CHANGELOG.md";
const SONAR_CONFIG = "sonar-project.properties";

export async function projectPackageJson(projectName) {
  return readProjectJson(projectName, PACKAGE_JSON);
}

export async function projectChangelogHasVersion(projectName, version) {
  const changelogContent = await readProjectFile(projectName, CHANGELOG);
  return changelogContent.includes(`## [${version}]`);
}

export async function sonarConfigHasVersion(projectName, version) {
  const sonarConfigContent = await readProjectFile(projectName, SONAR_CONFIG);
  return sonarConfigContent.includes(`sonar.projectVersion=${version}\n`);
}

export async function projectHasSonarConfig(projectName) {
  const projectFile = await projectFilePath(projectName, SONAR_CONFIG);
  console.log(projectFile);
  return fileExists(projectFile);
}

export async function projectStatus(projectName) {
  const projectPackageInfo = await projectPackageJson(projectName);
  let changelogUpdated = false;
  let projectIsPublished = false;
  let sonarConfigUpdated = false;
  let errorCheckingPublished = false;
  let hasSonarConfig = false;

  if (!projectPackageInfo.private) {
    try {
      projectIsPublished = await versionIsPublished(
        projectPackageInfo.name,
        projectPackageInfo.version
      );
    } catch (error) {
      projectIsPublished = false;
      errorCheckingPublished = true;
    }

    changelogUpdated = await projectChangelogHasVersion(projectName, projectPackageInfo.version);
    hasSonarConfig = await projectHasSonarConfig(projectName);
    if (hasSonarConfig) {
      sonarConfigUpdated = await sonarConfigHasVersion(projectName, projectPackageInfo.version);
    } else {
      sonarConfigUpdated = true;
    }
  }
  return {
    project: projectName,
    private: !!projectPackageInfo.private,
    name: projectPackageInfo.name,
    version: projectPackageInfo.version,
    isPublished: projectIsPublished,
    errorCheckingPublished,
    changelogUpdated,
    hasSonarConfig,
    sonarConfigUpdated,
    readyToPublish:
      !projectPackageInfo.private &&
      !!projectPackageInfo.name &&
      !projectIsPublished &&
      changelogUpdated &&
      (!hasSonarConfig || sonarConfigUpdated),
  };
}

export function projectsStatus(projectNames) {
  return Promise.all(
    projectNames.map((projectName) => {
      return projectStatus(projectName);
    })
  );
}

export async function projectsAreReadyToPublish(projectNames) {
  const statuses = await projectsStatus(projectNames);
  return !statuses.reduce((anyNotPublished, status) => {
    if (anyNotPublished) {
      return true;
    }
    if (!status.private && !status.readyToPublish) {
      return true;
    }
    return false;
  }, false);
}
