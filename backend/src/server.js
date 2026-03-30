const app = require('./app');

app.get('/', (req, res) => {
    res.send('BlueBridge Backend is running!');
});

// For local development
if (require.main === module) {
    process.on('unhandledRejection', (reason, promise) => {
        console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    });

    process.on('uncaughtException', (err) => {
        console.error('Uncaught Exception:', err);
    });

    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
        // Keep process alive if event loop drains (some Windows envs)
        setInterval(() => { }, 10000);
    });
}

module.exports = app;
