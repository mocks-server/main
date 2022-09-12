module.exports = [
  {
    id: "base",
    routes: ["get-users:1", "get-web-error:disabled", "get-web:fast"],
  },
  {
    id: "delayed",
    from: "base",
    routes: ["get-web:delayed"],
  },
  {
    id: "no-index",
    from: "base",
    routes: ["get-web:no-index"],
  },
  {
    id: "web-error",
    from: "base",
    routes: ["get-web-error:error"],
  },
];
