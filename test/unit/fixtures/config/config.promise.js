module.exports = () => {
  return Promise.resolve({
    plugins: ["foo"],
    options: {
      log: "silly",
      delay: 1000,
    },
  });
};
