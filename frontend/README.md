# Frontend Application

This is the React + Vite application for the Recruitment Portal.

## Structure
- `src/`:
  - `components/`: Reusable UI components.
  - `pages/`: Page components (Student, Recruiter, Admin).
  - `services/`: API and Socket.io services.
  - `types/`: TypeScript type definitions.
  - `utils/`: Utility functions.
  - `constants/`: Global constants.
  - `main.tsx`: Entry point.
  - `App.tsx`: Main application component.
  - `index.css`: Global styles.

## Communication
The frontend communicates with the backend API using `VITE_API_URL` (for example `http://localhost:3000/api`).
Socket.io client uses `VITE_SOCKET_URL` (for example `http://localhost:3000`).
Run frontend on port `5173` and backend on port `3000` as separate services.
