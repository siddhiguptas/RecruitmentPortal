const express = require('express');
const { triggerNotification } = require('./controllers/notificationController');
require('dotenv').config();

const app = express();

app.use(express.json()); 

app.post('/api/notify', triggerNotification);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Backend server is running on port ${PORT}`);
    console.log(`Notification Module ready at http://localhost:${PORT}/api/notify`);
});