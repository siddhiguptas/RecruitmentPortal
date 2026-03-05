const NotificationService = require('./services/notificationService');

console.log("Attempting to send test email...");

NotificationService.sendInstantUpdate(
    "harkeshyadav20005@gmail.com",
    "Test from Recruitment Portal",
    "Woohoo! The automated communication module is working perfectly!"
).then(() => console.log("Test finished executing."));