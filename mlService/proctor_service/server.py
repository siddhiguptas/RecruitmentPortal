from fastapi import FastAPI, WebSocket, WebSocketDisconnect
import cv2
import numpy as np
import base64
import json
from proctor_engine import analyze_frame

app = FastAPI()


@app.websocket("/ws/proctor")
async def proctor_endpoint(websocket: WebSocket):
    await websocket.accept()
    try:
        while True:
            # 1. Receive the Base64 image string from the frontend
            data = await websocket.receive_text()

            # 2. Clean the string (remove the "data:image/jpeg;base64," part)
            if "," in data:
                data = data.split(",")[1]

            # 3. Decode Base64 back into raw bytes
            img_bytes = base64.b64decode(data)

            # 4. Convert bytes into a NumPy array, then into an OpenCV image
            np_arr = np.frombuffer(img_bytes, np.uint8)
            frame = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)

            # 5. Pass the frame to our proctor engine
            if frame is not None:
                result = analyze_frame(frame)
                # 6. Send the status back to the frontend as JSON
                await websocket.send_text(json.dumps(result))
            else:
                await websocket.send_text(
                    json.dumps({"error": "Failed to decode frame"})
                )

    except WebSocketDisconnect:
        print("Client disconnected from proctoring session.")
    except Exception as e:
        print(f"Error: {e}")
