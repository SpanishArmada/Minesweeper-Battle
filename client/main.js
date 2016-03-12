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
            border: "#111111"
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
            this.state[i][j] = 0;
        }
    }
    this.canvas = document.getElementById("canvas");
    this.canvas.addEventListener('click', this.handleClick.bind(this));
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
    this.canvasContext.save();
    this.canvasContext.font = 'bold 20px monospace';
    this.canvasContext.fillStyle = this.getColorFromNumber(number);
    this.canvasContext.fillText(number, x, y);
    this.canvasContext.restore();
}

Minesweeper.prototype.drawBomb = function(i, j, type) {
    var x = j * this.config.tile.size,
        y = i * this.config.tile.size;
    this.canvasContext.save();
    this.canvasContext.drawImage(this.config.bomb[type], x, y);
    this.canvasContext.restore();
}
Minesweeper.prototype.drawFlag = function(i, j , type) {
    var x = j * this.config.tile.size,
        y = i * this.config.tile.size;
    this.canvasContext.save();
    this.canvasContext.drawImage(this.config.flag[type], x, y);
    this.canvasContext.restore();
}
Minesweeper.prototype.drawRect = function(i, j) {
    var x = j * this.config.tile.size,
        y = i * this.config.tile.size,
        width = this.config.tile.size,
        height = this.config.tile.size;
    this.canvasContext.save();
    this.canvasContext.fillStyle = this.config.tile.color;
    this.canvasContext.strokeStyle = this.config.tile.border;
    this.canvasContext.fillRect(x, y, width, height);
    this.canvasContext.strokeRect(x, y, width, height);
    this.canvasContext.restore();
}
Minesweeper.prototype.drawMap = function () {
    for (var i = 0; i < this.config.maze.height; i++) {
        for (var j = 0; j < this.config.maze.width; j++) {
            this.drawRect(i, j);
        }
    }
};
Minesweeper.prototype.handleClick = function (e) {
    var rect = this.canvas.getBoundingClientRect(),
        x = e.clientX - rect.left,
        y = e.clientY - rect.top,
        i = Math.floor(y / this.config.tile.size),
        j = Math.floor(x / this.config.tile.size);
    console.log(x, y, i, j);
    
    // send (i, j) to server
    
    this.drawFlag(i, j, Math.round(Math.random()));
    
};

document.addEventListener("DOMContentLoaded", function () {
    var minesweeper = new Minesweeper();
    minesweeper.drawMap();
    
    minesweeper.drawNumber(5, 5, 1);
    minesweeper.drawNumber(5, 6, 2);
    minesweeper.drawNumber(5, 7, 3);
    minesweeper.drawNumber(5, 8, 4);
    minesweeper.drawNumber(5, 9, 5);
    minesweeper.drawNumber(5, 10, 6);
    minesweeper.drawNumber(5, 11, 7);
    minesweeper.drawNumber(5, 12, 8);
    
}, false);