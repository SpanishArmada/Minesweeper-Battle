/**
 * Created by dbakti7 on 3/12/2016.
 */
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

function shuffleGrids(xSize, ySize, xClicked, yClicked, bombs) {
    /**
     * (xSize, ySize) is the board size
     * (xClicked, yClicked) is the grid clicked by user at the first time
     * bombs is the number of bombs that we want on the board
     * return the shuffled-coordinates
     * @type {Array}
     */
    var grids = [];
    for(i = 0;i < xSize; ++i) {
        for(j = 0;j < ySize; ++j) {
            // skip if the grid is around the clicked grid
            if((Math.abs(xSize - xClicked) <= 1) || (Math.abs(ySize - yClicked) <= 1))
                continue;
            grids.push([i, j]);
        }
    }
    shuffle(grids);
    return grids;
}

function placeBombs(xSize, ySize, shuffledGrids, bombs) {
    /**
     * (xSize, ySize) is the board size
     * bombs is the number of bombs that we want on the board
     * return grids: 2D array, 0 for bomb, 1 - 8 for bombs count
     * @type {Array}
     */
    var grids = new Array(xSize);
    for(i=0;i<xSize;++i)
        grids[i] = new Array(ySize);

    for(i=0;i<xSize;++i)
        for(j=0;j<ySize;++j)
            grids[i][j] = 0;

    var bombLocations = new Array(xSize);
    for(i=0;i<xSize;++i)
        bombLocations[i] = new Array(ySize);

    for(i=0;i<xSize;++i)
        for(j=0;j<ySize;++j)
            bombLocations[i][j] = 0;

    for(coordinate in shuffledGrids) {
        if(bombs == 0)
            break;

        ++grids[coordinate[0]+1][coordinate[1]];
        ++grids[coordinate[0]-1][coordinate[1]];
        ++grids[coordinate[0]][coordinate[1]+1];
        ++grids[coordinate[0]][coordinate[1]-1];
        ++grids[coordinate[0]+1][coordinate[1]+1];
        ++grids[coordinate[0]-1][coordinate[1]-1];
        ++grids[coordinate[0]-1][coordinate[1]+1];
        ++grids[coordinate[0]+1][coordinate[1]-1];

        if((++grids[coordinate[0]+1][coordinate[1]] == 9) ||
            (++grids[coordinate[0]-1][coordinate[1]] == 9) ||
            (++grids[coordinate[0]][coordinate[1]+1] == 9) ||
            (++grids[coordinate[0]][coordinate[1]-1] == 9) ||
            (++grids[coordinate[0]+1][coordinate[1]+1] == 9) ||
            (++grids[coordinate[0]-1][coordinate[1]-1] == 9) ||
            (++grids[coordinate[0]-1][coordinate[1]+1] == 9) ||
            (++grids[coordinate[0]+1][coordinate[1]-1] == 9)) {

            --grids[coordinate[0]+1][coordinate[1]];
            --grids[coordinate[0]-1][coordinate[1]];
            --grids[coordinate[0]][coordinate[1]+1];
            --grids[coordinate[0]][coordinate[1]-1];
            --grids[coordinate[0]+1][coordinate[1]+1];
            --grids[coordinate[0]-1][coordinate[1]-1];
            --grids[coordinate[0]-1][coordinate[1]+1];
            --grids[coordinate[0]+1][coordinate[1]-1];
        }
        else {
            --bombs;
            bombLocations[coordinate[0]][coordinate[1]] = 1;
        }
    }
    for(i=0;i<xSize;++i) {
        for(j=0;j<ySize;++j) {
            if(bombLocations[i][j] == 1)
                grids[i][j] = 0;
        }
    }
    return grids;
}


function getMap(xSize, ySize, xClicked, yClicked, bombs) {

    shuffledGrids = shuffleGrids(xSize, ySize, xClicked, yClicked, bombs);
    grids = placeBombs(xSize, ySize, shuffledGrids, bombs);
    return grids;
}
