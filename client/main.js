"use strict";

var Minesweeper = function(ws) {
    this.ws = ws;
    
    this.config = {
        maze: {
            width: 16,
            height: 16
        },
        bombs: 41,
        tile: {
            size: 32,
            color: "#DBDBDB",
            border: "#111111",
            revealedColor: "#F0F0F0",
        }, 
        flag: [],
        bomb: null
    };
    for (var i = 0; i < 2; i++) {
        var img = new Image(this.config.tile.size, this.config.tile.size);
        img.src = 'assets/flag-' + i + ".png";
        this.config.flag.push(img);
    }
    var img = new Image(this.config.tile.size, this.config.tile.size);
    img.src = 'assets/bomb.png';
    this.config.bomb = img;
        
    this.state = {
        map: [],
        currentUsername: null,
        opponents: []
    };
    
    this.state.map = [];
    for (var i = 0; i < this.config.maze.height; i++) {
        this.state.map[i] = [];
        for (var j = 0; j < this.config.maze.width; j++) {
            this.state.map[i][j] = -1;
        }
    }
    this.canvas = document.getElementById("canvas");
    this.canvas.addEventListener('click', this.handleClick.bind(this));
    this.canvas.addEventListener('contextmenu', this.handleRightClick.bind(this));
    
    this.canvasContext = this.canvas.getContext('2d');
    
};
Minesweeper.prototype.wsSend = function(type, data) {
    var msg = {type: type};
    if (data != null) {
        msg.content = data;
    }
    this.ws.send(JSON.stringify(msg));
};
Minesweeper.prototype.wsMessageHandler = function(event) {
    var data = JSON.parse(event.data),
        type = data.type,
        content = data.content;
    console.log(data);
    
    if (type === "matchFound") {
        this.updateMap(content.board);
        for (var i = 0; i < content.opponents; i++) {
            this.state.opponents.push({
                name: content.opponents[i],
                score: 0
            });
        }
        // hacky implementation
        document.getElementById("opp-name").style.display = "inline";
        document.getElementById("opp-name").textContent = content.opponents[0];
        
    } else if (type === "gameState") {
        this.updateMap(content.board);
        for (var i = 0; i < content.playerScores; i++) {
            // TODO which one is P1's score?
            this.states.oppponents[i] = content.playerScores[i];
        }
    }
};

Minesweeper.prototype.start = function(username) {
    this.state.currentUsername = username;
    this.wsSend("findMatch", {
        name: username 
    });
    this.ws.onmessage =  this.wsMessageHandler;
};
Minesweeper.prototype.cancel = function() {
    this.state.currentUsername = null;
    this.wsSend("cancelFindMatch");
};

Minesweeper.prototype.getColorFromNumber = function (number) {
    var ret = "#111";
    switch (number) {
        case 1: ret = "#0707FD"; break;
        case 2: ret = "#007B00"; break;
        case 3: ret = "#FA1010"; break;
        case 4: ret = "#000f75"; break;
        case 5: ret = "#966139"; break;
        case 6: ret = "#36c1bd"; break;
        case 7: ret = "#111"; break;
        case 8: ret = "#666"; break;
    }
    return ret;
}
Minesweeper.prototype.drawNumber = function (i, j, number) {
    var x = (j + .3) * this.config.tile.size,
        y = (i + .7) * this.config.tile.size;
    this.drawRect(i, j, this.config.tile.revealedColor);
    
    this.canvasContext.save();
    this.canvasContext.font = 'bold 20px "Fira Mono"';
    this.canvasContext.fillStyle = this.getColorFromNumber(number);
    this.canvasContext.fillText(number, x, y);
    this.canvasContext.restore();
}

