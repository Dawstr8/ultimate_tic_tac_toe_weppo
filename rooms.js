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
            players: [null, null],
            game: new UltimateTicTacToeGame(),
        }

        return this.numberOfRooms.toString();
    }

    joinRoom(userId, roomId) {
        if (this.roomsList[roomId].players.filter((name) => name !== null).length > 1) {
            return false;
        }

        this.roomsList[roomId].players[this.roomsList[roomId].players[0] === null ? 0 : 1] = userId;
        
        return true;
    };

    leaveRoom(userId, roomId) {
        if (this.roomsList.hasOwnProperty(roomId)) {
            this.roomsList[roomId].players = this.roomsList[roomId].players.map((user) => {
                if (user === userId) {
                    return null;
                }

                return user;
            });

            if (this.roomsList[roomId].players.filter((name) => name !== null).length === 0) {
                delete this.roomsList[roomId];
                return true;
            }
            
        }
        return false
    }

}

module.exports = Rooms