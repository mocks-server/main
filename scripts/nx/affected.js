import { pnpmRun } from "../pnpm/run.js";

function getJsonFromReport(textReport) {
  const splitted = textReport.trim().split(/\r?\n/);
  return splitted.slice(splitted.indexOf("{"), splitted.indexOf("}") + 1).join("");
}

function parseReport(textReport) {
  console.log("----------------");
  console.log(textReport);
  console.log("----------------");
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
    await pnpmRun(["nx", "print-affected", "--", "--base", "monorepo-poc"], { silent: true })
  );
  return textReport.projects || [];
}

export async function printAffectedReport() {
  const affectedProjects = await affected();
  const projectsLength = affectedProjects.length;
  if (projectsLength) {
    console.log(
      `${affectedProjects.length} projects affected by changes: ${affectedProjects.join(", ")}`
    );
  } else {
    console.log("No affected projects");
  }
}
