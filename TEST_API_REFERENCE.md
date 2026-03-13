# Test API Quick Reference

## Base URL
```
http://localhost:3000/api/tests
```

## Authentication
All requests require:
```
Header: Authorization: Bearer <JWT_TOKEN>
Header: Content-Type: application/json
```

---

## API Endpoints Summary

### 1. Get All Available Tests
**GET** `/api/tests`
```bash
curl -X GET http://localhost:3000/api/tests \
  -H "Authorization: Bearer <token>"
```

**Response**: Array of Test objects
```json
[
  {
    "_id": "507f1f77bcf86cd799439011",
    "title": "JavaScript Fundamentals",
    "company": "Tech Corp",
    "type": "MCQ",
    "duration": 30,
    "totalQuestions": 5,
    "difficulty": "Easy",
    "deadline": "2024-03-20T00:00:00Z",
    "passingScore": 60,
    "createdAt": "2024-03-10T10:30:00Z"
  }
]
```

---

### 2. Get Test Details
**GET** `/api/tests/:testId`
```bash
curl -X GET http://localhost:3000/api/tests/507f1f77bcf86cd799439011 \
  -H "Authorization: Bearer <token>"
```

**Response**:
```json
{
  "test": {
    "_id": "507f1f77bcf86cd799439011",
    "title": "JavaScript Fundamentals",
    "company": "Tech Corp",
    "type": "MCQ",
    "duration": 30,
    "totalQuestions": 5,
    "difficulty": "Easy",
    "passingScore": 60,
    "questions": [
      {
        "questionText": "What is JavaScript?",
        "options": ["A", "B", "C", "D"],
        "marks": 1
      }
    ]
  },
  "hasAttempted": false,
  "attemptId": null
}
```

---

### 3. Start Test
**POST** `/api/tests/:testId/start`
```bash
curl -X POST http://localhost:3000/api/tests/507f1f77bcf86cd799439011/start \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json"
```

**Response**:
```json
{
  "attemptId": "507f1f77bcf86cd799439012",
  "test": {
    "_id": "507f1f77bcf86cd799439011",
    "title": "JavaScript Fundamentals",
    "type": "MCQ",
    "duration": 30,
    "questions": [...]
  },
  "startedAt": "2024-03-10T14:30:00Z",
  "timeRemaining": 1800
}
```

---

### 4. Save Answer (Auto-save)
**POST** `/api/tests/:attemptId/save-answer`
```bash
# MCQ Answer
curl -X POST http://localhost:3000/api/tests/507f1f77bcf86cd799439012/save-answer \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "mcq",
    "questionIndex": 0,
    "answer": 2,
    "timeSpent": 45
  }'

# Coding Answer
curl -X POST http://localhost:3000/api/tests/507f1f77bcf86cd799439012/save-answer \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "coding",
    "questionIndex": 0,
    "answer": "function sum(a, b) { return a + b; }",
    "timeSpent": 120
  }'
```

**Response**:
```json
{
  "message": "Answer saved successfully"
}
```

**Parameters**:
- `type` (string): "mcq" or "coding"
- `questionIndex` (number): Index of the question (0-based)
- `answer` (number for MCQ | string for coding): The answer
- `timeSpent` (number): Time spent on this question in seconds

---

### 5. Submit Test
**POST** `/api/tests/:attemptId/submit`
```bash
curl -X POST http://localhost:3000/api/tests/507f1f77bcf86cd799439012/submit \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json"
```

**Response**:
```json
{
  "message": "Test submitted successfully",
  "attemptId": "507f1f77bcf86cd799439012",
  "result": {
    "totalScore": 4,
    "totalMarks": 5,
    "percentage": 80,
    "passed": true,
    "timeTaken": 25
  }
}
```

---

### 6. Auto-submit Test
**POST** `/api/tests/:attemptId/auto-submit`
```bash
curl -X POST http://localhost:3000/api/tests/507f1f77bcf86cd799439012/auto-submit \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json"
```

**Response**: Same as Submit Test

---

### 7. Get Test Results
**GET** `/api/tests/results/all`
```bash
curl -X GET http://localhost:3000/api/tests/results/all \
  -H "Authorization: Bearer <token>"
```

**Response**: Array of TestResult objects
```json
[
  {
    "_id": "507f1f77bcf86cd799439012",
    "test": {
      "_id": "507f1f77bcf86cd799439011",
      "title": "JavaScript Fundamentals",
      "company": "Tech Corp",
      "type": "MCQ",
      "difficulty": "Easy",
      "duration": 30
    },
    "totalScore": 4,
    "percentage": 80,
    "passed": true,
    "submittedAt": "2024-03-10T14:55:00Z",
    "timeTaken": 25
  }
]
```

---

