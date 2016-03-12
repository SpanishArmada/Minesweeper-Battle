var GameConstant = require('./GameConstant.js');

module.exports = function (players, board) {
	var players = players,
		hiddenBoard = board;

	// gameBoard contains revealed grids
	var gameBoard = new Array(GameConstant.NUM_ROWS);

	for (var i = 0; i < GameConstant.NUM_ROWS; ++i){
		gameBoard[i] = new Array(GameConstant.NUM_COLS);
		for (var j = 0; j < GameConstant.NUM_COLS; ++j){
			gameBoard[i][j] = -1;
		}
	}

	function clickReveal(player, i, j) {
		if(gameBoard == -1){
			if(hiddenBoard == 9){
				player.score += GameConstant.MINES_EXPLODES;
			}
		}
	}

	function clickFlag(player, i, j) {

	}
}