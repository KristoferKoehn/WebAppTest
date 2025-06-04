from flask import Flask, Response, jsonify
import cv2
import numpy as np
from mss import mss
import time
import threading

app = Flask(__name__)
monitor = {"top": 0, "left": 0, "width": 1280, "height": 720}
latest_fps = {"fps": 0}

def generate_frames():
    with mss() as sct:
        prev_time = time.time()
        frame_count = 0

        while True:
            frame_count += 1
            sct_img = sct.grab(monitor)
            frame = np.array(sct_img)
            frame = cv2.cvtColor(frame, cv2.COLOR_BGRA2BGR)
            ret, buffer = cv2.imencode(".jpg", frame, [cv2.IMWRITE_JPEG_QUALITY, 70])
            if not ret:
                continue

            # Calculate FPS every second
            now = time.time()
            if now - prev_time >= 1.0:
                latest_fps["fps"] = frame_count
                frame_count = 0
                prev_time = now

            yield (
                b"--frame\r\n"
                b"Content-Type: image/jpeg\r\n\r\n" + buffer.tobytes() + b"\r\n"
            )

@app.route("/screen")
def screen_feed():
    return Response(
        generate_frames(), mimetype="multipart/x-mixed-replace; boundary=frame"
    )

@app.route("/fps")
def fps_api():
    return jsonify(latest_fps)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, threaded=True)
