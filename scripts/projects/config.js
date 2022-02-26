import { versionIsPublished } from "../npm/check.js";

import { readProjectJson, readProjectFile } from "./utils.js";

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

export async function projectStatus(projectName) {
  const projectPackageInfo = await projectPackageJson(projectName);
  let changelogUpdated = false;
  let projectIsPublished = false;
  let sonarConfigUpdated = false;

  if (!projectPackageInfo.private) {
    projectIsPublished = await versionIsPublished(
      projectPackageInfo.name,
      projectPackageInfo.version
    );
    changelogUpdated = await projectChangelogHasVersion(projectName, projectPackageInfo.version);
    sonarConfigUpdated = await sonarConfigHasVersion(projectName, projectPackageInfo.version);
  }
  return {
    project: projectName,
    private: !!projectPackageInfo.private,
    name: projectPackageInfo.name,
    version: projectPackageInfo.version,
    isPublished: projectIsPublished,
    changelogUpdated,
    sonarConfigUpdated,
    readyToPublish:
      !projectPackageInfo.private &&
      !!projectPackageInfo.name &&
      !projectIsPublished &&
      changelogUpdated &&
      sonarConfigUpdated,
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
