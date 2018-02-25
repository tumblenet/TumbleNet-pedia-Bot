require('./config/App.js');

function ToArray(obj) {
  var array = [];
  for (var item in obj) {
    array.push(obj[item]);
  }
  return array;
}

console.log(ToArray(App.wiki.normal_ns));
