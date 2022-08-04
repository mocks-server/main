export * from "./types";
export { AdminApiClient } from "./AdminApiClient";

import { register as registerer } from "./register";

export function register() {
  registerer(Cypress, cy);
}
