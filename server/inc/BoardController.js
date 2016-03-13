var GameState = require('./GameState.js');

module.exports = (function () {
	var
		nextBoardId = 0,
		board = {},
		players = {};

	function newGame(playerArr, generatedBoard, numRows, numCols, numMines, randomRevealedRow, randomRevealedCol) {
		var boardId = nextBoardId.toString();
		for(var i = 0; i < playerArr.length; ++i) {
			playerArr[i].boardId = boardId;
			playerArr[i].idx = i;
		}

		players[boardId] = playerArr;
		board[boardId] = new GameState(playerArr, generatedBoard, numRows, numCols, randomRevealedRow, randomRevealedCol);
		++nextBoardId;

		return board[boardId];
	}

	function getBoard(boardId) {
		return board[boardId];
	}

	function getPlayers(boardId) {
		return players[boardId];
	}

	function clear(boardId) {
		delete players[boardId];
		delete board[boardId];
	}

	return {
		newGame: newGame,
		getBoard: getBoard,
		getPlayers: getPlayers,
		clear: clear
	}
}());