/**
 * Created by dbakti7 on 3/12/2016.
 */

 var assert = require('assert');

module.exports = (function () {
	var dr = [0, 1, 1, 1, 0, -1, -1, -1],
		dc = [1, 1, 0, -1, -1, -1, 0, 1];

	function shuffle(array) {
		/**
		 * to shuffle an array, based of Fisher-Yates algorithm
		 */
		var currentIndex = array.length, temporaryValue, randomIndex;

		// While there remain elements to shuffle...
		while (0 !== currentIndex) {

			// Pick a remaining element...
			randomIndex = Math.floor(Math.random() * currentIndex);
			currentIndex -= 1;

			// And swap it with the current element.
			temporaryValue = array[currentIndex];
			array[currentIndex] = array[randomIndex];
			array[randomIndex] = temporaryValue;
		}

		return array;
	}

	function flattenBoard(numRows, numCols, rowClicked, colClicked, numMines) {
		/**
		 * (numRows, numCols) is the board size
		 * (rowClicked, colClicked) is the grid clicked by user at the first time
		 * numMines is the number of bombs that we want on the board
		 * return the flattened board
		 * @type {Array}
		 */
		var grids = [];
		for(var i = 0; i < numRows; ++i) {
			for(var j = 0; j < numCols; ++j) {
				// skip if the grid is around the clicked grid
				if(Math.abs(i - rowClicked) <= 1 && Math.abs(j - colClicked) <= 1)
					continue;
				grids.push([i, j]);
			}
		}
		return grids;
	}

	function inBoard(numRows, numCols, row, col) {
		return 0 <= row && row < numRows
			&& 0 <= col && col < numCols;
	}

	function inEdge(numRows, numCols, row, col) {
		return 0 == row || row == numRows-1 
			|| 0 == col || col == numCols-1;
	}

	function inCorner(numRows, numCols, row, col) {
		return (0 == row || row == numRows-1)
			&& (0 == col || col == numCols-1);
	}

	function placeMines(numRows, numCols, shuffledGrids, numMines) {
		/**
		 * (numRows, numCols) is the board size
		 * numMines is the number of bombs that we want on the board
		 * return grids: 2D array, 9 for bomb, 1 - 8 for bombs count
		 * @type {Array}
		 */
		var grids = new Array(numRows);
		for(var i = 0; i < numRows; ++i)
			grids[i] = new Array(numCols);

		for(var i = 0; i < numRows; ++i)
			for(var j = 0; j < numCols; ++j)
				grids[i][j] = 0;

		var hasMines = new Array(numRows);
		for(var i = 0; i < numRows; ++i) {
			hasMines[i] = new Array(numCols);
			for(var j = 0; j < numCols; ++j)
				hasMines[i][j] = false;
		}

		for(var i = 0; i < shuffledGrids.length; ++i) {
			var coordinate = shuffledGrids[i];

			if(numMines == 0)
				break;

			var hasEight = false;
			var hasFive = false;
			var hasTwo = false;

			for(var k = 0; k < dr.length; ++k) {
				var row = coordinate[0] + dr[k],
					col = coordinate[1] + dc[k];


				if(inBoard(numRows, numCols, row, col)) {
					++grids[row][col];
					if(inCorner(numRows, numCols, row, col)) {
						hasTwo = hasTwo || grids[row][col] === 2;
					}
					else if(inEdge(numRows, numCols, row, col)) {
						hasFive = hasFive || grids[row][col] === 5;
					}
					else{
						hasEight = hasEight || grids[row][col] === 8;	
					}
					


				}
			}

			if(hasTwo || hasFive || hasEight) {
				for(var k = 0; k < dr.length; ++k) {
					var row = coordinate[0] + dr[k],
						col = coordinate[1] + dc[k];

					if(inBoard(numRows, numCols, row, col))
						--grids[row][col];
				}
			}
			else {
				--numMines;
				hasMines[coordinate[0]][coordinate[1]] = true;
			}
		}

		for(var i = 0; i < numRows; ++i) {
			for(var j = 0 ; j < numCols; ++j) {
				if(hasMines[i][j])
					grids[i][j] = 9;
			}
		}

		return grids;
	}

	function generate(numRows, numCols, rowClicked, colClicked, numMines) {
		/**
		 * (numRows, numCols) is the board size
		 * (rowClicked, colClicked) is the coordinate clicked the first time
		 * numMines is the number of bombs we want on the board
		 * return grids: 2D array, 0 for bomb, 1 - 8 for bombs count
		 */
		shuffledGrids = shuffle(flattenBoard(numRows, numCols, rowClicked, colClicked, numMines));
		grids = placeMines(numRows, numCols, shuffledGrids, numMines);
		return grids;
	}

	return {
		generate: generate
	};

}());




