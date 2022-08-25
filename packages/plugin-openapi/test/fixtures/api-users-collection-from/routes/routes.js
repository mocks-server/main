module.exports = [
  {
    id: "get-books",
    url: "/api/books",
    method: "get",
    variants: [
      {
        id: "success",
        type: "json",
        options: {
          status: 200,
          body: [
            {
              title: "1984",
              author: "George Orwell",
            },
          ],
        },
      },
    ],
  },
];
