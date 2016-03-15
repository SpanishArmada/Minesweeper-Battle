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
		board[boardId] = new GameState(playerArr, generatedBoard, numRows, numCols, numMines, randomRevealedRow, randomRevealedCol);
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
		console.log('Deleting board ID: ', boardId);
		delete players[boardId];
		delete board[boardId];
	}

	function dc(player) {
		var boardId = player.boardId;
		if(boardId === null
			// Board has not been deleted
			|| typeof board[boardId] === 'undefined')
		{
			return;
		}

		board[boardId].dc();

		if(board[boardId].getNumPlayersOnline() === 0) {
			clear(boardId);
		}
	}

	return {
		newGame: newGame,
		getBoard: getBoard,
		getPlayers: getPlayers,
		clear: clear,
		dc: dc,
	}
}());