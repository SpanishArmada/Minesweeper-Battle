var GameState = require('./GameState.js');

module.exports = (function () {
	var
		boardId = 0,
		board = {};

	function newGame(players, generatedBoard) {
		for(var i = 0; i < players.length; ++i) {
			players[i].boardId = boardId.toString();
		}
		board[boardId.toString()] = new GameState();
	}

	return {
		newGame: newGame
	}
}());