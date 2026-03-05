require('dotenv').config();
const nodemailer = require('nodemailer');
const twilio = require('twilio');
const cron = require('node-cron');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS 
    }
});

const NotificationService = {
    sendInstantUpdate: async (email, subject, message) => {
        try {
            await transporter.sendMail({
                from: process.env.EMAIL_USER,
                to: email,
                subject: subject,
                text: message
            });
            console.log(`Update email sent to ${email}`);
        } catch (error) {
            console.error("Email Error:", error);
        }
    },

    scheduleReminder: (cronTime, email, message) => {
        cron.schedule(cronTime, () => {
            console.log("Running scheduled reminder task...");
            NotificationService.sendInstantUpdate(email, "Interview Reminder", message);
        });
    }
};

module.exports = NotificationService;