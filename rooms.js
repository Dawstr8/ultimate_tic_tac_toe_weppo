const UltimateTicTacToeGame = require('./game.js');

class Rooms {
    constructor() {
        this.roomsList = {};
        this.numberOfRooms = 0;
    }

    createRoom() {
        this.numberOfRooms += 1;
        this.roomsList[this.numberOfRooms] = {
            id: this.numberOfRooms,
            players: [],
            game: new UltimateTicTacToeGame(),
        }

        return this.numberOfRooms;
    }

    joinRoom(userId, roomId) {
        if (this.roomsList[roomId].players.length > 1) {
            return false;
        }

        this.roomsList[roomId].players.push(userId);
        return true;
    };

    leaveRoom(userId, roomId) {
        this.roomsList[roomId].players = this.roomsList[roomId].players.filter(user => user !== userId);
    }

}

module.exports = Rooms