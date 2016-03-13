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
            hover: null
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
    
    img = new Image(this.config.tile.size, this.config.tile.size);
    img.src = 'assets/hover.png';
    this.config.tile.hover = img;
        
    this.state = {
        map: [],
        currentUsername: null,
        currentIdx: 0,
        players: [],
        hoverPrev: {
            i: 0,
            j: 0
        },
        endMatch: false
    };
    
    this.state.map = [];
    for (var i = 0; i < this.config.maze.height; i++) {
        this.state.map[i] = [];
        for (var j = 0; j < this.config.maze.width; j++) {
            this.state.map[i][j] = -1;
        }
    }
    this.canvas = document.getElementById("canvas");
    this.scoreCanvas = document.getElementById("canvas-score");
    
    
    this.scoreCanvas.addEventListener('mousemove', this.handleHover.bind(this));
    this.scoreCanvas.addEventListener('click', this.handleClick.bind(this));
    this.scoreCanvas.addEventListener('contextmenu', this.handleRightClick.bind(this));
    
    this.canvasContext = this.canvas.getContext('2d');
    this.scoreCanvasContext = this.scoreCanvas.getContext('2d');
    
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
        for (var i = 0; i < content.players; i++) {
            this.state.players.push({
                name: content.players[i].name,
                score: 0
            });
        }
        this.state.currentIdx = content.idx;
        console.log(!content.idx);
        
        // hacky implementation
        document.getElementById("opp-name").style.display = "inline";
        document.getElementById("opp-name").textContent = content.players[!this.state.currentIdx + 0].name; // TODO super hacky implementation :P
        document.getElementById("message").textContent = "";
        document.getElementById("cancel").style.display = "none";
        document.getElementById("overlay").style.display = "none";
        
    } else if (type === "gameState") {
        this.updateMap(content.board);
        this.state.players[content.idx] = content.score;
        this.animateDeltaScore(content.idx, content.i, content.j, content.deltaScore, 0);
        
        // TODO ibid.
        if (content.idx === this.state.currentIdx) {
            document.getElementById("my-score").textContent = this.state.players[content.idx];
        } else {
            document.getElementById("opp-score").textContent = this.state.players[content.idx];
        }
       
    } else if (type === "endMatch") {
        this.updateMap(content.board);
        this.endMatch();
    }
};

Minesweeper.prototype.start = function(username) {
    this.state.currentUsername = username;
    this.wsSend("findMatch", {
        name: username 
    });
    this.ws.onmessage =  this.wsMessageHandler.bind(this);
};
Minesweeper.prototype.cancel = function() {
    this.state.currentUsername = null;
    this.wsSend("cancelFindMatch");
};
Minesweeper.prototype.getColorFromPlayer = function (idx) {
    var color = ['#F40000', '#0050FF', '#EDDF00', '#00BF04'];
    if (idx < 0 || idx >= color.length) {
        return '#000';
    }
    return color[idx];
};
Minesweeper.prototype.endMatch = function() {
    var x = 4.5 * this.config.tile.size,
        y = this.scoreCanvas.height / 2 - 50;
    this.scoreCanvasContext.clearRect(0, 0, this.scoreCanvas.width, this.scoreCanvas.height);
    
    this.scoreCanvasContext.save();
    this.scoreCanvasContext.fillStyle = "rgba(0, 0, 0, 0.6)";
    this.scoreCanvasContext.fillRect(0, 0, this.scoreCanvas.width, this.scoreCanvas.height);
    
    this.scoreCanvasContext.fillStyle = "#fff";
    this.scoreCanvasContext.font = 'bold 40px "Fira Mono"';
    this.scoreCanvasContext.fillText("Game Over", x + .5 * this.config.tile.size, y);
    this.scoreCanvasContext.font = 'bold 20px "Fira Mono"';
    this.scoreCanvasContext.fillText("Thank you for playing", x, y + 2 * this.config.tile.size);
    this.scoreCanvasContext.restore();
    
    // remove listener
    this.state.endMatch = true;
};

