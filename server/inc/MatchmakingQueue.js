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

	function has(player) {
		return queue.indexOf(player) > -1;
	}

	function get(numPlayers) {
		var result = queue.splice(0, numPlayers);
		console.log('dequeueing %d players, there are %d players left in the queue.', numPlayers, queue.length);
		return result;
	}

	return {
		insert: insert,
		erase: erase,
		size: size,
		get: get,
		has: has
	}
}());