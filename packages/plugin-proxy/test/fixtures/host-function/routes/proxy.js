module.exports = [
  {
    id: "proxy-all",
    url: "*",
    method: ["GET", "POST", "PATCH", "PUT"],
    variants: [
      {
        id: "enabled",
        handler: "proxy-v4",
        response: {
          host: () => {
            return "http://127.0.0.1:3200";
          },
          options: {},
        },
      },
      {
        id: "disabled",
        response: (_req, _res, next) => next(),
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
        handler: "proxy-v4",
        response: {
          host: () => {
            return "http://127.0.0.1:3300";
          },
          options: {},
        },
      },
    ],
  },
];
