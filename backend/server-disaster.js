const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();

// Middleware - CORS Configuration
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'https://thailand-dems.vercel.app',
  'https://*.vercel.app',
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    // Check if origin is allowed
    if (allowedOrigins.some(allowed => {
      if (allowed.includes('*')) {
        const regex = new RegExp(allowed.replace('*', '.*'));
        return regex.test(origin);
      }
      return allowed === origin;
    })) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Test database connection
const db = require('./db/connection');
db.query('SELECT 1')
  .then(() => console.log('✅ Database connected successfully'))
  .catch(err => console.error('❌ Database connection failed:', err.message));

// Import routes
const dashboardRoutes = require('./routes/dashboard-disaster');
const disasterRoutes = require('./routes/disasters');
const shelterRoutes = require('./routes/shelters');
const supplyRoutes = require('./routes/supplies');
const volunteerRoutes = require('./routes/volunteers');
const volunteerAuthRoutes = require('./routes/volunteerAuth');
const weatherRoutes = require('./routes/weather');
const evacuationRoutes = require('./routes/evacuation');
const userReportRoutes = require('./routes/userReports');
const alertRoutes = require('./routes/alerts');
const locationRoutes = require('./routes/locations');

// ===== ENHANCED SYSTEM ROUTES =====
const agencyRoutes = require('./routes/agencies');
const resourceIntelligenceRoutes = require('./routes/resourceIntelligence');
const enhancedVolunteerRoutes = require('./routes/enhancedVolunteers');
const partnerFacilitiesRoutes = require('./routes/partnerFacilities');
const tierRoutes = require('./routes/tiers');

// API routes
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/disasters', disasterRoutes);
app.use('/api/shelters', shelterRoutes);
app.use('/api/supplies', supplyRoutes);
app.use('/api/volunteers', volunteerRoutes);
app.use('/api/volunteer-auth', volunteerAuthRoutes);
app.use('/api/weather', weatherRoutes);
app.use('/api/evacuation', evacuationRoutes);
app.use('/api/reports', userReportRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/locations', locationRoutes);

// ===== ENHANCED SYSTEM ROUTES =====
app.use('/api/agencies', agencyRoutes);
app.use('/api/resource-intelligence', resourceIntelligenceRoutes);
app.use('/api/volunteers-enhanced', enhancedVolunteerRoutes);
app.use('/api/partner-facilities', partnerFacilitiesRoutes);
app.use('/api/tiers', tierRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'Disaster and Emergency Management System API',
    version: '2.0',
    endpoints: [
      '/api/dashboard',
      '/api/disasters',
      '/api/shelters',
      '/api/supplies',
      '/api/volunteers',
      '/api/weather/:city',
      '/api/evacuation/routes',
      '/api/evacuation/plan'
    ]
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
});
