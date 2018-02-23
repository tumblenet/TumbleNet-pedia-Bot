require("./config/App.js");
const MWBot = require('mwbot');

var bot = new MWBot(App.options, App.requestOptions);

bot.setGlobalRequestOptions(App.globalRequestOptions);

function IfPageExists(pageTitle, exists, doesntExist, error) {
  //See if a page can be made to see if it exists
  bot.create(pageTitle, '', 'Testing if page exists').then(function (res) {
    //page doesnt exist
    bot.delete(pageTitle, 'Checking over');//Delete the page so it still doesnt exist
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

function ForEachPage(query,then) {
  query.action = "query";
  query.list = "allpages";
  query.aplimit = 999999999;

  //Query for all pages that meet the query
  return bot.request(query).then((res) => {
    // Success
    var pages = res.query.allpages
    pages.forEach(function (page) {
      then(page);
    });
  });
}

function AutoCreateTalkPages() {
  ForEachPage({},function (page) {
    IfPageExists(page.title,function (res) {
      bot.create('Talk:' + page.title, '', 'Created Talk Page').then((res) => {
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
      bot.delete(page.title, "Page '" + pageTitle + "' doesn't exist.");
    });
  }).catch((err) => {
  // Error
  });
}

function loop() {
  AutoCreateTalkPages();
  AutoDeleteTalkPagesOfPagesThatDontExist();
}

function loopThroughAllPagesTest() {
  ForEachPage({},function (page) {
    IfPageExists(page.title,function () {
      console.log("'" + page.title + "' exists.");
    }, function () {
      console.log("'" + page.title + "' doesn't exist.");
    });
  });
}

bot.login(App.user).then(function (res) {
  //logged In
  bot.getEditToken().then((response) => {
    // Success
    setInterval(loop, 3000);
    //loop();
    //loopThroughAllPagesTest();

  }).catch((err) => {
    // Error: Could not get edit token
  });
}).catch(function (err) {
  //error logging in
});
