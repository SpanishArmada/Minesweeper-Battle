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

var wss = new WebSocket.Server({ port: config.port() });

wss.on('connection', function (ws) {
	console.log('Number of clients: %d', wss.clients.length);

	ws.on('message', function (msgStr) {
		var data = JSON.parse(msgStr);
		switcher(ws, data);
	})
});

var switcher = function(ws, data) {
	switch(data.type) {
		case MessageType.FIND_MATCH:
			{
				var name = data.content.name;
					, player = new Player(ws, name);

				MatchmakingQueue.insert(player);
				ws.on('close', function () {
					MatchmakingQueue.erase(player);
				});

				checkQueue();
			}
			break;
		case MessageType.CANCEL_MATCH:
			{
				ws.close();
			}
			break;
		case MessageType.CLICK_REVEAL:
			{

			}
			break
	}
}

var checkQueue = function () {
	if(MatchmakingQueue.size() < 2) return;

	var players = MatchmakingQueue.get(2),
		clickedRow = Math.random() * GameConstant.NUM_ROWS | 0,
		clickedCol = Math.random() * GameConstant.NUM_COLS | 0;

	BoardController.newGame(players, BoardGenerator.generate(GameConstant.NUM_ROWS
		, GameConstant.NUM_COLS
		, clickedRow
		, clickedCol
		, GameConstant.NUM_MINES));
}