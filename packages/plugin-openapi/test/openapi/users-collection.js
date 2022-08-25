module.exports = [
  {
    id: "base",
    routes: [
      "get-users:200-json-one-user",
      "post-users:201-status",
      "get-users-id:200-json-success",
    ],
  },
  {
    id: "all-users",
    from: "base",
    routes: ["get-users:200-json-two-users"],
  },
  {
    id: "users-error",
    from: "base",
    routes: ["post-users:400-text-error-message", "get-users-id:404-json-not-found"],
  },
];
