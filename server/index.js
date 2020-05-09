//@ts-check
const config = require('./inc/config.js');
const WebSocket = require('ws');
const MessageType = require('./inc/MessageType.js');
const BoardGenerator = require('./inc/BoardGenerator.js');
const GameConstant = require('./inc/GameConstant.js');
const MatchmakingQueue = require('./inc/MatchmakingQueue.js').default;
const BoardController = require('./inc/BoardController.js').default;
const Player = require('./inc/Player.js');

let wss = new WebSocket.Server({
  host: config.hostname(process.env.OPENSHIFT_NODEJS_IP || 'localhost'),
  port: config.port(process.env.OPENSHIFT_NODEJS_PORT || 3000),
});
let inGameData = 'inGameData';
let timerId = null;

const matchmakingQueue = new MatchmakingQueue();
const boardController = new BoardController();

wss.on('connection', function (ws) {
  console.log('Number of clients: %d', wss.clients.size);

  let player = (ws[inGameData] = new Player(ws));

  ws.on('message', function (msgStr) {
    if (typeof msgStr !== 'string') {
      return;
    }
    let data = JSON.parse(msgStr);

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
          let gameState = boardController.getBoard(player.boardId);
          let players = boardController.getPlayers(player.boardId);
          if (!gameState || !players) {
            break;
          }
          let i = data.content.i;
          let j = data.content.j;
          let updates = gameState.clickReveal(player, i, j);
          let result = {
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

          for (let i = 0; i < players.length; ++i) {
            players[i].ws.send(JSON.stringify(result));
          }

          checkMatchEnd(players, gameState);
        }
        break;

      case MessageType.CLICK_FLAG:
        {
          let gameState = boardController.getBoard(player.boardId);
          let players = boardController.getPlayers(player.boardId);
          if (!gameState || !players) {
            break;
          }
          let i = data.content.i;
          let j = data.content.j;
          let updates = gameState.clickFlag(player, i, j);
          let result = {
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

          for (let i = 0; i < players.length; ++i) {
            players[i].ws.send(JSON.stringify(result));
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
    boardController.disconnect(player);
  });
});

function checkQueue() {
  // The next line of code does not throw error
  // even if timerId is null
  clearTimeout(timerId);

  while (matchmakingQueue.size() >= 4) {
    dequeue(4);
  }

  let size = matchmakingQueue.size();
  if (2 <= size && size < 4) {
    console.log(
      'Waiting for an additional player for 10s (currently, %d players are in the queue)',
      size
    );
    timerId = setTimeout(dequeue.bind(undefined, size), 10000);
  }
};

function dequeue(numPlayers) {
  let players = matchmakingQueue.get(numPlayers);
  let randomRevealedRow = (1 + Math.random() * (GameConstant.NUM_ROWS - 2)) | 0;
  let randomRevealedCol = (1 + Math.random() * (GameConstant.NUM_COLS - 2)) | 0;
  let gameState = boardController.newGame({
    players,
    board: BoardGenerator.generate(
      GameConstant.NUM_ROWS,
      GameConstant.NUM_COLS,
      randomRevealedRow,
      randomRevealedCol,
      GameConstant.NUM_MINES
    ),
    numRows: GameConstant.NUM_ROWS,
    numCols: GameConstant.NUM_COLS,
    numMines: GameConstant.NUM_MINES,
    revealedRow: randomRevealedRow,
    revealedCol: randomRevealedCol,
  });
  // Data to be sent to client
  let data = {
    type: MessageType.MATCH_FOUND,
    content: {
      players: [],
    },
  };

  data.content.board = gameState.gameBoard;
  for (let i = 0; i < players.length; ++i) {
    data.content.players.push({
      idx: i,
      name: players[i].name,
      score: players[i].score,
    });
  }

  for (let i = 0; i < players.length; ++i) {
    data.content.idx = i;
    players[i].ws.send(JSON.stringify(data));
  }
};

function checkMatchEnd(players, gameState) {
  if (gameState.numMines > 0) return;

  for (let i = 0; i < players.length; ++i) {
    players[i].ws.send(
      JSON.stringify({
        type: MessageType.END_MATCH,
        content: {
          board: gameState.gameBoard,
        },
      })
    );

    players[i].ws.close();
  }

  boardController.clear(players[0].boardId);
};
