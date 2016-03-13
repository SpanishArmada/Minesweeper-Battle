dr = [0, 1, 1, 1, 0, -1, -1, -1]
dc = [1, 1, 0, -1, -1, -1, 0, 1]

def inBoard(numRows, numCols, row, col):
    return ((0 <= row < numRows) and (0 <= col < numCols))

def getAction(numRows, numCols, gameState):
    for i in range(numRows):
        for j in range(numCols):
            curGrid = gameState[i][j]
            if(curGrid == -1 or curGrid >= 9):
                continue
            walls = 0
            revealedBombs = 0
            for k in range(len(dr)):
                if(inBoard(numRows, numCols, i + dr[k], j + dc[k])):
                    if(0 <= gameState[i + dr[k]][j + dc[k]] <= 8):
                        walls += 1
                    elif(gameState[i + dr[k]][j + dc[k]] >= 9):
                        revealedBombs += 1
                else:
                    walls += 1
            
            space = 8 - walls - revealedBombs
            curGrid -= revealedBombs
            print(i, j, walls, revealedBombs, space, curGrid)
            if(curGrid == 0):
                # openGrid
                for k in range(len(dr)):
                    if(inBoard(numRows, numCols, i + dr[k], j + dc[k])):
                        if(gameState[i + dr[k]][j + dc[k]] == -1):
                            return ['open', i + dr[k], j + dc[k]]
            elif(curGrid == space):
                # flagGrid
                for k in range(len(dr)):
                    if(inBoard(numRows, numCols, i + dr[k], j + dc[k])):
                        if(gameState[i + dr[k]][j + dc[k]] == -1):
                            return ['flag', i + dr[k], j + dc[k]]
    return ['finish']
