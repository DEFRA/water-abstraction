
module.exports = {
  getNunjucksTest: {
    method: 'GET',
    path: '/nunjucks-test',
    handler: async (request, h) => {
      return h.view('test.njk', request.view, {
        layout: false
      });
    }
  }
};
