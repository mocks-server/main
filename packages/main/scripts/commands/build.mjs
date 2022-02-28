import { PROJECT_NAME } from "../constants.mjs";
import { copyWorkspaceFileToProject } from "../../../../scripts/projects/utils.js";

async function build() {
  await Promise.all([
    copyWorkspaceFileToProject(PROJECT_NAME, "README.md"),
    copyWorkspaceFileToProject(PROJECT_NAME, "LICENSE"),
    copyWorkspaceFileToProject(PROJECT_NAME, "NOTICE"),
  ]);
}

build();
