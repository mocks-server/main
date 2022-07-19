module.exports = [
  {
    id: "base",
    routes: ["get-users-invalid:success", "get-user-variant-invalid:1", "get-user:2"],
  },
  {
    id: "base",
    routes: [],
  },
  {
    id: "invalid-variant",
    from: "base",
    routes: ["get-user-variant-invalid:2"],
  },
  {
    id: "invalid-mock",
  },
  {
    id: "invalid-from",
    from: "foo",
    routes: ["get-user:2"],
  },
  {
    id: "duplicated-route",
    from: "base",
    routes: ["get-user:2", "get-user:1"],
  },
];
