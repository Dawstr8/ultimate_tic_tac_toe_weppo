class UltimateTicTacToeGame {
    constructor() {
        this.bigBoard = this.initBigBoard(),
        this.smallBoards = this.initSmallBoards(),
        this.winningPositions = [[0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6], [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6]],
        this.lastMove = this.deepCopy([null, null]);;
        this.possibleMoves = this.initPossibleMoves();
        this.possibleBoards = this.deepCopy([true, true, true, true, true, true, true, true, true])
        this.turn = Math.random() > 0.5 ? 'X' : 'O';
        this.winner = null;
    }

    checkBoardWinner(board) {
        for (let position of this.winningPositions) {
            if (board[position[0]] === board[position[1]] && board[position[0]] === board[position[2]] && board[position[0]] !== null) {
                return board[position[0]];
            }
        }

        return board.includes(null) ? null : 0;
    }

    get gameEnded() {
        return this.winner !== null;
    }

    initPossibleMoves() {
        let possibleMoves = [];
        for (let i = 0; i < 9; i++) {
            for (let j = 0; j < 9; j++) {
                possibleMoves.push([i, j]);
            }
        }
        return possibleMoves;
    }

    generatePossibleMoves() {
        this.generatePossibleBoards();
        let possibleMoves = [];
        for (let i = 0; i < 9; i++) {
            if (this.possibleBoards[i]) {
                for (let j = 0; j < 9; j++) {
                    if (this.smallBoards[i][j] === null) {
                        possibleMoves.push([i, j]);
                    }   
                } 
            }
        }

        return possibleMoves;
    }

    generatePossibleBoards() {
        if (this.gameEnded) {
            this.possibleBoards = [false, false, false, false, false, false, false, false, false];
            return;
        }
        let possibleBoards = [false, false, false, false, false, false, false, false, false];
        const bigBoardField = this.lastMove[1];
        if (this.bigBoard[bigBoardField] === null) {
            possibleBoards[bigBoardField] = true;
        } else {
            for (let i = 0; i < 9; i++) {
                if (this.bigBoard[i] === null) {
                    possibleBoards[i] = true;
                }   
            }
        }

        this.possibleBoards = possibleBoards;
    }

    makeMove(player, bigBoardField, smallBoardField) {
        let move = [bigBoardField, smallBoardField]
        if (!this.gameEnded && this.turn === player && this.isMovePossible(move)) {
            this.smallBoards[move[0]][move[1]] = player;

            this.bigBoard[move[0]] = this.checkBoardWinner(this.smallBoards[move[0]])
            
            this.lastMove = move;
            this.turn = this.turn === 'X' ? 'O' : 'X';

            this.winner = this.checkBoardWinner(this.bigBoard);
            this.possibleMoves = this.generatePossibleMoves();
        
            return move;
        }

        return null;
    }

    isMovePossible(move) {
        for (let i = 0; i < this.possibleMoves.length; i++) {
            if (this.possibleMoves[i][0] === move[0] && this.possibleMoves[i][1] === move[1]) {
                return true;
            }
        }

        return false;
    }

    initBigBoard() {
        const emptyBoard = [null, null, null, null, null, null, null, null, null];
        return this.deepCopy(emptyBoard);
    }

    initSmallBoards() {
        const emptyBoard = [null, null, null, null, null, null, null, null, null];
        return [this.deepCopy(emptyBoard), this.deepCopy(emptyBoard), this.deepCopy(emptyBoard),
                this.deepCopy(emptyBoard), this.deepCopy(emptyBoard), this.deepCopy(emptyBoard),
                this.deepCopy(emptyBoard), this.deepCopy(emptyBoard), this.deepCopy(emptyBoard)];
    }

    resetGame() {
        this.bigBoard = this.initBigBoard();
        this.smallBoards = this.initSmallBoards();
        this.possibleMoves = this.initPossibleMoves();
        this.possibleBoards = this.deepCopy([true, true, true, true, true, true, true, true, true]);
        this.turn = Math.random() < 0.5 ? 'X' : 'O';
        this.lastMove = [null, null];
        this.winner = null;
    }

    deepCopy(object) {
        return JSON.parse(JSON.stringify(object));
    }
}

module.exports = UltimateTicTacToeGame