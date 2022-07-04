module.exports = [
  {
    id: "user-2",
    url: "/api/users/2",
    method: ["GET"],
    variants: [
      {
        id: "default",
        response: {
          status: 200,
          body: {
            id: 2,
            name: "Mocked User",
          },
        },
      },
    ],
  },
];
