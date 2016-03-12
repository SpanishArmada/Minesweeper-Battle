"use strict";

var Minesweeper = function() {
    this.config = {
        maze: {
            width: 16,
            height: 16
        },
        bombs: 41,
    };
    this.state = [];
    for (var i = 0; i < this.config.maze.height; i++) {
        this.state[i] = [];
    }
    this.canvas = document.getElementById("canvas");
    this.canvas.addEventListener('click', function (e) {
        this.handleClick(this.canvas, e);
    }.bind(this));
    this.canvasContext = this.canvas.getContext('2d');
    
};
Minesweeper.prototype.drawMap = function () {
    
};
Minesweeper.prototype.handleClick = function () {
    
};




document.addEventListener("DOMContentLoaded", function () {
    var minesweeper = new Minesweeper();
    
}, false);