module.exports = [
  {
    id: "base",
    routes: [
      "get-users:200-json-one-user",
      "post-users:201-status",
      "get-users-id:200-json-success",
      "get-users-id-books-bookId:200-json-success",
      "get-users-id-books-bookId-pages-pageNumber:200-text-success",
    ],
  },
];
