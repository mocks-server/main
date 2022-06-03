import winston from "winston";
import ArrayTransport from "winston-array-transport";

type LevelSilly = "silly";
type LevelDebug = "debug";
type LevelVerbose = "verbose";
type LevelInfo = "info";
type LevelWarn = "warn";
type LevelError = "error";
type LevelSilent = "silent";

type Level = LevelSilly | LevelDebug | LevelVerbose | LevelInfo | LevelWarn | LevelError | LevelSilent;

type TransportConsole = "console";
type TransportStore = "store";
type TransportType = TransportConsole | TransportStore;

type Log = string;
type Label = string;
type LogsStore = Log[];
interface Transports {
  console: winston.transports.ConsoleTransportInstance;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  store: any;
}

interface LoggerOptions {
  level?: Level,
}

const TIME_FORMAT = "HH:mm:ss:SS";

const LEVEL_SILLY: LevelSilly = "silly";
const LEVEL_DEBUG: LevelDebug = "debug";
const LEVEL_VERBOSE: LevelVerbose = "verbose";
const LEVEL_INFO: LevelInfo = "info";
const LEVEL_WARN: LevelWarn = "warn";
const LEVEL_ERROR: LevelError = "error";
const LEVEL_SILENT: LevelSilent = "silent";

const TRANSPORT_CONSOLE: TransportConsole = "console";
const TRANSPORT_STORE: TransportStore = "store";

const formatLog = winston.format.printf(logTemplate);
const formatTimestamp = winston.format.timestamp({
    format: TIME_FORMAT,
  });

function formatLabelOrLevel(labelOrLevel: Label | Level): Log {
  return `[${labelOrLevel}]`;
}

function logTemplate(log: winston.Logform.TransformableInfo): Log {
  return `${log.timestamp} ${formatLabelOrLevel(log.label)}${formatLabelOrLevel(log.level)} ${log.message}`;
}

function createTransports(logsStore: LogsStore, defaultLevel: Level): Transports {
  return {
    [TRANSPORT_CONSOLE]: new winston.transports.Console({
      level: defaultLevel,
      format: winston.format.combine(
        winston.format.colorize(),
        formatTimestamp,
        formatLog
      ),
    }),
    [TRANSPORT_STORE]: new ArrayTransport({
      array: logsStore,
      limit: 1000,
      level: defaultLevel,
      format: winston.format.combine(
        formatTimestamp,
        formatLog
      ),
    }),
  }
}

export default class Logger {
  private _label: Label;
  private _transports : Transports;
  private _container : winston.Container;
  private _logger: winston.Logger;
  private _store: LogsStore = [];

  constructor(label: Label, { level }: LoggerOptions = {}) {
    const defaultLevel = level || LEVEL_INFO;
    this._label = label;
    this._transports = createTransports(this._store, defaultLevel);
    this._container = new winston.Container();

    this._container.add(label, {
      format: winston.format.combine(
        winston.format.label({ label }),
      ),
      transports: [this._transports[TRANSPORT_CONSOLE], this._transports[TRANSPORT_STORE]]
    });

    this._logger = this._container.get(label);
  }

  private _setTransportLevel(level: Level, transport: TransportType) {
    if (level === LEVEL_SILENT) {
      this._transports[transport].silent = true;
    } else {
      this._transports[transport].silent = false;
      this._transports[transport].level = level;
    }
  }

  get logs(): LogsStore {
    return this._store;
  }

  public [LEVEL_SILLY](log: Log) {
    this._logger[LEVEL_SILLY](log);
  }

  public [LEVEL_DEBUG](log: Log) {
    this._logger[LEVEL_DEBUG](log);
  }

  public [LEVEL_VERBOSE](log: Log) {
    this._logger[LEVEL_VERBOSE](log);
  }

  public [LEVEL_INFO](log: Log) {
    this._logger[LEVEL_INFO](log);
  }

  public [LEVEL_WARN](log: Log) {
    this._logger[LEVEL_WARN](log);
  }

  public [LEVEL_ERROR](log: Log) {
    this._logger[LEVEL_ERROR](log);
  }

  public set(level: Level, transport?: TransportType ) {
    if(transport) {
      this._setTransportLevel(level, transport)
    } else {
      this._setTransportLevel(level, TRANSPORT_CONSOLE)
      this._setTransportLevel(level, TRANSPORT_STORE)
    }
  }
}