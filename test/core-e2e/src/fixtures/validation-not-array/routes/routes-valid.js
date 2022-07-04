module.exports = [
  {
    id: "foo",
    method: "GET",
    url: "/api/foo",
    variants: [
      {
        id: "success",
        handler: "json",
        response: {
          status: 200,
          body: {},
        },
      },
    ],
  },
];
