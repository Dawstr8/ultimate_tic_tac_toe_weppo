// app.js
var http = require('http');
var socket = require('socket.io');
var express = require('express');

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
    res.render('rooms', { rooms: rooms.roomsList });
    res.end();
});

app.get('/game/:id', function (req, res) {
    res.render('game');
    res.end();
});

const Rooms = require('./rooms.js');
var users = {};
var rooms = new Rooms();

io.on('connection', function(socket) {
    users[socket.id] = { username: null, room: null };

    // creating room
    socket.on('create room', () => {
        const roomId = rooms.createRoom();
        socket.emit('room created', roomId);
        console.log(rooms.roomsList);
    });

    // joining room
    socket.on('join room', (roomId) => {
        if (users[socket.id].room === null) {
            const success = rooms.joinRoom(socket.id, roomId);
            if (success) {
                users[socket.id].room = roomId;
                var destination = '/game/' + roomId;
                socket.emit('redirect', destination);
            }
        }
    });

    // leaving room
    socket.on('leave room', () => {
        if (users[socket.id].room !== null) {
            rooms.leaveRoom(socket.id, users[socket.id].room);
        }
    });

    // disconnecting
    socket.on('disconnect', (reason) => {
        if (users[socket.id].room !== null) {
            rooms.leaveRoom(socket.id, users[socket.id].room);
        }
        delete users[socket.id];
    })
});


server.listen(process.env.PORT || 3000);
console.log('server listens');