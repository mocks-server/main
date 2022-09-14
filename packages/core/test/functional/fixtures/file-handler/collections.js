module.exports = [
  {
    id: "base",
    routes: ["web:success", "get-users:success", "get-user:success"],
  },
  {
    id: "users-error",
    from: "base",
    routes: ["get-users:error", "get-user:error"],
  },
  {
    id: "user-file-error",
    from: "base",
    routes: ["get-user:file-error"],
  },
];
