// app.js
var http = require('http');
var express = require('express');

var app = express();
var server = http.createServer(app);

app.use(express.static('./static'));
app.set('view engine', 'ejs');
app.set('views', './views');

app.use(express.urlencoded({extended:true}));

app.get('/', function (req, res) {
    res.render('app', { username: ''});
    res.end();
});

app.post('/', (req, res) => {
    var username = req.body.username;

    if ( username && username.length >= 3 ) { 
        res.redirect('/rooms');
    } else {
        res.render('app', { 
            username: username, 
            message: 'Username must contain at least 3 characters'
        });
    }
});

app.get('/rooms', function (req, res) {
    res.render('rooms');
    res.end();
});

server.listen(process.env.PORT || 3000);
console.log('server listens');