import stripAnsi from "strip-ansi";

function formatLabelOrLevel(labelOrLevel) {
  if (!labelOrLevel.length) {
    return "";
  }
  return `[${labelOrLevel}]`;
}

export function formattedLog(label, level, message) {
  return `${formatLabelOrLevel(level)}${formatLabelOrLevel(label)} ${message}`;
}

export function cleanLog(log) {
  return stripAnsi(log).replace(/.*?\s/, "");
}

export function cleanLogs(logs) {
  return Array.isArray(logs) ? logs.map(cleanLog) : cleanLog(logs);
}
