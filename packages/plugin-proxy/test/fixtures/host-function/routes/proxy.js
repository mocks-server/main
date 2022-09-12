module.exports = [
  {
    id: "proxy-all",
    url: "*",
    method: ["GET", "POST", "PATCH", "PUT"],
    variants: [
      {
        id: "enabled",
        type: "proxy",
        options: {
          host: () => {
            return "http://127.0.0.1:3200";
          },
          options: {},
        },
      },
      {
        id: "disabled",
        type: "middleware",
        options: {
          middleware: (_req, _res, next) => next(),
        },
      },
    ],
  },
  {
    id: "proxy-user",
    url: "/api/users/:id",
    method: ["GET", "POST", "PATCH", "PUT"],
    variants: [
      {
        id: "enabled",
        type: "proxy",
        options: {
          host: () => {
            return "http://127.0.0.1:3300";
          },
          options: {},
        },
      },
    ],
  },
];
