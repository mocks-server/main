import { CliRunner } from "../cli/runner.js";

const PNPM_COMMAND = "pnpm";
const PNPM_RUN = "run";

export const pnpmRun = CliRunner(PNPM_COMMAND, [PNPM_RUN]);
