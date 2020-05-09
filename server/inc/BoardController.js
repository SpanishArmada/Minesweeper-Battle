//@ts-check
const GameState = require('./GameState.js').default;
/**
 * @typedef {import('./Player')} Player
 */

/**
 * BoardController
 */
class BoardController {
  constructor() {
    this.nextBoardId = 0;
    this.board = {};
    this.players = {};
  }

  /**
   *
   * @param {Object} options
   * @param {Array<Player>} options.players
   * @param {Array<Array<number>>} options.board
   * @param {number} options.numRows
   * @param {number} options.numCols
   * @param {number} options.numMines
   * @param {number} options.revealedRow
   * @param {number} options.revealedCol
   */
  newGame({
    players,
    board,
    numRows,
    numCols,
    numMines,
    revealedRow,
    revealedCol,
  }) {
    let boardId = this.nextBoardId.toString();
    for (let i = 0; i < players.length; ++i) {
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

  /**
   *
   * @returns {GameState | void} board
   * @param {string} boardId
   */
  getBoard(boardId) {
    return this.board[boardId];
  }

  /**
   *
   * @returns {Array<Player> | void} players
   * @param {string} boardId
   */
  getPlayers(boardId) {
    return this.players[boardId];
  }

  /**
   *
   * @param {string} boardId
   */
  clear(boardId) {
    console.log('Deleting board ID: ', boardId);
    delete this.players[boardId];
    delete this.board[boardId];
  }

  /**
   *
   * @param {Player} player
   */
  disconnect(player) {
    let boardId = player.boardId;
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
