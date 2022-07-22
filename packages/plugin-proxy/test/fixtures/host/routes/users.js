const { USERS } = require("../db/users");

module.exports = [
  {
    id: "get-users",
    url: "/api/users",
    method: "GET",
    variants: [
      {
        id: "success",
        type: "json",
        options: {
          status: 200,
          body: USERS,
        },
      },
    ],
  },
];
