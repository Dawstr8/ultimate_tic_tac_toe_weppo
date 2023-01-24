class UltimateTicTacToeGame {
    constructor() {
        this.bigBoard = this.initBigBoard(),
        this.smallBoards = this.initSmallBoards(),
        this.winningPositions = [[0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6], [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6]],
        this.lastMove = this.deepCopy([null, null]);;
        this.possibleMoves = this.initPossibleMoves();
        this.turn = 'X';
    }

    checkBoardWinner(board) {
        for (let position in this.winningPositions) {
            if (board[position[0]] === board[position[1]] && board[position[0]] === board[position[2]] && board[position[0]] !== 0) {
                return board[position[0]];
            }
        }

        return board.includes(null) ? null : 0;
    }

    get winner() {
        this.checkBoardWinner(this.bigBoard);
    }

    get gameEnded() {
        return this.winner === null;
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
        let possibleMoves = [];
        const bigBoardField = this.lastMove[1];
        if (this.bigBoard[bigBoardField] === null) {
            for (let i = 0; i < 9; i++) {
                if (this.smallBoards[bigBoardField][i] === null) {
                    possibleMoves.push([bigBoardField, i]);
                }
            }
        } else {
            for (let i = 0; i < 9; i++) {
                if (this.bigBoard[i] === null) {
                    for (let j = 0; j < 9; j++) {
                        if (this.smallBoards[i][j] === null) {
                            possibleMoves.push([i, j]);
                        }   
                    } 
                }
            }
        }
    }

    makeMove(player, bigBoardField, smallBoardField) {
        let move = [bigBoardField, smallBoardField]
        console.log(this.gameEnded, this.turn === player, this.isMovePossible(move));
        if (!this.gameEnded && this.turn === player && this.isMovePossible(move)) {
            this.smallBoards[move[0]][move[1]] = player;
            this.bigBoard[move[0]] = this.checkBoardWinner(this.smallBoards[move[0]])
            
            this.lastMove = move;
            this.turn = this.turn === 'X' ? 'O' : 'X';
        
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
        this.initBigBoard();
        this.initSmallBoards();
    }

    deepCopy(object) {
        return JSON.parse(JSON.stringify(object));
    }
}

module.exports = UltimateTicTacToeGame