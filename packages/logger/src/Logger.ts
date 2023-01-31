import EventEmitter from "events";

import chalk from "chalk";
import * as winston from "winston";
import ArrayTransport from "winston-array-transport";

import type { EventsListener, EventsListenerRemover } from "./EventsTypes";
import {
  LEVEL_SILLY,
  LEVEL_DEBUG,
  LEVEL_VERBOSE,
  LEVEL_INFO,
  LEVEL_WARN,
  LEVEL_ERROR,
  LEVEL_SILENT,
  TRANSPORT_CONSOLE,
  TRANSPORT_STORE,
  TRANSPORT_GLOBAL_STORE,
  LoggerConstructor,
} from "./LoggerTypes";
import type {
  LoggerNamespaceLabel,
  LogLevel,
  LogMessage,
  LogsStore,
  LogsStoreLimit,
  LoggerTransports,
  LoggerInterface,
  LoggerSetLevel,
  LoggerOptions,
  LoggerPrivateOptions,
} from "./LoggerTypes";

import { observableStore, CHANGE_EVENT, addEventListener } from "./events";

const DEFAULT_STORE_LIMIT = 1000;
const TIME_FORMAT = "HH:mm:ss:SS";

const formatTimestamp = winston.format.timestamp({
  format: TIME_FORMAT,
});

function colourLabel(label: LoggerNamespaceLabel): LoggerNamespaceLabel {
  if (!label.length) {
    return "";
  }
  return chalk.grey(label);
}

function formatLabelOrLevel(labelOrLevel: LoggerNamespaceLabel | LogLevel): LogMessage {
  if (!labelOrLevel.length) {
    return "";
  }
  return `[${labelOrLevel}]`;
}

function logTemplate(log: winston.Logform.TransformableInfo, colors = false): LogMessage {
  const label = colors ? colourLabel(log.label) : log.label;
  return `${log.timestamp} ${formatLabelOrLevel(log.level)}${formatLabelOrLevel(label)} ${
    log.message
  }`;
}

function colorsTemplate(log: winston.Logform.TransformableInfo): LogMessage {
  return logTemplate(log, true);
}

function template(log: winston.Logform.TransformableInfo): LogMessage {
  return logTemplate(log);
}

const formatLog = winston.format.printf(colorsTemplate);
const formatStore = winston.format.printf(template);

function createArrayTransport(
  store: LogsStore,
  defaultLevel: LogLevel,
  storeLimit: LogsStoreLimit
): LoggerTransports.LogsArray {
  return new ArrayTransport({
    array: store,
    limit: storeLimit,
    level: defaultLevel,
    maxListeners: 0,
    format: winston.format.combine(formatTimestamp, formatStore),
  });
}

function createConsoleTransport(
  defaultLevel: LogLevel
): winston.transports.ConsoleTransportInstance {
  return new winston.transports.Console({
    level: defaultLevel,
    format: winston.format.combine(winston.format.colorize(), formatTimestamp, formatLog),
  });
}

function createTransports(
  store: LogsStore,
  defaultLevel: LogLevel,
  storeLimit: LogsStoreLimit,
  globalStoreTransport: LoggerTransports.LogsArray
): LoggerTransports.Winston {
  return {
    [TRANSPORT_CONSOLE]: createConsoleTransport(defaultLevel),
    [TRANSPORT_STORE]: createArrayTransport(store, defaultLevel, storeLimit),
    [TRANSPORT_GLOBAL_STORE]: globalStoreTransport,
  };
}

function namespaceLabel(parentLogger: LoggerInterface, label: LoggerNamespaceLabel) {
  const parentLabel = parentLogger.label;
  if (!parentLabel.length) {
    return label;
  }
  return `${parentLogger.label}:${label}`;
}

