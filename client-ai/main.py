import websocket
import threading
import time
import json

getActionRunning = False
def on_message(ws, message):
    # edit here for getAction
    print(message)
    obj = json.loads(message)
    if(obj[0] == 'gameState'):
        content = obj['content']
        board = content['board']
        numRows = len(board)
        numCols = len(board[0])
        if(not getActionRunning):
            getActionRunning = True
            while(True):
                action = getAction(numRows, numCols, board)
                if(action[0] == "open"):
                    sendMessage = ["clickReveal", {i: action[1], j: action[2]}]
                    ws.send(json.dumps(sendMessage))
                    time.sleep(0.5)
                elif(action[0] == "flag"):
                    sendMessage = ["clickFlag", {i: action[1], j: action[2]}]
                    ws.send(json.dumps(sendMessage))
                    time.sleep(0.5)
                elif(action[0] == "finish"):
                    break
                
            getActionRunning = False
                    
                
        


def on_error(ws, error):
    print(error)

def on_close(ws):
    print("### closed ###")

def on_open(ws):
    def run(*args):
        for i in range(3):
            time.sleep(1)
            ws.send("Hello %d" % i)
        time.sleep(1)
        ws.close()
        print("thread terminating...")
    threading.Thread(target=run).start()


if __name__ == "__main__":
    websocket.enableTrace(True)
    ws = websocket.WebSocketApp("ws://echo.websocket.org/",
                              on_message = on_message,
                              on_error = on_error,
                              on_close = on_close)
    ws.on_open = on_open
    ws.run_forever()
