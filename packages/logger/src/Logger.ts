import EventEmitter from "events";

import winston from "winston";
import ArrayTransport from "winston-array-transport";
import chalk from "chalk";

import { observableStore, CHANGE_EVENT, addEventListener } from "./events";
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
} from "./types/Logger";

import type {
  LoggerTs,
} from "./types/Logger";
import type { EventsTs } from "./types/Events";

const DEFAULT_STORE_LIMIT = 1000;
const TIME_FORMAT = "HH:mm:ss:SS";

const formatTimestamp = winston.format.timestamp({
    format: TIME_FORMAT,
  });

function colourLabel(label: LoggerTs.Label ): LoggerTs.Label {
  if (!label.length) {
    return "";
  }
  return chalk.grey(label);
}

function formatLabelOrLevel(labelOrLevel: LoggerTs.Label | LoggerTs.Level): LoggerTs.Message {
  if (!labelOrLevel.length) {
    return "";
  }
  return `[${labelOrLevel}]`;
}

function logTemplate(log: winston.Logform.TransformableInfo, colors = false): LoggerTs.Message {
  const label = colors ? colourLabel(log.label) : log.label;
  return `${log.timestamp} ${formatLabelOrLevel(log.level)}${formatLabelOrLevel(label)} ${log.message}`;
}

function colorsTemplate(log: winston.Logform.TransformableInfo): LoggerTs.Message {
  return logTemplate(log, true);
}

function template(log: winston.Logform.TransformableInfo): LoggerTs.Message {
  return logTemplate(log);
}

const formatLog = winston.format.printf(colorsTemplate);
const formatStore = winston.format.printf(template);

function createArrayTransport(store: LoggerTs.Store, defaultLevel: LoggerTs.Level, storeLimit: LoggerTs.StoreLimit): LoggerTs.Transports.Array {
  return new ArrayTransport({
    array: store,
    limit: storeLimit,
    level: defaultLevel,
    maxListeners: 0,
    format: winston.format.combine(
      formatTimestamp,
      formatStore
    ),
  })
}

function createConsoleTransport(defaultLevel: LoggerTs.Level): winston.transports.ConsoleTransportInstance {
  return new winston.transports.Console({
    level: defaultLevel,
    format: winston.format.combine(
      winston.format.colorize(),
      formatTimestamp,
      formatLog
    ),
  })
}

function createTransports(store: LoggerTs.Store, defaultLevel: LoggerTs.Level, storeLimit: LoggerTs.StoreLimit, globalStoreTransport: LoggerTs.Transports.Array): LoggerTs.Transports.Winston {
  return {
    [TRANSPORT_CONSOLE]: createConsoleTransport(defaultLevel),
    [TRANSPORT_STORE]: createArrayTransport(store, defaultLevel, storeLimit),
    [TRANSPORT_GLOBAL_STORE]: globalStoreTransport,
  }
}

function namespaceLabel(parentLogger: LoggerTs.Interface, label: LoggerTs.Label) {
  const parentLabel = parentLogger.label;
  if (!parentLabel.length) {
    return label;
  }
  return `${parentLogger.label}:${label}`;
}

export class Logger implements LoggerTs.Interface {
  private _label: LoggerTs.Label;
  private _transports : LoggerTs.Transports.Winston;
  private _container : winston.Container;
  private _logger: winston.Logger;
  private _store: LoggerTs.Store;
  private _storeEmitter: EventEmitter = new EventEmitter();
  private _globalStore: LoggerTs.Store;
  private _globalStoreEmitter: EventEmitter = new EventEmitter();
  private _namespaces: LoggerTs.Interface[] = [];
  private _parent: LoggerTs.Interface | undefined;
  private _root: LoggerTs.Interface;
  private _level: LoggerTs.Level;
  private _transportsPinnedLevels: LoggerTs.Transports.PinnedLevels = { [TRANSPORT_CONSOLE]: false, [TRANSPORT_STORE]: false };
  private _pinnedLevel: LoggerTs.SetLevel.Pinned = false;
  private _globalStoreTransport: LoggerTs.Transports.Array;

