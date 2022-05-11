module.exports = [
  {
    id: "foo",
    method: "GET",
    url: "/api/foo",
    variants: [
      {
        id: "success",
        response: {
          status: 200,
          body: {},
        },
      },
    ],
  },
];
