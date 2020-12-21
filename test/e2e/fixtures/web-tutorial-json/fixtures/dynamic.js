const INITIAL_USERS = [
  {
    id: 1,
    name: "John Doe",
  },
  {
    id: 2,
    name: "Jane Doe",
  },
];

const getUserReal = {
  id: "get-user-real",
  url: "/api/users/:id",
  method: "GET",
  response: (req, res) => {
    const userId = req.params.id;
    const user = INITIAL_USERS.find((userData) => userData.id === Number(userId));
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
};

module.exports = {
  getUserReal,
};
