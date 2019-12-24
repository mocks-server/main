const getUser = {
  url: "/api/user",
  method: "GET",
  response: {
    status: 200,
    body: [{ email: "foo@foo.com" }]
  }
};

module.exports = {
  getUser
};
