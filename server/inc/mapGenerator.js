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

function getBombs(xSize, ySize, xClicked, yClicked, bombs) {
    /**
     * (xSize, ySize) is the board size
     * (xClicked, yClicked) is the grid clicked by user at the first time
     * bombs is the number of bombs that we want on the board
     * return the coordinates of bombs
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
    return grids.slice(0, bombs);
}