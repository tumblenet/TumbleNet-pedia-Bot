const express = require('express');
const http = require('http');

var app = express();
var server = http.Server(app);
var port = process.env.PORT || 3000;

app.use(function (req,res,next) {
  res.sendFile(__dirname + '/log.txt');
});

server.listen(port, function () {
  console.log("Server listening on port " + port);
});


global.App.server = server;
