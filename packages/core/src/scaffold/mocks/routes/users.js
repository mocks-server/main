// Use this file only as a guide for first steps. Delete it when you have added your own routes files.
// For a detailed explanation regarding each routes property, visit:
// https://www.mocks-server.org/docs/usage/routes

// users data
const USERS = [
  {
    id: 1,
    name: "John Doe",
  },
  {
    id: 2,
    name: "Jane Doe",
  },
];

module.exports = [
  {
    id: "get-users", // id of the route
    url: "/api/users", // url in express format
    method: "GET", // HTTP method
    variants: [
      {
        id: "success", // id of the variant
        handler: "json", // variant handler
        response: {
          status: 200, // status to send
          body: USERS, // body to send
        },
      },
      {
        id: "error", // id of the variant
        handler: "json", // variant handler
        response: {
          status: 400, // status to send
          body: {
            // body to send
            message: "Error",
          },
        },
      },
    ],
  },
  {
    id: "get-user", // id of the route
    url: "/api/users/:id", // url in express format
    method: "GET", // HTTP method
    variants: [
      {
        id: "success", // id of the variant
        handler: "json", // variant handler
        response: {
          status: 200, // status to send
          body: USERS[0], // body to send
        },
      },
      {
        id: "real", // id of the variant
        handler: "middleware", // variant handler
        response: {
          middleware: (req, res) => {
            const userId = req.params.id;
            const user = USERS.find((userData) => userData.id === Number(userId));
            if (user) {
              res.status(200);
              res.send(user);
            } else {
              res.status(404);
              res.send({
                message: "User not found",
              });
            }
          },
        },
      },
    ],
  },
];
