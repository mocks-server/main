/*
Copyright 2023 Javier Brea

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

import type {
  OptionDefinition,
  OptionInterfaceOfType,
  GetOptionValueTypeFromDefinition,
} from "@mocks-server/config";
import type { LogLevel } from "@mocks-server/logger";

export type PluginEnabledOptionDefinition = OptionDefinition<boolean, { hasDefault: true }>;
export type EmojisOptionDefinition = OptionDefinition<boolean, { hasDefault: true }>;

export type PluginEnabledOption = OptionInterfaceOfType<boolean, { hasDefault: true }>;
export type EmojisEnabledOption = OptionInterfaceOfType<boolean, { hasDefault: true }>;

export type LogOption = OptionInterfaceOfType<LogLevel, { hasDefault: true }>;
export type SelectedCollectionOption = OptionInterfaceOfType<string, { nullable: true }>;
export type DelayOption = OptionInterfaceOfType<number, { hasDefault: true }>;
export type PortOption = OptionInterfaceOfType<number, { hasDefault: true }>;
export type HostOption = OptionInterfaceOfType<string, { hasDefault: true }>;
export type HttpsEnabledOption = OptionInterfaceOfType<boolean, { hasDefault: true }>;
export type WatchOption = OptionInterfaceOfType<boolean, { hasDefault: true }>;

//eslint-disable-next-line @typescript-eslint/no-namespace
declare global {
  //eslint-disable-next-line @typescript-eslint/no-namespace
  namespace MocksServer {
    interface PluginsConfig {
      inquirerCli?: {
        enabled?: GetOptionValueTypeFromDefinition<PluginEnabledOptionDefinition>;
        emojis?: GetOptionValueTypeFromDefinition<EmojisOptionDefinition>;
      };
    }
  }
}
