/*
Copyright 2021-2022 Javier Brea

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

const {
  startCore,
  doFetch,
  waitForServer,
  waitForServerUrl,
  removeConfigFile,
} = require("./support/helpers");

describe("loadCollections and loadRoutes methods", () => {
  let core, changeMockAndWait, waitUntilCollectionChanged;

  beforeAll(async () => {
    core = await startCore();
    waitUntilCollectionChanged = async (collectionId) => {
      await new Promise((resolve) => {
        const interval = setInterval(() => {
          if (core.mock.collections.selected === collectionId) {
            clearInterval(interval);
            resolve();
          }
        }, 200);
      });
    };

    changeMockAndWait = async (collectionId) => {
      core.config.namespace("mock").namespace("collections").option("selected").value =
        collectionId;
      await waitUntilCollectionChanged(collectionId);
    };
    await waitForServer();
  });

  afterAll(async () => {
    removeConfigFile();
    await core.stop();
  });

  describe("When started", () => {
    it("should return users", async () => {
      const users = await doFetch("/api/users");
      expect(users.body).toEqual([
        { id: 1, name: "John Doe" },
        { id: 2, name: "Jane Doe" },
      ]);
    });
  });

  describe("When routes and collections are loaded using core methods", () => {
    it("should have loaded new collections and routes", async () => {
      const { loadRoutes, loadCollections } = core.mock.createLoaders();
      loadRoutes([
        {
          id: "get-books",
          url: "/api/books",
          method: "GET",
          variants: [
            {
              id: "success",
              type: "json",
              options: {
                status: 200,
                body: [{ id: 1, title: "1984" }],
              },
            },
            {
              id: "error",
              type: "json",
              options: {
                status: 403,
                body: {
                  message: "Bad data",
                },
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
              type: "json",
              options: {
                status: 200,
                body: [{ id: 1, name: "George Orwell" }],
              },
            },
            {
              id: "bradbury",
              type: "json",
              options: {
                status: 200,
                body: [{ id: 1, name: "Ray Bradbury" }],
              },
            },
            {
              id: "error",
              type: "json",
              options: {
                status: 403,
                body: {
                  message: "Bad data",
                },
              },
            },
          ],
        },
      ]);
      loadCollections([
        {
          id: "users-and-library",
          from: "base",
          routesVariants: ["get-books:success", "get-authors:success"],
        },
        {
          id: "authors-error",
          from: "users-and-library",
          routesVariants: ["get-authors:error"],
        },
        {
          id: "bradbury",
          from: "users-and-library",
          routesVariants: ["get-authors:bradbury"],
        },
      ]);
      core.config.namespace("mock").namespace("collections").option("selected").value =
        "users-and-library";
      await waitForServerUrl("/api/books");

      const books = await doFetch("/api/books");
      expect(books.body).toEqual([{ id: 1, title: "1984" }]);

      const authors = await doFetch("/api/authors");
      expect(authors.body).toEqual([{ id: 1, name: "George Orwell" }]);

      const users = await doFetch("/api/users");
      expect(users.body).toEqual([
        { id: 1, name: "John Doe" },
        { id: 2, name: "Jane Doe" },
      ]);
    });

    it("should be able to change collection using select method", async () => {
      core.mock.collections.select("bradbury");
      await waitUntilCollectionChanged("bradbury");

      const authors = await doFetch("/api/authors");
      expect(authors.body).toEqual([{ id: 1, name: "Ray Bradbury" }]);
    });

    it("should be able to change to a new collection", async () => {
      await changeMockAndWait("authors-error");
      const books = await doFetch("/api/books");
      expect(books.body).toEqual([{ id: 1, title: "1984" }]);

      const users = await doFetch("/api/users");
      expect(users.body).toEqual([
        { id: 1, name: "John Doe" },
        { id: 2, name: "Jane Doe" },
      ]);

      const authors = await doFetch("/api/authors");
      expect(authors.status).toEqual(403);
    });

    it("should keep collections loaded from files", async () => {
      await changeMockAndWait("base");
      const users = await doFetch("/api/users");
      expect(users.body).toEqual([
        { id: 1, name: "John Doe" },
        { id: 2, name: "Jane Doe" },
      ]);
      const authors = await doFetch("/api/authors");
      expect(authors.status).toEqual(404);
    });
  });
});
