//@ts-check
/*
Usage:

var MessageType = require('./inc/MessageType.js');

...

socket.on(messageType.FIND_MATCH, ...);

*/
module.exports = {
  /**
   * Parameter
   * - name: string
   */
  FIND_MATCH: 'findMatch',

  /**
   * Parameter: None
   */
  CANCEL_MATCH: 'cancelMatch',

  /**
   * Parameter
   * - board: Object
   * - players: Array
   */
  MATCH_FOUND: 'matchFound',

  /**
   * Parameter:
   * - i: number
   * - j: number
   */
  CLICK_REVEAL: 'clickReveal',

  /**
   * Parameter:
   * - i: number
   * - j: number
   */
  CLICK_FLAG: 'clickFlag',

  /**
   * Parameter
   * - board: Object
   * - players: Array
   */
  GAME_STATE: 'gameState',

  /**
   * Parameter: None
   */
  END_MATCH: 'endMatch',
};
