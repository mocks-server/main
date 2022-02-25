import path from "node:path";
import handlebars from "handlebars";

import { pnpmRun } from "../pnpm/run.js";
import { dirName, readFile } from "../common/utils.js";

import { filterApplications, filterTests, filterLibraries } from "./config.js";

const __DIRNAME = dirName(import.meta.url);

function templatePath(templateName) {
  return path.resolve(__DIRNAME, "templates", templateName);
}

function getJsonFromReport(textReport) {
  const splitted = textReport.trim().split(/\r?\n/);
  return splitted.slice(splitted.indexOf("{"), splitted.indexOf("}") + 1).join("");
}

function parseReport(textReport) {
  let result;
  try {
    result = JSON.parse(getJsonFromReport(textReport));
  } catch (error) {
    console.warn("Error parsing nx report");
    result = {};
  }
  return result;
}

export async function affected() {
  const textReport = parseReport(
    await pnpmRun(["nx", "print-affected", "--", "--base", "origin/release"], { silent: true })
  );
  return textReport.projects || [];
}

export async function printAffectedReport() {
  const affectedProjects = await affected();
  const templateContent = await readFile(templatePath("affectedReportHtml.hbs"));
  const applications = await filterApplications(affectedProjects);
  const test = await filterTests(affectedProjects);
  const libraries = await filterLibraries(affectedProjects);
  const report = handlebars.compile(templateContent)({
    affected: affectedProjects,
    applications,
    applicationsArePlural: applications.length > 1,
    test,
    testArePlural: test.length > 1,
    libraries,
    librariesArePlural: libraries.length > 1,
  });
  console.log(report);
}
