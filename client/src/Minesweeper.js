import { MinesweeperWs } from './MinesweeperWs.js';

export class Minesweeper {
  constructor() {
    this.config = {
      maze: {
        width: 16,
        height: 16,
      },
      bombs: 41,
      tile: {
        size: 32,
        color: '#DBDBDB',
        border: '#111111',
        revealedColor: '#F0F0F0',
        hover: null,
      },
      flag: [],
      bomb: null,
      online: true,
    };

    // init tile configs
    for (var i = 0; i < 4; i++) {
      var img = new Image(this.config.tile.size, this.config.tile.size);
      img.src = 'assets/flag-' + i + '.png';
      this.config.flag.push(img);
    }
    var img = new Image(this.config.tile.size, this.config.tile.size);
    img.src = 'assets/bomb.png';
    this.config.bomb = img;

    img = new Image(this.config.tile.size, this.config.tile.size);
    img.src = 'assets/hover.png';
    this.config.tile.hover = img;

    this.multiplayer = new MinesweeperWs(this);

    this.state = {
      map: [],
      currentUsername: null,
      currentIdx: 0,
      players: [],
      hoverPrev: {
        i: 0,
        j: 0,
      },
      startMatch: false,
      endMatch: false,
      status: [],
      animateDeltaScoreLoopRunning: false,
      animateDeltaScoreQueue: [],
    };

    this.state.map = [];
    for (var i = 0; i < this.config.maze.height; i++) {
      this.state.map[i] = [];
      for (var j = 0; j < this.config.maze.width; j++) {
        this.state.map[i][j] = -1;
      }
    }
    this.canvas = document.getElementById('canvas');
    this.scoreCanvas = document.getElementById('canvas-score');

    this.scoreCanvas.addEventListener('mousemove', this.handleHover.bind(this));
    this.scoreCanvas.addEventListener('click', this.handleClick.bind(this));
    this.scoreCanvas.addEventListener(
      'contextmenu',
      this.handleRightClick.bind(this)
    );

    this.canvasContext = this.canvas.getContext('2d');
    this.scoreCanvasContext = this.scoreCanvas.getContext('2d');

    this.colorLuminance = function (hex, lum) {
      // validate hex string
      hex = String(hex).replace(/[^0-9a-f]/gi, '');
      if (hex.length < 6) {
        hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
      }
      lum = lum || 0;

      // convert to decimal and change luminosity
      var rgb = '#',
        c,
        i;
      for (i = 0; i < 3; i++) {
        c = parseInt(hex.substr(i * 2, 2), 16);
        c = Math.round(Math.min(Math.max(0, c + c * lum), 255)).toString(16);
        rgb += ('00' + c).substr(c.length);
      }

      return rgb;
    };
  }

  start = function (username) {
    this.state.currentUsername = username;
    if (this.config.online) {
      this.multiplayer.wsSend('findMatch', {
        name: username,
      });
    }
  };
  cancel = function () {
    this.state.currentUsername = null;
    if (this.config.online) {
      this.multiplayer.wsSend('cancelMatch');
    }
  };
  getColorFromPlayer = function (idx) {
    var color = ['#F40000', '#0050FF', '#EDDF00', '#00BF04'];
    if (idx < 0 || idx >= color.length) {
      return '#000';
    }
    return color[idx];
  };
  endMatch = function () {
    var x = 4.5 * this.config.tile.size,
      y = this.scoreCanvas.height / 2 - 50,
      str = 'Game over';
    this.scoreCanvasContext.clearRect(
      0,
      0,
      this.scoreCanvas.width,
      this.scoreCanvas.height
    );

    this.scoreCanvasContext.save();
    this.scoreCanvasContext.fillStyle = 'rgba(0, 0, 0, 0.6)';
    this.scoreCanvasContext.fillRect(
      0,
      0,
      this.scoreCanvas.width,
      this.scoreCanvas.height
    );

    this.scoreCanvasContext.fillStyle = '#fff';
    this.scoreCanvasContext.font = 'bold 40px "Fira Mono"';

    var maxScore = this.state.players[0].score,
      maxScoreIdx = 0,
      winDraw = false;
    for (var i = 1; i < this.state.players.length; i++) {
      if (this.state.players[i].score > maxScore) {
        maxScore = this.state.players[i].score;
        maxScoreIdx = i;
        winDraw = false;
      } else if (this.state.players[i].score === maxScore) {
        winDraw = true;
      }
    }
    if (winDraw) {
      str = "It's a draw";
    } else if (maxScoreIdx === this.state.currentIdx) {
      str = 'You win';
    } else {
      str = 'You lose';
    }

    this.scoreCanvasContext.fillText(str, x + 0.5 * this.config.tile.size, y);
    this.scoreCanvasContext.font = 'bold 20px "Fira Mono"';
    this.scoreCanvasContext.fillText(
      'Thank you for playing',
      x,
      y + 2 * this.config.tile.size
    );
    this.scoreCanvasContext.restore();

    // remove listener
    this.state.endMatch = true;
  };

