// All requires
var
	config = require('./inc/Config.js'),
	WebSocket = require('ws'),

	MessageType = require('./inc/MessageType.js'),
	BoardGenerator = require('./inc/BoardGenerator.js'),
	GameConstant = require('./inc/GameConstant.js'),
	MatchmakingQueue = require('./inc/MatchmakingQueue.js'),
	BoardController = require('./inc/BoardController.js');

var wss = new WebSocket.Server({ port: config.port() });

wss.on('connection', function (ws) {
	console.log('Number of clients: %d', wss.clients.length);

	ws.on('close', function () {
		MatchmakingQueue.erase(ws);
		console.log('Number of clients: %d', wss.clients.length);
	})

	ws.on('message', function (msgStr) {
		var data = JSON.parse(msgStr);

		switcher(ws, data);
	})
});

var switcher = function(ws, data) {
	switch(data.type) {
		case MessageType.FIND_MATCH: {
				handleFindMatch(ws, data);
			}
			break;
		case MessageType.CANCEL_MATCH: {
				MatchmakingQueue.erase(ws);
			}
			break;
		case CLICK_REVEAL: {
				
			}
			break;
		}
	}
}

var handleFindMatch = function (ws, data) {
	MatchmakingQueue.insert(ws);

	if(MatchmakingQueue.size() >= 2) {
		var wsArr = MatchmakingQueue.get(2);

		
	}
}