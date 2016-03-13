# SpanishArmada
NTU IEEE Hackathon 2016

## Project Description

Two-player real-time minesweeper battle on the same minefield, competing to uncover the most number of correct flags with fewest penalties.

## How to play?

1. Open [client page](http://rawgit.com/pciang/SpanishArmada/master/client/index.html), input in your nickname, then click "Start" to enter the matchmaking queue in order to find a suitable opponent.
2. Play minesweeper normally ([See rules](https://en.wikipedia.org/wiki/Microsoft_Minesweeper#Gameplay)).
3. Game is over when all mines are flagged or uncovered.

## Rules

1. Every correct flag is going to rewarded +1 point, and every wrong flag or triggered mine will penalized the player by -1 and -5 points respectively.
2. Winner is determined by highest score. Draw is declared in case of tie.

## Running the programs
### Client

1. At "client" folder, open index.html at browser (alternatively, access it at  [Rawgit](http://rawgit.com/pciang/SpanishArmada/master/client/index.html))
2. **Important**: Wait for another player to start find match. You can try to simulate two users at one on one machine by opening the same page in a new tab.


### Server

1. At "server" folder, npm install
2. To run, node index.js

### Client-AI

1. Client-AI can connect to the server and act as the AI opponent for the match.
2. At "client-ai" folder, execute `pip install -r requirements.txt`
3. To run AI, `python main.py`


## Future improvement

1. Allows more than 2 players at one board
2. Dynamic board size, according to number of players.
3. Smarter AI. Currently, the AI only moves when there is a trivial action.
4. Records player's game result and predict their skills accordingly.
5. Better matchmaking algorithm according to user skills.
6. Possible additional game modes, e.g. no-flag mode.
7. In-app purchase to obtain special flag design, etc.

## Demo
[At YouTube](https://youtu.be/dSQmVNemUbw)


