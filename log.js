const fs = require('fs');
var util = require('util');
var log_file = fs.createWriteStream(__dirname + '/log.txt', {flags : 'w'});
var log_stdout = process.stdout;

var oldLog = console.log;

console.log = function (s) {
  //oldLog(s);

  log_file.write(util.format(s) + '\n');
  log_stdout.write(util.format(s) + '\n');
}
