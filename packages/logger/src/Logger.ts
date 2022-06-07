import EventEmitter from "events";

import winston from "winston";
import ArrayTransport from "winston-array-transport";

import { observableStore, CHANGE_EVENT, addEventListener } from "./events";

import type {
    LogsStore,
    LevelSilly,
    LevelDebug,
    LevelVerbose,
    LevelInfo,
    LevelWarn,
    LevelError,
    LevelSilent,
    TransportConsole,
    TransportStore, 
    TransportGlobalStore,
    Label,
    Level,
    Log,
    TransportsPinnedLevels,
    PinnedLevel,
    LoggerOptions,
    SetOptions,
    WinstonTransportType,
    SetTransportLevelOptions,
    TransportType,
    SetBaseLevelOptions,
    EventListener,
    StoreLimit,
    ArrayTransportInstance,
  } from "./types";

interface LoggerPrivateOptions {
  parent?: Logger,
  globalStore?: LogsStore,
  globalStoreTransport?: ArrayTransportInstance,
}

interface Transports {
  console: winston.transports.ConsoleTransportInstance;
  store: ArrayTransportInstance;
  globalStore: ArrayTransportInstance;
}

const DEFAULT_STORE_LIMIT = 1000;
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
  return `${log.timestamp} ${formatLabelOrLevel(log.level)}${formatLabelOrLevel(log.label)} ${log.message}`;
}

function createArrayTransport(store: LogsStore, defaultLevel: Level, storeLimit: StoreLimit): ArrayTransportInstance {
  return new ArrayTransport({
    array: store,
    limit: storeLimit,
    level: defaultLevel,
    format: winston.format.combine(
      formatTimestamp,
      formatLog
    ),
  })
}

function createConsoleTransport(defaultLevel: Level): winston.transports.ConsoleTransportInstance {
  return new winston.transports.Console({
    level: defaultLevel,
    format: winston.format.combine(
      winston.format.colorize(),
      formatTimestamp,
      formatLog
    ),
  })
}

function createTransports(store: LogsStore, defaultLevel: Level, storeLimit: StoreLimit, globalStoreTransport: ArrayTransportInstance): Transports {
  return {
    [TRANSPORT_CONSOLE]: createConsoleTransport(defaultLevel),
    [TRANSPORT_STORE]: createArrayTransport(store, defaultLevel, storeLimit),
    [TRANSPORT_GLOBAL_STORE]: globalStoreTransport,
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
  private _store: LogsStore;
  private _storeEmitter: EventEmitter = new EventEmitter();
  private _globalStore: LogsStore;
  private _globalStoreEmitter: EventEmitter = new EventEmitter();
  private _namespaces: Logger[] = [];
  private _parent: Logger | undefined;
  private _level: Level;
  private _transportsPinnedLevels: TransportsPinnedLevels = { [TRANSPORT_CONSOLE]: false, [TRANSPORT_STORE]: false };
  private _pinnedLevel: PinnedLevel = false;
  private _globalStoreTransport: ArrayTransportInstance;

  /**
   * Creates a root logger
   * @returns Returns a new Logger instance
  */
  constructor(label: Label = "", { level, storeLimit = DEFAULT_STORE_LIMIT, globalStoreLimit = DEFAULT_STORE_LIMIT }: LoggerOptions = {}, { parent, globalStore, globalStoreTransport }: LoggerPrivateOptions = {}) {
    this._parent = parent;
    const parentLevel = this._parent && this._parent.level;
    const defaultLevel = level || parentLevel || LEVEL_INFO;
    this._level = defaultLevel;
    this._label = parent ? namespaceLabel(parent, label) : label;

    this._store = observableStore(this._storeEmitter, storeLimit);
    this._globalStore = globalStore || observableStore(this._globalStoreEmitter, globalStoreLimit);
    this._globalStoreTransport = globalStoreTransport || createArrayTransport(this._globalStore, defaultLevel, globalStoreLimit);
    this._transports = createTransports(this._store, defaultLevel, storeLimit, this._globalStoreTransport);
    
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
    const namespace = new Logger(label, options, { parent: this, globalStoreTransport: this._globalStoreTransport, globalStore: this._globalStore });
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

  public onChangeStore(listener: EventListener) {
    return addEventListener(listener, CHANGE_EVENT, this._storeEmitter);
  }

  public onChangeGlobalStore(listener: EventListener) {
    return addEventListener(listener, CHANGE_EVENT, this._globalStoreEmitter);
  }
}