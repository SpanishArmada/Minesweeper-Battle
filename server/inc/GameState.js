//@ts-check
const Scoring = require('./scoring.js');
/**
 * @typedef {import('./Player')} Player
 */

/**
 * Constant
 */
const Constant = {
  UNREVEALED: -1,
  NO_MINE: 0,
  REVEALED_MINE: 9,
  CORRECT_FLAG: 10,

  /**
   * special case for hiddenBoard
   */
  HAS_MINE: 9,
};

class GameState {
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
  constructor({
    players,
    board,
    numRows,
    numCols,
    numMines,
    revealedRow,
    revealedCol,
  }) {
    this.players = players;
    this.board = board;
    this.numRows = numRows;
    this.numCols = numCols;
    this.numMines = numMines;
    this.revaledRow = revealedRow;
    this.revaledCol = revealedCol;

    this.hiddenBoard = board;
    this.numPlayersOnline = players.length;

    // this contains revealed grids
    let gameBoard = new Array(numRows);
    for (let i = 0; i < numRows; ++i) {
      gameBoard[i] = new Array(numCols);
      for (let j = 0; j < numCols; ++j) {
        gameBoard[i][j] = Constant.UNREVEALED;
      }
    }

    /**
     * @type Array<Array<number>>
     */
    this.gameBoard = gameBoard; // added public reference to gameBoard

    this.reveal(revealedRow, revealedCol);
  }
  disconnect() {
    --this.numPlayersOnline;
  }
  getNumPlayersOnline() {
    return this.numPlayersOnline;
  }

  /**
   *
   * @param {number} r row
   * @param {number} c column
   */
  inBoard(r, c) {
    return 0 <= r && r < this.numRows && 0 <= c && c < this.numCols;
  }

  revealAll() {
    for (var r = 0; r < this.numRows; ++r) {
      for (var c = 0; c < this.numCols; ++c) {
        if (this.gameBoard[r][c] === Constant.UNREVEALED) {
          this.reveal(r, c);
        }
      }
    }
  }

  /**
   *
   * @param {number} i row
   * @param {number} j column
   */
  reveal(i, j) {
    if (this.gameBoard[i][j] === Constant.UNREVEALED) {
      if (this.hiddenBoard[i][j] === Constant.HAS_MINE) {
        this.gameBoard[i][j] = Constant.REVEALED_MINE;
        --this.numMines;

        return Scoring.MINE_EXPLODED_MULTIPLIER;
      } else if (this.hiddenBoard[i][j] === Constant.NO_MINE) {
        // BFS
        let q = [];
        let dr = [0, 1, 1, 1, 0, -1, -1, -1];
        let dc = [1, 1, 0, -1, -1, -1, 0, 1];

        q.push({ r: i, c: j });
        while (q.length > 0) {
          let head = q.shift();
          let r = head.r;
          let c = head.c;

          this.gameBoard[r][c] = this.hiddenBoard[r][c];
          if (this.hiddenBoard[r][c] !== Constant.NO_MINE) continue;

          for (let k = 0; k < 8; ++k) {
            let next_r = r + dr[k];
            let next_c = c + dc[k];

            if (
              this.inBoard(next_r, next_c) &&
              this.gameBoard[next_r][next_c] === Constant.UNREVEALED
            ) {
              q.push({ r: next_r, c: next_c });
            }
          }
        }

        return Scoring.NEUTRAL_CLICK_MULTIPLIER;
      } /* if is number */ else {
        this.gameBoard[i][j] = this.hiddenBoard[i][j];
        return Scoring.NEUTRAL_CLICK_MULTIPLIER;
      }
    } /* if it is revealed */ else {
      let r = i;
      let c = j;
      let dr = [0, 1, 1, 1, 0, -1, -1, -1];
      let dc = [1, 1, 0, -1, -1, -1, 0, 1];
      let mineCounter = 0;

      for (let k = 0; k < 8; ++k) {
        let next_r = r + dr[k];
        let next_c = c + dc[k];

        if (
          this.inBoard(next_r, next_c) &&
          (this.gameBoard[next_r][next_c] >= Constant.CORRECT_FLAG ||
            this.gameBoard[next_r][next_c] === Constant.REVEALED_MINE)
        ) {
          ++mineCounter;
        }
      }

      if (mineCounter === this.gameBoard[i][j]) {
        for (let k = 0; k < 8; ++k) {
          let next_r = r + dr[k];
          let next_c = c + dc[k];

          if (
            this.inBoard(next_r, next_c) &&
            this.gameBoard[next_r][next_c] === Constant.UNREVEALED
          ) {
            this.reveal(next_r, next_c);
          }
        }
      }

      return Scoring.NEUTRAL_CLICK_MULTIPLIER;
    }
  }

  clickReveal(player, i, j) {
    var deltaScore = this.reveal(i, j);
    player.score += deltaScore;

    if (this.numMines === 0) this.revealAll();

    return {
      deltaScore: deltaScore,
      gameBoard: this.gameBoard,
    };
  }

  flag(player, i, j) {
    if (this.gameBoard[i][j] !== Constant.UNREVEALED) {
      return 0;
    }

    if (this.hiddenBoard[i][j] === Constant.HAS_MINE) {
      this.gameBoard[i][j] = Constant.CORRECT_FLAG + player.idx;
      --this.numMines;

      return Scoring.CORRECT_FLAG_MULTIPLIER;
    }

    return Scoring.WRONG_FLAG_MULTIPLIER;
  }

  clickFlag(player, i, j) {
    var deltaScore = this.flag(player, i, j);
    player.score += deltaScore;

    if (this.numMines === 0) this.revealAll();

    return {
      deltaScore: deltaScore,
      gameBoard: this.gameBoard,
    };
  }
}

module.exports = {
  default: GameState,
};
