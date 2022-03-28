import fsExtra from "fs-extra";
import * as url from "url";

const READ_WRITE_FILE_OPTIONS = {
  encoding: "utf8",
};

export function dirName(importMetaUrl) {
  return url.fileURLToPath(new URL(".", importMetaUrl));
}

export function uniqueArray(array) {
  return array.filter((value, index, self) => {
    return self.indexOf(value) === index;
  });
}

export function ensureArray(value) {
  return Array.isArray(value) ? value : [value];
}

export function catchCommandError(command) {
  return command.catch((error) => {
    console.log(error);
    process.exit(1);
  });
}

export function fileExists(filePath) {
  return fsExtra.existsSync(filePath);
}

export function readFile(filePath) {
  return fsExtra.readFile(filePath, READ_WRITE_FILE_OPTIONS);
}

export function writeFile(filePath, content) {
  return fsExtra.writeFile(filePath, content, READ_WRITE_FILE_OPTIONS);
}

export function copyFile(origin, dest) {
  return fsExtra.copyFile(origin, dest);
}

export async function readJson(filePath) {
  const fileContent = await readFile(filePath);
  return JSON.parse(fileContent);
}

export function getJsonFromStdout(stdout) {
  const splitted = stdout.trim().split(/\r?\n/);
  return splitted.slice(splitted.indexOf("{"), splitted.indexOf("}") + 1).join("");
}
