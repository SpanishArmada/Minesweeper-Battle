//@ts-check

class Player {
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
     * @type number
     */
    this.boardId = null;
    /**
     * @type number
     */
    this.idx = null;
  }
}
module.exports = Player;