export const Logger: LoggerConstructor = class Logger implements LoggerInterface {
  private _label: LoggerNamespaceLabel;
  private _transports: LoggerTransports.Winston;
  private _container: winston.Container;
  private _logger: winston.Logger;
  private _store: LogsStore;
  private _storeEmitter: EventEmitter = new EventEmitter();
  private _globalStore: LogsStore;
  private _globalStoreEmitter: EventEmitter = new EventEmitter();
  private _namespaces: LoggerInterface[] = [];
  private _parent: LoggerInterface | undefined;
  private _root: LoggerInterface;
  private _level: LogLevel;
  private _transportsPinnedLevels: LoggerTransports.PinnedLevels = {
    [TRANSPORT_CONSOLE]: false,
    [TRANSPORT_STORE]: false,
  };
  private _pinnedLevel: LoggerSetLevel.Pinned = false;
  private _globalStoreTransport: LoggerTransports.LogsArray;

  constructor(
    label: LoggerNamespaceLabel = "",
    {
      level,
      storeLimit = DEFAULT_STORE_LIMIT,
      globalStoreLimit = DEFAULT_STORE_LIMIT,
    }: LoggerOptions = {},
    { parent, root, globalStore, globalStoreTransport }: LoggerPrivateOptions = {}
  ) {
    this._parent = parent;
    this._root = root || this;
    const parentLevel = this._parent && this._parent.level;
    const defaultLevel = level || parentLevel || LEVEL_INFO;
    this._level = defaultLevel;
    this._label = parent ? namespaceLabel(parent, label) : label;

    this._store = observableStore(this._storeEmitter, storeLimit);
    this._globalStore = globalStore || observableStore(this._globalStoreEmitter, globalStoreLimit);
    this._globalStoreTransport =
      globalStoreTransport ||
      createArrayTransport(this._globalStore, defaultLevel, globalStoreLimit);
    this._transports = createTransports(
      this._store,
      defaultLevel,
      storeLimit,
      this._globalStoreTransport
    );

    this._container = new winston.Container();

    this._container.add(label, {
      format: winston.format.combine(winston.format.label({ label: this._label })),
      transports: [
        this._transports[TRANSPORT_CONSOLE],
        this._transports[TRANSPORT_STORE],
        this._transports[TRANSPORT_GLOBAL_STORE],
      ],
    });

    this._logger = this._container.get(label);
  }

  private _setWinstonTransportLevel(
    level: LogLevel,
    transport: LoggerTransports.WinstonType
  ): void {
    if (level === LEVEL_SILENT) {
      this._transports[transport].silent = true;
    } else {
      this._transports[transport].silent = false;
      this._transports[transport].level = level;
    }
  }

  private _setTransportLevel(
    level: LogLevel,
    transport: LoggerTransports.Type,
    {
      pinned = false,
      fromBaseLevel = false,
      forcePropagation = false,
    }: LoggerSetLevel.TransportOptions
  ): void {
    if (
      forcePropagation ||
      !fromBaseLevel ||
      (fromBaseLevel && !this._transportsPinnedLevels[transport])
    ) {
      this._transportsPinnedLevels[transport] = pinned;
      this._setWinstonTransportLevel(level, transport);
      if (transport === TRANSPORT_STORE && !this._parent) {
        this._setWinstonTransportLevel(level, TRANSPORT_GLOBAL_STORE);
      }
    }
  }

  private _setBaseLevel(
    level: LogLevel,
    { pinned = false, forcePropagation }: LoggerSetLevel.BaseOptions
  ): void {
    this._level = level;
    this._pinnedLevel = pinned;

    this._setTransportLevel(level, TRANSPORT_CONSOLE, { fromBaseLevel: true, forcePropagation });
    this._setTransportLevel(level, TRANSPORT_STORE, { fromBaseLevel: true, forcePropagation });
  }

  public _setLevelFromParent(
    level: LogLevel,
    { transport, forcePropagation = false }: LoggerSetLevel.Options
  ): void {
    if (!this._pinnedLevel || forcePropagation) {
      this._set(level, { transport, forcePropagation });
    }
  }

  private _set(
    level: LogLevel,
    { transport, propagate = true, forcePropagation, pinned }: LoggerSetLevel.Options = {}
  ): void {
    if (transport) {
      this._setTransportLevel(level, transport, { pinned, forcePropagation });
    } else {
      this._setBaseLevel(level, { pinned, forcePropagation });
    }
    if (propagate) {
      this._namespaces.forEach((namespace: LoggerInterface) => {
        namespace._setLevelFromParent(level, { transport, forcePropagation });
      });
    }
  }

  private _getNamespace(label: LoggerNamespaceLabel): LoggerInterface | undefined {
    return this._namespaces.find((namespace: LoggerInterface) => {
      return namespace.label === label;
    });
  }

  private _createNamespace(label: LoggerNamespaceLabel, options?: LoggerOptions): LoggerInterface {
    const namespace = new Logger(label, options, {
      parent: this,
      root: this._root,
      globalStoreTransport: this._globalStoreTransport,
      globalStore: this._globalStore,
    });
    this._namespaces.push(namespace);
    return namespace;
  }

  get store(): LogsStore {
    return this._store;
  }

  get globalStore(): LogsStore {
    return this._globalStore;
  }

  get label(): LoggerNamespaceLabel {
    return this._label;
  }

  get level(): LogLevel {
    return this._level;
  }

  public [LEVEL_SILLY](message: LogMessage): void {
    this._logger[LEVEL_SILLY](message);
  }

  public [LEVEL_DEBUG](message: LogMessage): void {
    this._logger[LEVEL_DEBUG](message);
  }

  public [LEVEL_VERBOSE](message: LogMessage): void {
    this._logger[LEVEL_VERBOSE](message);
  }

  public [LEVEL_INFO](message: LogMessage): void {
    this._logger[LEVEL_INFO](message);
  }

  public [LEVEL_WARN](message: LogMessage): void {
    this._logger[LEVEL_WARN](message);
  }

  public [LEVEL_ERROR](message: LogMessage): void {
    this._logger[LEVEL_ERROR](message);
  }

  public setLevel(level: LogLevel, options?: LoggerSetLevel.Options): void {
    this._set(level, options);
  }

  public namespace(label: LoggerNamespaceLabel, options?: LoggerOptions): LoggerInterface {
    return this._getNamespace(label) || this._createNamespace(label, options);
  }

  public cleanStore(): void {
    this._store.splice(0, this._store.length);
  }

  public onChangeStore(listener: EventsListener): EventsListenerRemover {
    return addEventListener(listener, CHANGE_EVENT, this._storeEmitter);
  }

  public onChangeGlobalStore(listener: EventsListener): EventsListenerRemover {
    return addEventListener(listener, CHANGE_EVENT, this._globalStoreEmitter);
  }

  public get root(): LoggerInterface {
    return this._root;
  }
};

export const LEVELS = {
  SILLY: LEVEL_SILLY,
  DEBUG: LEVEL_DEBUG,
  VERBOSE: LEVEL_VERBOSE,
  INFO: LEVEL_INFO,
  WARN: LEVEL_WARN,
  ERROR: LEVEL_ERROR,
  SILENT: LEVEL_SILENT,
};

export const TRANSPORTS = {
  CONSOLE: TRANSPORT_CONSOLE,
  STORE: TRANSPORT_STORE,
  GLOBAL_STORE: TRANSPORT_GLOBAL_STORE,
};
