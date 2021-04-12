// Use this file only as a guide for first steps using middlewares. Delete it when no more needed.
// For a detailed explanation about using middlewares, visit:
// https://mocks-server.org/docs/guides-using-middlewares

function middleware(req: Object, res: Object, next: () => void, mocksServer: Object) : void {
  res.set("x-mocks-server-example", "custom-header-typescript");
  mocksServer.tracer.info(
    "Custom header added by add-headers:enabled route variant middleware using TypeScript"
  );
  next();
}

const middlewares = [
  {
    id: "add-headers",
    url: "*",
    method: "GET",
    variants: [
      {
        id: "enabled",
        response: middleware,
      },
      {
        id: "disabled",
        response: (req, res, next) => next(),
      },
    ],
  },
];

export default middlewares;