const webpack = require("webpack");
const path = require("path");

module.exports = {
  entry: "./src/index.js",
  output: {
    path: path.resolve(__dirname, "public"),
    filename: "main.js",
  },
  plugins: [
    new webpack.EnvironmentPlugin({
      PORT: 3100,
    }),
  ],
};
