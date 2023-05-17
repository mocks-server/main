import type {
  WithDefault,
  OptionBoolean,
  OptionNumber,
  OptionObject,
  OptionString,
} from "@mocks-server/config";

export const ALL_HOSTS = "0.0.0.0";

export const OPTIONS: [WithDefault<OptionNumber>, WithDefault<OptionString>] = [
  {
    description: "Port number for the server to be listening at",
    name: "port",
    type: "number",
    default: 3100,
  },
  {
    description: "Host for the server",
    name: "host",
    type: "string",
    default: ALL_HOSTS,
  },
];

export const HTTPS_NAMESPACE = "https";

export const HTTPS_OPTIONS: [WithDefault<OptionBoolean>, OptionString, OptionString] = [
  {
    description: "Use https protocol or not",
    name: "enabled",
    type: "boolean",
    default: false,
  },
  {
    description: "Path to a TLS/SSL certificate",
    name: "cert",
    type: "string",
  },
  {
    description: "Path to the certificate private key",
    name: "key",
    type: "string",
  },
];

export const CORS_NAMESPACE = "cors";

export const CORS_OPTIONS: [WithDefault<OptionBoolean>, WithDefault<OptionObject>] = [
  {
    description: "Use CORS middleware or not",
    name: "enabled",
    type: "boolean",
    default: true,
  },
  {
    description:
      "Options for the CORS middleware. Further information at https://github.com/expressjs/cors#configuration-options",
    name: "options",
    type: "object",
    default: {
      preflightContinue: false,
    },
  },
];

export const JSON_BODY_PARSER_NAMESPACE = "jsonBodyParser";

export const JSON_BODY_PARSER_OPTIONS: [WithDefault<OptionBoolean>, WithDefault<OptionObject>] = [
  {
    description: "Use json body-parser middleware or not",
    name: "enabled",
    type: "boolean",
    default: true,
  },
  {
    description:
      "Options for the json body-parser middleware. Further information at https://github.com/expressjs/body-parser",
    name: "options",
    type: "object",
    default: {},
  },
];

export const URL_ENCODED_BODY_PARSER_NAMESPACE = "urlEncodedBodyParser";

export const URL_ENCODED_BODY_PARSER_OPTIONS: [
  WithDefault<OptionBoolean>,
  WithDefault<OptionObject>
] = [
  {
    description: "Use urlencoded body-parser middleware or not",
    name: "enabled",
    type: "boolean",
    default: true,
  },
  {
    description:
      "Options for the urlencoded body-parser middleware. Further information at https://github.com/expressjs/body-parser",
    name: "options",
    type: "object",
    default: { extended: true },
  },
];
