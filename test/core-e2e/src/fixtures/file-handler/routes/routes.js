const path = require("path");

const ROOT_FOLDER = path.resolve(__dirname, "..");

module.exports = [
  {
    id: "get-users",
    url: "/api/users",
    method: "GET",
    variants: [
      {
        id: "success",
        type: "file",
        options: {
          status: 200,
          path: "src/fixtures/file-handler/files/users.json",
        },
      },
      {
        id: "error",
        type: "file",
        options: {
          status: 400,
          path: "src/fixtures/file-handler/files/error.txt",
        },
      },
    ],
  },
  {
    id: "get-user",
    url: "/api/users/:id",
    method: "GET",
    variants: [
      {
        id: "success",
        type: "file",
        options: {
          status: 200,
          path: "files/user.json",
          headers: {
            "x-custom-header": "foo-custom-header",
          },
          options: {
            root: ROOT_FOLDER,
          }
        },
      },
      {
        id: "error",
        type: "file",
        options: {
          status: 400,
          path: "files/error.txt",
          options: {
            root: ROOT_FOLDER,
          }
        },
      },
      {
        id: "file-error",
        type: "file",
        options: {
          status: 400,
          path: "files/foo.txt",
          options: {
            root: ROOT_FOLDER,
          }
        },
      },
    ],
  },
  {
    id: "web",
    url: "/web",
    method: "GET",
    variants: [
      {
        id: "success",
        type: "file",
        options: {
          status: 200,
          path: "src/fixtures/file-handler/files/web.html",
          headers: {
            "x-custom-header": "web-custom-header",
          }
        },
      },
    ],
  },
];
