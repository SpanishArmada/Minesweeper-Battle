// All requires
var
	config = require('./inc/Config.js'),
	WebSocket = require('ws'),
	fs = require('fs'),

	MessageType = require('./inc/MessageType.js'),
	BoardGenerator = require('./inc/BoardGenerator.js'),
	GameConstant = require('./inc/GameConstant.js'),
	MatchmakingQueue = require('./inc/MatchmakingQueue.js'),
	BoardController = require('./inc/BoardController.js'),
	Player = require('./inc/Player.js');

var wss = new WebSocket.Server({ port: config.port() }),
	inGameData = 'inGameData';

wss.on('connection', function (ws) {
	console.log('Number of clients: %d', wss.clients.length);

	var player = ws[inGameData] = new Player(ws);

	ws.on('message', function (msgStr) {
		var data = JSON.parse(msgStr);

		switch(data.type) {
			case MessageType.FIND_MATCH:
			{
				ws[inGameData].name = data.content.name;
				MatchmakingQueue.insert(player);

				checkQueue();
			}
			break;


			case MessageType.CANCEL_MATCH:
			{
				MatchmakingQueue.erase(player);
			}
			break;


			case MessageType.CLICK_REVEAL:
			{
				var gameState = BoardController.getBoard(player.boardId),
					players = BoardController.getPlayers(player.boardId),
					i = data.content.i,
					j = data.content.j,
					updates = gameState.clickReveal(player, i, j),
					idx = players.indexOf(player),

					result = {
						type: MessageType.GAME_STATE,
						content: {
							id: player.id,
							board: updates.gameBoard,
							deltaScore: updates.deltaScore,
							score: player.score
						}
					};

				for(var i = 0; i < players.length; ++i) {
					players[i].ws.send(JSON.stringify(result));
				}
			}
			break;


			case MessageType.CLICK_FLAG:
			{
				var gameState = BoardController.getBoard(player.boardId),
					players = BoardController.getPlayers(player.boardId),
					i = data.content.i,
					j = data.content.j,
					updates = gameState.clickFlag(player, i, j),
					idx = players.indexOf(player),

					result = {
						type: MessageType.GAME_STATE,
						content: {
							id: player.id,
							board: updates.gameBoard,
							deltaScore: updates.deltaScore,
							score: player.score
						}
					};

				for(var i = 0; i < players.length; ++i) {
					players[i].ws.send(JSON.stringify(result));
				}
			}
			break;


			default:
			break;
		}
	});

	ws.on('close', function (code, data) {
		// Important!
		MatchmakingQueue.erase(player);

		// Do anything with (code, data)
	});
});

var checkQueue = function () {
	if(MatchmakingQueue.size() < 2) return;

	var players = MatchmakingQueue.get(2),
		randomRevealedRow = Math.random() * GameConstant.NUM_ROWS | 0,
		randomRevealedCol = Math.random() * GameConstant.NUM_COLS | 0,

		board = BoardController.newGame(players, BoardGenerator.generate(GameConstant.NUM_ROWS
			, GameConstant.NUM_COLS
			, randomRevealedRow
			, randomRevealedCol
			, GameConstant.NUM_MINES), GameConstant.NUM_ROWS, GameConstant.NUM_COLS
			, randomRevealedRow, randomRevealedCol),

	// Data to be sent to client
		data = {
			type: MessageType.MATCH_FOUND,
			content: {}
		}

	data.content.board = board;
	for(var i = 0; i < players.length; ++i) {
		data.content.id = i;
		data.content.name = players[i].name;
		data.content.score = players[i].score;

		players[i].ws.send(JSON.stringify(data));
	}
}