import stripAnsi from "strip-ansi";

function formatLabelOrLevel(labelOrLevel) {
  return `[${labelOrLevel}]`;
}

export function formattedLog(label, level, message) {
  return `${formatLabelOrLevel(label)}${formatLabelOrLevel(level)} ${message}`;
}

export function cleanLog(log) {
  return stripAnsi(log).replace(/.*?\s/, "");
}

export function cleanLogs(logs) {
  return Array.isArray(logs) ? logs.map(cleanLog) : cleanLog(logs);
}
