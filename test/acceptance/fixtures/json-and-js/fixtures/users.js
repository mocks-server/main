module.exports = [
  {
    id: "get-users",
    url: "/api/users",
    method: "GET",
    response: {
      status: 200,
      body: [
        {
          id: 1,
          name: "John Doe"
        },
        {
          id: 2,
          name: "Jane Doe"
        }
      ]
    }
  }
];
