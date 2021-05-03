module.exports = [
  {
    id: "base",
    routesVariants: ["get-users-invalid:success", "get-user-variant-invalid:1", "get-user:2"],
  },
  {
    id: "invalid-variant",
    from: "base",
    routesVariants: ["get-user-variant-invalid:2"],
  },
  {
    id: "invalid-mock",
  },
];