  animateDeltaScoreLoop = function () {
    if (this.state.endMatch) {
      return;
    }
    this.state.animateDeltaScoreLoopRunning = true;
    this.scoreCanvasContext.clearRect(
      0,
      0,
      this.scoreCanvas.width,
      this.scoreCanvas.height
    );
    this.scoreCanvasContext.save();
    this.scoreCanvasContext.font = 'bold 20px "Fira Mono"';

    var queue = this.state.animateDeltaScoreQueue,
      newQueue = [];
    while (queue.length > 0) {
      var head = queue.shift(),
        i = head.i,
        j = head.j,
        k = head.k,
        x = (j + 0.35) * this.config.tile.size,
        y = (i + 0.35) * this.config.tile.size + Math.floor(k / 2),
        str = head.str,
        playerIdx = head.playerIdx;
      this.scoreCanvasContext.fillStyle = this.colorLuminance(
        this.getColorFromPlayer(playerIdx),
        -0.3
      );
      this.scoreCanvasContext.fillText(str, x, y);

      if (k > 1) {
        newQueue.push({
          i: head.i,
          j: head.j,
          k: head.k - 1,
          str: head.str,
          playerIdx: head.playerIdx,
        });
      }
    }

    while (newQueue.length > 0) {
      var head = newQueue.shift();
      this.state.animateDeltaScoreQueue.push({
        i: head.i,
        j: head.j,
        k: head.k,
        str: head.str,
        playerIdx: head.playerIdx,
      });
    }

    this.scoreCanvasContext.restore();

    if (this.state.animateDeltaScoreQueue.length > 0) {
      window.requestAnimationFrame(this.animateDeltaScoreLoop.bind(this));
    } else {
      this.state.animateDeltaScoreLoopRunning = false;
      this.scoreCanvasContext.clearRect(
        0,
        0,
        this.scoreCanvas.width,
        this.scoreCanvas.height
      );
    }
  };

  animateDeltaScore = function (playerIdx, i, j, deltaScore) {
    if (this.state.endMatch) {
      return;
    }
    if (deltaScore < 0 && playerIdx !== this.state.currentIdx) {
      return;
    }
    if (deltaScore === 0) {
      return;
    }

    this.state.animateDeltaScoreQueue.push({
      i: i,
      j: j,
      k: 20,
      str: deltaScore > 0 ? '+' + deltaScore : deltaScore,
      playerIdx: playerIdx,
    });
    if (!this.state.animateDeltaScoreLoopRunning) {
      this.animateDeltaScoreLoop();
    }
  };

