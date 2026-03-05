const NotificationService = require('../services/notificationService');

const triggerNotification = async (req, res) => {
    const { email, subject, message } = req.body;

    if (!email || !subject || !message) {
        return res.status(400).json({ error: "Missing required fields: email, subject, or message" });
    }

    try {
        await NotificationService.sendInstantUpdate(email, subject, message);
        res.status(200).json({ success: true, message: "Communication triggered successfully!" });
    } catch (error) {
        res.status(500).json({ success: false, error: "Failed to send communication." });
    }
};

module.exports = { triggerNotification };