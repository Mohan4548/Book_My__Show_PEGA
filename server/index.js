const express = require('express');
const cors = require('cors');
const cron = require('node-cron');
const fs = require('fs');
const path = require('path');

const db = require('./db/database');
const { calculateSlaStatus } = require('./services/slaService');

const moviesRoutes = require('./routes/movies');
const showsRoutes = require('./routes/shows');
const bookingsRoutes = require('./routes/bookings');
const statsRoutes = require('./routes/stats');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/movies', moviesRoutes);
app.use('/api/shows', showsRoutes);
app.use('/api/bookings', bookingsRoutes);
app.use('/api/stats', statsRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    appName: 'Movexa ⭐ Pega Case Management Engine',
    timestamp: new Date().toISOString(),
  });
});

// Serve built React static frontend from client/dist
const clientDistPath = path.join(__dirname, '../client/dist');
if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
} else {
  app.get('/', (req, res) => {
    res.send(`
      <! baseline html>
      <html>
        <head>
          <title>Movexa ⭐ Case Engine</title>
        </head>
        <body style="font-family: system-ui, -apple-system, sans-serif; background: #0f172a; color: #f8fafc; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0;">
          <div style="text-align: center; background: #1e293b; padding: 40px; border-radius: 24px; border: 1px solid #334155; max-width: 500px; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);">
            <h1 style="color: #38bdf8; margin-top: 0;">Movexa ⭐ Backend Engine</h1>
            <p style="color: #94a3b8; font-size: 14px;">Express REST API is online on Port 5000.</p>
            <div style="margin: 24px 0; padding: 16px; background: #0f172a; border-radius: 16px; border: 1px solid #38bdf8;">
              <p style="margin: 0; font-size: 13px; color: #cbd5e1;">Open the Interactive Web App at:</p>
              <a href="http://localhost:5173" style="display: inline-block; margin-top: 8px; font-weight: bold; color: #0f172a; background: #38bdf8; padding: 10px 20px; text-decoration: none; border-radius: 12px;">http://localhost:5173</a>
            </div>
          </div>
        </body>
      </html>
    `);
  });
}

// Scheduled SLA Monitoring Cron Job (Runs every 5 minutes to audit SLA thresholds)
cron.schedule('*/5 * * * *', () => {
  try {
    const bookings = db.getBookings();
    const unresolved = bookings.filter((b) => b.status === 'Approval' || b.status === 'Availability Check');

    let goalMissedCount = 0;
    let deadlineMissedCount = 0;

    unresolved.forEach((b) => {
      const sla = calculateSlaStatus(b, false);
      if (sla.code === 'GOAL_MISSED') goalMissedCount++;
      if (sla.code === 'DEADLINE_MISSED') deadlineMissedCount++;
    });

    if (goalMissedCount > 0 || deadlineMissedCount > 0) {
      console.log(`⏱️ [SLA MONITOR CRON] Active SLA Audit: ${unresolved.length} pending case(s). Goal Missed: ${goalMissedCount}, Deadline Missed: ${deadlineMissedCount}`);
    }
  } catch (err) {
    console.error('Error running SLA cron check:', err.message);
  }
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('⚠️ Unhandled Promise Rejection detected:', reason);
});

process.on('uncaughtException', (err) => {
  console.error('⚠️ Uncaught Exception detected:', err.message);
});

// Start Server
const server = app.listen(PORT, () => {
  console.log(`🚀 Movexa ⭐ Server running on http://localhost:${PORT}`);
  console.log(`📋 Pega Case Engine Active | Movies, Shows, Booking REST APIs ready.`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`❌ Port ${PORT} is already in use. Please terminate the process using port ${PORT} or check running background tasks.`);
    process.exit(1);
  } else {
    console.error('❌ Server error:', err.message);
  }
});
