var
	GameConstant = require('./GameConstant.js'),
	Scoring = require('./scoring.js');

var Constant = {
	UNREVEALED: -1,
	NO_MINE: 0,
	REVEALED_MINE: 9,
	CORRECT_FLAG: 10,

	// special case for hiddenBoard
	HAS_MINE: 9,
};

module.exports = function (players, board, numRows, numCols, numMines, revealedRow, revealedCol) {
	var hiddenBoard = board;

	// this contains revealed grids
	var gameBoard = new Array(numRows);
	for(var i = 0; i < numRows; ++i){
		gameBoard[i] = new Array(numCols);
		for(var j = 0; j < numCols; ++j){
			gameBoard[i][j] = Constant.UNREVEALED;
		}
	}
    
    this.gameBoard = gameBoard; // added public reference to gameBoard

	function inBoard(r, c) {
		return 0 <= r && r < numRows
			&& 0 <= c && c < numCols;
	}

	function reveal(i, j) {
		if(gameBoard[i][j] === Constant.UNREVEALED) {

			if(hiddenBoard[i][j] === Constant.HAS_MINE) {
				gameBoard[i][j] = Constant.REVEALED_MINE;


				--numMines;
				// If the last mine has been triggered
				// This supposed to be a rather dirty haxx
				if(numMines === 0) {
					for(var r = 0; r < numRows; ++r) {
						for(var c = 0; c < numCols; ++c) {
							if(gameBoard[r][c] === Constant.UNREVEALED) {
								reveal(r, c);
							}
						}
					}
				}


				return Scoring.MINE_EXPLODED_MULTIPLIER;
			}

			else if(hiddenBoard[i][j] === Constant.NO_MINE) {
				// BFS
				var q = [],
					dr = [0, 1, 1, 1, 0, -1, -1, -1],
					dc = [1, 1, 0, -1, -1, -1, 0, 1];

				q.push({ r: i, c: j });
				while(q.length > 0) {
					var head = q.shift(),
						r = head.r,
						c = head.c;

					gameBoard[r][c] = hiddenBoard[r][c];
					if(hiddenBoard[r][c] !== Constant.NO_MINE)
						continue;

					for(var k = 0; k < 8; ++k) {
						var next_r = r + dr[k],
							next_c = c + dc[k];

						if(inBoard(next_r, next_c) && gameBoard[next_r][next_c] === Constant.UNREVEALED) {
							q.push({ r: next_r, c: next_c });
						}
					}
				}

				return Scoring.NEUTRAL_CLICK_MULTIPLIER;
			}

			else /* if is number */ {
				gameBoard[i][j] = hiddenBoard[i][j];
				return Scoring.NEUTRAL_CLICK_MULTIPLIER;
			}
		}

		else /* if it is revealed */ {
			var r = i,
				c = j,
				dr = [0, 1, 1, 1, 0, -1, -1, -1],
				dc = [1, 1, 0, -1, -1, -1, 0, 1],
				numMines = 0;

			for(var k = 0; k < 8; ++k) {
				var next_r = r + dr[k],
					next_c = c + dc[k];

				if(inBoard(next_r, next_c)
					&& (gameBoard[next_r][next_c] >= Constant.CORRECT_FLAG
					|| gameBoard[next_r][next_c] === Constant.REVEALED_MINE))
				{
					++numMines;
				}
			}

			if(numMines === gameBoard[i][j]) {
				for(var k = 0; k < 8; ++k) {
					var next_r = r + dr[k],
						next_c = c + dc[k];

					if(inBoard(next_r, next_c)
						&& gameBoard[next_r][next_c] === Constant.UNREVEALED)
					{
						reveal(next_r, next_c);
					}
				}
			}

			return Scoring.NEUTRAL_CLICK_MULTIPLIER;
		}
	}

	reveal(revealedRow, revealedCol);
	this.clickReveal = function (player, i, j) {
		var deltaScore = reveal(i, j);
		player.score += deltaScore;

		return {
			deltaScore: deltaScore,
			gameBoard: gameBoard
		};
	}

	function flag(player, i, j) {
		if(gameBoard[i][j] !== Constant.UNREVEALED) {
			return 0;
		}

		if(hiddenBoard[i][j] === Constant.HAS_MINE) {
			gameBoard[i][j] = Constant.CORRECT_FLAG + player.idx;
			--numMines;

			// If the last mine has been flagged
			// This supposed to be a rather dirty haxx
			if(numMines === 0) {
				for(var r = 0; r < numRows; ++r) {
					for(var c = 0; c < numCols; ++c) {
						if(gameBoard[r][c] === Constant.UNREVEALED) {
							reveal(r, c);
						}
					}
				}
			}


			return Scoring.CORRECT_FLAG_MULTIPLIER;
		}

		return Scoring.WRONG_FLAG_MULTIPLIER;
	}

	this.clickFlag = function (player, i, j) {
		var deltaScore = flag(player, i, j);
		player.score += deltaScore;

		return {
			deltaScore: deltaScore,
			gameBoard: gameBoard
		};
	}

	this.numMines = function () {
		return numMines;
	}
}