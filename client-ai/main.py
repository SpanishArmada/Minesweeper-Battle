import websocket
import threading
import time
import json
import GetAction
from GetAction import getAction

getActionRunning = None
def on_message(ws, message):
    # edit here for getAction
    global getActionRunning
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
                action = getAction(numRows, numCols, board)
                print(action)
                if(action[0] == "open"):
                    sendMessage = {"type": "clickReveal", "content": {"i": action[1], "j": action[2]}}
                    ws.send(json.dumps(sendMessage))
                    time.sleep(0.5)
                    break
                elif(action[0] == "flag"):
                    sendMessage = {"type": "clickFlag", "content": {"i": action[1], "j": action[2]}}
                    ws.send(json.dumps(sendMessage))
                    time.sleep(0.5)
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
##    ws.send("s")
    global getActionRunning
    getActionRunning = False
    x = json.dumps({"type":"findMatch", "content":{"name":"AI"}})
    ws.send(x)
##    def run(*args):
##        x = json.dumps(["findMatch", {"name": "AI"}])
##        ws.send(x)
##        print(x)
####        for i in range(3):
####            ws.send("Hello %d" % i)
####        #ws.close()
####        print("thread terminating...")
##    threading.Thread(target=run).start()


if __name__ == "__main__":
    websocket.enableTrace(True)
    ws = websocket.WebSocketApp("ws://spanisharmada-pciang.rhcloud.com:8000/",
                              on_message = on_message,
                              on_error = on_error,
                              on_close = on_close)
    ws.on_open = on_open
    ws.run_forever()
