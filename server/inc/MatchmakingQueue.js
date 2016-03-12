var assert = require('assert');

module.exports = (function () {
	var queue = [];

	function insert(socket) {
		if(queue.indexOf(socket) === -1) {
			queue.push(socket);
		}
	}

	function size() {
		return queue.length;
	}

	function erase(socket) {
		var idx = queue.indexOf(socket);
		if(idx > -1) {
			queue.splice(idx, 1);
		}
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