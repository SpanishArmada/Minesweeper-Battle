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

			}
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
		randomRevealedCol = Math.random() * GameConstant.NUM_COLS | 0;

	BoardController.newGame(players, BoardGenerator.generate(GameConstant.NUM_ROWS
		, GameConstant.NUM_COLS
		, randomRevealedRow
		, randomRevealedCol
		, GameConstant.NUM_MINES), numRows, numCols, randomRevealedRow, randomRevealedCol);
}