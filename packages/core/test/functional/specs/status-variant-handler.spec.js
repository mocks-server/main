/*
Copyright 2022 Javier Brea

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

const { startCore, doTextFetch, waitForServer, waitForServerUrl } = require("../support/helpers");

describe("status variant handler", () => {
  let core, changeMockAndWait;

  beforeAll(async () => {
    core = await startCore(null, {
      files: {
        enabled: false,
      },
    });

    changeMockAndWait = async (collectionId) => {
      await core.mock.collections.select(collectionId);
    };
    await waitForServer();
  });

  afterAll(async () => {
    await core.stop();
  });

  describe("When variants of type status are loaded", () => {
    it("should have loaded new routes", async () => {
      const { loadRoutes, loadCollections } = core.mock.createLoaders();
      loadRoutes([
        {
          id: "get-books",
          url: "/api/books",
          method: "GET",
          variants: [
            {
              id: "success",
              type: "status",
              options: {
                status: 200,
              },
            },
            {
              id: "error",
              type: "status",
              options: {
                status: 403,
              },
            },
          ],
        },
        {
          id: "get-authors",
          url: "/api/authors",
          method: "GET",
          variants: [
            {
              id: "success",
              type: "status",
              options: {
                status: 200,
              },
            },
            {
              id: "error",
              type: "status",
              options: {
                status: 403,
              },
            },
          ],
        },
      ]);
      loadCollections([
        {
          id: "base",
          routes: ["get-books:success", "get-authors:success"],
        },
        {
          id: "authors-error",
          from: "base",
          routes: ["get-authors:error"],
        },
        {
          id: "books-error",
          from: "base",
          routes: ["get-books:error"],
        },
      ]);
      await changeMockAndWait("base");
      await waitForServerUrl("/api/books");

      const books = await doTextFetch("/api/books");
      expect(books.status).toEqual(200);
      expect(books.body).toEqual("");

      const authors = await doTextFetch("/api/authors");
      expect(authors.status).toEqual(200);
      expect(authors.body).toEqual("");
    });

    it("should send new status when collection changes", async () => {
      await changeMockAndWait("authors-error");

      const authors = await doTextFetch("/api/authors");
      expect(authors.status).toEqual(403);
      expect(authors.body).toEqual("");
    });

    it("should send Content-Length header as 0", async () => {
      const response = await doTextFetch("/api/books");
      expect(response.headers.get("Content-Length")).toEqual("0");
    });
  });
});
