module.exports = [
  {
    id: "base",
    routesVariants: ["get-users-invalid:success", "get-user-variant-invalid:1", "get-user:2"],
  },
  {
    id: "base",
    routesVariants: [],
  },
  {
    id: "invalid-variant",
    from: "base",
    routesVariants: ["get-user-variant-invalid:2"],
  },
  {
    id: "invalid-mock",
  },
  {
    id: "invalid-from",
    from: "foo",
    routesVariants: ["get-user:2"],
  },
  {
    id: "duplicated-route",
    from: "base",
    routesVariants: ["get-user:2", "get-user:1"],
  },
];
