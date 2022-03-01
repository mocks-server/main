import { projectNxConfig } from "./config.js";

const TYPE_APPLICATION = "application";
const TYPE_LIBRARY = "library";
const TYPE_TEST = "test";

const TEST_SUFFIX = "-e2e";

async function projectType(projectName) {
  const config = await projectNxConfig(projectName);
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