Minesweeper.prototype.animateDeltaScore = function (playerIdx, i, j, deltaScore, k) {
    if (this.state.endMatch) {
        return;
    }
    this.scoreCanvasContext.clearRect(0, 0, this.scoreCanvas.width, this.scoreCanvas.height);
    if (k > 10 || deltaScore === 0) {
        return;
    }
    if (deltaScore < 0 && playerIdx !== this.state.currentIdx) {
        return;
    }
    
    var x = (j + .3) * this.config.tile.size,
        y = (i + .3) * this.config.tile.size - k,
        str = deltaScore;
    if (deltaScore > 0) {
        str = "+" + deltaScore;
    }
    
    this.scoreCanvasContext.save();
    this.scoreCanvasContext.font = 'bold 20px "Fira Mono"';
    this.scoreCanvasContext.fillStyle = this.getColorFromPlayer(playerIdx);
    this.scoreCanvasContext.fillText(str, x, y);
    this.scoreCanvasContext.restore();
    
    window.requestAnimationFrame(function () {
        this.animateDeltaScore(playerIdx, i, j, deltaScore, k + 1);
    }.bind(this));
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
Minesweeper.prototype.drawImage = function(i, j, img) {
    var x = j * this.config.tile.size,
        y = i * this.config.tile.size;
    this.canvasContext.save();
    this.canvasContext.drawImage(img, x, y);
    this.canvasContext.restore();
};
Minesweeper.prototype.drawBomb = function(i, j) {
    this.drawRect(i, j, this.config.tile.revealedColor);
    this.drawImage(i, j, this.config.bomb);
}
Minesweeper.prototype.drawFlag = function(i, j , type) {
    this.drawRect(i, j, this.config.tile.revealedColor);
    this.drawImage(i, j, this.config.flag[type]);
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
Minesweeper.prototype.drawTile = function(i, j) {
    if (i < 0 || i >= this.config.maze.height || j < 0 || j >= this.config.maze.width) {
        return false;
    }
    
    if (this.state.map[i][j] === -1) {
        this.drawRect(i, j);
    } else {
        this.drawRect(i, j, this.config.tile.revealedColor);
    }
    
    if (this.state.map[i][j] === 9) { // mine
        this.drawBomb(i, j);
    } else if (this.state.map[i][j] >= 10) { // flag correct
        this.drawFlag(i, j, this.state.map[i][j] - 10); // dirty dirty haxx
    } else if (1 <= this.state.map[i][j] && this.state.map[i][j] <= 8) {
        this.drawNumber(i, j, this.state.map[i][j]);
    }
};

Minesweeper.prototype.drawMap = function () {
    for (var i = 0; i < this.config.maze.height; i++) {
        for (var j = 0; j < this.config.maze.width; j++) {
            this.drawTile(i, j);
        }
    }
};


Minesweeper.prototype.updateMap = function(data) {
    for (var i = 0; i < this.config.maze.height; i++) {
        for (var j = 0; j < this.config.maze.width; j++) {
            this.state.map[i][j] = data[i][j];
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

Minesweeper.prototype.handleHover = function (e) {
    if (this.state.endMatch) {
        return;
    }
    
    var tmp = this.getCoordFromEvent(e),
        i = tmp[0], j = tmp[1];
    // console.log("Hover:", i, j);
    
    this.drawTile(this.state.hoverPrev.i, this.state.hoverPrev.j);
    this.drawImage(i, j, this.config.tile.hover);
    this.state.hoverPrev.i = i;
    this.state.hoverPrev.j = j;
};
Minesweeper.prototype.handleClick = function (e) {
    var tmp = this.getCoordFromEvent(e),
        i = tmp[0], j = tmp[1];
    // console.log("Click:", i, j);
    
    if (this.state.map[i][j] === 0 || this.state.map[i][j] > 8 || this.state.endMatch) {
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
    // console.log("RightClick:", i, j);
    if (this.state.map[i][j] !== -1 || this.state.endMatch) {
        return false;
    }
    
    // send (i, j) to server
    this.wsSend("clickFlag", {
        i: i,
        j: j
    });
};


document.addEventListener("DOMContentLoaded", function () {
    var ws = new WebSocket("ws://spanisharmada-pciang.rhcloud.com:8000/"); // TODO point to real server
    var minesweeper = null;
    ws.onopen = function (e) {
        minesweeper = new Minesweeper(ws);
        minesweeper.drawMap();
        console.log("Connection opened");
    };
    window.onbeforeunload = function() {
        // http://stackoverflow.com/questions/4812686/closing-websocket-correctly-html5-javascript
        ws.onclose = function () {}; // disable onclose handler first
        ws.close();
    };
    
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