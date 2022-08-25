module.exports = [
  {
    id: "base",
    routes: ["read-users:one-user", "create-user:success", "read-user:success"],
  },
  {
    id: "all-users",
    from: "base",
    routes: ["read-users:two-users"],
  },
  {
    id: "users-error",
    from: "base",
    routes: ["create-user:error", "read-user:not-found"],
  },
];
