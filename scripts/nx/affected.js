import path from "node:path";
import handlebars from "handlebars";

import { pnpmRun } from "../pnpm/run.js";
import { dirName, readFile } from "../common/utils.js";
import { REPORT_FORMAT_TEXT } from "../common/constants.js";

import { filterApplications, filterTests, filterLibraries } from "./config.js";

const DEFAULT_BASE = "origin/release";
const TEMPLATES_FOLDER = "templates";
const __DIRNAME = dirName(import.meta.url);

function templatePath(templateName) {
  return path.resolve(__DIRNAME, TEMPLATES_FOLDER, templateName);
}

function getJsonFromReport(textReport) {
  const splitted = textReport.trim().split(/\r?\n/);
  return splitted.slice(splitted.indexOf("{"), splitted.indexOf("}") + 1).join("");
}

function parseReport(textReport) {
  return JSON.parse(getJsonFromReport(textReport));
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

export async function printAffectedReport({ format, prepend, base = DEFAULT_BASE, head }) {
  const template =
    format === REPORT_FORMAT_TEXT ? "affectedReportText.hbs" : "affectedReportHtml.hbs";
  const affectedProjects = await affected(base);
  const templateContent = await readFile(templatePath(template));
  const applications = await filterApplications(affectedProjects);
  const test = await filterTests(affectedProjects);
  const libraries = await filterLibraries(affectedProjects);
  const report = handlebars.compile(templateContent)({
    base,
    head,
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
