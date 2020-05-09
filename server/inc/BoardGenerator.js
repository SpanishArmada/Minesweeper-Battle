//@ts-check
/**
 * Created by dbakti7 on 3/12/2016.
 */

let dr = [0, 1, 1, 1, 0, -1, -1, -1],
  dc = [1, 1, 0, -1, -1, -1, 0, 1];
class BoardGenerator {
  /**
   *
   * @param {Object} options
   * @param {number} options.numRows  (numRows, numCols) is the board size
   * @param {number} options.numCols  (numRows, numCols) is the board size
   * @param {number} options.rowClicked  (rowClicked, colClicked) is the grid clicked by user at the first time
   * @param {number} options.colClicked  (rowClicked, colClicked) is the grid clicked by user at the first time
   * @param {number} options.numMines  numMines is the number of bombs that we want on the board
   */
  constructor({ numRows, numCols, rowClicked, colClicked, numMines }) {
    this.numRows = numRows;
    this.numCols = numCols;
    this.rowClicked = rowClicked;
    this.colClicked = colClicked;
    this.numMines = numMines;
  }

  /**
   * To shuffle an array, based of Fisher-Yates algorithm
   * 
   * @template T
   * @returns {Array<T>} shuffeled array 
   * @param {Array<T>} array 
   */
  _shuffle(array) {
    let currentIndex = array.length,
      temporaryValue,
      randomIndex;

    // While there remain elements to shuffle...
    while (0 !== currentIndex) {
      // Pick a remaining element...
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1;

      // And swap it with the current element.
      temporaryValue = array[currentIndex];
      array[currentIndex] = array[randomIndex];
      array[randomIndex] = temporaryValue;
    }

    return array;
  }

  /**
   * @returns {Array<Array<number>>} Array of coordinates (e.g. `[[1,2], [1,3], [1,4]]`)
   */
  _flattenBoard() {
    /**
     * @type {Array<Array<number>>}
     */
    let grids = [];
    for (let i = 0; i < this.numRows; ++i) {
      for (let j = 0; j < this.numCols; ++j) {
        // skip if the grid is around the clicked grid
        if (
          Math.abs(i - this.rowClicked) <= 1 &&
          Math.abs(j - this.colClicked) <= 1
        )
          continue;
        grids.push([i, j]);
      }
    }
    return grids;
  }

  /**
   * @returns {boolean} Whether row and col is in board
   * @param {number} row 
   * @param {number} col 
   */
  _inBoard(row, col) {
    return 0 <= row && row < this.numRows && 0 <= col && col < this.numCols;
  }

  /**
   * @returns {boolean} Whether row and col is in edge
   * @param {number} row 
   * @param {number} col 
   */
  _inEdge(row, col) {
    return (
      0 == row || row == this.numRows - 1 || 0 == col || col == this.numCols - 1
    );
  }

  /**
   * @returns {boolean} Whether row and col is in corner
   * @param {number} row 
   * @param {number} col 
   */
  _inCorner(row, col) {
    return (
      (0 == row || row == this.numRows - 1) &&
      (0 == col || col == this.numCols - 1)
    );
  }

  /**
   * 
   * @param {Array<Array<number>>} shuffledGrids Array of coordinates
   * @returns {Array<Array<number>>} 2D array of size numRows x numCols, 0 for bomb, 1 - 8 for bombs count
   */
  _placeMines(shuffledGrids) {
    /**
     * @type {Array<Array<number>>}
     */
    let grids = new Array(this.numRows);
    for (let i = 0; i < this.numRows; ++i) grids[i] = new Array(this.numCols);

    for (let i = 0; i < this.numRows; ++i)
      for (let j = 0; j < this.numCols; ++j) grids[i][j] = 0;

    let hasMines = new Array(this.numRows);
    for (let i = 0; i < this.numRows; ++i) {
      hasMines[i] = new Array(this.numCols);
      for (let j = 0; j < this.numCols; ++j) hasMines[i][j] = false;
    }

    let numMines = this.numMines;

    for (let i = 0; i < shuffledGrids.length; ++i) {
      let coordinate = shuffledGrids[i];

      if (numMines == 0) break;

      let hasEight = false,
        hasFive = false,
        hasTwo = false;

      for (let k = 0; k < dr.length; ++k) {
        let row = coordinate[0] + dr[k],
          col = coordinate[1] + dc[k];

        if (this._inBoard(row, col)) {
          ++grids[row][col];

          if (this._inCorner(row, col)) {
            hasTwo = hasTwo || grids[row][col] === 2;
          }

          if (this._inEdge(row, col)) {
            hasFive = hasFive || grids[row][col] === 5;
          }

          hasEight = hasEight || grids[row][col] === 8;
        }
      }

      if (hasTwo || hasFive || hasEight) {
        for (let k = 0; k < dr.length; ++k) {
          let row = coordinate[0] + dr[k],
            col = coordinate[1] + dc[k];

          if (this._inBoard(row, col)) --grids[row][col];
        }
      } else {
        --numMines;
        hasMines[coordinate[0]][coordinate[1]] = true;
      }
    }

    for (let i = 0; i < this.numRows; ++i) {
      for (let j = 0; j < this.numCols; ++j) {
        if (hasMines[i][j]) grids[i][j] = 9;
      }
    }

    return grids;
  }

  /**
   * @returns {Array<Array<number>>} 2D array, 0 for bomb, 1 - 8 for bombs count
   */
  generate() {
    let shuffledGrids = this._shuffle(this._flattenBoard());
    let grids = this._placeMines(shuffledGrids);
    return grids;
  }
}

module.exports = {
  default: BoardGenerator,
};
