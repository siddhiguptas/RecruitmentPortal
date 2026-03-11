import pandas as pd
from sklearn.ensemble import RandomForestClassifier
import joblib
import os

# Set up paths
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "placement_model.pkl")
CSV_PATH = os.path.join(BASE_DIR, "placement_data.csv")


def train_model_from_csv():
    """
    Reads the real alumni data from the CSV file and trains the model.
    """
    if not os.path.exists(CSV_PATH):
        print(f"Error: Could not find {CSV_PATH}. Please create the spreadsheet.")
        return

    print("Loading data from CSV and training model...")
    df = pd.read_csv(CSV_PATH)

    # Separate the features (inputs) from the target (Placed)
    X = df.drop("Placed", axis=1)
    y = df["Placed"]

    model = RandomForestClassifier(n_estimators=100, random_state=42)
    model.fit(X, y)

    joblib.dump(model, MODEL_PATH)
    print("Model trained on real data and saved successfully!")


# Auto-train if the model doesn't exist yet
if not os.path.exists(MODEL_PATH):
    train_model_from_csv()


def predict_student_placement(student_data):
    """
    Loads the model, predicts probability, and generates TPO feedback.
    """
    # Ensure the model is trained before predicting
    if not os.path.exists(MODEL_PATH):
        return {"error": "Model not trained. Missing CSV data."}

    model = joblib.load(MODEL_PATH)

    # Convert incoming dict to DataFrame. Columns must match the CSV perfectly.
    df = pd.DataFrame([student_data])

    # Predict Probability of getting placed
    probability = model.predict_proba(df)[0][1]

    # Generate dynamic feedback based on the new metrics
    feedback = []
    if student_data["CGPA"] < 7.0:
        feedback.append(
            "High Priority: Improve CGPA to clear initial company cut-offs."
        )
    if student_data["DSA_Score"] < 60:
        feedback.append("Needs significant upskilling in Data Structures & Algorithms.")
    if student_data["Aptitude_Score"] < 65:
        feedback.append(
            "Aptitude score is low. Practice quantitative and logical reasoning."
        )
    if student_data["Internships"] == 0 and student_data["Projects"] < 2:
        feedback.append(
            "Resume lacks practical experience. Build more projects or secure an internship."
        )
    if student_data["Comm_Skills"] <= 2:
        feedback.append("Enroll in soft skills and mock interview workshops.")

    if not feedback:
        feedback.append("Profile is highly competitive. Ready for placement drives.")

    return {
        "placement_probability": round(probability * 100, 2),
        "recommendations": feedback,
    }
