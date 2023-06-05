/** Built in configuration object */
export interface BuiltInConfig {
  /** Configuration for the config library itself */
  config?: {
    /** Determines whether config file should be read or not */
    readFile?: boolean;
    /** Determines whether config should read arguments or not */
    readArguments?: boolean;
    /** Determines whether config should read environment vars or not */
    readEnvironment?: boolean;
    /** Determines where config should search for config file */
    fileSearchPlaces?: string[];
    /** Determines from where config should start searching for config file */
    fileSearchFrom?: string;
    /** Determines where config should stop searching for config file */
    fileSearchStop?: string;
    /** Determines whether unknown arguments should be allowed or not */
    allowUnknownArguments?: boolean;
  };
}
