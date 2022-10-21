/* eslint-disable @typescript-eslint/no-namespace */
import type winston from "winston";

import type { EventsTs } from "./Events";

export const LEVEL_SILLY: LoggerTs.Levels.Silly = "silly";
export const LEVEL_DEBUG: LoggerTs.Levels.Debug = "debug";
export const LEVEL_VERBOSE: LoggerTs.Levels.Verbose = "verbose";
export const LEVEL_INFO: LoggerTs.Levels.Info = "info";
export const LEVEL_WARN: LoggerTs.Levels.Warn = "warn";
export const LEVEL_ERROR: LoggerTs.Levels.Error = "error";
export const LEVEL_SILENT: LoggerTs.Levels.Silent = "silent";

export const TRANSPORT_CONSOLE: LoggerTs.Transports.Types.Console = "console";
export const TRANSPORT_STORE: LoggerTs.Transports.Types.Store = "store";
export const TRANSPORT_GLOBAL_STORE: LoggerTs.Transports.Types.GlobalStore = "globalStore";

export namespace LoggerTs {
  export namespace Levels {
    export type Silly = "silly";
    export type Debug = "debug";
    export type Verbose = "verbose";
    export type Info = "info";
    export type Warn = "warn";
    export type Error = "error";
    export type Silent = "silent";
  }

  /** Logs level */
  export type Level = Levels.Silly | Levels.Debug | Levels.Verbose | Levels.Info | Levels.Warn | Levels.Error | Levels.Silent;

  /** Namespace label */
  export type Label = string;

  /** Limit of logs to store */
  export type StoreLimit = number;

  /** Log message */
  export type Message = string;

  /** Logs store */
  export type Store = Message[];

  export namespace Transports {
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
    export type Array = any;

    export interface Winston {
      console: winston.transports.ConsoleTransportInstance;
      store: Array;
      globalStore: Array;
    }
  }

  export namespace SetLevel {
    export type Pinned = boolean | undefined;

    export interface BaseOptions {
      /** When true, next level changes coming from parent propagations will be ignored and the transport/transports will keep the defined level */
      pinned?: Pinned,
      /** When true, the propagation will ignore pinned levels and it will always override them */
      forcePropagation?: boolean,
    }

    export interface Options extends BaseOptions {
      /** The Winston transport in which the level has to be set. If not provided, the level is set to all transports. In the root logger, changes in the store transport will be applied also to the globalStore transport. */
      transport?: Transports.Type,
      /** Propagates the level change to all children namespaces recursively or not */
      propagate?: boolean,
    }

    export interface TransportOptions extends BaseOptions {
      fromBaseLevel?: boolean,
    }
  }

  /** Options for creating a new logger instance */
  export interface Options {
    /** Log level */
    level?: Level,
    /** Limit of logs to store in the namespace */
    storeLimit?: StoreLimit,
    /** Limit of logs to store in the global store */
    globalStoreLimit?: StoreLimit,
  }

  /** Logger private options. Used only internally to create child namespaces */
  export interface PrivateOptions {
    parent?: Interface,
    root?: Interface,
    globalStore?: Store,
    globalStoreTransport?: Transports.Winston["globalStore"],
  }

  /** Creates a logger instance */
  export interface Constructor {
    /**
    * Creates a logger interface
    * @param label - Label for the logger {@link Label}
    * @param options - Logger options {@link Options}
    * @param privateOptions - Logger private options. Used only internally to create child namespaces {@link PrivateOptions}
    * @returns Logger interface {@link Interface}.
    * @example const logger = new Logger("ddbb", { level: "warn" });
    */
    new (label: Label, options?: Options, privateOptions?: PrivateOptions): Interface
  }

  /** Logger interface */
  export interface Interface {

    /** Logs store, one by namespace */
    store: Store

    /** Logs global store, unique by Logger instance, created by the root namespace */
    globalStore: Store

    /** Namespace label */
    label: Label

    /** Namespace level */
    level: Level

    /**
    * Log a message if the current level is silly.
    * @param message - Message to log {@link Message}
    * @example logger.silly("Hello")
    */
    [LEVEL_SILLY](message: Message): void

    /**
    * Log a message if the current level is silly or debug
    * @param message - Message to log {@link Message}
    * @example logger.debug("Hello")
    */
    [LEVEL_DEBUG](message: Message): void

    /**
    * Log a message if the current level is silly, debug or verbose
    * @param message - Message to log {@link Message}
    * @example logger.verbose("Hello")
    */
    [LEVEL_VERBOSE](message: Message): void

    /**
    * Log a message if the current level is not warn, error or silent
    * @param message - Message to log {@link Message}
    * @example logger.info("Hello")
    */
    [LEVEL_INFO](message: Message): void

    /**
    * Log a message if the current level is not error or silent
    * @param message - Message to log {@link Message}
    * @example logger.warn("Hello")
    */
    [LEVEL_WARN](message: Message): void

    /**
    * Log a message if the current level is not silent
    * @param message - Message to log {@link Message}
    * @example logger.error("Hello")
    */
    [LEVEL_ERROR](message: Message): void

    /**
    * Set namespace level. Must be used internally only when parent namespace changes the level
    * @param level - Level to set {@link Level}
    * @param options - Set options {@link SetLevel.Options}
    * @example logger._setLevelFromParent("debug")
    */
    _setLevelFromParent(level: Level, options: SetLevel.Options): void

    /**
    * Set namespace level
    * @param level - Level to set {@link Level}
    * @param options - Set options {@link SetLevel.Options}
    * @example logger.setLevel("debug")
    */
    setLevel(level: Level, options?: SetLevel.Options ): void
    
    /**
    * Returns a child namespace of creates one in case label does not exist
    * @param label - Namespace label {@link Label}
    * @param options - Options for the new namespace {@link Options}
    * @example const namespace = logger.namespace("foo")
    */
    namespace(label: Label, options?: Options): Interface

    /**
    * Remove all logs from namespace store
    * @example logger.cleanStore()
    */
    cleanStore(): void

    /**
    * Received function will be executed whenever a new log is added to the namespace store
    * @param listener - Function to execute when the store changes {@link Events.Listener}
    * @returns Function allowing to remove the event listener. Once executed, the eventListenet won't be executed any more {@link Events.ListenerRemover}
    * @example const removeOnChangeListener = logger.onChangeStore(() => console.log("New log was added to the namespace"))
    */
    onChangeStore(listener: EventsTs.Listener): EventsTs.ListenerRemover

    /**
    * Received function will be executed whenever a new log is added to the global store
    * @param listener - Function to execute when the store changes {@link Events.Listener}
    * @returns Function allowing to remove the event listener. Once executed, the eventListenet won't be executed any more {@link Events.ListenerRemover}
    * @example const removeOnChangeListener = logger.onChangeGlobalStore(() => console.log("New log was added"))
    */
    onChangeGlobalStore(listener: EventsTs.Listener): EventsTs.ListenerRemover

    /** Root logger instance */
    root: Interface
  }
}


