//@ts-check
const config = require('./inc/config.js');
const WebSocket = require('ws');
const MessageType = require('./inc/MessageType.js');
const BoardGenerator = require('./inc/BoardGenerator.js');
const GameConstant = require('./inc/GameConstant.js');
const MatchmakingQueue = require('./inc/MatchmakingQueue.js').default;
const BoardController = require('./inc/BoardController.js');
const Player = require('./inc/Player.js');

var wss = new WebSocket.Server({
    host: config.hostname(process.env.OPENSHIFT_NODEJS_IP || 'localhost'),
    port: config.port(process.env.OPENSHIFT_NODEJS_PORT || 3000),
  }),
  inGameData = 'inGameData',
  timerId = null;

  const matchmakingQueue = new MatchmakingQueue();

wss.on('connection', function (ws) {
  console.log('Number of clients: %d', wss.clients.length);

  var player = (ws[inGameData] = new Player(ws));

  ws.on('message', function (msgStr) {
    var data = JSON.parse(msgStr);

    switch (data.type) {
      case MessageType.FIND_MATCH:
        {
          ws[inGameData].name = data.content.name;
          matchmakingQueue.insert(player);

          checkQueue();
        }
        break;

      case MessageType.CANCEL_MATCH:
        {
          if (matchmakingQueue.has(player)) {
            matchmakingQueue.erase(player);
            checkQueue(); // This line of code is important
          }
        }
        break;

      case MessageType.CLICK_REVEAL:
        {
          var gameState = BoardController.getBoard(player.boardId),
            players = BoardController.getPlayers(player.boardId),
            i = data.content.i,
            j = data.content.j,
            updates = gameState.clickReveal(player, i, j),
            idx = players.indexOf(player),
            result = {
              type: MessageType.GAME_STATE,
              content: {
                i: i,
                j: j,
                idx: player.idx,
                board: updates.gameBoard,
                deltaScore: updates.deltaScore,
                score: player.score,
              },
            };

          for (var i = 0; i < players.length; ++i) {
            players[i].ws.send(JSON.stringify(result), function (err) {
              /* Do nothing */
            });
          }

          checkMatchEnd(players, gameState);
        }
        break;

      case MessageType.CLICK_FLAG:
        {
          var gameState = BoardController.getBoard(player.boardId),
            players = BoardController.getPlayers(player.boardId),
            i = data.content.i,
            j = data.content.j,
            updates = gameState.clickFlag(player, i, j),
            idx = players.indexOf(player),
            result = {
              type: MessageType.GAME_STATE,
              content: {
                i: i,
                j: j,
                idx: player.idx,
                board: updates.gameBoard,
                deltaScore: updates.deltaScore,
                score: player.score,
              },
            };

          for (var i = 0; i < players.length; ++i) {
            players[i].ws.send(JSON.stringify(result), function (err) {
              /* Do nothing */
            });
          }

          checkMatchEnd(players, gameState);
        }
        break;

      default:
        break;
    }
  });

  ws.on('close', function (code, data) {
    // Important!
    if (matchmakingQueue.has(player)) {
      matchmakingQueue.erase(player);
      checkQueue(); // always recheck the queue
    }

    // Do anything with (code, data)

    // Remove player from board
    BoardController.dc(player);
  });
});

var checkQueue = function () {
  // The next line of code does not throw error
  // even if timerId is null
  clearTimeout(timerId);

  while (matchmakingQueue.size() >= 4) {
    dequeue(4);
  }

  var size = matchmakingQueue.size();
  if (2 <= size && size < 4) {
    console.log(
      'Waiting for an additional player for 10s (currently, %d players are in the queue)',
      size
    );
    timerId = setTimeout(dequeue.bind(undefined, size), 10000);
  }
};

var dequeue = function (numPlayers) {
  var players = matchmakingQueue.get(numPlayers),
    randomRevealedRow = (1 + Math.random() * (GameConstant.NUM_ROWS - 2)) | 0,
    randomRevealedCol = (1 + Math.random() * (GameConstant.NUM_COLS - 2)) | 0,
    gameState = BoardController.newGame(
      players,
      BoardGenerator.generate(
        GameConstant.NUM_ROWS,
        GameConstant.NUM_COLS,
        randomRevealedRow,
        randomRevealedCol,
        GameConstant.NUM_MINES
      ),
      GameConstant.NUM_ROWS,
      GameConstant.NUM_COLS,
      GameConstant.NUM_MINES,
      randomRevealedRow,
      randomRevealedCol
    ),
    // Data to be sent to client
    data = {
      type: MessageType.MATCH_FOUND,
      content: {
        players: [],
      },
    };

  data.content.board = gameState.gameBoard;
  for (var i = 0; i < players.length; ++i) {
    data.content.players.push({
      idx: i,
      name: players[i].name,
      score: players[i].score,
    });
  }

  for (var i = 0; i < players.length; ++i) {
    data.content.idx = i;
    players[i].ws.send(JSON.stringify(data));
  }
};

var checkMatchEnd = function (players, gameState) {
  if (gameState.numMines() > 0) return;

  for (var i = 0; i < players.length; ++i) {
    players[i].ws.send(
      JSON.stringify({
        type: MessageType.END_MATCH,
        content: {
          board: gameState.gameBoard,
        },
      }),
      function (err) {
        /* Do nothing */
      }
    );

    players[i].ws.close();
  }

  BoardController.clear(players[0].boardId);
};
