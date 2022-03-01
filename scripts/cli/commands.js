import { program, Option } from "commander";

export const REPORT_FORMAT_HTML = "html";
export const REPORT_FORMAT_TEXT = "text";

export const formatOption = new Option("--format <format>", "Format of the report")
  .choices([REPORT_FORMAT_TEXT, REPORT_FORMAT_HTML])
  .default(REPORT_FORMAT_TEXT);

export const prependOption = new Option("--prepend <prepend>", "Prepend text to the report");

export const baseOption = new Option("--base <base>", "Base of the current branch");

export const projectOption = new Option("--project <project>", "Project name");

export const targetOption = new Option("--target <target>", "Project target");

export function command({ options = [] }) {
  options.forEach((option) => {
    program.addOption(option);
  });
  return program.parse(process.argv).opts();
}
