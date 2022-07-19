// Use this file only as a guide for first steps using middlewares. Delete it when no more needed.
// For a detailed explanation about using middlewares, visit:
// https://www.mocks-server.org/docs/usage/variants/middleware

module.exports = [
  {
    id: "add-headers",
    url: "*",
    method: "GET",
    variants: [
      {
        id: "enabled",
        type: "middleware",
        options: {
          middleware: (_req, res, next, core) => {
            res.set("x-mocks-server-example", "some-value");
            core.logger.info("Custom header added by route variant middleware");
            next();
          },
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
];
