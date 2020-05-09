//@ts-check
/**
 * @typedef {import('ws')} WebSocket
 */

class Player {
  /**
   *
   * @param {WebSocket} ws
   */
  constructor(ws) {
    /**
     * @type WebSocket
     */
    this.ws = ws;
    /**
     * @type string
     */
    this.name = null;
    /**
     * @type number
     */
    this.score = 0;

    /**
     * @type string
     */
    this.boardId = null;
    /**
     * @type number
     */
    this.idx = null;
  }
}
module.exports = Player;
