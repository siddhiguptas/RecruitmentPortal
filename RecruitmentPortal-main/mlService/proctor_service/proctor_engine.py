import cv2
import mediapipe as mp
from mediapipe.tasks import python
from mediapipe.tasks.python import vision
import numpy as np
import os
import urllib.request

# ==========================================
# 1. SETUP: Face Landmarker Model
# ==========================================
face_model_path = "face_landmarker.task"
if not os.path.exists(face_model_path):
    print("Downloading Face Landmarker model...")
    url = "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task"
    urllib.request.urlretrieve(url, face_model_path)

face_base_options = python.BaseOptions(model_asset_path=face_model_path)
face_options = vision.FaceLandmarkerOptions(base_options=face_base_options, num_faces=3)
face_detector = vision.FaceLandmarker.create_from_options(face_options)

# ==========================================
# 2. SETUP: Object Detector Model (Upgraded to Lite2)
# ==========================================
obj_model_path = "efficientdet_lite2.tflite"
if not os.path.exists(obj_model_path):
    print("Downloading Upgraded Object Detector model...")
    url = "https://storage.googleapis.com/mediapipe-models/object_detector/efficientdet_lite2/int8/1/efficientdet_lite2.tflite"
    urllib.request.urlretrieve(url, obj_model_path)

obj_base_options = python.BaseOptions(model_asset_path=obj_model_path)
obj_options = vision.ObjectDetectorOptions(
    base_options=obj_base_options, score_threshold=0.4
)  # 40% is a good balance for Lite2
object_detector = vision.ObjectDetector.create_from_options(obj_options)


# ==========================================
# 3. CORE PROCESSING ENGINE
# ==========================================
def analyze_frame(image_array):
    image_rgb = cv2.cvtColor(image_array, cv2.COLOR_BGR2RGB)
    mp_image = mp.Image(image_format=mp.ImageFormat.SRGB, data=image_rgb)

    # Default status
    status = {
        "head_pose": "Center",
        "suspicious": False,
        "message": "Looking at screen",
    }

    # --- NEW: PHONE DETECTION LOGIC ---
    obj_result = object_detector.detect(mp_image)
    for detection in obj_result.detections:
        for category in detection.categories:
            if category.category_name == "cell phone":
                status["suspicious"] = True
                status["message"] = "WARNING: Cell phone detected!"
                # We return immediately because a phone is an instant hard-fail
                return status

    # --- EXISTING FACE & GAZE LOGIC ---
    face_result = face_detector.detect(mp_image)

    if not face_result.face_landmarks:
        status["head_pose"] = "No Face Detected"
        status["suspicious"] = True
        status["message"] = "Face is not visible in the camera frame."
        return status

    if len(face_result.face_landmarks) > 1:
        status["head_pose"] = "Multiple Faces"
        status["suspicious"] = True
        status["message"] = (
            f"Warning: {len(face_result.face_landmarks)} people detected in frame!"
        )
        return status

    img_h, img_w, _ = image_array.shape
    face_3d = []
    face_2d = []

    for face_landmarks in face_result.face_landmarks:
        for idx, lm in enumerate(face_landmarks):
            if idx in [33, 263, 1, 61, 291, 199]:
                x, y = int(lm.x * img_w), int(lm.y * img_h)
                face_2d.append([x, y])
                face_3d.append([x, y, lm.z])

        face_2d = np.array(face_2d, dtype=np.float64)
        face_3d = np.array(face_3d, dtype=np.float64)

        focal_length = 1 * img_w
        cam_matrix = np.array(
            [[focal_length, 0, img_h / 2], [0, focal_length, img_w / 2], [0, 0, 1]]
        )
        dist_matrix = np.zeros((4, 1), dtype=np.float64)

        success, rot_vec, trans_vec = cv2.solvePnP(
            face_3d, face_2d, cam_matrix, dist_matrix
        )
        rmat, _ = cv2.Rodrigues(rot_vec)
        angles, _, _, _, _, _ = cv2.RQDecomp3x3(rmat)

        x = angles[0] * 360
        y = angles[1] * 360

        if y < -10:
            status["head_pose"] = "Looking Right"
            status["suspicious"] = True
            status["message"] = "Looking away from screen."
        elif y > 10:
            status["head_pose"] = "Looking Left"
            status["suspicious"] = True
            status["message"] = "Looking away from screen."
        elif x < -5:
            status["head_pose"] = "Looking Down"
            status["suspicious"] = True
            status["message"] = "Possible phone usage or reading notes."
        elif x > 15:
            status["head_pose"] = "Looking Up"
            status["suspicious"] = True
            status["message"] = "Looking away from screen."

    return status
