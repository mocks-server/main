import { workspacePath } from "../common/paths.js";
import { readJson } from "../common/utils.js";

export const PNPM_WORKSPACE_CONFIG = workspacePath("workspace.json");

export function pnpmWorskpaceConfig() {
  return readJson(PNPM_WORKSPACE_CONFIG);
}

export async function pnpmWorskpaceProjectConfig(projectName) {
  const config = await pnpmWorskpaceConfig();
  return config.projects[projectName];
}
