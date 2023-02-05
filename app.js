var http = require('http');
var socket = require('socket.io');
var express = require('express');
var crypto = require('crypto');

const { sessionMiddleware, wrap, createSessionMiddleware } = require('./sessionController.js');

var app = express();
var server = http.createServer(app);
var io = socket(server);

app.use(express.static('./static'));
app.set('view engine', 'ejs');
app.set('views', './views');

const Rooms = require('./rooms.js');
var rooms = new Rooms();

var users = {};

app.use(express.urlencoded({ extended:true }));
app.use(sessionMiddleware);
app.use(createSessionMiddleware(users));

app.get('/', (req, res) => {
    const uuid = req.session.uuid;
    res.render('app', { username: users[uuid].username });
    res.end();
});

app.post('/', (req, res) => {
    var username = req.body.username;
    if ( username && username.length >= 3 ) {
        const uuid = req.session.uuid;
        users[uuid].username = username;
        res.redirect('/rooms');
    } else {
        res.render('app', { 
            username: username, 
            message: 'Username must contain at least 3 characters'
        });
    }
});

app.get('/rooms', (req, res) => {
    const uuid = req.session.uuid;
    if (checkIfUsernameIsPresent(uuid, res)) {
        res.render('rooms', { rooms: rooms.roomsList, username: users[uuid].username, currentRoom: users[uuid].room });
    };
    res.end();
});

app.get('/game/:id', function (req, res) {
    const roomId = req.params.id;
    const uuid = req.session.uuid;
    if (checkIfUsernameIsPresent(uuid, res)) {
        if (rooms.roomsList.hasOwnProperty(roomId)) {
            let game = rooms.roomsList[roomId].game;
            let firstPlayer = rooms.roomsList[roomId].players[0] ? users[rooms.roomsList[roomId].players[0]].username : null;
            let secondPlayer = rooms.roomsList[roomId].players[1] ? users[rooms.roomsList[roomId].players[1]].username : null;
            let yourPlayerNr = rooms.roomsList[roomId].players[0] === uuid ? 'X' : 'O';
            res.render('game', { game, players: [firstPlayer, secondPlayer], id: roomId, yourPlayerNr });
        } else {
            res.redirect('/rooms');
        }
    }
    res.end();
});

const checkIfUsernameIsPresent = (uuid, res) => {
    if (users[uuid].username === null) {
        res.redirect('/');
        return false;
    }

    return true;
}

io.use(wrap(sessionMiddleware));
io.use(wrap(createSessionMiddleware(users)));
io.on('connection', function(socket) {
    let uuid = socket.request.session.uuid;
    if (users[uuid].room) {
        socket.join(users[uuid].room);
    }

    socket.on('create room', () => createRoom(socket));

    socket.on('join room', (roomId) => joinRoom(socket, roomId));

    socket.on('leave room', () => leaveRoom(socket));

    socket.on('make move', (fieldId) => {
        const uuid = socket.request.session.uuid;
        const roomId = users[uuid].room;
        const game = rooms.roomsList[roomId].game;
        const player = rooms.roomsList[roomId].players[0] === uuid ? 'X' : 'O';
        const move = game.makeMove(player, parseInt(fieldId[0]), parseInt(fieldId[1]));
        if (move !== null) {
            io.to(roomId).emit('move made', move[0].toString() + move[1].toString(), player, game);
        }
    });

    socket.on('reset game', () => resetGame(socket));

    createRoom = (socket) => {
        let roomId = rooms.createRoom();
        joinRoom(socket, roomId);
        io.emit('room created', roomId, rooms.roomsList[roomId]);
    };

    joinRoom = (socket, roomId) => {
        let uuid = socket.request.session.uuid;
        leaveRoom(socket);
        const success = rooms.joinRoom(uuid, roomId);
        if (success) {
            users[uuid].room = roomId;
            socket.join(roomId);
            io.emit('room state changed', users[uuid].room, rooms.roomsList[users[uuid].room]);

            let firstPlayer = rooms.roomsList[roomId].players[0] ? users[rooms.roomsList[roomId].players[0]].username : null;
            let secondPlayer = rooms.roomsList[roomId].players[1] ? users[rooms.roomsList[roomId].players[1]].username : null;
            io.to(roomId).emit('player joined room', [firstPlayer, secondPlayer]);

            var destination = '/game/' + roomId;
            socket.emit('redirect', destination);
        }
    };

    leaveRoom = (socket) => {
        let uuid = socket.request.session.uuid;
        if (users[uuid].room !== null) {
            const roomDeleted = rooms.leaveRoom(uuid, users[uuid].room);
            if (roomDeleted) {
                io.emit('room deleted', users[uuid].room);
            } else {
                io.emit('room state changed', users[uuid].room, rooms.roomsList[users[uuid].room]);

                let roomId = users[uuid].room;
                let firstPlayer = rooms.roomsList[roomId].players[0] ? users[rooms.roomsList[roomId].players[0]].username : null;
                let secondPlayer = rooms.roomsList[roomId].players[1] ? users[rooms.roomsList[roomId].players[1]].username : null;
                io.to(roomId).emit('player left room', [firstPlayer, secondPlayer]);
            }

            var destination = '/rooms';
            socket.emit('redirect', destination);
            users[uuid].room = null;
        }
    };

    resetGame = (socket) => {
        let uuid = socket.request.session.uuid;
        let roomId = users[uuid].room;
        let game = rooms.roomsList[roomId].game;
        game.resetGame();
        io.to(roomId).emit('game reset', game);
    }

});

server.listen(process.env.PORT || 3000);
console.log('server listens');