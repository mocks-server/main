const wp = require("@cypress/webpack-preprocessor");
const path = require("path");

const webpackOptions = {
  resolve: {
    extensions: [".ts", ".js"],
    alias: {
      "@mocks-server/cypress-commands": path.resolve(
        __dirname,
        "../../../../packages/cypress-commands/dist/index.js"
      ),
    },
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        exclude: [/node_modules/],
        use: [
          {
            loader: "ts-loader",
          },
        ],
      },
    ],
  },
};

const options = {
  webpackOptions,
};

module.exports = wp(options);
