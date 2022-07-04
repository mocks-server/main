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
          host: "http://127.0.0.1:3200",
          options: {
            filter: (req) => {
              return !req.url.includes("users/2");
            },
          },
        },
      },
      {
        id: "disabled",
        handler: "middleware",
        response: {
          middleware: (_req, _res, next) => next(),
        },
      },
    ],
  },
];
