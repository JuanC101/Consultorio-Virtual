from fastapi import FastAPI
from fastapi.responses import StreamingResponse
import cv2

app = FastAPI()

def gen():
    cap = cv2.VideoCapture(0)  # Usa 0 para la cámara integrada, 1 para una cámara externa, etc.
    while True:
        ret, frame = cap.read()
        if not ret:
            break
        _, buffer = cv2.imencode('.jpg', frame)
        frame = buffer.tobytes()
        yield (b'--frame\r\n'
               b'Content-Type: image/jpeg\r\n\r\n' + frame + b'\r\n')

@app.get("/video")
async def video_feed():
    return StreamingResponse(gen(), media_type="multipart/x-mixed-replace; boundary=frame")

# Punto de entrada para ejecutar el servidor con Uvicorn
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
