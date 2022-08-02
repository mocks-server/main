export * from "./types";
export { MocksServerApiClient } from "./MocksServerApiClient";

import { register as registerer } from "./register";

export function register() {
  registerer(Cypress);
}
