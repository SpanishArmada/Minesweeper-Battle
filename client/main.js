"use strict";

var Minesweeper = function() {
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
        
    
    this.state = [];
    for (var i = 0; i < this.config.maze.height; i++) {
        this.state[i] = [];
        for (var j = 0; j < this.config.maze.width; j++) {
            this.state[i][j] = -1;
        }
    }
    this.canvas = document.getElementById("canvas");
    this.canvas.addEventListener('click', this.handleClick.bind(this));
    this.canvas.addEventListener('contextmenu', this.handleRightClick.bind(this));
    
    this.canvasContext = this.canvas.getContext('2d');
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
    this.canvasContext.font = 'bold 20px monospace';
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
            if (this.state[i][j] === -1) {
                this.drawRect(i, j);
            } else {
                this.drawRect(i, j, this.config.tile.revealedColor);
            }
            
            if (this.state[i][j] === 9) { // mine
                this.drawBomb(i, j);
            } else if (this.state[i][j] === 10) { // flag correct
                this.drawFlag(i, j, 0);
            } else if (1 <= this.state[i][j] && this.state[i][j] <= 8) {
                this.drawNumber(i, j, this.state[i][j]);
            }
            
        }
    }
};

Minesweeper.prototype.getCoordFromEvent = function (e) {
    var rect = this.canvas.getBoundingClientRect(),
        x = e.clientX - rect.left,
        y = e.clientY - rect.top,
        i = Math.floor(y / this.config.tile.size),
        j = Math.floor(x / this.config.tile.size);
    return [i, j];
}
Minesweeper.prototype.handleClick = function (e) {
    var tmp = this.getCoordFromEvent(e),
        i = tmp[0], j = tmp[1];
    console.log("Click:", i, j);
    if (this.state[i][j] === 0 || this.state[i][j] > 8) {
        return false;
    }
    
    // send (i, j) to server
};

Minesweeper.prototype.receiveMap = function() {
    // update map
    
    this.drawMap();
};

Minesweeper.prototype.handleRightClick = function (e) {
    e.preventDefault();
    var tmp = this.getCoordFromEvent(e),
        i = tmp[0], j = tmp[1];
    console.log("RightClick:", i, j);
    
    
    if (this.state[i][j] !== -1) {
        return false;
    }
    
    // send (i, j) to server
};

document.addEventListener("DOMContentLoaded", function () {
    var minesweeper = new Minesweeper();
    minesweeper.state[5][4] = 0;
    minesweeper.drawMap();
    minesweeper.drawNumber(5, 5, 1);
    minesweeper.drawNumber(5, 6, 2);
    minesweeper.drawNumber(5, 7, 3);
    minesweeper.drawNumber(5, 8, 4);
    minesweeper.drawNumber(5, 9, 5);
    minesweeper.drawNumber(5, 10, 6);
    minesweeper.drawNumber(5, 11, 7);
    minesweeper.drawNumber(5, 12, 8);
    minesweeper.drawBomb(5, 13);
    minesweeper.drawFlag(5, 14, 0);
    minesweeper.drawFlag(5, 15, 1);
    
}, false);