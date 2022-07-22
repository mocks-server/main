module.exports = [
  {
    id: "foo",
    method: "GET",
    url: "/api/foo",
    variants: [
      {
        id: "success",
        type: "json",
        options: {
          status: 200,
          body: {},
        },
      },
    ],
  },
];
