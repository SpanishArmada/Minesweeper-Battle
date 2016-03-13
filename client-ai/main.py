import websocket
import threading
import time
import json
import GetAction
from GetAction import getAction

getActionRunning = None
checked = [[False for i in range(30)] for j in range(30)]
def on_message(ws, message):
    # edit here for getAction
    global getActionRunning
    global checked
    print(message)
    obj = json.loads(message)
    if(obj['type'] == 'gameState'):
        content = obj['content']
        board = content['board']
        numRows = len(board)
        numCols = len(board[0])
        print(numRows, numCols)
        if(not getActionRunning):
            getActionRunning = True
            while(True):
                action, checked = getAction(numRows, numCols, board, checked)
                print(action)
                if(action[0] == "open"):
                    for act in action[1:]:
                        print(act)
                        sendMessage = {"type": "clickReveal", "content": {"i": act[0], "j": act[1]}}
                        ws.send(json.dumps(sendMessage))
                        time.sleep(0.1)
                    break
                elif(action[0] == "flag"):
                    for act in action[1:]:
                        print(act)
                        sendMessage = {"type": "clickFlag", "content": {"i": act[0], "j": act[1]}}
                        ws.send(json.dumps(sendMessage))
                        time.sleep(0.1)
                    break
                elif(action[0] == "finish"):
                    break
                
            getActionRunning = False
                    
                
        


def on_error(ws, error):
    print(error)

def on_close(ws):
    ws.close()
    print("### closed ###")

def on_open(ws):
    global getActionRunning
    getActionRunning = False
    x = json.dumps({"type":"findMatch", "content":{"name":"DeepCACADSweeper"}})
    ws.send(x)


if __name__ == "__main__":
    websocket.enableTrace(True)
    ws = websocket.WebSocketApp("ws://spanisharmada-pciang.rhcloud.com:8000/",
                              on_message = on_message,
                              on_error = on_error,
                              on_close = on_close)
    ws.on_open = on_open
    ws.run_forever()
