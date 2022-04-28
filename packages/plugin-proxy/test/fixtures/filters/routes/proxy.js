module.exports = [
  {
    id: "proxy-all",
    url: "*",
    method: ["GET", "POST", "PATCH", "PUT"],
    variants: [
      {
        id: "enabled",
        handler: "proxy",
        host: "http://127.0.0.1:3200",
        options: {
          filter: (req) => {
            return !req.url.includes("users/2");
          },
        },
      },
      {
        id: "disabled",
        response: (req, res, next) => next(),
      },
    ],
  },
];
