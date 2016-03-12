dr = [0, 1, 1, 1, 0, -1, -1, -1]
dc = [1, 1, 0, -1, -1, -1, 0, 1]

def inBoard(numRows, numCols, row, col):
    return ((0 <= row < numRows) and (0 <= col < numCols))

def getAction(numRows, numCols, gameState):
    for i in range(numRows):
        for j in range(numCols):
            curGrid = gameState[i][j]
            if(curGrid == -1 or (9 <= curGrid <= 10)):
                continue
            walls = 0
            revealedBombs = 0
            for k in range(len(dr)):
                if(inBoard(numRows, numCols, i + dr, j + dc)):
                    if(0 <= gameState[i + dr][j + dc] <= 8):
                        ++walls
                    elif(9 <= gameState[i + dr][j + dc] <= 10):
                        ++revealedBombs
                else:
                    ++walls

            space = 8 - walls - revealedBombs
            curGrid -= revealedBombs
            if(curGrid == 0):
                # openGrid
                for k in range(len(dr)):
                    if(inBoard(numRows, numCols, i + dr, j + dc)):
                        if(gameState[i + dr][j + dc] == -1):
                            return ['open', i + dr, j + dc]
            elif(curGrid == space):
                # flagGrid
                for k in range(len(dr)):
                    if(inBoard(numRows, numCols, i + dr, j + dc)):
                        if(gameState[i + dr][j + dc] == -1):
                            return ['flag', i + dr, j + dc]
            else:
                return ['finish']
