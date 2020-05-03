export class MinesweeperWs {
  constructor(minesweeper) {
    this.ws = new WebSocket('ws://localhost:3000/');
    this.minesweeper = minesweeper;
    this.ws.onopen = this.wsOpenHandler.bind(this);
    this.ws.onmessage = this.wsMessageHandler.bind(this);
    window.onbeforeunload = function () {
      // http://stackoverflow.com/a/4818541/917957
      this.ws.onclose = function () {}; // disable onclose handler first
      this.ws.close();
    }.bind(this);
  }
  wsSend = function (type, data) {
    var msg = { type: type };
    if (data != null) {
      msg.content = data;
    }
    this.ws.send(JSON.stringify(msg));
  };
  wsOpenHandler = function (event) {
    console.log('Connection opened');
    document.getElementById('start').removeAttribute('disabled');
    document.getElementById('start').textContent = 'Start';
  };
  wsMessageHandler = function (event) {
    var data = JSON.parse(event.data),
      type = data.type,
      content = data.content;
    // console.log(data);

    if (type === 'matchFound') {
      this.minesweeper.updateMap(content.board);
      for (var i = 0; i < content.players.length; i++) {
        this.minesweeper.state.players.push({
          name: content.players[i].name,
          score: 0,
        });
        var scoreItem = document.createElement('div');

        var nameEl = document.createElement('div');
        var flagEl = this.minesweeper.config.flag[
          i % this.minesweeper.config.flag.length
        ];
        flagEl.width = 17;
        flagEl.height = 17;

        var nameTextEl = document.createElement('span');
        nameTextEl.textContent = '(' + content.players[i].name + ')';

        if (content.idx === i) {
          flagEl.style.backgroundColor = '#ccc';
          nameTextEl.style.backgroundColor = '#ccc';
        }

        nameEl.appendChild(flagEl);
        nameEl.appendChild(nameTextEl);

        var scoreEl = document.createElement('div');
        scoreEl.textContent = 0;

        scoreItem.appendChild(nameEl);
        scoreItem.appendChild(scoreEl);
        document.getElementById('score-items').appendChild(scoreItem);

        this.minesweeper.state.status.push({
          nameEl: nameEl,
          scoreEl: scoreEl,
        });
      }
      this.minesweeper.state.currentIdx = content.idx;

      document.getElementById('message').textContent =
        'Game is starting in 3...';
      document.getElementById('cancel').style.display = 'none';
      this.minesweeper.state.startMatch = true;

      setTimeout(
        function () {
          document.getElementById('message').textContent =
            'Game is starting in 2..';
          setTimeout(
            function () {
              document.getElementById('message').textContent =
                'Game is starting in 1.';
              setTimeout(
                function () {
                  document.getElementById('overlay').style.display = 'none';
                }.bind(this),
                1000
              );
            }.bind(this),
            1000
          );
        }.bind(this),
        1000
      );
    } else if (type === 'gameState') {
      this.minesweeper.updateMap(content.board);
      this.minesweeper.state.players[content.idx].score = content.score;
      this.minesweeper.animateDeltaScore(
        content.idx,
        content.i,
        content.j,
        content.deltaScore
      );
      this.minesweeper.state.status[
        content.idx
      ].scoreEl.textContent = this.minesweeper.state.players[content.idx].score;
    } else if (type === 'endMatch') {
      this.minesweeper.updateMap(content.board);
      this.minesweeper.endMatch();
    }
  };
}
