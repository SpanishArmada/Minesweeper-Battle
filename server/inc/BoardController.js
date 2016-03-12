var GameState = require('./GameState.js');

module.exports = (function () {
	var
		nextBoardId = 0,
		board = {};

	function newGame(players, generatedBoard, numRows, numCols, randomRevealedRow, randomRevealedCol) {
		var boardId = nextBoardId.toString();
		for(var i = 0; i < players.length; ++i) {
			players[i].boardId = boardId;
		}
		board[boardId] = new GameState(players, generatedBoard, numRows, numCols, randomRevealedRow, randomRevealedCol);
		++nextBoardId;
	}

	function get(boardId) {
		return board[boardId];
	}

	return {
		newGame: newGame,
		get: get
	}
}());