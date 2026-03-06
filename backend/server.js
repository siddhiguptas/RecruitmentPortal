const express = require('express');
const { triggerNotification } = require('./controllers/notificationController');
const atsController = require('./controllers/atsController');
require('dotenv').config();

const app = express();

app.use(express.json()); 

// Notification route
app.post('/api/notify', triggerNotification);

// ATS routes
app.post("/api/apply-job", atsController.applyJob);
app.get("/api/ats-pipeline", atsController.getPipeline);
app.put("/api/update-status/:id", atsController.updateStatus);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Backend server is running on port ${PORT}`);
    console.log(`Notification Module ready at http://localhost:${PORT}/api/notify`);
    console.log(`ATS Module ready`);
});
