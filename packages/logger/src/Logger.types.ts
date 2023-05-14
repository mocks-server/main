/* eslint-disable @typescript-eslint/no-namespace */
import type * as winston from "winston";

import type { EventsListenerRemover, EventsListener } from "./Events.types";

export const LEVEL_SILLY: LogLevels.Silly = "silly";
export const LEVEL_DEBUG: LogLevels.Debug = "debug";
export const LEVEL_VERBOSE: LogLevels.Verbose = "verbose";
export const LEVEL_INFO: LogLevels.Info = "info";
export const LEVEL_WARN: LogLevels.Warn = "warn";
export const LEVEL_ERROR: LogLevels.ErrorLevel = "error";
export const LEVEL_SILENT: LogLevels.Silent = "silent";

export const TRANSPORT_CONSOLE: LoggerTransports.Types.Console = "console";
export const TRANSPORT_STORE: LoggerTransports.Types.Store = "store";
export const TRANSPORT_GLOBAL_STORE: LoggerTransports.Types.GlobalStore = "globalStore";

export namespace LogLevels {
  export type Silly = "silly";
  export type Debug = "debug";
  export type Verbose = "verbose";
  export type Info = "info";
  export type Warn = "warn";
  export type ErrorLevel = "error";
  export type Silent = "silent";
}

/** Logs level */
export type LogLevel =
  | LogLevels.Silly
  | LogLevels.Debug
  | LogLevels.Verbose
  | LogLevels.Info
  | LogLevels.Warn
  | LogLevels.ErrorLevel
  | LogLevels.Silent;

/** Namespace label */
export type LoggerNamespaceLabel = string;

/** Limit of logs to store */
export type LogsStoreLimit = number;

/** Log message */
export type LogMessage = string;

/** Logs store */
export type LogsStore = LogMessage[];

export namespace LoggerTransports {
  export namespace Types {
    export type Console = "console";
    export type Store = "store";
    export type GlobalStore = "globalStore";
  }

  export type Type = Types.Console | Types.Store;
  export type WinstonType = Types.Console | Types.Store | Types.GlobalStore;

  export interface PinnedLevels {
    console: boolean;
    store: boolean;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export type LogsArray = any;

  export interface Winston {
    console: winston.transports.ConsoleTransportInstance;
    store: LogsArray;
    globalStore: LogsArray;
  }
}

export namespace LoggerSetLevel {
  export type Pinned = boolean | undefined;

  export interface BaseOptions {
    /** When true, next level changes coming from parent propagations will be ignored and the transport/transports will keep the defined level */
    pinned?: Pinned;
    /** When true, the propagation will ignore pinned levels and it will always override them */
    forcePropagation?: boolean;
  }

  export interface Options extends BaseOptions {
    /** The Winston transport in which the level has to be set. If not provided, the level is set to all transports. In the root logger, changes in the store transport will be applied also to the globalStore transport. */
    transport?: LoggerTransports.Type;
    /** Propagates the level change to all children namespaces recursively or not */
    propagate?: boolean;
  }

  export interface TransportOptions extends BaseOptions {
    fromBaseLevel?: boolean;
  }
}

/** Options for creating a new logger instance */
export interface LoggerOptions {
  /** Log level */
  level?: LogLevel;
  /** Limit of logs to store in the namespace */
  storeLimit?: LogsStoreLimit;
  /** Limit of logs to store in the global store */
  globalStoreLimit?: LogsStoreLimit;
}

/** Logger private options. Used only internally to create child namespaces */
export interface LoggerPrivateOptions {
  parent?: LoggerInterface;
  root?: LoggerInterface;
  globalStore?: LogsStore;
  globalStoreTransport?: LoggerTransports.Winston["globalStore"];
}

/** Creates a logger instance */
export interface LoggerConstructor {
  /**
   * Creates a logger interface
   * @param label - Label for the logger {@link Label}
   * @param options - Logger options {@link Options}
   * @param privateOptions - Logger private options. Used only internally to create child namespaces {@link PrivateOptions}
   * @returns Logger interface {@link Interface}.
   * @example const logger = new Logger("ddbb", { level: "warn" });
   */
  new (
    label: LoggerNamespaceLabel,
    options?: LoggerOptions,
    privateOptions?: LoggerPrivateOptions
  ): LoggerInterface;
}

/** Logger interface */
export interface LoggerInterface {
  /** Logs store, one by namespace */
  store: LogsStore;

