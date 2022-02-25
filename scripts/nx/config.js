import path from "node:path";

import { ROOT_PATH, PNPM_WORKSPACE_CONFIG } from "../common/paths.js";
import { readJson } from "../common/utils.js";

const TYPE_APPLICATION = "application";
const TYPE_LIBRARY = "library";
const TYPE_TEST = "test";

const TEST_SUFFIX = "-e2e";

const PROJECT_CONFIG_FILE = "project.json";

export function pnpmWorskpaceConfig() {
  return readJson(PNPM_WORKSPACE_CONFIG);
}

export async function pnpmWorskpaceProjectConfig(projectName) {
  const config = await pnpmWorskpaceConfig();
  return config.projects[projectName];
}

export async function projectPath(projectName) {
  const projectPathBasedOnPnpmConfig = await pnpmWorskpaceProjectConfig(projectName);
  return path.resolve(ROOT_PATH, projectPathBasedOnPnpmConfig);
}

async function projectConfig(projectName) {
  const projectConfigPath = await projectPath(projectName);
  return readJson(path.resolve(projectConfigPath, PROJECT_CONFIG_FILE));
}

async function projectType(projectName) {
  const config = await projectConfig(projectName);
  const type = config.projectType;
  if (type === TYPE_APPLICATION) {
    if (projectName.endsWith(TEST_SUFFIX)) {
      return TYPE_TEST;
    }
    return TYPE_APPLICATION;
  }
  return TYPE_LIBRARY;
}

async function projectIsOfType(projectName, type) {
  const projectTypeResult = await projectType(projectName);
  return projectTypeResult === type;
}

async function filterProjectsByType(projects, type) {
  const projectsWithTypes = await Promise.all(
    projects.map((projectName) => {
      return projectIsOfType(projectName, type).then((isOfType) => {
        return {
          name: projectName,
          isOfType,
        };
      });
    })
  );
  return projectsWithTypes
    .filter(({ isOfType }) => {
      return !!isOfType;
    })
    .map(({ name }) => name);
}

export function filterApplications(projects) {
  return filterProjectsByType(projects, TYPE_APPLICATION);
}

export function filterTests(projects) {
  return filterProjectsByType(projects, TYPE_TEST);
}

export function filterLibraries(projects) {
  return filterProjectsByType(projects, TYPE_LIBRARY);
}
