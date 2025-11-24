'use client';

import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect, useState } from 'react';

// Fix default marker icon issue with webpack
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom disaster icons
const createDisasterIcon = (type, severity) => {
  const colors = {
    'Catastrophic': '#dc2626',
    'Severe': '#ea580c',
    'Moderate': '#f59e0b',
    'Minor': '#3b82f6'
  };
  
  const icons = {
    'Flood': '🌊',
    'Wildfire': '🔥',
    'Fire': '🔥',
    'Tsunami': '🌊',
    'Drought': '☀️',
    'Landslide': '⛰️',
    'Industrial Accident': '🏭',
    'Tornado': '🌪️',
    'Storm': '⛈️',
    'Hurricane': '🌀',
    'Volcanic Eruption': '🌋',
    'Earthquake': '🏗️',
    'Other': '⚠️'
  };

  const color = colors[severity] || '#6b7280';
  const emoji = icons[type] || '⚠️';
  
  return L.divIcon({
    className: 'custom-disaster-icon',
    html: `
      <div style="
        background: ${color};
        width: 40px;
        height: 40px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 20px;
        border: 3px solid white;
        box-shadow: 0 4px 6px rgba(0,0,0,0.3);
        cursor: pointer;
      ">
        ${emoji}
      </div>
    `,
    iconSize: [40, 40],
    iconAnchor: [20, 20],
    popupAnchor: [0, -20]
  });
};

// Shelter icon
const createShelterIcon = (status) => {
  const colors = {
    'Full': '#dc2626',
    'Available': '#10b981',
    'Closed': '#6b7280'
  };
  
  const color = colors[status] || '#3b82f6';
  
  return L.divIcon({
    className: 'custom-shelter-icon',
    html: `
      <div style="
        background: ${color};
        width: 30px;
        height: 30px;
        border-radius: 4px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 16px;
        border: 2px solid white;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        cursor: pointer;
      ">
        🏠
      </div>
    `,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
    popupAnchor: [0, -15]
  });
};

// Component to recenter map
function RecenterMap({ selectedDisaster }) {
  const map = useMap();
  useEffect(() => {
    if (selectedDisaster && selectedDisaster.Latitude && selectedDisaster.Longitude) {
      const lat = parseFloat(selectedDisaster.Latitude);
      const lng = parseFloat(selectedDisaster.Longitude);
      if (!isNaN(lat) && !isNaN(lng)) {
        console.log('Flying to:', lat, lng, 'for disaster:', selectedDisaster.DisasterName);
        map.flyTo([lat, lng], 10, { duration: 1.5 });
      }
    }
  }, [selectedDisaster?.DisasterID, map]);
  return null;
}

