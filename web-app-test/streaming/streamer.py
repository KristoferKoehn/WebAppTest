from flask import Flask, Response, jsonify, request
from flask_cors import CORS
import threading
import time
import numpy as np
import cv2
from mss import mss

# Create two Flask apps
stream_app = Flask("stream_app")
api_app = Flask("api_app")

CORS(stream_app)
CORS(api_app)

latest_fps = {"fps": 0}
region = {"left": 100, "top": 100, "width": 640, "height": 480}
region_lock = threading.Lock()

PREVIEW_WIDTH = 640
PREVIEW_HEIGHT = 480
TARGET_FPS = 24

# Shared screen dimensions (initialized later)
screen_width = None
screen_height = None

def interactive_overlay():
    """Displays a full-screen preview with a draggable capture rectangle."""
    global screen_width, screen_height

    dragging = False
    offset = (0, 0)

    window_name = "📺 Live Preview (Drag to Move Capture Box)"
    cv2.namedWindow(window_name)

    def mouse_callback(event, x, y, flags, param):
        nonlocal dragging, offset
        with region_lock:
            if event == cv2.EVENT_LBUTTONDOWN:
                scaled_left = int(region["left"] * PREVIEW_WIDTH / screen_width)
                scaled_top = int(region["top"] * PREVIEW_HEIGHT / screen_height)
                scaled_right = int((region["left"] + region["width"]) * PREVIEW_WIDTH / screen_width)
                scaled_bottom = int((region["top"] + region["height"]) * PREVIEW_HEIGHT / screen_height)

                if scaled_left < x < scaled_right and scaled_top < y < scaled_bottom:
                    dragging = True
                    offset = (x - scaled_left, y - scaled_top)

            elif event == cv2.EVENT_MOUSEMOVE and dragging:
                new_left = int((x - offset[0]) * screen_width / PREVIEW_WIDTH)
                new_top = int((y - offset[1]) * screen_height / PREVIEW_HEIGHT)
                region["left"] = max(0, min(screen_width - region["width"], new_left))
                region["top"] = max(0, min(screen_height - region["height"], new_top))

            elif event == cv2.EVENT_LBUTTONUP:
                dragging = False

    cv2.setMouseCallback(window_name, mouse_callback)

    with mss() as sct:
        monitor = sct.monitors[4]  # full screen monitor, adjust if needed
        screen_width = monitor["width"]
        screen_height = monitor["height"]

        while True:
            full_screen = sct.grab(monitor)
            frame = np.array(full_screen)
            frame = cv2.cvtColor(frame, cv2.COLOR_BGRA2BGR)
            preview = cv2.resize(frame, (PREVIEW_WIDTH, PREVIEW_HEIGHT))

            with region_lock:
                x = int(region["left"] * PREVIEW_WIDTH / screen_width)
                y = int(region["top"] * PREVIEW_HEIGHT / screen_height)
                w = int(region["width"] * PREVIEW_WIDTH / screen_width)
                h = int(region["height"] * PREVIEW_HEIGHT / screen_height)

            cv2.rectangle(preview, (x, y), (x + w, y + h), (0, 255, 0), 2)
            cv2.putText(preview, "Drag this box to change stream region", (x + 10, y - 10),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.5, (100, 255, 100), 1, cv2.LINE_AA)

            cv2.imshow(window_name, preview)
            if cv2.waitKey(10) & 0xFF == 27:  # ESC to exit
                break

    cv2.destroyAllWindows()


@stream_app.route("/screen")
def screen_feed():
    def generate_frames():
        with mss() as sct:
            prev_time = time.time()
            frame_count = 0

            target_fps = TARGET_FPS
            frame_duration = 1.0 / target_fps

            while True:
                start = time.time()

                with region_lock:
                    mon = dict(region)
                screen = sct.grab(mon)
                frame = np.array(screen)
                frame = cv2.cvtColor(frame, cv2.COLOR_BGRA2BGR)

                ret, buffer = cv2.imencode(".jpg", frame, [cv2.IMWRITE_JPEG_QUALITY, 70])
                if not ret:
                    continue

                now = time.time()
                frame_count += 1
                if now - prev_time >= 1.0:
                    latest_fps["fps"] = frame_count
                    frame_count = 0
                    prev_time = now

                yield (
                    b"--frame\r\n"
                    b"Content-Type: image/jpeg\r\n\r\n" + buffer.tobytes() + b"\r\n"
                )

                # ⏱ Frame rate limiting
                elapsed = time.time() - start
                sleep_time = max(0, frame_duration - elapsed)
                time.sleep(sleep_time)

    return Response(generate_frames(), mimetype="multipart/x-mixed-replace; boundary=frame")


@api_app.route("/fps")
def fps_api():
    return jsonify(latest_fps)


@api_app.route("/update-region", methods=["POST"])
def update_region():
    data = request.get_json()
    with region_lock:
        region["left"] = int(data.get("left", region["left"]))
        region["top"] = int(data.get("top", region["top"]))
        region["width"] = int(data.get("width", region["width"]))
        region["height"] = int(data.get("height", region["height"]))
    return jsonify(success=True, region=region)


def run_stream_app():
    stream_app.run(host="0.0.0.0", port=5000, threaded=True)


def run_api_app():
    api_app.run(host="0.0.0.0", port=5001, threaded=True)


if __name__ == "__main__":
    # Start stream and API servers in background threads
    threading.Thread(target=run_stream_app, daemon=True).start()
    threading.Thread(target=run_api_app, daemon=True).start()

    # Optionally run the overlay UI on main thread (uncomment if needed)
    #interactive_overlay()

    # Keep main thread alive indefinitely
    while True:
        time.sleep(1)
