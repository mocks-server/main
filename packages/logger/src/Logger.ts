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
type PinnedLevel = boolean | undefined;

type TransportConsole = "console";
type TransportStore = "store";
type TransportGlobalStore = "globalStore";
type TransportType = TransportConsole | TransportStore;
type WinstonTransportType = TransportConsole | TransportStore | TransportGlobalStore;

type Log = string;
type Label = string;
type LogsStore = Log[];

interface Transports {
  console: winston.transports.ConsoleTransportInstance;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  store: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  globalStore: any;
}

interface TransportsPinnedLevels {
  console: boolean;
  store: boolean;
}

interface LoggerOptions {
  level?: Level,
}

interface LoggerPrivateOptions {
  parent?: Logger,
  globalStore?: LogsStore,
}

interface SetBaseLevelOptions {
  pinned?: PinnedLevel,
  forcePropagation?: boolean,
}

interface SetTransportLevelOptions extends SetBaseLevelOptions {
  fromBaseLevel?: boolean,
}

interface SetOptions extends SetBaseLevelOptions {
  transport?: TransportType,
  propagate?: boolean,
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
const TRANSPORT_GLOBAL_STORE: TransportGlobalStore = "globalStore";

const formatLog = winston.format.printf(logTemplate);
const formatTimestamp = winston.format.timestamp({
    format: TIME_FORMAT,
  });

function formatLabelOrLevel(labelOrLevel: Label | Level): Log {
  if (!labelOrLevel.length) {
    return "";
  }
  return `[${labelOrLevel}]`;
}

function logTemplate(log: winston.Logform.TransformableInfo): Log {
  return `${log.timestamp} ${formatLabelOrLevel(log.label)}${formatLabelOrLevel(log.level)} ${log.message}`;
}

function createTransports(store: LogsStore, globalStore: LogsStore, defaultLevel: Level): Transports {
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
      array: store,
      limit: 1000,
      level: defaultLevel,
      format: winston.format.combine(
        formatTimestamp,
        formatLog
      ),
    }),
    [TRANSPORT_GLOBAL_STORE]: new ArrayTransport({
      array: globalStore,
      limit: 1000,
      level: defaultLevel,
      format: winston.format.combine(
        formatTimestamp,
        formatLog
      ),
    }),
  }
}

function namespaceLabel(parentLogger: Logger, label: Label) {
  const parentLabel = parentLogger.label;
  if (!parentLabel.length) {
    return label;
  }
  return `${parentLogger.label}:${label}`;
}

export default class Logger {
  private _label: Label;
  private _transports : Transports;
  private _container : winston.Container;
  private _logger: winston.Logger;
  private _store: LogsStore = [];
  private _globalStore: LogsStore;
  private _namespaces: Logger[] = [];
  private _parent: Logger | undefined;
  private _level: Level;
  private _transportsPinnedLevels: TransportsPinnedLevels = { [TRANSPORT_CONSOLE]: false, [TRANSPORT_STORE]: false };
  private _pinnedLevel: PinnedLevel = false;

  constructor(label: Label = "", { level }: LoggerOptions = {}, { parent, globalStore = [] }: LoggerPrivateOptions = {}) {
    this._globalStore = globalStore;
    this._parent = parent;
    const parentLevel = this._parent && this._parent.level;
    const defaultLevel = level || parentLevel || LEVEL_INFO;
    this._level = defaultLevel;
    this._label = parent ? namespaceLabel(parent, label) : label;
    this._transports = createTransports(this._store, this._globalStore, defaultLevel);
    this._container = new winston.Container();

    this._container.add(label, {
      format: winston.format.combine(
        winston.format.label({ label: this._label }),
      ),
      transports: [this._transports[TRANSPORT_CONSOLE], this._transports[TRANSPORT_STORE], this._transports[TRANSPORT_GLOBAL_STORE]]
    });

    this._logger = this._container.get(label);
  }

  private _setWinstonTransportLevel(level: Level, transport: WinstonTransportType) {
    if (level === LEVEL_SILENT) {
      this._transports[transport].silent = true;
    } else {
      this._transports[transport].silent = false;
      this._transports[transport].level = level;
    }
  }

  private _setTransportLevel(level: Level, transport: TransportType, { pinned = false, fromBaseLevel = false, forcePropagation = false }: SetTransportLevelOptions) {
    if (forcePropagation || !fromBaseLevel || (fromBaseLevel && !this._transportsPinnedLevels[transport])) {
      this._transportsPinnedLevels[transport] = pinned;
      this._setWinstonTransportLevel(level, transport);
      if(transport === TRANSPORT_STORE) {
        this._setWinstonTransportLevel(level, TRANSPORT_GLOBAL_STORE);
      }
    }
  }

  private _setBaseLevel(level: Level, { pinned = false, forcePropagation }: SetBaseLevelOptions) {
      this._level = level;
      this._pinnedLevel = pinned;

      this._setTransportLevel(level, TRANSPORT_CONSOLE, { fromBaseLevel: true, forcePropagation })
      this._setTransportLevel(level, TRANSPORT_STORE, { fromBaseLevel: true, forcePropagation })
  }

  private _setLevelFromParent(level: Level, { transport, forcePropagation = false }: SetOptions) {
    if(!this._pinnedLevel || forcePropagation) {
      this._set(level, { transport, forcePropagation });
    }
  }

  private _set(level: Level, { transport, propagate = true, forcePropagation, pinned }: SetOptions = {} ) {
    if(transport) {
      this._setTransportLevel(level, transport, { pinned, forcePropagation })
    } else {
      this._setBaseLevel(level, { pinned, forcePropagation });
    }
    if(propagate) {
      this._namespaces.forEach((namespace: Logger) => {
        namespace._setLevelFromParent(level, { transport, forcePropagation });
      });
    }
  }

  private _getNamespace(label: Label): Logger | undefined {
    return this._namespaces.find((namespace: Logger) => {
      return namespace.label === label;
    });
  }

  private _createNamespace(label: Label, options: LoggerOptions): Logger {
    const namespace = new Logger(label, options, { parent: this, globalStore: this._globalStore });
    this._namespaces.push(namespace);
    return namespace;
  }

  get store(): LogsStore {
    return this._store;
  }

  get globalStore(): LogsStore {
    return this._globalStore;
  }

  get label(): Label {
    return this._label;
  }

  get level(): Level {
    return this._level;
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

  public setLevel(level: Level, options: SetOptions ) {
    this._set(level, options);
  }

  public namespace(label: Label, options: LoggerOptions): Logger {
    return this._getNamespace(label) || this._createNamespace(label, options);
  }

  public cleanStore() {
    this._store.splice(0, this._store.length);
  }
}