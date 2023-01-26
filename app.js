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
app.use(express.static( "./static" ));

const Rooms = require('./rooms.js');
var users = {};
var rooms = new Rooms();
var socketIdToUuid = {};
var knownUuids = [];

// ENDPOINTS
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
    const id = req.params.id;
    if (rooms.roomsList.hasOwnProperty(id)) {
        res.render('game', { game: rooms.roomsList[id].game, players: rooms.roomsList[id].players, id });
    } else {
        res.redirect('/rooms');
    }
    
    res.end();
});

io.on('connection', function(socket) {
    socket.on('connected', (clientUuid) => {
        socketIdToUuid[socket.id] = clientUuid;
        if (!knownUuids.includes(clientUuid)) {
            knownUuids.push(clientUuid);
            users[clientUuid] = { username: null, room: null };
        } else {
            socket.join(users[clientUuid].room);
        }

        
    });

    // creating room
    socket.on('create room', () => {
        const roomId = rooms.createRoom();
        io.emit('room created', roomId);
    });

    // joining room
    socket.on('join room', (roomId) => {
        if (users[socketIdToUuid[socket.id]].room === null) {
            const success = rooms.joinRoom(socketIdToUuid[socket.id], roomId);
            if (success) {
                users[socketIdToUuid[socket.id]].room = roomId;
                var destination = '/game/' + roomId;
                socket.emit('redirect', destination);
                socket.join(roomId);
            }
            
        }
    });

    // leaving room
    socket.on('leave room', () => {
        if (users[socketIdToUuid[socket.id]].room !== null) {
            rooms.leaveRoom(socketIdToUuid[socket.id], users[socketIdToUuid[socket.id]].room);
            users[socketIdToUuid[socket.id]].room = null;
        }
    });

    // disconnecting
    socket.on('disconnect', (reason) => {
        delete socketIdToUuid[socket.id];
    })

    socket.on('make move', (fieldId) => {
        const roomId = users[socketIdToUuid[socket.id]].room;
        const game = rooms.roomsList[roomId].game;
        const player = rooms.roomsList[roomId].players[0] === socketIdToUuid[socket.id] ? 'X' : 'O';
        const move = game.makeMove(player, parseInt(fieldId[0]), parseInt(fieldId[1]));
        if (move !== null) {
            io.to(roomId).emit('move made', move[0].toString() + move[1].toString(), player, game);
        }
    });
});

server.listen(process.env.PORT || 3000);
console.log('server listens');