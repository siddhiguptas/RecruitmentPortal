import cv2
import mediapipe as mp
import numpy as np

# Initialize MediaPipe outside the function so it doesn't reload on every single frame
mp_face_mesh = mp.solutions.face_mesh
face_mesh = mp_face_mesh.FaceMesh(
    max_num_faces=1,
    refine_landmarks=True,
    min_detection_confidence=0.5,
    min_tracking_confidence=0.5,
)


def analyze_frame(image_array):
    """
    Takes a BGR image array (from OpenCV), processes head pose,
    and returns a dictionary of the proctoring status.
    """
    # MediaPipe requires RGB color space
    image_rgb = cv2.cvtColor(image_array, cv2.COLOR_BGR2RGB)
    results = face_mesh.process(image_rgb)

    # Default status payload
    status = {
        "head_pose": "Center",
        "suspicious": False,
        "message": "Looking at screen",
    }

    # If no face is found in the frame at all
    if not results.multi_face_landmarks:
        status["head_pose"] = "No Face Detected"
        status["suspicious"] = True
        status["message"] = "Face is not visible in the camera frame."
        return status

    img_h, img_w, _ = image_array.shape
    face_3d = []
    face_2d = []

    for face_landmarks in results.multi_face_landmarks:
        for idx, lm in enumerate(face_landmarks.landmark):
            # Key landmarks: Nose tip, Chin, Left/Right Eye corners, Mouth corners
            if idx in [33, 263, 1, 61, 291, 199]:
                x, y = int(lm.x * img_w), int(lm.y * img_h)

                # 2D image coordinates
                face_2d.append([x, y])
                # 3D spatial coordinates (Z is estimated by MediaPipe)
                face_3d.append([x, y, lm.z])

        # Convert to NumPy arrays required by OpenCV
        face_2d = np.array(face_2d, dtype=np.float64)
        face_3d = np.array(face_3d, dtype=np.float64)

        # Build the Camera Matrix (Intrinsic parameters)
        focal_length = 1 * img_w
        cam_matrix = np.array(
            [[focal_length, 0, img_h / 2], [0, focal_length, img_w / 2], [0, 0, 1]]
        )
        dist_matrix = np.zeros((4, 1), dtype=np.float64)

        # Solve PnP (Perspective-n-Point) to find head rotation
        success, rot_vec, trans_vec = cv2.solvePnP(
            face_3d, face_2d, cam_matrix, dist_matrix
        )

        # Convert rotation vector to a rotation matrix
        rmat, _ = cv2.Rodrigues(rot_vec)

        # Get the Euler angles (Pitch, Yaw, Roll)
        angles, _, _, _, _, _ = cv2.RQDecomp3x3(rmat)

        x = angles[0] * 360  # Pitch (Up/Down)
        y = angles[1] * 360  # Yaw (Left/Right)

        # Thresholds to determine where they are looking
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