Minesweeper.prototype.drawBomb = function(i, j) {
    var x = j * this.config.tile.size,
        y = i * this.config.tile.size;
    this.drawRect(i, j, this.config.tile.revealedColor);
    
    this.canvasContext.save();
    this.canvasContext.drawImage(this.config.bomb, x, y);
    this.canvasContext.restore();
}
Minesweeper.prototype.drawFlag = function(i, j , type) {
    var x = j * this.config.tile.size,
        y = i * this.config.tile.size;
    this.drawRect(i, j, this.config.tile.revealedColor);
    
    this.canvasContext.save();
    this.canvasContext.drawImage(this.config.flag[type], x, y);
    this.canvasContext.restore();
}
Minesweeper.prototype.drawRect = function(i, j, fillStyle) {
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
}
Minesweeper.prototype.drawMap = function () {
    for (var i = 0; i < this.config.maze.height; i++) {
        for (var j = 0; j < this.config.maze.width; j++) {
            if (this.state.map[i][j] === -1) {
                this.drawRect(i, j);
            } else {
                this.drawRect(i, j, this.config.tile.revealedColor);
            }
            
            if (this.state.map[i][j] === 9) { // mine
                this.drawBomb(i, j);
            } else if (this.state.map[i][j] === 10) { // flag correct
                // TODO which flag is whose?
                this.drawFlag(i, j, 0);
            } else if (1 <= this.state.map[i][j] && this.state.map[i][j] <= 8) {
                this.drawNumber(i, j, this.state.map[i][j]);
            }
            
        }
    }
};


Minesweeper.prototype.updateMap = function(data) {
    for (var i = 0; i < this.config.maze.height; i++) {
        for (var j = 0; j < this.config.maze.width; j++) {
            this.state[i][j] = data[i][j];
        }
    }
    this.drawMap();
};

Minesweeper.prototype.getCoordFromEvent = function (e) {
    var rect = this.canvas.getBoundingClientRect(),
        x = e.clientX - rect.left,
        y = e.clientY - rect.top,
        i = Math.floor(y / this.config.tile.size),
        j = Math.floor(x / this.config.tile.size);
    return [i, j];
};

Minesweeper.prototype.handleClick = function (e) {
    var tmp = this.getCoordFromEvent(e),
        i = tmp[0], j = tmp[1];
    console.log("Click:", i, j);
    
    if (this.state.map[i][j] === 0 || this.state.map[i][j] > 8) {
        return false;
    }
    
    // send (i, j) to server
    this.wsSend("clickReveal", {
        i: i,
        j: j
    });
};

Minesweeper.prototype.handleRightClick = function (e) {
    e.preventDefault();
    var tmp = this.getCoordFromEvent(e),
        i = tmp[0], j = tmp[1];
    console.log("RightClick:", i, j);
    
    if (this.state.map[i][j] !== -1) {
        return false;
    }
    
    // send (i, j) to server
    this.wsSend("clickFlag", {
        i: i,
        j: j
    });
};


document.addEventListener("DOMContentLoaded", function () {
    var ws = new WebSocket("wss://spanisharmada-server.azurewebsites.net/"); // TODO point to real server
    var minesweeper = new Minesweeper(ws);
    minesweeper.drawMap();
    var afm = 0, afmGo = false, afmDots = 0;
    
    function animateFindingMatch() {
        afm++;
        if (afm % 40 === 0) {
            afmDots += 1;
            afm = 0;
        }
        if (afmDots > 5) {
            afmDots = 0;
        }
        var dots = "";
        for (var i = 0; i < afmDots; i++) {
            dots += ".";
        }
        document.getElementById("message").textContent = "Finding match" + dots;
        
        if (afmGo) {
            window.requestAnimationFrame(animateFindingMatch);
        } else {
            document.getElementById("message").textContent = "";
        }
    }
    document.getElementById("start").addEventListener("click", function () {
        var usernameElem = document.getElementById("username-input");
        if (usernameElem.checkValidity()) {
            var username = usernameElem.value;
            // send findMatch
            minesweeper.start(username);
            document.getElementById("my-name").textContent = username;
            
            afmGo = true;
            animateFindingMatch();
            document.getElementById("cancel").style.display = "block";
            document.getElementById("my-name").style.display = "inline";
            document.getElementById("start").style.display = "none";
            document.getElementById("prompt").style.display = "none";
        }
        
        
    }, false);
    document.getElementById("cancel").addEventListener("click", function () {
        // send cancelFindMatch
        minesweeper.cancel();
        
        afmGo = false;
        document.getElementById("message").textContent = "";
        document.getElementById("cancel").style.display = "none";
        document.getElementById("my-name").style.display = "none";
        document.getElementById("opp-name").style.display = "none";
        document.getElementById("start").style.display = "block";
        document.getElementById("prompt").style.display = "block";
    }, false);
}, false);