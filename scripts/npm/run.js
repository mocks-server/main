import { CliRunner } from "../cli/runner.js";

const NPM_COMMAND = "npm";
const NPM_VIEW = "view";

export const npmView = CliRunner(NPM_COMMAND, [NPM_VIEW]);
