module.exports = [
  {
    id: "get-user",
    url: "/api/user",
    method: "GET",
    variants: [
      {
        id: "1",
        response: {
          status: 200,
          body: [{ email: "foo@foo.com" }],
        },
      },
      {
        id: "2",
        response: {
          status: 200,
          body: [{ email: "foo2@foo2.com" }],
        },
      },
    ],
  },
];
