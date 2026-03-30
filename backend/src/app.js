const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();
require('../config/firebase');

const app = express();

app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE']
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Serve static files from root directory
app.use(express.static(path.join(__dirname, '../../')));

app.get("/", (req, res) => {
    res.json({ message: "BlueBridge Backend is running!", status: "online" });
});

app.get("/api", (req, res) => {
    res.json({ message: "BlueBridge API is running!", status: "safe", path: "api" });
});

// Routes
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/users', require('./routes/users.routes'));
app.use('/api/workers', require('./routes/workers.routes'));
app.use('/api/bookings', require('./routes/bookings.routes'));
app.use('/api/reviews', require('./routes/reviews.routes'));
app.use('/api/transactions', require('./routes/transactions.routes'));
app.use('/api/notifications', require('./routes/notifications.routes'));
app.use('/api/support', require('./routes/support.routes'));
// Remove referrals route as per request
// app.use('/api/referrals', require('./routes/referrals.routes'));
app.use('/api/metadata', require('./routes/metadata.routes'));
app.use('/api/favorites', require('./routes/favorites.routes'));
app.use('/api/jobs', require('./routes/jobs.routes'));
app.use('/api/chat', require('./routes/chat.routes'));
app.use('/api/location', require('./routes/location.routes'));
app.use('/api/payments', require('./routes/payments.routes'));
app.use('/api/verification', require('./routes/verification.routes'));

// Error handling middleware (must be last)
app.use(require('./middlewares/error.middleware'));

module.exports = app;
