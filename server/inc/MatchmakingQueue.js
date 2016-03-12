var assert = require('assert');

module.exports = (function () {
	var queue = [];

	function insert(player) {
		if(queue.indexOf(player) === -1) {
			queue.push(player);
			console.log('%d players are queueing.', queue.length);
		}
	}

	function size() {
		return queue.length;
	}

	function erase(player) {
		var idx = queue.indexOf(player);
		if(idx > -1) {
			queue.splice(idx, 1);
			console.log('%d players are queueing.', queue.length);
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