export type LevelSilly = "silly";
export type LevelDebug = "debug";
export type LevelVerbose = "verbose";
export type LevelInfo = "info";
export type LevelWarn = "warn";
export type LevelError = "error";
export type LevelSilent = "silent";

export type Level = LevelSilly | LevelDebug | LevelVerbose | LevelInfo | LevelWarn | LevelError | LevelSilent;
export type PinnedLevel = boolean | undefined;

export type TransportConsole = "console";
export type TransportStore = "store";
export type TransportGlobalStore = "globalStore";
export type TransportType = TransportConsole | TransportStore;
export type WinstonTransportType = TransportConsole | TransportStore | TransportGlobalStore;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ArrayTransportInstance = any;

export type Log = string;
export type Label = string;
export type LogsStore = Log[];
export type StoreLimit = number;

export interface TransportsPinnedLevels {
  console: boolean;
  store: boolean;
}

export interface LoggerOptions {
  level?: Level,
  storeLimit?: StoreLimit,
  globalStoreLimit?: StoreLimit,
}

export interface SetBaseLevelOptions {
  pinned?: PinnedLevel,
  forcePropagation?: boolean,
}

export interface SetTransportLevelOptions extends SetBaseLevelOptions {
  fromBaseLevel?: boolean,
}

export interface SetOptions extends SetBaseLevelOptions {
  transport?: TransportType,
  propagate?: boolean,
}

export interface EventListener {
  (): void
}