export default function ThailandDisasterMap({ disasters = [], shelters = [], onDisasterClick, onShelterClick, selectedDisaster }) {
  const [mounted, setMounted] = useState(false);
  const [mapKey, setMapKey] = useState(0);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Force map to re-center when selectedDisaster changes
  useEffect(() => {
    if (selectedDisaster) {
      setMapKey(prev => prev + 1);
    }
  }, [selectedDisaster?.DisasterID]);

  if (!mounted) {
    return (
      <div className="w-full h-full bg-gray-200 rounded-lg flex items-center justify-center">
        <p className="text-gray-600">Loading map...</p>
      </div>
    );
  }

  // Thailand center coordinates
  const thailandCenter = [13.7563, 100.5018]; // Bangkok
  const center = selectedDisaster && selectedDisaster.Latitude && selectedDisaster.Longitude
    ? [parseFloat(selectedDisaster.Latitude), parseFloat(selectedDisaster.Longitude)] 
    : thailandCenter;

  // Calculate affected radius based on population
  const getAffectedRadius = (population) => {
    if (!population) return 10000;
    if (population > 1000000) return 80000;
    if (population > 500000) return 60000;
    if (population > 100000) return 40000;
    if (population > 50000) return 25000;
    return 15000;
  };

  const getRadiusColor = (severity) => {
    const colors = {
      'Catastrophic': '#dc2626',
      'Severe': '#ea580c',
      'Moderate': '#f59e0b',
      'Minor': '#3b82f6'
    };
    return colors[severity] || '#6b7280';
  };

  return (
    <div className="w-full h-full rounded-lg overflow-hidden shadow-xl">
      <MapContainer
        key={mapKey}
        center={center}
        zoom={selectedDisaster ? 10 : 6}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <RecenterMap selectedDisaster={selectedDisaster} />

        {/* Disaster markers with affected area circles */}
        {disasters.map((disaster) => (
          disaster.Latitude && disaster.Longitude && (
            <div key={`disaster-${disaster.DisasterID}`}>
              {/* Affected area circle */}
              <Circle
                center={[disaster.Latitude, disaster.Longitude]}
                radius={getAffectedRadius(disaster.EstimatedAffectedPopulation)}
                pathOptions={{
                  fillColor: getRadiusColor(disaster.Severity),
                  fillOpacity: 0.15,
                  color: getRadiusColor(disaster.Severity),
                  weight: 2,
                  opacity: 0.5
                }}
              />
              
              {/* Disaster marker */}
              <Marker
                position={[disaster.Latitude, disaster.Longitude]}
                icon={createDisasterIcon(disaster.DisasterType, disaster.Severity)}
                eventHandlers={{
                  click: () => onDisasterClick && onDisasterClick(disaster)
                }}
              >
                <Popup maxWidth={300}>
                  <div className="p-2">
                    <h3 className="font-bold text-lg mb-2">{disaster.DisasterName}</h3>
                    <div className="space-y-1 text-sm">
                      <p><strong>Type:</strong> {disaster.DisasterType}</p>
                      <p><strong>Severity:</strong> <span className={`
                        ${disaster.Severity === 'Catastrophic' ? 'text-red-600' : ''}
                        ${disaster.Severity === 'Severe' ? 'text-orange-600' : ''}
                        ${disaster.Severity === 'Moderate' ? 'text-yellow-600' : ''}
                        ${disaster.Severity === 'Minor' ? 'text-blue-600' : ''}
                        font-semibold
                      `}>{disaster.Severity}</span></p>
                      <p><strong>Status:</strong> {disaster.Status}</p>
                      <p><strong>Region:</strong> {disaster.AffectedRegion}</p>
                      <p><strong>Affected:</strong> {(disaster.EstimatedAffectedPopulation || 0).toLocaleString()} people</p>
                      {disaster.EstimatedDamage && (
                        <p><strong>Damage:</strong> {disaster.EstimatedDamage >= 1000000000
                          ? `฿${(disaster.EstimatedDamage / 1000000000).toFixed(1)}B`
                          : disaster.EstimatedDamage >= 1000000
                          ? `฿${(disaster.EstimatedDamage / 1000000).toFixed(0)}M`
                          : `฿${(disaster.EstimatedDamage / 1000).toFixed(0)}K`
                        }</p>
                      )}
                      <p className="text-xs text-gray-600 mt-2">
                        {new Date(disaster.StartDate).toLocaleString('th-TH')}
                      </p>
                    </div>
                  </div>
                </Popup>
              </Marker>
            </div>
          )
        ))}

        {/* Shelter markers */}
        {shelters.map((shelter) => (
          shelter.Latitude && shelter.Longitude && (
            <Marker
              key={`shelter-${shelter.ShelterID}`}
              position={[shelter.Latitude, shelter.Longitude]}
              icon={createShelterIcon(shelter.Status)}
              eventHandlers={{
                click: () => onShelterClick && onShelterClick(shelter)
              }}
            >
              <Popup maxWidth={300}>
                <div className="p-2">
                  <h3 className="font-bold text-lg mb-2">{shelter.ShelterName}</h3>
                  <div className="space-y-1 text-sm">
                    <p><strong>Type:</strong> {shelter.ShelterType}</p>
                    <p><strong>Location:</strong> {shelter.City}</p>
                    <p><strong>Status:</strong> <span className={`
                      ${shelter.Status === 'Full' ? 'text-red-600' : ''}
                      ${shelter.Status === 'Available' ? 'text-green-600' : ''}
                      font-semibold
                    `}>{shelter.Status}</span></p>
                    <p><strong>Capacity:</strong> {shelter.CurrentOccupancy}/{shelter.Capacity}</p>
                    <p className="text-xs text-gray-600 mt-2">
                      Available: {shelter.Capacity - shelter.CurrentOccupancy} spaces
                    </p>
                    {shelter.ContactPerson && (
                      <p className="text-xs mt-2">
                        <strong>Contact:</strong> {shelter.ContactPerson}<br/>
                        {shelter.ContactPhone}
                      </p>
                    )}
                  </div>
                </div>
              </Popup>
            </Marker>
          )
        ))}
      </MapContainer>
      
      {/* Map Legend - Modern Floating Collapsible Button */}
      <div className="absolute bottom-4 left-4 z-[1000]">
        <button
          onClick={() => {
            const legend = document.getElementById('map-legend-content');
            legend.classList.toggle('hidden');
          }}
          className="bg-white/95 backdrop-blur-sm hover:bg-white text-gray-800 px-4 py-2 rounded-lg shadow-lg font-semibold text-sm transition-all flex items-center gap-2 mb-2"
        >
          <span>📊</span>
          <span>Legend</span>
        </button>
        <div id="map-legend-content" className="hidden bg-white/95 backdrop-blur-sm rounded-lg shadow-xl p-3 animate-fade-in">
          <div className="space-y-2 text-xs min-w-[160px]">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-red-600 flex items-center justify-center text-sm">🔥</div>
              <span className="font-medium">Severe</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-yellow-600 flex items-center justify-center text-sm">⚠️</div>
              <span className="font-medium">Moderate</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-green-600 flex items-center justify-center text-sm">🏠</div>
              <span className="font-medium">Available</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-red-600 flex items-center justify-center text-sm">🏠</div>
              <span className="font-medium">Full</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
