import path from "node:path";

const { pathname: root } = new URL("../src", import.meta.url);

export const ROOT_PATH = path.resolve(root, "..", "..");
