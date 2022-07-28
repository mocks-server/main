module.exports = [
  {
    id: "get-users",
    url: "/api/users",
    method: "GET",
    variants: [
      {
        id: "1",
        type: "json",
        options: {
          status: 200,
          body: [{ email: "foo@foo.com" }],
        },
      },
      {
        id: "2",
        type: "json",
        options: {
          status: 200,
          body: [{ email: "foo2@foo2.com" }],
        },
      },
    ],
  },
  {
    id: "get-web",
    url: "/web",
    variants: [
      {
        id: "disabled",
        disabled: true,
      },
      {
        id: "fast",
        type: "static",
        options: {
          path: "static/static",
        },
      },
      {
        id: "delayed",
        type: "static",
        delay: 1000,
        options: {
          path: "static/static",
        },
      },
      {
        id: "no-index",
        type: "static",
        options: {
          path: "static/static",
          headers: {
            "x-index-disabled": "true",
          },
          options: {
            index: false,
          },
        },
      },
    ],
  },
  {
    id: "get-web-error",
    url: "/web/**",
    variants: [
      {
        id: "disabled",
        disabled: true,
      },
      {
        id: "error",
        type: "json",
        options: {
          status: 400,
          body: { message: "Forced error" },
        },
      },
    ],
  },
];
