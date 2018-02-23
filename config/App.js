global.App = {
  user: require('./user.js') || {
    apiUrl: 'http://en.tumblenet.shoutwiki.com/w/api.php',
    username: process.env.WIKI_USER,
    password: process.env.WIKI_PASS
  },
  options: {
    verbose: false,
    silent: false,
    defaultSummary: 'TumbleBot',
    concurrency: 5,
    apiUrl: false,
    sparqlEndpoint: 'https://query.wikidata.org/bigdata/namespace/wdq/sparql'
  },
  requestOptions: {

  },
  globalRequestOptions: {
      method: 'POST',
      qs: {
          format: 'json'
      },
      headers: {
          'User-Agent': 'mwbot/1.0.3'
      },
      timeout: 120000, // 120 seconds
      jar: true,
      time: true,
      json: true
  }
}
