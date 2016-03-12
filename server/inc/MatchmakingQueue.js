var assert = require('assert');

module.exports = (function () {
	var queue = [];

	function insert(socket) {
		if(queue.indexOf(socket) === -1) {
			queue.push(socket);
		}
		console.log('%d players are queueing', queue.length);
	}

	function size() {
		return queue.length;
	}

	function erase(socket) {
		var idx = queue.indexOf(socket);
		if(idx > -1) {
			queue.splice(idx, 1);
		}
		console.log('%d players are queueing', queue.length);
	}

	function get(numPlayers) {
		return queue.splice(0, numPlayers);
	}

	return {
		insert: insert,
		erase: erase,
		size: size,
		get: get
	}
}());