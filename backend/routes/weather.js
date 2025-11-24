const express = require('express');
const router = express.Router();

// Mock weather data (in production, integrate with real API like OpenWeatherMap)
router.get('/:city', async (req, res) => {
  try {
    const { city } = req.params;
    
    // Simulated weather data
    const weatherData = {
      current: {
        temperature: Math.floor(Math.random() * 15) + 25, // 25-40°C
        feelsLike: Math.floor(Math.random() * 15) + 26,
        condition: ['Sunny', 'Cloudy', 'Rainy', 'Thunderstorm', 'Partly Cloudy'][Math.floor(Math.random() * 5)],
        icon: ['☀️', '⛅', '🌧️', '⛈️', '🌤️'][Math.floor(Math.random() * 5)],
        humidity: Math.floor(Math.random() * 40) + 50, // 50-90%
        windSpeed: Math.floor(Math.random() * 50) + 10, // 10-60 km/h
        cloudCover: Math.floor(Math.random() * 100),
        visibility: Math.floor(Math.random() * 10) + 5 // 5-15 km
      },
      forecast: [
        {
          date: 'Today',
          icon: '☀️',
          high: 35,
          low: 27,
          condition: 'Sunny',
          rainChance: 10
        },
        {
          date: 'Tomorrow',
          icon: '⛅',
          high: 34,
          low: 26,
          condition: 'Partly Cloudy',
          rainChance: 20
        },
        {
          date: 'Mon',
          icon: '🌧️',
          high: 32,
          low: 25,
          condition: 'Rainy',
          rainChance: 70
        },
        {
          date: 'Tue',
          icon: '⛈️',
          high: 31,
          low: 24,
          condition: 'Thunderstorm',
          rainChance: 85
        },
        {
          date: 'Wed',
          icon: '🌤️',
          high: 33,
          low: 26,
          condition: 'Partly Cloudy',
          rainChance: 30
        }
      ],
      alerts: []
    };

    // Add weather alerts based on conditions
    if (weatherData.current.temperature > 38) {
      weatherData.alerts.push({
        event: 'Extreme Heat Warning',
        severity: 'Extreme',
        description: 'Dangerous heat conditions expected. Stay hydrated and avoid outdoor activities.'
      });
    }

    if (weatherData.current.windSpeed > 60) {
      weatherData.alerts.push({
        event: 'High Wind Warning',
        severity: 'Severe',
        description: 'Strong winds may cause damage. Secure loose objects and avoid travel.'
      });
    }

    if (weatherData.current.condition === 'Thunderstorm') {
      weatherData.alerts.push({
        event: 'Thunderstorm Alert',
        severity: 'Moderate',
        description: 'Thunderstorms expected in the area. Seek shelter and avoid open spaces.'
      });
    }

    res.json(weatherData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
