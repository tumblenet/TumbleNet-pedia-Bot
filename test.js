require('./config/App.js');

console.log(App.wiki.namespaces.file);

console.log(App.wiki.namespaces);

console.log(App.wiki.talk_ns);

console.log(App.wiki.getNamespaceName(12));
console.log(App.wiki.getTalkNamespaceNamefromNSName("Talk"));
