const getUser = {
  url: "/api/user",
  method: "GET",
  response: {
    status: 200,
    body: [{ email: "foo@foo.com" }]
  }
};

const getUser2 = {
  url: "/api/user",
  method: "GET",
  response: {
    status: 200,
    body: [{ email: "foo2@foo2.com" }]
  }
};

module.exports = {
  getUser,
  getUser2
};
