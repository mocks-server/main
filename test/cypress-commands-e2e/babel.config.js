module.exports = {
  plugins: [
    [
      "module-resolver",
      {
        root: ["."],
        alias: {
          "@mocks-server/cypress-commands": "../../packages/cypress-commands",
        },
      },
    ],
  ],
};
