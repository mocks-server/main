/*
Copyright 2023 Javier Brea

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

import type { InputQuestion, ListQuestion } from "inquirer";

export type InquirerQuestion = InputQuestion | ListQuestion;

export type InquirerQuestionsMap = Record<string, InquirerQuestion>;

export interface GetHeaders {
  /** Callback for getting headers to print */
  (): string[];
}

export interface GetAlerts {
  /** Callback for getting alerts to print */
  (): string[];
}

/** Options for creating an Inquirer interface */
export interface InquirerOptions {
  /** Whether to use emojis or not */
  emojis?: boolean;
}

/** Creates a Inquirer interface */
export interface InquirerConstructor {
  /**
   * Creates a Inquirer interface
   * @param options - Inquirer options {@link InquirerOptions}
   * @returns Inquirer interface {@link InquirerInterface}.
   * @example const InquirerInterface = new InquirerInterface({ logger, alerts });
   */
  new (getHeaders: GetHeaders, getAlerts: GetAlerts, options?: InquirerOptions): InquirerInterface;
}

export interface ClearScreenOptions {
  /** Whether to render header or not */
  header?: boolean;
}

/** Inquirer interface */
export interface InquirerInterface {
  /** Questions to be asked */
  set questions(questions: InquirerQuestionsMap);

  /** Enable or disable emojis */
  set emojis(enabled: boolean);

  /** Exit logs mode */
  exitLogsMode(): void;

  /** Enter logs mode
   * @param startLogs - Callback to start printing logs when screen is ready
   */
  logsMode(startLogs?: () => void): Promise<void>;

  /** Ask question */
  inquire(questionKey: string, extendProperties?: Partial<InquirerQuestion>): Promise<unknown>;

  /** Exit process */
  quit(): never;

  /** Clear screen
   * @param options - Options for clearing screen
   */
  clearScreen(options?: ClearScreenOptions): void;

  /** Remove listeners */
  removeListeners(): void;
}
