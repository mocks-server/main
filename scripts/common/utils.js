export function ensureArray(value) {
  return Array.isArray(value) ? value : [value];
}

export function catchCommandError(command) {
  return command.catch((error) => {
    console.log(error);
    process.exit(1);
  });
}
