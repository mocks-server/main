/*
Copyright 2021-2023 Javier Brea

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/
import type EventEmitter from "events";

import type { EventListener, EventListenerRemover, EventName } from "./Events.types";

export const CHANGE_MOCK: EventName = "change:mock";
export const CHANGE_ALERTS: EventName = "change:alerts";

export function addEventListener(
  listener: EventListener,
  eventName: EventName,
  eventEmitter: EventEmitter
): EventListenerRemover {
  const removeCallback: EventListenerRemover = (): void => {
    eventEmitter.removeListener(eventName, listener);
  };
  eventEmitter.on(eventName, listener);
  return removeCallback;
}
