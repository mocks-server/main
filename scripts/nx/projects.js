import path from "node:path";
import handlebars from "handlebars";

import { pnpmRun } from "../pnpm/run.js";
import { dirName, readFile, getJsonFromStdout } from "../common/utils.js";
import { REPORT_FORMAT_TEXT } from "../common/constants.js";
import { projectsAreReadyToPublish, projectsStatus } from "../projects/config.js";
import { allProjectNames } from "../projects/utils.js";

import { filterApplications, filterTests, filterLibraries } from "./config.js";

const DEFAULT_BASE = "origin/release";
const TEMPLATES_FOLDER = "templates";
const __DIRNAME = dirName(import.meta.url);

function templatePath(templateName) {
  return path.resolve(__DIRNAME, TEMPLATES_FOLDER, templateName);
}

function parseReport(textReport) {
  return JSON.parse(getJsonFromStdout(textReport));
}

export async function affected(base) {
  const baseArgument = base || DEFAULT_BASE;
  const textReport = parseReport(
    await pnpmRun(["nx", "print-affected", "--", "--base", baseArgument], { silent: true })
  );
  return textReport.projects || [];
}

function arrayHasMany(array) {
  return array.length > 1;
}

function stringifyObjectWithPrefix(object, prefix) {
  return `${prefix}${JSON.stringify(object)}`;
}

export async function printAffectedArray({ prepend = "", base = DEFAULT_BASE }) {
  const affectedProjects = await affected(base);
  console.log(stringifyObjectWithPrefix(affectedProjects, prepend));
}

export async function printProjectsArray({ prepend = "" }) {
  const allProjects = await allProjectNames();
  console.log(stringifyObjectWithPrefix(allProjects, prepend));
}

export async function printAffectedReport({ format, prepend = "", base = DEFAULT_BASE }) {
  const template =
    format === REPORT_FORMAT_TEXT ? "affectedReportText.hbs" : "affectedReportHtml.hbs";
  const affectedProjects = await affected(base);
  const templateContent = await readFile(templatePath(template));
  const applications = await filterApplications(affectedProjects);
  const test = await filterTests(affectedProjects);
  const libraries = await filterLibraries(affectedProjects);
  const report = handlebars.compile(templateContent)({
    base,
    prepend,
    affected: affectedProjects,
    affectedArePlural: arrayHasMany(affectedProjects),
    applications,
    applicationsArePlural: arrayHasMany(applications),
    test,
    testArePlural: arrayHasMany(test),
    libraries,
    librariesArePlural: arrayHasMany(libraries),
  });
  console.log(report);
}

export async function printAffectedCheckReport({ format, prepend = "", base = DEFAULT_BASE }) {
  const template =
    format === REPORT_FORMAT_TEXT ? "affectedCheckReportText.hbs" : "affectedCheckReportHtml.hbs";
  const affectedProjects = await affected(base);
  const templateContent = await readFile(templatePath(template));
  const statuses = await projectsStatus(affectedProjects);
  const ok = await projectsAreReadyToPublish(affectedProjects);

  const templateStatuses = statuses.map((status) => {
    return {
      ...status,
      showDetails:
        !status.private &&
        (!status.readyToPublish || status.errorCheckingPublished || !status.hasSonarConfig),
    };
  });

  const report = handlebars.compile(templateContent)({
    base,
    prepend,
    statuses: templateStatuses,
    ok,
  });
  console.log(report);
}

export async function checkAffected({ base = DEFAULT_BASE }) {
  const affectedProjects = await affected(base);
  const ok = await projectsAreReadyToPublish(affectedProjects);
  if (!ok) {
    throw new Error("Affected projects not upgraded properly");
  }
}
