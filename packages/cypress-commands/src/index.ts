export * from "./types";

export { AdminApiClient } from "./AdminApiClient";

import { register as registerer } from "./Register";

/**
 * Register Mocks Server Cypress commands
 * @example register();
 */
export function register(): void {
  registerer(Cypress, cy);
}
