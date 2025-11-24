'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import LeafletFix from '@/components/LeafletFix';

// Dynamically import map to avoid SSR issues
const MapContainer = dynamic(
  () => import('react-leaflet').then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import('react-leaflet').then((mod) => mod.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import('react-leaflet').then((mod) => mod.Marker),
  { ssr: false }
);
const Popup = dynamic(
  () => import('react-leaflet').then((mod) => mod.Popup),
  { ssr: false }
);
const Polyline = dynamic(
  () => import('react-leaflet').then((mod) => mod.Polyline),
  { ssr: false }
);

export default function Evacuation() {
  const [routes, setRoutes] = useState([]);
  const [shelters, setShelters] = useState([]);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [destination, setDestination] = useState(null);
  const [routePath, setRoutePath] = useState([]);
  const [formData, setFormData] = useState({
    startLocation: '',
    startLat: '',
    startLng: ''
  });

  useEffect(() => {
    fetchData();
    // Get user's current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setCurrentLocation({ lat: latitude, lng: longitude });
          setFormData(prev => ({
            ...prev,
            startLat: latitude.toString(),
            startLng: longitude.toString(),
            startLocation: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`
          }));
        },
        (error) => {
          console.log('Location error:', error);
          // Default to Bangkok center
          setCurrentLocation({ lat: 13.7563, lng: 100.5018 });
        }
      );
    } else {
      // Default to Bangkok center
      setCurrentLocation({ lat: 13.7563, lng: 100.5018 });
    }
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [routesRes, sheltersRes] = await Promise.all([
        fetch('http://localhost:5000/api/evacuation/routes'),
        fetch('http://localhost:5000/api/shelters')
      ]);
      const routesData = await routesRes.json();
      const sheltersData = await sheltersRes.json();
      setRoutes(routesData);
      setShelters(sheltersData.filter(s => s.Status === 'Available'));
    } catch (error) {
      console.error('Error fetching data:', error);
    }
    setLoading(false);
  };

  // Calculate distance between two points using Haversine formula
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  // Sort shelters by distance from current location
  const getSortedShelters = () => {
    if (!currentLocation) return shelters;
    
    return [...shelters].sort((a, b) => {
      const distA = calculateDistance(
        currentLocation.lat, 
        currentLocation.lng,
        parseFloat(a.Latitude),
        parseFloat(a.Longitude)
      );
      const distB = calculateDistance(
        currentLocation.lat,
        currentLocation.lng,
        parseFloat(b.Latitude),
        parseFloat(b.Longitude)
      );
      return distA - distB;
    });
  };

  const handlePlanRoute = async (e) => {
    e.preventDefault();
    if (!currentLocation || !destination) {
      alert('Please select both start location and destination shelter');
      return;
    }
    
    setLoading(true);
    try {
      // Use OSRM (Open Source Routing Machine) for real routing
      const response = await fetch(
        `https://router.project-osrm.org/route/v1/driving/${currentLocation.lng},${currentLocation.lat};${destination.lng},${destination.lat}?overview=full&geometries=geojson&steps=true`
      );
      const data = await response.json();
      
      if (data.routes && data.routes.length > 0) {
        const route = data.routes[0];
        
        // Convert route geometry to Leaflet format
        const coordinates = route.geometry.coordinates.map(coord => [coord[1], coord[0]]);
        setRoutePath(coordinates);
        
        // Format the route data
        const formattedRoute = {
          distance: (route.distance / 1000).toFixed(2), // Convert to km
          estimatedTime: Math.round(route.duration / 60), // Convert to minutes
          trafficStatus: 'Clear',
          steps: route.legs[0].steps.map((step, idx) => ({
            instruction: step.maneuver.type === 'depart' 
              ? `Head ${step.maneuver.modifier || 'straight'} on ${step.name || 'road'}`
              : step.maneuver.type === 'arrive'
              ? `Arrive at ${destination.name}`
              : `${step.maneuver.type.replace('-', ' ')} ${step.maneuver.modifier ? step.maneuver.modifier : ''} onto ${step.name || 'road'}`,
            distance: (step.distance / 1000).toFixed(2),
            duration: Math.round(step.duration / 60)
          }))
        };
        
        setSelectedRoute(formattedRoute);
      }
    } catch (error) {
      console.error('Error planning route:', error);
      alert('Unable to calculate route. Please try again.');
    }
    setLoading(false);
  };

  const handleGetCurrentLocation = () => {
    if (navigator.geolocation) {
      setLoading(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setCurrentLocation({ lat: latitude, lng: longitude });
          setFormData(prev => ({
            ...prev,
            startLat: latitude.toString(),
            startLng: longitude.toString(),
            startLocation: `Current Location (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`
          }));
          setLoading(false);
        },
        (error) => {
          console.error('Error getting location:', error);
          alert('Unable to get your location. Please enable location services.');
          setLoading(false);
        }
      );
    } else {
      alert('Geolocation is not supported by your browser');
    }
  };

  const handleSelectShelter = (shelter) => {
    if (shelter.Latitude && shelter.Longitude) {
      setDestination({
        lat: parseFloat(shelter.Latitude),
        lng: parseFloat(shelter.Longitude),
        name: shelter.ShelterName
      });
    }
  };

  const getUrgencyColor = (level) => {
    switch (level) {
      case 'Critical': return 'bg-red-500';
      case 'High': return 'bg-orange-500';
      case 'Medium': return 'bg-yellow-500';
      default: return 'bg-green-500';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Clear': return 'text-green-500';
      case 'Moderate': return 'text-yellow-500';
      case 'Congested': return 'text-orange-500';
      case 'Blocked': return 'text-red-500';
      default: return 'text-slate-400';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-6">
      <LeafletFix />
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">
              🚗 Evacuation Route Planning
            </h1>
            <p className="text-slate-300 text-lg">Find the safest and fastest route to safety</p>
          </div>
          <Link href="/" className="px-6 py-3 bg-white/10 hover:bg-white/20 border-2 border-white/30 hover:border-white/50 rounded-xl font-semibold text-white transition-all duration-200 hover:scale-105 flex items-center gap-2">
            <span>←</span> Back to Dashboard
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Route Planning Form */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-slate-800/50 border border-slate-600 rounded-xl p-6">
              <h3 className="text-xl font-bold mb-4 text-white">Plan Your Route</h3>
              <form onSubmit={handlePlanRoute} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-slate-200">Starting Location</label>
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={formData.startLocation}
                      onChange={(e) => setFormData({...formData, startLocation: e.target.value})}
                      placeholder="Enter location or use current"
                      className="w-full bg-slate-700 text-white px-4 py-2 rounded-lg border border-slate-600 focus:border-orange-500 focus:outline-none"
                      required
                    />
                    <button
                      type="button"
                      onClick={handleGetCurrentLocation}
                      className="w-full bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-sm transition-colors"
                    >
                      📍 Use My Current Location
                    </button>
                  </div>
                  {currentLocation && (
                    <p className="text-xs text-green-400 mt-1">
                      ✓ Location set: {currentLocation.lat.toFixed(4)}, {currentLocation.lng.toFixed(4)}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-slate-200">Destination Shelter</label>
                  {destination ? (
                    <div className="bg-green-900/30 border border-green-500 rounded-lg p-3">
                      <p className="font-medium text-green-400">✓ {destination.name}</p>
                      <p className="text-xs text-slate-400 mt-1">
                        {destination.lat.toFixed(4)}, {destination.lng.toFixed(4)}
                      </p>
                      <button
                        type="button"
                        onClick={() => setDestination(null)}
                        className="text-xs text-red-400 hover:underline mt-1"
                      >
                        Clear selection
                      </button>
                    </div>
                  ) : (
                    <p className="text-sm text-yellow-400">
                      ⚠️ Select a shelter from the list below
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading || !currentLocation || !destination}
                  className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-slate-600 disabled:cursor-not-allowed px-6 py-3 rounded-lg font-semibold transition-colors"
                >
                  {loading ? 'Calculating Route...' : '🗺️ Calculate Route'}
                </button>
              </form>

              {/* Route Summary - Compact */}
              {selectedRoute && (
                <div className="mt-4">
                  <div className="grid grid-cols-3 gap-2 mb-3">
                    <div className="bg-slate-700/50 rounded-lg p-3 text-center">
                      <p className="text-lg font-bold text-orange-400">{selectedRoute.distance} km</p>
                      <p className="text-xs text-slate-300">Distance</p>
                    </div>
                    <div className="bg-slate-700/50 rounded-lg p-3 text-center">
                      <p className="text-lg font-bold text-blue-400">{selectedRoute.estimatedTime} min</p>
                      <p className="text-xs text-slate-300">Time</p>
                    </div>
                    <div className="bg-slate-700/50 rounded-lg p-3 text-center">
                      <p className={`text-lg font-bold ${getStatusColor(selectedRoute.trafficStatus)}`}>
                        {selectedRoute.trafficStatus}
                      </p>
                      <p className="text-xs text-slate-300">Traffic</p>
                    </div>
                  </div>

                  {/* Scrollable Directions */}
                  <div className="bg-slate-700/30 rounded-lg p-3">
                    <h4 className="font-semibold text-white text-sm mb-2 flex items-center justify-between">
                      <span>🧭 Turn-by-turn Directions</span>
                      <span className="text-xs text-slate-400">{selectedRoute.steps?.length} steps</span>
                    </h4>
                    <div className="space-y-2 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
                      {selectedRoute.steps?.map((step, idx) => (
                        <div key={idx} className="flex gap-2 items-start bg-slate-800/50 rounded-lg p-2.5 hover:bg-slate-700/50 transition-colors">
                          <div className="bg-orange-500 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold flex-shrink-0">
                            {idx + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-white text-sm leading-tight">{step.instruction}</p>
                            <p className="text-xs text-slate-400 mt-0.5">{step.distance} km • {step.duration} min</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Nearest Shelters */}
              <div className="mt-6">
                <h4 className="font-semibold mb-3 text-white">Available Shelters (Closest to Farthest)</h4>
                <div className="space-y-2 max-h-64 overflow-y-auto custom-scrollbar">
                  {getSortedShelters().slice(0, 10).map(shelter => {
                    const distance = currentLocation ? calculateDistance(
                      currentLocation.lat,
                      currentLocation.lng,
                      parseFloat(shelter.Latitude),
                      parseFloat(shelter.Longitude)
                    ) : null;
                    
                    return (
                      <div 
                        key={shelter.ShelterID} 
                        onClick={() => handleSelectShelter(shelter)}
                        className={`cursor-pointer rounded-lg p-3 transition-all ${
                          destination?.name === shelter.ShelterName
                            ? 'bg-green-700/50 border-2 border-green-500'
                            : 'bg-slate-700/50 hover:bg-slate-700 border-2 border-transparent'
                        }`}
                      >
                        <p className="font-medium text-white">{shelter.ShelterName}</p>
                        <p className="text-xs text-slate-300">{shelter.City}</p>
                        <div className="flex justify-between mt-1 text-xs">
                          <span className="text-green-500">
                            Available: {shelter.Capacity - shelter.CurrentOccupancy} / {shelter.Capacity}
                          </span>
                          {distance && (
                            <span className="text-blue-400">
                              📏 {distance.toFixed(1)} km away
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Route Results & Map */}
          <div className="lg:col-span-2 space-y-6">
            {/* Interactive Map */}
            <div className="bg-slate-800/50 border border-slate-600 rounded-xl p-6">
              <h3 className="text-2xl font-bold mb-4 text-white">Route Map</h3>
              <div style={{ height: '500px', borderRadius: '8px', overflow: 'hidden' }}>
                {currentLocation && typeof window !== 'undefined' && (
                  <MapContainer
                    center={[currentLocation.lat, currentLocation.lng]}
                    zoom={13}
                    style={{ height: '100%', width: '100%' }}
                  >
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    
                    {/* Start location marker */}
                    {currentLocation && (
                      <Marker position={[currentLocation.lat, currentLocation.lng]}>
                        <Popup>
                          <strong>Your Location</strong>
                          <br />
                          Starting Point
                        </Popup>
                      </Marker>
                    )}
                    
                    {/* Destination marker */}
                    {destination && (
                      <Marker position={[destination.lat, destination.lng]}>
                        <Popup>
                          <strong>{destination.name}</strong>
                          <br />
                          Evacuation Shelter
                        </Popup>
                      </Marker>
                    )}
                    
                    {/* Route line */}
                    {routePath.length > 0 && (
                      <Polyline
                        positions={routePath}
                        color="orange"
                        weight={4}
                        opacity={0.8}
                      />
                    )}
                    
                    {/* All shelters */}
                    {shelters.map(shelter => (
                      shelter.Latitude && shelter.Longitude && (
                        <Marker
                          key={shelter.ShelterID}
                          position={[parseFloat(shelter.Latitude), parseFloat(shelter.Longitude)]}
                        >
                          <Popup>
                            <strong>{shelter.ShelterName}</strong>
                            <br />
                            {shelter.City}
                            <br />
                            Available: {shelter.Capacity - shelter.CurrentOccupancy}
                          </Popup>
                        </Marker>
                      )
                    ))}
                  </MapContainer>
                )}
              </div>
            </div>

            {selectedRoute && (
              <div className="bg-slate-800/50 border border-slate-600 rounded-xl p-6">
                <h3 className="text-2xl font-bold mb-4 text-white">Route Overview</h3>
                <p className="text-slate-300 mb-4">
                  View detailed turn-by-turn directions in the left panel below the route calculator.
                </p>
              </div>
            )}

            {/* All Evacuation Routes */}
            <div className="bg-slate-800/50 border border-slate-600 rounded-xl p-6">
              <h3 className="text-xl font-bold mb-4 text-white">All Evacuation Routes</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-600">
                      <th className="text-left p-3 text-slate-200">Route Name</th>
                      <th className="text-left p-3 text-slate-200">From</th>
                      <th className="text-left p-3 text-slate-200">To</th>
                      <th className="text-left p-3 text-slate-200">Status</th>
                      <th className="text-left p-3 text-slate-200">Capacity</th>
                      <th className="text-left p-3 text-slate-200">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {routes.map(route => (
                      <tr key={route.RouteID} className="border-b border-slate-700 hover:bg-slate-700/30">
                        <td className="p-3 font-medium text-white">{route.RouteName}</td>
                        <td className="p-3 text-slate-300">{route.StartPoint}</td>
                        <td className="p-3 text-slate-300">{route.EndPoint}</td>
                        <td className="p-3">
                          <span className={`${getStatusColor(route.Status)} font-semibold`}>
                            {route.Status}
                          </span>
                        </td>
                        <td className="p-3">
                          <div className="w-full bg-slate-700 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full ${route.CurrentLoad > 80 ? 'bg-red-500' : route.CurrentLoad > 50 ? 'bg-yellow-500' : 'bg-green-500'}`}
                              style={{width: `${route.CurrentLoad}%`}}
                            ></div>
                          </div>
                          <p className="text-xs text-slate-400 mt-1">{route.CurrentLoad}% loaded</p>
                        </td>
                        <td className="p-3">
                          <a
                            href={`https://www.google.com/maps/dir/${route.StartPoint}/${route.EndPoint}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-orange-400 hover:underline text-sm"
                          >
                            🗺️ View
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
