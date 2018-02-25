var wikiNamespaceIDs = {
  Media: -2,
  Special: -1,
  _: 0,
  Talk: 1,
  User: 2,
  User_talk: 3,
  Project: 4,
  Project_Talk: 5,
  File: 6,
  File_talk: 7,
  MediaWiki: 8,
  MediaWiki_talk: 9,
  Template: 10,
  Template_talk: 11,
  Help: 12,
  Help_talk: 13,
  Category: 14,
  Category_talk: 15,
  Property: 16,
  Property_talk: 17,
  Concept: 18,
  Concept_talk: 19,
  UserWiki: 20,
  UserWiki_talk: 21,
  Link: 22,
  Link_talk: 23,
  Module: 24,
  Module_talk: 25,
  Gadget: 26,
  Gadget_talk: 27,
  Gadget_definition: 28,
  Gadget_definition_talk: 29
};

function NormaliseName(s) {
  return s[0].toUpperCase() + s.substring(1);
}

function isEven(n) {
   return n % 2 == 0;
}

function isOdd(n) {
   return Math.abs(n % 2) == 1;
}

function GetCertainNS(array,checkFunc) {
  var nsObject = {};
  for (var namespaceName in array) {
    var namespaceID = array[namespaceName];
    if (namespaceID > -1) {
      if (checkFunc(namespaceID)) {
        nsObject[namespaceName] = namespaceID;
      }
    }
  }
  return nsObject;
}

global.App = {
  user: {
    apiUrl: 'http://en.tumblenet.shoutwiki.com/w/api.php',
    username: process.env.WIKI_USER || require('./user.js').username,
    password: process.env.WIKI_PASS || require('./user.js').password
  },
  options: {
    verbose: true,
    silent: false,
    defaultSummary: 'Tumble Bot' + ( (process.env.NODE_ENV !== "production" )? " Development": ""),
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
    underConstruction: "Category: Under Construction",
  },
  template: {
    underConstruction: "construction",
    documentation: "documentation"
  },
  wiki: {
    namespaces: wikiNamespaceIDs,
    normal_ns: GetCertainNS(wikiNamespaceIDs,isEven),
    talk_ns: GetCertainNS(wikiNamespaceIDs, isOdd),
    getNamespaceName(id) {
      for (var namespaceName in wikiNamespaceIDs) {
        if (wikiNamespaceIDs[namespaceName]==id) {
          if (namespaceName == "_") {
            return "";
          } else {
            return namespaceName.replace("_"," ");
          }
        }
      }
      throw "ID " + id + " not found";
    },
    getTalkNamespace: function (id) {
      if(id>-1 && !App.wiki.getNamespaceName(id).includes('talk')&&!App.wiki.getNamespaceName(id).includes('Talk')){
        return id+1;
      }
      throw App.wiki.getNamespaceName(id) + " pages dont have Talk pages.";
    },
    getTalkNamespaceName: function (id) {
      return App.wiki.getNamespaceName(App.wiki.getTalkNamespace(id));
    },
    getTalkNamespacefromNSName: function (nsName) {
      nsName = NormaliseName(nsName);
      return App.wiki.getTalkNamespace(wikiNamespaceIDs[nsName.replace(" ","_")]);
    },
    getTalkNamespaceNamefromNSName: function (nsName) {
      nsName = NormaliseName(nsName);
      return App.wiki.getTalkNamespaceName(wikiNamespaceIDs[nsName.replace(" ","_")]);
    }
  }
}
