// app.js
var http = require('http');
var fs = require('fs');
var express = require('express');
var homePage = fs.readFileSync('./views/app.ejs', 'utf-8');

var app = express();
var server = http.createServer(app);

app.use(express.static('./static'));

app.get('/', function (req, res) {
    res.setHeader('Content-type', 'text/html');
    res.write(homePage);
    res.end();
});

server.listen(process.env.PORT || 3000);
console.log('server listens');