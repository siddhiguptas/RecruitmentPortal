# College Recruitment Portal - API Documentation

## Base URL
`http://localhost:3000/api`

---

## 1. Authentication

### Register User
*   **Method:** `POST`
*   **URL:** `/auth/register`
*   **Authentication:** None
*   **Request Body:**
    ```json
    {
      "name": "John Doe",
      "email": "john@example.com",
      "password": "password123",
      "role": "student" // "student", "recruiter", "admin"
    }
    ```
*   **Response Body:**
    ```json
    {
      "_id": "64f...",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "student",
      "token": "jwt_token_here"
    }
    ```

### Login User
*   **Method:** `POST`
*   **URL:** `/auth/login`
*   **Authentication:** None
*   **Request Body:**
    ```json
    {
      "email": "john@example.com",
      "password": "password123"
    }
    ```
*   **Response Body:**
    ```json
    {
      "_id": "64f...",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "student",
      "token": "jwt_token_here"
    }
    ```

---

## 2. Student APIs

### Upload Resume
*   **Method:** `POST`
*   **URL:** `/students/upload-resume`
*   **Authentication:** Required (Student)
*   **Request Body:** `multipart/form-data` (field: `resume`)
*   **Response Body:**
    ```json
    {
      "message": "Resume uploaded and parsed",
      "profile": { ... }
    }
    ```

### Update Profile
*   **Method:** `PUT`
*   **URL:** `/students/profile`
*   **Authentication:** Required (Student)
*   **Request Body:**
    ```json
    {
      "skills": ["React", "Node.js"],
      "education": [...],
      "experience": [...]
    }
    ```
*   **Response Body:** Updated profile object.

### View Recommended Jobs
*   **Method:** `GET`
*   **URL:** `/students/recommended-jobs`
*   **Authentication:** Required (Student)
*   **Response Body:** Array of ranked job recommendations.

### Apply to Job
*   **Method:** `POST`
*   **URL:** `/students/apply`
*   **Authentication:** Required (Student)
*   **Request Body:**
    ```json
    {
      "jobId": "64f..."
    }
    ```
*   **Response Body:** Application object with match score.

### View My Applications
*   **Method:** `GET`
*   **URL:** `/students/applications`
*   **Authentication:** Required (Student)
*   **Response Body:** Array of applications with job details.

---

## 3. Recruiter APIs

### Post Job
*   **Method:** `POST`
*   **URL:** `/recruiters/jobs`
*   **Authentication:** Required (Recruiter)
*   **Request Body:**
    ```json
    {
      "company": "Tech Corp",
      "title": "Software Engineer",
      "description": "...",
      "requirements": ["..."],
      "location": "Remote",
      "salary": "100k",
      "jobType": "full-time"
    }
    ```
*   **Response Body:** Created job object.

### View Applicants
*   **Method:** `GET`
*   **URL:** `/recruiters/jobs/:jobId/applicants`
*   **Authentication:** Required (Recruiter)
*   **Response Body:** Array of applications sorted by match score.

### Rank Candidates using ML
*   **Method:** `POST`
*   **URL:** `/recruiters/jobs/:jobId/rank`
*   **Authentication:** Required (Recruiter)
*   **Response Body:** Array of ranked candidates with scores.

### Update Application Stage
*   **Method:** `PUT`
*   **URL:** `/recruiters/applications/:applicationId/status`
*   **Authentication:** Required (Recruiter)
*   **Request Body:**
    ```json
    {
      "status": "shortlisted", // "applied", "shortlisted", "interviewing", "offered", "rejected"
      "feedback": "Great profile"
    }
    ```
*   **Response Body:** Updated application object.

---

## 4. Admin APIs

### View Placement Analytics
*   **Method:** `GET`
*   **URL:** `/admin/analytics`
*   **Authentication:** Required (Admin)
*   **Response Body:**
    ```json
    {
      "totalStudents": 100,
      "totalRecruiters": 10,
      "totalJobs": 50,
      "totalApplications": 200,
      "placedStudents": 30,
      "placementRate": "30.00"
    }
    ```

### Verify Student Eligibility
*   **Method:** `PUT`
*   **URL:** `/admin/students/:studentId/eligibility`
*   **Authentication:** Required (Admin)
*   **Request Body:**
    ```json
    {
      "isEligible": true
    }
    ```
*   **Response Body:** Updated student profile.

### Predict Student Placement
*   **Method:** `POST`
*   **URL:** `/admin/students/:studentId/predict-placement`
*   **Authentication:** Required (Admin)
*   **Request Body:**
    ```json
    {
      "cgpa": 8.5,
      "internships": 2,
      "projects": 3,
      "backlogs": 0
    }
    ```
*   **Response Body:**
    ```json
    {
      "placement_probability": 0.85,
      "recommendations": ["Improve coding skills", "Take more projects"]
    }
    ```

---

## 5. ML Microservice Integration (Internal Bridge)

The backend communicates with the Python ML service at `http://localhost:8000`.

*   `POST /parse-resume`: Extracts skills, education, and experience from a resume file.
*   `POST /parse-resume-text`: Extracts skills, education, and experience from plain text.
*   `POST /match-job`: Calculates match score between a student profile and job description.
*   `POST /recommend-jobs`: Returns ranked job recommendations for a student.
*   `POST /rank-candidates`: Returns ranked candidates for a recruiter job.
*   `POST /predict-placement` or `POST /api/predict-placement`: Returns placement probability and recommendations for a student.
*   `WebSocket /ws/proctor`: Streams webcam frames and returns suspicious activity detection.

---

## 6. Real-Time Notifications (Socket.io)

Clients can connect to the Socket.io server on the main port.

*   **Event:** `join_room`
    *   **Payload:** `userId`
    *   **Description:** Join a private room for notifications.
*   **Event:** `application_update`
    *   **Payload:** `{ applicationId, status, feedback }`
    *   **Description:** Received by students when their application status changes.
*   **Event:** `proctoring_alert`
    *   **Payload:** `{ alertType, confidence }`
    *   **Description:** Received during online tests if suspicious activity is detected.
