const path = require("path");

module.exports = [
  {
    id: "static",
    url: "/",
    variants: [
      {
        id: "success",
        type: "static",
        options: {
          path: path.resolve(__dirname, "..", "static"),
        },
      },
    ],
  },
];
