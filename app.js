// app.js
var http = require('http');
var socket = require('socket.io');
var express = require('express');
var crypto = require("crypto");

var app = express();
var server = http.createServer(app);
var io = socket(server);

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
    res.render('rooms', { rooms });
    res.end();
});

app.get('/game/:id', function (req, res) {
    res.render('game');
    res.end();
});

var users = {};
var rooms = {};
var roomsNr = 0;

io.on('connection', function(socket) {
    console.log('client connected:' + socket.id);
    users[socket.id] = { username: '' };

    // creating room
    socket.on('create room', () => createRoom(socket));

    // joining room
    socket.on('join room', (roomId) => joinRoom(socket, roomId)); 
});

function createRoom(socket) {
    rooms[roomsNr] = {
        id: roomsNr,
        players: [socket.id],
    }
    io.emit('room created', roomsNr );

    roomsNr += 1;
}

function joinRoom(socket, roomid) {
    console.log('join');
    var destination = '/game/' + roomid;
    socket.emit('redirect', destination);
};

server.listen(process.env.PORT || 3000);
console.log('server listens');