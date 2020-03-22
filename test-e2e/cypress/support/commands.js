import { config } from "@mocks-server/cypress-commands";

config({
  adminApiPath: Cypress.env("MOCKS_ADMIN_API_PATH"),
  baseUrl: Cypress.env("MOCKS_URL"),
});
