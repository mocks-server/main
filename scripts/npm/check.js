import { getJsonFromStdout } from "../common/utils.js";

import { npmView } from "./run.js";

export async function versionIsPublished(packageName, version) {
  const npmViewStdout = await npmView([packageName, "--json"], { silent: true });
  const versions = JSON.parse(getJsonFromStdout(npmViewStdout)).versions;
  return versions.includes(version);
}
