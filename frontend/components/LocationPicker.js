'use client';
import { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in Next.js
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

function MapClickHandler({ onLocationSelect }) {
  useMapEvents({
    click: async (e) => {
      const { lat, lng } = e.latlng;
      
      // Reverse geocode to get location name
      try {
        const response = await fetch(
          `http://localhost:5000/api/locations/reverse?lat=${lat}&lng=${lng}&radius=10`
        );
        const locations = await response.json();
        
        if (locations && locations.length > 0) {
          const nearest = locations[0];
          onLocationSelect({
            name: nearest.LocationName,
            province: nearest.Province,
            region: nearest.Region,
            latitude: lat,
            longitude: lng,
            address: nearest.Address,
            distance: nearest.distance
          });
        } else {
          onLocationSelect({
            name: 'Custom Location',
            province: '',
            region: '',
            latitude: lat,
            longitude: lng,
            address: `Lat: ${lat.toFixed(6)}, Lng: ${lng.toFixed(6)}`
          });
        }
      } catch (error) {
        console.error('Reverse geocoding error:', error);
        onLocationSelect({
          name: 'Custom Location',
          latitude: lat,
          longitude: lng,
          address: `Lat: ${lat.toFixed(6)}, Lng: ${lng.toFixed(6)}`
        });
      }
    }
  });
  return null;
}

export default function LocationPicker({ 
  onLocationSelect, 
  initialLocation = null,
  className = '' 
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(initialLocation);
  const [mapMode, setMapMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const searchTimeout = useRef(null);
  const suggestionsRef = useRef(null);

  // Default center: Bangkok
  const defaultCenter = [13.7563, 100.5018];
  const mapCenter = selectedLocation 
    ? [selectedLocation.latitude, selectedLocation.longitude]
    : defaultCenter;

  useEffect(() => {
    // Close suggestions when clicking outside
    function handleClickOutside(event) {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (searchQuery.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    // Debounce search
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }

    searchTimeout.current = setTimeout(async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `http://localhost:5000/api/locations/search?query=${encodeURIComponent(searchQuery)}&limit=15`
        );
        const data = await response.json();
        setSuggestions(data);
        setShowSuggestions(true);
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setLoading(false);
      }
    }, 300);
  }, [searchQuery]);

  const handleSelectSuggestion = (location) => {
    const selected = {
      name: location.LocationName,
      province: location.Province,
      region: location.Region,
      latitude: parseFloat(location.Latitude),
      longitude: parseFloat(location.Longitude),
      address: location.Address,
      type: location.LocationType
    };
    
    setSelectedLocation(selected);
    setSearchQuery(location.LocationName);
    setShowSuggestions(false);
    onLocationSelect(selected);
  };

  const handleMapSelect = (location) => {
    setSelectedLocation(location);
    onLocationSelect(location);
    setMapMode(false);
  };

  const clearSelection = () => {
    setSelectedLocation(null);
    setSearchQuery('');
    onLocationSelect(null);
  };

  const getLocationTypeIcon = (type) => {
    const icons = {
      'Province': '🏛️',
      'District': '🏘️',
      'City': '🌆',
      'University': '🎓',
      'Landmark': '📍',
      'Airport': '✈️',
      'Hospital': '🏥',
      'Government': '🏛️'
    };
    return icons[type] || '📍';
  };

  return (
    <div className={`relative ${className}`}>
      {/* Search Input */}
      <div className="relative" ref={suggestionsRef}>
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
            placeholder="Search: Rangsit University, Bangkok, Chiang Mai..."
            className="w-full px-4 py-3 pr-24 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-2">
            {selectedLocation && (
              <button
                type="button"
                onClick={clearSelection}
                className="px-3 py-1 bg-red-500/80 hover:bg-red-600 text-white rounded text-sm transition-all"
              >
                Clear
              </button>
            )}
            <button
              type="button"
              onClick={() => setMapMode(!mapMode)}
              className="px-3 py-1 bg-blue-500/80 hover:bg-blue-600 text-white rounded text-sm transition-all"
              title="Pick location on map"
            >
              🗺️
            </button>
          </div>
        </div>

        {/* Autocomplete Suggestions */}
        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute z-50 w-full mt-2 bg-gray-800 border border-gray-700 rounded-lg shadow-2xl max-h-96 overflow-y-auto">
            {loading && (
              <div className="p-4 text-center text-gray-400">
                <div className="w-6 h-6 border-2 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
              </div>
            )}
            {suggestions.map((location) => (
              <button
                key={location.LocationID}
                type="button"
                onClick={() => handleSelectSuggestion(location)}
                className="w-full px-4 py-3 text-left hover:bg-gray-700 transition-colors border-b border-gray-700 last:border-b-0"
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{getLocationTypeIcon(location.LocationType)}</span>
                  <div className="flex-1">
                    <div className="font-semibold text-white">{location.LocationName}</div>
                    <div className="text-sm text-gray-400">
                      {location.LocationType} • {location.Province} • {location.Region}
                    </div>
                    {location.Address && (
                      <div className="text-xs text-gray-500 mt-1">{location.Address}</div>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Selected Location Display */}
      {selectedLocation && !mapMode && (
        <div className="mt-3 p-4 bg-green-500/20 border border-green-500/50 rounded-lg">
          <div className="flex items-start justify-between">
            <div>
              <div className="font-semibold text-white">✅ Selected: {selectedLocation.name}</div>
              <div className="text-sm text-gray-300 mt-1">
                {selectedLocation.province && `${selectedLocation.province}, `}
                {selectedLocation.region}
              </div>
              <div className="text-xs text-gray-400 mt-1">
                📍 {selectedLocation.latitude.toFixed(6)}, {selectedLocation.longitude.toFixed(6)}
              </div>
              {selectedLocation.address && (
                <div className="text-xs text-gray-400 mt-1">{selectedLocation.address}</div>
              )}
              {selectedLocation.distance && (
                <div className="text-xs text-gray-500 mt-1">
                  ~{selectedLocation.distance.toFixed(2)} km from clicked point
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Map Mode */}
      {mapMode && (
        <div className="mt-3 bg-gray-800 border border-gray-700 rounded-lg overflow-hidden">
          <div className="p-3 bg-gray-900 border-b border-gray-700 flex items-center justify-between">
            <div>
              <div className="font-semibold text-white">Click on map to select location</div>
              <div className="text-xs text-gray-400 mt-1">
                We'll find the nearest known location or use exact coordinates
              </div>
            </div>
            <button
              type="button"
              onClick={() => setMapMode(false)}
              className="px-3 py-1 bg-red-500/80 hover:bg-red-600 text-white rounded text-sm"
            >
              Close Map
            </button>
          </div>
          <div className="h-96">
            <MapContainer
              center={mapCenter}
              zoom={selectedLocation ? 14 : 6}
              style={{ height: '100%', width: '100%' }}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <MapClickHandler onLocationSelect={handleMapSelect} />
              {selectedLocation && (
                <Marker position={[selectedLocation.latitude, selectedLocation.longitude]} />
              )}
            </MapContainer>
          </div>
        </div>
      )}

      {/* Quick Suggestions */}
      {!selectedLocation && !mapMode && (
        <div className="mt-3">
          <div className="text-xs text-gray-400 mb-2">Quick suggestions:</div>
          <div className="flex flex-wrap gap-2">
            {['Bangkok', 'Chiang Mai', 'Phuket', 'Pattaya', 'Rangsit University'].map((place) => (
              <button
                key={place}
                type="button"
                onClick={() => setSearchQuery(place)}
                className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded-full transition-all"
              >
                {place}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
