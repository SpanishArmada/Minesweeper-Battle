/*
Usage:

var messageType = require('./inc/MessageType.js');

...

socket.on(messageType.FIND_MATCH, ...);

*/
module.exports = {
	/*
		Parameter:
			- name: string
	*/
	FIND_MATCH: 'findMatch',

	/*
		Parameter:
			N/A
	*/
	CANCEL_MATCH: 'cancelMatch',

	/*
	Parameter:
		- board: Object,
		- players: Array
	*/
	MATCH_FOUND: 'matchFound',

	/*
	Parameter:
		- i: integer,
		- j: integer
	*/
	CLICK_REVEAL: 'clickReveal',

	/*
	Parameter:
		- i: integer,
		- j: integer
	*/
	CLICK_FLAG: 'clickFlag',

	/*
	Parameter:
		- board: Object,
		- players: Array
	*/
	GAME_STATE: 'gameState'
};
