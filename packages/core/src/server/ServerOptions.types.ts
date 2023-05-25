import type {
  OptionDefinition,
  UnknownObject,
  GetOptionValueTypeFromDefinition,
} from "@mocks-server/config";
import type { OptionsJson, OptionsUrlencoded } from "body-parser";
import type { CorsOptions } from "cors";

export const ALL_HOSTS = "0.0.0.0";

export type PortNumberOptionDefinition = OptionDefinition<number, { hasDefault: true }>;
export type HostOptionDefinition = OptionDefinition<string, { hasDefault: true }>;

export type HttpsProtocolOptionDefinition = OptionDefinition<boolean, { hasDefault: true }>;
export type HttpsCertOptionDefinition = OptionDefinition<string>;
export type HttpsKeyOptionDefinition = OptionDefinition<string>;

export type CorsEnabledOptionDefinition = OptionDefinition<boolean>;
export type CorsOptionsOptionDefinition = OptionDefinition<UnknownObject, { hasDefault: true }>;

export type JsonBodyParserEnabledOptionDefinition = OptionDefinition<
  boolean,
  { hasDefault: true }
>;
export type JsonBodyParserOptionsOptionDefinition = OptionDefinition<
  UnknownObject,
  { hasDefault: true }
>;

export type UrlEncodedBodyParserEnabledOptionDefinition = OptionDefinition<
  boolean,
  { hasDefault: true }
>;
export type UrlEncodedBodyParserOptionsOptionDefinition = OptionDefinition<
  UnknownObject,
  { hasDefault: true }
>;

declare global {
  //eslint-disable-next-line @typescript-eslint/no-namespace
  namespace MocksServer {
    interface Config {
      server?: {
        port?: GetOptionValueTypeFromDefinition<PortNumberOptionDefinition>;
        host?: GetOptionValueTypeFromDefinition<HostOptionDefinition>;
        https?: {
          enabled?: GetOptionValueTypeFromDefinition<HttpsProtocolOptionDefinition>;
          cert?: GetOptionValueTypeFromDefinition<HttpsCertOptionDefinition>;
          key?: GetOptionValueTypeFromDefinition<HttpsKeyOptionDefinition>;
        };
        cors?: {
          enabled?: GetOptionValueTypeFromDefinition<CorsEnabledOptionDefinition>;
          options?: GetOptionValueTypeFromDefinition<CorsOptionsOptionDefinition, CorsOptions>;
        };
        jsonBodyParser?: {
          enabled?: GetOptionValueTypeFromDefinition<JsonBodyParserEnabledOptionDefinition>;
          options?: GetOptionValueTypeFromDefinition<
            JsonBodyParserOptionsOptionDefinition,
            OptionsJson
          >;
        };
        urlEncodedBodyParser?: {
          enabled?: GetOptionValueTypeFromDefinition<UrlEncodedBodyParserEnabledOptionDefinition>;
          options?: GetOptionValueTypeFromDefinition<
            UrlEncodedBodyParserOptionsOptionDefinition,
            OptionsUrlencoded
          >;
        };
      };
    }
  }
}
