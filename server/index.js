// All requires
var
	config = require('./inc/Config.js'),
	WebSocket = require('ws'),

	MessageType = require('./inc/MessageType.js'),
	BoardGenerator = require('./inc/BoardGenerator.js'),
	GameConstant = require('./inc/GameConstant.js'),
	MatchmakingQueue = require('./inc/MatchmakingQueue.js');

var wss = new WebSocket.Server({ port: config.port() });

wss.on('connection', function (ws) {
	console.log('Number of clients: %d', wss.clients.length);

	ws.on('message', function (msgStr) {
		var data = JSON.parse(msgStr);
	})

	ws.on('close', function () {
		console.log('Number of clients: %d', wss.clients.length);
	})
});