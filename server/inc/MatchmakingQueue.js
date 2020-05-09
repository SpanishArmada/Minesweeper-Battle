//@ts-check

/**
 * @typedef {import('./Player')} Player
 */
class MatchmakingQueue {
  constructor() {
    /**
     * @type Array<Player>
     */
    this.queue = [];
  }

  /**
   * @param {Player} player 
   */
  insert(player) {
    if (this.queue.indexOf(player) === -1) {
      this.queue.push(player);
      console.log('%d players are queueing.', this.queue.length);
    }
  }

  size() {
    return this.queue.length;
  }

  /**
   * @param {Player} player 
   */
  erase(player) {
    let idx = this.queue.indexOf(player);
    if (idx > -1) {
      this.queue.splice(idx, 1);
      console.log('%d players are queueing.', this.queue.length);
    }
  }

  /**
   * @param {Player} player 
   */
  has(player) {
    return this.queue.indexOf(player) > -1;
  }

  /**
   * @param {number} numPlayers 
   */
  get(numPlayers) {
    let result = this.queue.splice(0, numPlayers);
    console.log(
      'dequeueing %d players, there are %d players left in the this.queue.',
      numPlayers,
      this.queue.length
    );
    return result;
  }
}

module.exports = {
  default: MatchmakingQueue,
};
