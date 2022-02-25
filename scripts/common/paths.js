import path from "node:path";

import { dirName } from "./utils.js";

const __DIRNAME = dirName(import.meta.url);

export const ROOT_PATH = path.resolve(__DIRNAME, "..", "..");
