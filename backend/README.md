# Backend Service

This is the main API server for the Recruitment Portal.
Runs on `http://localhost:3000` by default.

## Structure
- `server.ts`: Entry point. Starts the Express server and the ML microservice.
- `server/`:
  - `controllers/`: Request handlers.
  - `routes/`: API route definitions.
  - `models/`: Mongoose models.
  - `middleware/`: Auth and other middleware.
  - `services/`: Business logic and microservice proxies.
  - `config/`: Configuration (DB, etc).
  - `utils/`: Utility functions and mock database.

## Microservice Integration
The backend communicates with the ML microservice via HTTP calls to `ML_SERVICE_URL`.
In development, the ML service is started as a child process on port 8000.

## Frontend Integration
Frontend is a separate service (typically `http://localhost:5173`).
Configure CORS with `FRONTEND_ORIGIN` in backend `.env`.
