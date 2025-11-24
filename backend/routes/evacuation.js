const express = require('express');
const router = express.Router();
const db = require('../db/connection');

// Get all evacuation routes
router.get('/routes', async (req, res) => {
  try {
    // Check if EvacuationRoutes table exists, if not return mock data
    const [routes] = await db.query(`
      SELECT * FROM EvacuationRoutes 
      WHERE Status != 'Blocked' 
      ORDER BY RouteName
    `).catch(() => {
      // If table doesn't exist, return mock data
      return [[
        {
          RouteID: 1,
          RouteName: 'Highway 1 - North Route',
          StartPoint: 'Bangkok City Center',
          EndPoint: 'Ayutthaya Shelter',
          Status: 'Clear',
          EstimatedTime: 45,
          Distance: 85,
          CurrentLoad: 35
        },
        {
          RouteID: 2,
          RouteName: 'Coastal Road - East',
          StartPoint: 'Pattaya',
          EndPoint: 'Rayong Emergency Center',
          Status: 'Moderate',
          EstimatedTime: 60,
          Distance: 95,
          CurrentLoad: 65
        },
        {
          RouteID: 3,
          RouteName: 'Mountain Pass - West',
          StartPoint: 'Kanchanaburi',
          EndPoint: 'Ratchaburi Shelter',
          Status: 'Clear',
          EstimatedTime: 90,
          Distance: 120,
          CurrentLoad: 25
        },
        {
          RouteID: 4,
          RouteName: 'Southern Highway',
          StartPoint: 'Phuket',
          EndPoint: 'Krabi Safe Zone',
          Status: 'Congested',
          EstimatedTime: 120,
          Distance: 165,
          CurrentLoad: 85
        }
      ]];
    });
    
    res.json(routes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Plan evacuation route
router.post('/plan', async (req, res) => {
  try {
    const { startLocation, disasterType, urgencyLevel } = req.body;
    
    // Mock route planning (in production, use real routing API like Google Maps)
    const plannedRoute = {
      startLocation,
      destination: 'Nearest Emergency Shelter',
      distance: Math.floor(Math.random() * 50) + 10, // 10-60 km
      estimatedTime: Math.floor(Math.random() * 60) + 15, // 15-75 min
      trafficStatus: ['Clear', 'Moderate', 'Congested'][Math.floor(Math.random() * 3)],
      urgencyLevel,
      disasterType,
      steps: [
        {
          instruction: 'Head north on Main Street',
          distance: 2.5,
          duration: 5
        },
        {
          instruction: 'Turn right onto Highway 1',
          distance: 15.3,
          duration: 18
        },
        {
          instruction: 'Continue straight for 10 km',
          distance: 10.0,
          duration: 12
        },
        {
          instruction: 'Exit at Junction 5',
          distance: 1.2,
          duration: 3
        },
        {
          instruction: 'Arrive at Emergency Shelter on the right',
          distance: 0.5,
          duration: 2
        }
      ]
    };

    res.json(plannedRoute);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
