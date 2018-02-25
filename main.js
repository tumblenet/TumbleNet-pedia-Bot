require("./config/App.js");
require('./log.js');
require("./webserver.js");

const MWBot = require('mwbot');

var bot = new MWBot(App.options, App.requestOptions);
bot.setGlobalRequestOptions(App.globalRequestOptions);

function FirstLetterUppercase(s) {
  return s[0].toUpperCase() + s.substring(1);
}

function ToArray(obj) {
  var objArray = [];
  for (var item in obj) {
    objArray.push(obj[item]);
  }
  return objArray;
}

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
  return ForEachPage(query,then,"pages");
}

function AutoCreateTalkPages(namespaces) {

  if (namespaces === undefined) {
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
              console.log("Error creating talk page for '" + page.title + "'.  --  " + err.code);
          }
        });
      },function (err) {

      });
    }).catch((err) => {
    // Error
    });
  } else {
    namespaces.forEach(function (namespace) {
      ForEachPage({
        apnamespace: namespace
      },function (page) {
        IfPageExists(page.title,function (res) {
          bot.create(App.wiki.getTalkNamespaceName(namespace) + ':' + page.title, '').then((res) => {
            console.log("Talk page created for '" + page.title + "': " + App.wiki.getTalkNamespaceName(namespace) + ':' + page.title);
          }).catch((err) => {
            // General error, or: page already exists
            switch (err.code) {
              case "articleexists":

                break;
              default:
                console.log("Error creating talk page for '" + page.title + "'.  --  " + err.code);
            }
          });
        },function (err) {

        });
      }).catch((err) => {
      // Error
      });
    });
  }


}
function AutoDeleteTalkPagesOfPagesThatDontExist(namespaces) {
  if (namespaces === undefined) {
    ForEachPage({
      apnamespace: App.wiki.namespaces.Talk //Specify talk pages
    },function (page) {
      var pageTitle = page.title.substr(5);
      IfPageExists(pageTitle, function (res) {

      },function (err) {//IF PAGE DOESNT EXIST
        console.log("Deleting '" + page.title + "'...");
        bot.delete(page.title);
      });
    }).catch((err) => {
    // Error
    });
  } else {
    namespaces.forEach(function (namespace) {
      ForEachPage({
        apnamespace: namespace //Specify talk pages
      },function (page) {
        var pageTitle = page.title.substr(5);
        IfPageExists(pageTitle, function (res) {

        },function (err) {//IF PAGE DOESNT EXIST
          console.log("Deleting '" + page.title + "'...");
          bot.delete(page.title);
        });
      }).catch((err) => {
      // Error
      });
    });
  }

}


function SetShortPagesAsUnderConstruction() {
  ForEachPageGetProperty(["revisions"],{
    gapmaxsize: App.qualifications.maxSizeForShortPage,
    gapfilterredir: "nonredirects",
  	rvprop: "content",
  	rvdir: "older",

  },function (page) {
    //console.log(page);
    var constructionTemplateName = App.template.underConstruction;
    var currentRevision = page.revisions[0]['*'];
    try {
      var includesTemplate = currentRevision.includes("{{" + constructionTemplateName);
      var includesTemplateCapitalised = currentRevision.includes("{{" + FirstLetterUppercase(constructionTemplateName));
      //console.log(includesTemplate || includesTemplateCapitalised);
      if (includesTemplate || includesTemplateCapitalised) {
        // the array is defined and has at least one element
        //console.log(page.title + " yes");
      } else {
        //console.log(page.title + " no");
        throw "Under Construction"
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

function AddDocumentationToTemplates() {
  ForEachPageGetProperty(["revisions"],{
    gapnamespace: 10,
    gapfilterredir: "nonredirects",
  	rvprop: "content"
  },function (page) {
    //console.log(page);
    if (page.title.endsWith("/doc")) {
      return;
    }
    try {
      var documentationTemplateName = App.template.documentation;
      var currentRevision = page.revisions[0]['*'];
      try {
        var includesTemplate = currentRevision.includes("{{" + documentationTemplateName);
        var includesTemplateCapitalised = currentRevision.includes("{{" + FirstLetterUppercase(documentationTemplateName));
        //console.log(includesTemplate || includesTemplateCapitalised);
        if (includesTemplate || includesTemplateCapitalised) {
          // the array is defined and has at least one element
          //console.log(page.title + " yes");
        } else {
          //console.log(page.title + " no");
          throw "Documentation"
        }
      } catch (e) {
        console.log(page.title + " has no documentation");
        bot.request({
          action: 'edit',
          title: page.title,
          appendtext: "<noinclude>{{documentation}}</noinclude>",
          token: bot.editToken
        });
      } finally {

      }
    } catch (e) {
      return;
    } finally {

    }

  });
}

function AutoDeleteDocumentationPagesOfTemplatesThatDontExist() {
  ForEachPage({
    apnamespace: App.wiki.namespaces.Template //Specify template pages
  },function (page) {
    var pageTitle = page.title.substr(5);
    IfPageExists(pageTitle, function (res) {

    },function (err) {//IF PAGE DOESNT EXIST
      console.log("Deleting '" + page.title + "'...");
      bot.delete(page.title);
    });
  }).catch((err) => {
  // Error
  });
}

function loop() {
  AutoCreateTalkPages(ToArray(App.wiki.normal_ns));
  AutoDeleteTalkPagesOfPagesThatDontExist();
  SetShortPagesAsUnderConstruction();
  AddDocumentationToTemplates();
}

function DevTest() {
  SetShortPagesAsUnderConstruction();
  // bot.request({
  //   action: 'edit',
  //   title: "Test page",
  //   prependtext: "{{construction | sign=~~~~}}",
  //   token: bot.editToken
  // });

}

function Start() {
  bot.login(App.user).then(function (res) {
    //logged In
    bot.getEditToken().then((res) => {
      // Success
      setInterval(loop, 3000);
      //loop();

      //DevTest();

    }).catch((err) => {
      // Error: Could not get edit token
    });
  }).catch(function (err) {
    //error logging in
  });
}
Start();
