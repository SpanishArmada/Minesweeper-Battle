var config = require('./inc/Config.js'),

	MessageType = require('./inc/MessageType.js'),

	io = require('socket.io')(config.port()),

	BoardGenerator = require('./inc/BoardGenerator.js'),

	GameConstant = require('./inc/GameConstant.js');

io.on('connection', function (socket) {
	io.emit('this', { will: 'be received by everyone'});

	socket.on('private message', function (from, msg) {
		console.log('I received a private message by ', from, ' saying ', msg);
	});

	socket.on('disconnect', function () {
		io.emit('user disconnected');
	});
});

