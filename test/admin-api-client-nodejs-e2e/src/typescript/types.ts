import { AdminApiClient } from "@mocks-server/admin-api-client";
import type {
  AdminApiClientInterface,
  ApiResponseBody
} from "@mocks-server/admin-api-client";

const apiClient: AdminApiClientInterface = new AdminApiClient();

export function about(): Promise<ApiResponseBody> {
  return apiClient.readAbout();
}
