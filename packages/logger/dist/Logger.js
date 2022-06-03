"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const winston_1 = __importDefault(require("winston"));
const winston_array_transport_1 = __importDefault(require("winston-array-transport"));
const TIME_FORMAT = "HH:mm:ss:SS";
const LEVEL_SILLY = "silly";
const LEVEL_DEBUG = "debug";
const LEVEL_VERBOSE = "verbose";
const LEVEL_INFO = "info";
const LEVEL_WARN = "warn";
const LEVEL_ERROR = "error";
const LEVEL_SILENT = "silent";
const TRANSPORT_CONSOLE = "console";
const TRANSPORT_STORE = "store";
const logsStore = [];
const formatLog = winston_1.default.format.printf(logTemplate);
const formatTimestamp = winston_1.default.format.timestamp({
    format: TIME_FORMAT,
});
function formatLabelOrLevel(labelOrLevel) {
    return `[${labelOrLevel}]`;
}
function logTemplate(log) {
    return `${log.timestamp} ${formatLabelOrLevel(log.label)}${formatLabelOrLevel(log.level)} ${log.message}`;
}
function createTransports() {
    return {
        [TRANSPORT_CONSOLE]: new winston_1.default.transports.Console({
            format: winston_1.default.format.combine(winston_1.default.format.colorize(), formatTimestamp, formatLog),
        }),
        [TRANSPORT_STORE]: new winston_array_transport_1.default({
            array: logsStore,
            limit: 1000,
            level: LEVEL_VERBOSE,
            format: winston_1.default.format.combine(formatTimestamp, formatLog),
        }),
    };
}
class Logger {
    constructor(label) {
        Object.defineProperty(this, "_label", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "_transports", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "_container", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "_logger", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this._label = label;
        this._transports = createTransports();
        this._container = new winston_1.default.Container();
        this._container.add(label, {
            format: winston_1.default.format.combine(winston_1.default.format.label({ label })),
            transports: [this._transports[TRANSPORT_CONSOLE], this._transports[TRANSPORT_STORE]]
        });
        this._logger = this._container.get(label);
    }
    [LEVEL_SILLY](log) {
        this._logger[LEVEL_SILLY](log);
    }
    [LEVEL_DEBUG](log) {
        this._logger[LEVEL_DEBUG](log);
    }
    [LEVEL_VERBOSE](log) {
        this._logger[LEVEL_VERBOSE](log);
    }
    [LEVEL_INFO](log) {
        this._logger[LEVEL_INFO](log);
    }
    [LEVEL_WARN](log) {
        this._logger[LEVEL_WARN](log);
    }
    [LEVEL_ERROR](log) {
        this._logger[LEVEL_ERROR](log);
    }
    set(level, transport = TRANSPORT_CONSOLE) {
        if (level === LEVEL_SILENT) {
            this._transports[transport].silent = true;
        }
        else {
            this._transports[transport].silent = false;
            this._transports[transport].level = level;
        }
    }
}
exports.default = Logger;
