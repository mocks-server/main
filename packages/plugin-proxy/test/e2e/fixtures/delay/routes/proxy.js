module.exports = [
  {
    id: "proxy-all",
    url: "*",
    method: ["GET", "POST", "PATCH", "PUT"],
    variants: [
      {
        id: "enabled",
        delay: 1000,
        handler: "proxy",
        host: "http://127.0.0.1:3200",
        options: {},
      },
      {
        id: "disabled",
        response: (req, res, next) => next(),
      },
    ],
  },
];
