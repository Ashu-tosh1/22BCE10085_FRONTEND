module.exports = {
  async redirects() {
    return [
      {
        source: "/",
        destination: "/search/trademarks?q=nike",
        permanent: true,
      },
    ];
  },
};