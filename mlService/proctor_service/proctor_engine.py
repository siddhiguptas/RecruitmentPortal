import cv2
import mediapipe as mp
from mediapipe.tasks import python
from mediapipe.tasks.python import vision
import numpy as np
import os
import urllib.request

# 1. Download the required model file if it doesn't exist in your folder
model_path = "face_landmarker.task"
if not os.path.exists(model_path):
    print("Downloading Face Landmarker model (this only happens once)...")
    url = "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task"
    urllib.request.urlretrieve(url, model_path)

# 2. Initialize the modern Tasks API Face Landmarker
base_options = python.BaseOptions(model_asset_path=model_path)
options = vision.FaceLandmarkerOptions(base_options=base_options, num_faces=1)
detector = vision.FaceLandmarker.create_from_options(options)


def analyze_frame(image_array):
    """
    Takes a BGR image array, processes head pose using the Tasks API,
    and returns a dictionary of the proctoring status.
    """
    # MediaPipe Tasks API requires its own Image object in RGB format
    image_rgb = cv2.cvtColor(image_array, cv2.COLOR_BGR2RGB)
    mp_image = mp.Image(image_format=mp.ImageFormat.SRGB, data=image_rgb)

    # Process the frame
    detection_result = detector.detect(mp_image)

    status = {
        "head_pose": "Center",
        "suspicious": False,
        "message": "Looking at screen",
    }

    # If no face is found in the frame
    if not detection_result.face_landmarks:
        status["head_pose"] = "No Face Detected"
        status["suspicious"] = True
        status["message"] = "Face is not visible in the camera frame."
        return status

    img_h, img_w, _ = image_array.shape
    face_3d = []
    face_2d = []

    # The new API returns a list of landmarks directly
    for face_landmarks in detection_result.face_landmarks:
        for idx, lm in enumerate(face_landmarks):
            # Key landmarks: Nose tip, Chin, Left/Right Eye corners, Mouth corners
            if idx in [33, 263, 1, 61, 291, 199]:
                x, y = int(lm.x * img_w), int(lm.y * img_h)
                face_2d.append([x, y])
                face_3d.append([x, y, lm.z])

        # Convert to NumPy arrays for OpenCV
        face_2d = np.array(face_2d, dtype=np.float64)
        face_3d = np.array(face_3d, dtype=np.float64)

        # Build the Camera Matrix (Intrinsic parameters)
        focal_length = 1 * img_w
        cam_matrix = np.array(
            [[focal_length, 0, img_h / 2], [0, focal_length, img_w / 2], [0, 0, 1]]
        )
        dist_matrix = np.zeros((4, 1), dtype=np.float64)

        # Solve PnP to find head rotation
        success, rot_vec, trans_vec = cv2.solvePnP(
            face_3d, face_2d, cam_matrix, dist_matrix
        )
        rmat, _ = cv2.Rodrigues(rot_vec)
        angles, _, _, _, _, _ = cv2.RQDecomp3x3(rmat)

        x = angles[0] * 360  # Pitch
        y = angles[1] * 360  # Yaw

        # Thresholds to determine gaze direction
        if y < -10:
            status["head_pose"] = "Looking Left"
            status["suspicious"] = True
            status["message"] = "Looking away from screen."
        elif y > 10:
            status["head_pose"] = "Looking Right"
            status["suspicious"] = True
            status["message"] = "Looking away from screen."
        elif x < -5:
            status["head_pose"] = "Looking Down"
            status["suspicious"] = True
            status["message"] = "Possible phone usage."
        elif x > 15:
            status["head_pose"] = "Looking Up"
            status["suspicious"] = True
            status["message"] = "Looking away from screen."

    return status