  constructor(label: LoggerTs.Label = "", { level, storeLimit = DEFAULT_STORE_LIMIT, globalStoreLimit = DEFAULT_STORE_LIMIT }: LoggerTs.Options = {}, { parent, root, globalStore, globalStoreTransport }: LoggerTs.PrivateOptions = {}) {
    this._parent = parent;
    this._root = root || this;
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

  private _setWinstonTransportLevel(level: LoggerTs.Level, transport: LoggerTs.Transports.WinstonType): void {
    if (level === LEVEL_SILENT) {
      this._transports[transport].silent = true;
    } else {
      this._transports[transport].silent = false;
      this._transports[transport].level = level;
    }
  }

  private _setTransportLevel(level: LoggerTs.Level, transport: LoggerTs.Transports.Type, { pinned = false, fromBaseLevel = false, forcePropagation = false }: LoggerTs.SetLevel.TransportOptions): void {
    if (forcePropagation || !fromBaseLevel || (fromBaseLevel && !this._transportsPinnedLevels[transport])) {
      this._transportsPinnedLevels[transport] = pinned;
      this._setWinstonTransportLevel(level, transport);
      if(transport === TRANSPORT_STORE && !this._parent) {
        this._setWinstonTransportLevel(level, TRANSPORT_GLOBAL_STORE);
      }
    }
  }

  private _setBaseLevel(level: LoggerTs.Level, { pinned = false, forcePropagation }:  LoggerTs.SetLevel.BaseOptions): void {
      this._level = level;
      this._pinnedLevel = pinned;

      this._setTransportLevel(level, TRANSPORT_CONSOLE, { fromBaseLevel: true, forcePropagation })
      this._setTransportLevel(level, TRANSPORT_STORE, { fromBaseLevel: true, forcePropagation })
  }

  public _setLevelFromParent(level: LoggerTs.Level, { transport, forcePropagation = false }: LoggerTs.SetLevel.Options): void {
    if(!this._pinnedLevel || forcePropagation) {
      this._set(level, { transport, forcePropagation });
    }
  }

  private _set(level: LoggerTs.Level, { transport, propagate = true, forcePropagation, pinned }: LoggerTs.SetLevel.Options = {} ): void {
    if(transport) {
      this._setTransportLevel(level, transport, { pinned, forcePropagation })
    } else {
      this._setBaseLevel(level, { pinned, forcePropagation });
    }
    if(propagate) {
      this._namespaces.forEach((namespace: LoggerTs.Interface) => {
        namespace._setLevelFromParent(level, { transport, forcePropagation });
      });
    }
  }

  private _getNamespace(label: LoggerTs.Label): LoggerTs.Interface | undefined {
    return this._namespaces.find((namespace: LoggerTs.Interface) => {
      return namespace.label === label;
    });
  }

  private _createNamespace(label: LoggerTs.Label, options?: LoggerTs.Options): LoggerTs.Interface {
    const namespace = new Logger(label, options, { parent: this, root: this._root, globalStoreTransport: this._globalStoreTransport, globalStore: this._globalStore });
    this._namespaces.push(namespace);
    return namespace;
  }

  get store(): LoggerTs.Store {
    return this._store;
  }

  get globalStore(): LoggerTs.Store {
    return this._globalStore;
  }

  get label(): LoggerTs.Label {
    return this._label;
  }

  get level(): LoggerTs.Level {
    return this._level;
  }

  public [LEVEL_SILLY](message: LoggerTs.Message): void {
    this._logger[LEVEL_SILLY](message);
  }

  public [LEVEL_DEBUG](message: LoggerTs.Message): void {
    this._logger[LEVEL_DEBUG](message);
  }

  public [LEVEL_VERBOSE](message: LoggerTs.Message): void {
    this._logger[LEVEL_VERBOSE](message);
  }

  public [LEVEL_INFO](message: LoggerTs.Message): void {
    this._logger[LEVEL_INFO](message);
  }

  public [LEVEL_WARN](message: LoggerTs.Message): void {
    this._logger[LEVEL_WARN](message);
  }

  public [LEVEL_ERROR](message: LoggerTs.Message): void {
    this._logger[LEVEL_ERROR](message);
  }

  public setLevel(level: LoggerTs.Level, options?: LoggerTs.SetLevel.Options ): void {
    this._set(level, options);
  }

  public namespace(label: LoggerTs.Label, options?: LoggerTs.Options): LoggerTs.Interface {
    return this._getNamespace(label) || this._createNamespace(label, options);
  }

  public cleanStore(): void {
    this._store.splice(0, this._store.length);
  }

  public onChangeStore(listener: EventsTs.Listener): EventsTs.ListenerRemover {
    return addEventListener(listener, CHANGE_EVENT, this._storeEmitter);
  }

  public onChangeGlobalStore(listener: EventsTs.Listener): EventsTs.ListenerRemover {
    return addEventListener(listener, CHANGE_EVENT, this._globalStoreEmitter);
  }

  public get root(): LoggerTs.Interface {
    return this._root;
  }
}

export const LEVELS = {
  SILLY: LEVEL_SILLY,
  DEBUG: LEVEL_DEBUG,
  VERBOSE: LEVEL_VERBOSE,
  INFO: LEVEL_INFO,
  WARN: LEVEL_WARN,
  ERROR: LEVEL_ERROR,
  SILENT: LEVEL_SILENT,
}

export const TRANSPORTS = {
  CONSOLE: TRANSPORT_CONSOLE,
  STORE: TRANSPORT_STORE,
  GLOBAL_STORE: TRANSPORT_GLOBAL_STORE,
}