  /** Logs global store, unique by Logger instance, created by the root namespace */
  globalStore: LogsStore;

  /** Namespace label */
  label: LoggerNamespaceLabel;

  /** Namespace level */
  level: LogLevel;

  /**
   * Log a message if the current level is silly.
   * @param message - Message to log {@link Message}
   * @example logger.silly("Hello")
   */
  [LEVEL_SILLY](message: LogMessage): void;

  /**
   * Log a message if the current level is silly or debug
   * @param message - Message to log {@link Message}
   * @example logger.debug("Hello")
   */
  [LEVEL_DEBUG](message: LogMessage): void;

  /**
   * Log a message if the current level is silly, debug or verbose
   * @param message - Message to log {@link Message}
   * @example logger.verbose("Hello")
   */
  [LEVEL_VERBOSE](message: LogMessage): void;

  /**
   * Log a message if the current level is not warn, error or silent
   * @param message - Message to log {@link Message}
   * @example logger.info("Hello")
   */
  [LEVEL_INFO](message: LogMessage): void;

  /**
   * Log a message if the current level is not error or silent
   * @param message - Message to log {@link Message}
   * @example logger.warn("Hello")
   */
  [LEVEL_WARN](message: LogMessage): void;

  /**
   * Log a message if the current level is not silent
   * @param message - Message to log {@link Message}
   * @example logger.error("Hello")
   */
  [LEVEL_ERROR](message: LogMessage): void;

  /**
   * Set namespace level. Must be used internally only when parent namespace changes the level
   * @param level - Level to set {@link Level}
   * @param options - Set options {@link SetLevel.Options}
   * @example logger._setLevelFromParent("debug")
   */
  _setLevelFromParent(level: LogLevel, options: LoggerSetLevel.Options): void;

  /**
   * Set namespace level
   * @param level - Level to set {@link Level}
   * @param options - Set options {@link SetLevel.Options}
   * @example logger.setLevel("debug")
   */
  setLevel(level: LogLevel, options?: LoggerSetLevel.Options): void;

  /**
   * Returns a child namespace of creates one in case label does not exist
   * @param label - Namespace label {@link Label}
   * @param options - Options for the new namespace {@link Options}
   * @example const namespace = logger.namespace("foo")
   */
  namespace(label: LoggerNamespaceLabel, options?: LoggerOptions): LoggerInterface;

  /**
   * Remove all logs from namespace store
   * @example logger.cleanStore()
   */
  cleanStore(): void;

  /**
   * Received function will be executed whenever a new log is added to the namespace store
   * @param listener - Function to execute when the store changes {@link Events.Listener}
   * @returns Function allowing to remove the event listener. Once executed, the eventListenet won't be executed any more {@link Events.ListenerRemover}
   * @example const removeOnChangeListener = logger.onChangeStore(() => console.log("New log was added to the namespace"))
   */
  onChangeStore(listener: EventsListener): EventsListenerRemover;

  /**
   * Received function will be executed whenever a new log is added to the global store
   * @param listener - Function to execute when the store changes {@link Events.Listener}
   * @returns Function allowing to remove the event listener. Once executed, the eventListenet won't be executed any more {@link Events.ListenerRemover}
   * @example const removeOnChangeListener = logger.onChangeGlobalStore(() => console.log("New log was added"))
   */
  onChangeGlobalStore(listener: EventsListener): EventsListenerRemover;

  /** Root logger instance */
  root: LoggerInterface;
}
