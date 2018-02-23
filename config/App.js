global.App = {
  user: {
    apiUrl: 'http://en.tumblenet.shoutwiki.com/w/api.php',
    username: process.env.WIKI_USER || require('./user.js').username,
    password: process.env.WIKI_PASS || require('./user.js').password
  },
  options: {
    verbose: true,
    silent: false,
    defaultSummary: 'Tumble Bot' + ( (process.env.NODE_ENV !== "production" )? " Development":""),
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
  },
  qualifications: {
    maxSizeForShortPage: 3000,
    aplimit: 999999
  },
  categories: {
    underConstruction: "Category:Under Construction",
  }
}
