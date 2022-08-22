import deepMerge from "deepmerge";

import openApiDocument from "./openapi/users";
import { openApiToRoutes } from "../src/index";

describe("when function is used and openapi definition is wrong", () => {
  describe("when has a wrong ref", () => {
    it("should throw an error with message", async () => {
      await expect(
        openApiToRoutes({
          basePath: "/api",
          document: deepMerge(openApiDocument, {
            paths: {
              "/users": {
                $ref: "#/foo/pathItems/Users",
              },
            },
          }),
        })
      ).rejects.toEqual(
        new Error("JSON Pointer points to missing location: #/foo/pathItems/Users")
      );
    });
  });

  describe("when has multiple wrong refs", () => {
    it("should throw an error with all messages", async () => {
      await expect(
        openApiToRoutes({
          basePath: "/api",
          document: deepMerge(openApiDocument, {
            paths: {
              "/users": {
                $ref: "#/foo/pathItems/Users",
              },
              "/users/{id}": {
                get: {
                  responses: {
                    "200": {
                      $ref: "#/components/foo/User",
                    },
                  },
                },
              },
            },
          }),
        })
      ).rejects.toEqual(
        new Error(
          "JSON Pointer points to missing location: #/foo/pathItems/Users. JSON Pointer points to missing location: #/components/foo/User"
        )
      );
    });
  });

  describe("when options are wrong", () => {
    it("should throw an error with message", async () => {
      await expect(
        openApiToRoutes({
          basePath: "/api",
          refs: {
            subDocPath: "dasd",
            location: "foo.json",
          },
          document: openApiDocument,
        })
      ).rejects.toEqual(
        new Error("options.subDocPath must be an Array of path segments or a valid JSON Pointer")
      );
    });
  });
});
