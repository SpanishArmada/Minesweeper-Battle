//@ts-check
var GameState = require('./GameState.js').default;

class BoardController {
  constructor() {
    this.nextBoardId = 0;
    this.board = {};
    this.players = {};
  }
  newGame({
    players,
    board,
    numRows,
    numCols,
    numMines,
    revealedRow,
    revealedCol,
  }) {
    var boardId = this.nextBoardId.toString();
    for (var i = 0; i < players.length; ++i) {
      players[i].boardId = boardId;
      players[i].idx = i;
    }

    this.players[boardId] = players;
    this.board[boardId] = new GameState({
      players,
      board,
      numRows,
      numCols,
      numMines,
      revealedRow,
      revealedCol,
    });
    ++this.nextBoardId;

    return this.board[boardId];
  }

  getBoard(boardId) {
    return this.board[boardId];
  }
  getPlayers(boardId) {
    return this.players[boardId];
  }
  clear(boardId) {
    console.log('Deleting board ID: ', boardId);
    delete this.players[boardId];
    delete this.board[boardId];
  }
  disconnect(player) {
    var boardId = player.boardId;
    if (
      boardId === null ||
      // Board has not been deleted
      typeof this.board[boardId] === 'undefined'
    ) {
      return;
    }

    this.board[boardId].disconnect();

    if (this.board[boardId].getNumPlayersOnline() === 0) {
      this.clear(boardId);
    }
  }
}

module.exports = {
  default: BoardController,
};
