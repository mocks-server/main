// Use this file only as a guide for first steps using middlewares. Delete it when no more needed.
// For a detailed explanation about using middlewares, visit:
// https://mocks-server.org/docs/guides-using-middlewares

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
          middleware: (req, res, next, mocksServer) => {
            res.set("x-mocks-server-example", "custom-header");
            mocksServer.logger.info(
              "Custom header added by add-headers:enabled route variant middleware"
            );
            next();
          }
        },
      },
      {
        id: "disabled",
        type: "middleware",
        options: {
          middleware: (req, res, next) => next(),
        }
      },
    ],
  },
];
