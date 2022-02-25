import path from "node:path";

import { ROOT_PATH } from "../common/paths.js";
import { readJson } from "../common/utils.js";

export const PNPM_WORKSPACE_CONFIG = path.resolve(ROOT_PATH, "workspace.json");

export function pnpmWorskpaceConfig() {
  return readJson(PNPM_WORKSPACE_CONFIG);
}

export async function pnpmWorskpaceProjectConfig(projectName) {
  const config = await pnpmWorskpaceConfig();
  return config.projects[projectName];
}
