const getAsyncLog = () => {
  return Promise.resolve("silly");
};

module.exports = async () => {
  const log = await getAsyncLog();
  return {
    plugins: ["foo"],
    options: {
      log,
      delay: 1000,
    },
  };
};