  getColorFromNumber = function (number) {
    var ret = '#111';
    switch (number) {
      case 1:
        ret = '#0707FD';
        break;
      case 2:
        ret = '#007B00';
        break;
      case 3:
        ret = '#FA1010';
        break;
      case 4:
        ret = '#000f75';
        break;
      case 5:
        ret = '#966139';
        break;
      case 6:
        ret = '#36c1bd';
        break;
      case 7:
        ret = '#111';
        break;
      case 8:
        ret = '#666';
        break;
    }
    return ret;
  };
  drawNumber = function (i, j, number) {
    var x = (j + 0.3) * this.config.tile.size,
      y = (i + 0.7) * this.config.tile.size;
    this.drawRect(i, j, this.config.tile.revealedColor);

    this.canvasContext.save();
    this.canvasContext.font = 'bold 20px "Fira Mono"';
    this.canvasContext.fillStyle = this.getColorFromNumber(number);
    this.canvasContext.fillText(number, x, y);
    this.canvasContext.restore();
  };
  drawImage = function (i, j, img) {
    var x = j * this.config.tile.size,
      y = i * this.config.tile.size;
    this.canvasContext.save();
    this.canvasContext.drawImage(img, x, y);
    this.canvasContext.restore();
  };
  drawBomb = function (i, j) {
    this.drawRect(i, j, this.config.tile.revealedColor);
    this.drawImage(i, j, this.config.bomb);
  };
  drawFlag = function (i, j, type) {
    this.drawRect(i, j, this.config.tile.revealedColor);
    this.drawImage(i, j, this.config.flag[type % this.config.flag.length]);
  };
  drawRect = function (i, j, fillStyle) {
    var x = j * this.config.tile.size,
      y = i * this.config.tile.size,
      width = this.config.tile.size,
      height = this.config.tile.size,
      fill = fillStyle;
    if (fillStyle === undefined) {
      fill = this.config.tile.color;
    }
    this.canvasContext.save();
    this.canvasContext.fillStyle = fill;
    this.canvasContext.strokeStyle = this.config.tile.border;
    this.canvasContext.fillRect(x, y, width, height);
    this.canvasContext.strokeRect(x, y, width, height);
    this.canvasContext.restore();
  };
  drawTile = function (i, j) {
    if (
      i < 0 ||
      i >= this.config.maze.height ||
      j < 0 ||
      j >= this.config.maze.width
    ) {
      return false;
    }

    if (this.state.map[i][j] === -1) {
      this.drawRect(i, j);
    } else {
      this.drawRect(i, j, this.config.tile.revealedColor);
    }

    if (this.state.map[i][j] === 9) {
      // mine
      this.drawBomb(i, j);
    } else if (this.state.map[i][j] >= 10) {
      // flag correct
      this.drawFlag(i, j, this.state.map[i][j] - 10); // dirty dirty haxx
    } else if (1 <= this.state.map[i][j] && this.state.map[i][j] <= 8) {
      this.drawNumber(i, j, this.state.map[i][j]);
    }
  };

  drawMap = function () {
    for (var i = 0; i < this.config.maze.height; i++) {
      for (var j = 0; j < this.config.maze.width; j++) {
        this.drawTile(i, j);
      }
    }
  };

  updateMap = function (data) {
    for (var i = 0; i < this.config.maze.height; i++) {
      for (var j = 0; j < this.config.maze.width; j++) {
        this.state.map[i][j] = data[i][j];
      }
    }
    this.drawMap();
  };

  getCoordFromEvent = function (e) {
    var rect = this.canvas.getBoundingClientRect(),
      x = e.clientX - rect.left,
      y = e.clientY - rect.top,
      i = Math.floor(y / this.config.tile.size),
      j = Math.floor(x / this.config.tile.size);
    return [i, j];
  };

  handleHover = function (e) {
    if (this.state.endMatch) {
      return;
    }

    var tmp = this.getCoordFromEvent(e),
      i = tmp[0],
      j = tmp[1];
    // console.log("Hover:", i, j);

    this.drawTile(this.state.hoverPrev.i, this.state.hoverPrev.j);
    this.drawImage(i, j, this.config.tile.hover);
    this.state.hoverPrev.i = i;
    this.state.hoverPrev.j = j;
  };
  handleClick = function (e) {
    var tmp = this.getCoordFromEvent(e),
      i = tmp[0],
      j = tmp[1];
    // console.log("Click:", i, j);

    if (
      this.state.map[i][j] === 0 ||
      this.state.map[i][j] > 8 ||
      this.state.endMatch
    ) {
      return false;
    }

    // send (i, j) to server
    if (this.config.online) {
      this.multiplayer.wsSend('clickReveal', {
        i: i,
        j: j,
      });
    }
  };

  handleRightClick = function (e) {
    e.preventDefault();
    var tmp = this.getCoordFromEvent(e),
      i = tmp[0],
      j = tmp[1];
    // console.log("RightClick:", i, j);
    if (this.state.map[i][j] !== -1 || this.state.endMatch) {
      return false;
    }

    // send (i, j) to server
    if (this.config.online) {
      this.multiplayer.wsSend('clickFlag', {
        i: i,
        j: j,
      });
    }
  };
}
