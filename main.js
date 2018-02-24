require("./config/App.js");
require('./log.js');
require("./webserver.js");

const MWBot = require('mwbot');

var bot = new MWBot(App.options, App.requestOptions);
bot.setGlobalRequestOptions(App.globalRequestOptions);

function IfPageExists(pageTitle="", exists=function () {}, doesntExist=function () {}, error=function (err) {}) {
  //See if a page can be made to see if it exists
  bot.create(pageTitle, '').then(function (res) {
    //page doesnt exist
    bot.delete(pageTitle);//Delete the page so it still doesnt exist
    doesntExist();
  }).catch(function (err) {
    //page does exist
    switch (err.code) {
      case "articleexists":
        exists()
        break;
      default:
        console.log("Error creating page '" + pageTitle + "'.  --  " + err.code);
        error(err);
    }
  });
}

function ForEachPage(query={}, then=function (page) {}, get="allpages") {
  if (query.generator == "allpages") {
    query.gaplimit = query.gaplimit ||  App.qualifications.aplimit
  } else {
    query.list = query.list || "allpages";
    query.aplimit = query.aplimit ||  App.qualifications.aplimit;
  }
  query.action = query.action || "query";

  //Query for all pages that meet the query
  return bot.request(query).then((res) => {
    // Success
    var pages = res.query[get];
    if (pages.length === undefined) {
      var pagesArray = [];
      for (var pageId in pages) {
        pagesArray.push(pages[pageId]);
      }
      pages = pagesArray;
      pagesArray = undefined;
    }
    pages.forEach(function (page) {
      then(page);
    });
  });
}

function ForEachPageGetProperty(propertyList=[], query={}, then=function (page) {}) {
  //propertyList.push("titles");
  query.generator = query.generator || "allpages";
  query.prop = query.prop || propertyList.join("|");
  return ForEachPage(query, then, "pages");
}

function AutoCreateTalkPages() {
  ForEachPage({},function (page) {
    IfPageExists(page.title,function (res) {
      bot.create('Talk:' + page.title, '').then((res) => {
        console.log("Talk page created for '" + page.title + "'.");
      }).catch((err) => {
        // General error, or: page already exists
        switch (err.code) {
          case "articleexists":

            break;
          default:
            console.log("Error creating talk page for '" + page.title + "'.  --  " + err.code)
        }
      });
    },function (err) {

    });
  }).catch((err) => {
  // Error
  });
}
function AutoDeleteTalkPagesOfPagesThatDontExist() {
  ForEachPage({
    apnamespace: 1 //Specify talk pages
  },function (page) {
    var pageTitle = page.title.substr(5);
    IfPageExists(pageTitle,function (res) {

    },function (err) {//IF PAGE DOESNT EXIST
      console.log("Deleting '" + page.title + "'...");
      bot.delete(page.title);
    });
  }).catch((err) => {
  // Error
  });
}

function SetShortPagesAsUnderConstruction() {
  ForEachPageGetProperty(["categories"],{
    gapmaxsize: App.qualifications.maxSizeForShortPage,
    gapfilterredir: "nonredirects"
  },function (page) {
    //console.log(page);
    try {
      var test = page.categories.filter(category => (category.title === App.categories.underConstruction));
      if (typeof image_array !== 'undefined' && image_array.length > 0) {

      } else {
        throw "Under Construction";
      }
    } catch (e) {
      console.log(page.title + " is a short page.");
      bot.request({
        action: 'edit',
         title: page.title,
         prependtext: "{{construction | sign=~~~~}}\n\n",
         token: bot.editToken
       });
    } finally {

    }
  });
}

function loop() {
  AutoCreateTalkPages();
  AutoDeleteTalkPagesOfPagesThatDontExist();
  //SetShortPagesAsUnderConstruction();
}

function DevTest() {
  SetShortPagesAsUnderConstruction();

}

bot.login(App.user).then(function (res) {
  //logged In
  bot.getEditToken().then((response) => {
    // Success
    setInterval(loop, 3000);
    //loop();

  //  DevTest();

  }).catch((err) => {
    // Error: Could not get edit token
  });
}).catch(function (err) {
  //error logging in
});
