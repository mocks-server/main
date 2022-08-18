module.exports = [
  {
    id: "base",
    routes: [
      "read-users:200-json-one-user",
      "create-user:201-status",
      "read-user:200-json-success",
    ],
  },
  {
    id: "all-users",
    from: "base",
    routes: ["read-users:200-json-two-users"],
  },
  {
    id: "users-error",
    from: "base",
    routes: ["create-user:400-text-error-message", "read-user:404-json-not-found"],
  },
];