### 8. Get Attempt Result
**GET** `/api/tests/attempt/:attemptId/result`
```bash
curl -X GET http://localhost:3000/api/tests/attempt/507f1f77bcf86cd799439012/result \
  -H "Authorization: Bearer <token>"
```

**Response**:
```json
{
  "test": {
    "_id": "507f1f77bcf86cd799439011",
    "title": "JavaScript Fundamentals",
    "type": "MCQ"
  },
  "attemptId": "507f1f77bcf86cd799439012",
  "totalScore": 4,
  "percentage": 80,
  "passed": true,
  "timeTaken": 25,
  "submittedAt": "2024-03-10T14:55:00Z",
  "answers": [
    {
      "questionIndex": 0,
      "questionText": "What is JavaScript?",
      "options": ["A", "B", "C", "D"],
      "selectedAnswer": 2,
      "correctAnswer": 2,
      "isCorrect": true,
      "explanation": "JavaScript is a programming language...",
      "marks": 1,
      "timeSpent": 45
    }
  ]
}
```

---

### 9. Get Ongoing Attempts
**GET** `/api/tests/ongoing/list`
```bash
curl -X GET http://localhost:3000/api/tests/ongoing/list \
  -H "Authorization: Bearer <token>"
```

**Response**: Array of in-progress TestAttempt objects

---

## Error Responses

### 400 Bad Request
```json
{
  "message": "Invalid test ID"
}
```

### 404 Not Found
```json
{
  "message": "Test not found"
}
```

### 403 Forbidden
```json
{
  "message": "Unauthorized"
}
```

### 400 Test Already Completed
```json
{
  "message": "You have already completed this test. Retakes are not allowed."
}
```

### 400 Test Not in Progress
```json
{
  "message": "Test is no longer in progress"
}
```

---

## Response Codes

| Code | Meaning |
|------|---------|
| 200  | Success |
| 400  | Bad Request or Business Logic Error |
| 403  | Unauthorized (Role/Ownership Check) |
| 404  | Resource Not Found |
| 500  | Server Error |

---

## Rate Limiting

Currently no rate limiting. Consider adding:
- 10 requests per second per student
- 100 test attempts per day per student

---

## Field Descriptions

### MCQ Answer Object
```javascript
{
  questionIndex: Number,    // 0-based index of question
  selectedAnswer: Number,   // 0-based index of selected option
  timeSpent: Number,        // Time in seconds
  isCorrect: Boolean        // Calculated on submission
}
```

### Coding Answer Object
```javascript
{
  problemIndex: Number,     // 0-based index of problem
  code: String,             // Submitted code
  language: String,         // Default: "javascript"
  timeSpent: Number,        // Time in seconds
  score: Number             // Marks awarded (0-max)
}
```

### Test Object
```javascript
{
  _id: String,
  title: String,
  company: String,
  type: "MCQ" | "Coding",
  description: String,
  duration: Number,         // in minutes
  totalQuestions: Number,
  difficulty: String,
  deadline: Date,
  passingScore: Number,     // percentage
  questions: Array,         // MCQ only
  codingProblems: Array,    // Coding only
  proctoringEnabled: Boolean,
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

---

## Frontend Service Usage

All endpoints are wrapped in `testService.ts` for easy use:

```typescript
import * as testService from '@/services/testService';

// Get all tests
const tests = await testService.getAllTests();

// Start a test
const attempt = await testService.startTest(testId);

// Save answer
await testService.saveAnswer(attemptId, 'mcq', 0, 2, 45);

// Submit test
const result = await testService.submitTest(attemptId);

// Get results
const results = await testService.getTestResults();

// Get detailed result
const detail = await testService.getAttemptResult(attemptId);
```

---

## Example Complete Flow

```bash
# 1. Get all tests
curl -X GET http://localhost:3000/api/tests \
  -H "Authorization: Bearer <token>"

# 2. Start a test
curl -X POST http://localhost:3000/api/tests/507f1f77bcf86cd799439011/start \
  -H "Authorization: Bearer <token>"

# Response includes attemptId: 507f1f77bcf86cd799439012

# 3. Save answers (repeat for each question)
curl -X POST http://localhost:3000/api/tests/507f1f77bcf86cd799439012/save-answer \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "mcq",
    "questionIndex": 0,
    "answer": 2,
    "timeSpent": 30
  }'

# 4. Submit test
curl -X POST http://localhost:3000/api/tests/507f1f77bcf86cd799439012/submit \
  -H "Authorization: Bearer <token>"

# 5. Get result
curl -X GET http://localhost:3000/api/tests/attempt/507f1f77bcf86cd799439012/result \
  -H "Authorization: Bearer <token>"
```

---

**API Version**: 1.0  
**Last Updated**: March 10, 2026
