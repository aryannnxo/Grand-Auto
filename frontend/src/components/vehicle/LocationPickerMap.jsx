import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';

import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

const LocationMarker = ({ position, setPosition }) => {
  useMapEvents({
    click(e) {
      setPosition([e.latlng.lat, e.latlng.lng]);
    },
  });

  return position === null ? null : (
    <Marker position={position}></Marker>
  );
};

const LocationPickerMap = ({ latitude, longitude, onLocationSelect }) => {
  // Default to Kathmandu
  const initialPos = latitude && longitude ? [latitude, longitude] : [27.7172, 85.3240];
  const [position, setPosition] = useState(latitude && longitude ? initialPos : null);

  useEffect(() => {
    if (latitude && longitude) {
      setPosition([latitude, longitude]);
    }
  }, [latitude, longitude]);

  const handlePositionChange = (pos) => {
    setPosition(pos);
    if (pos) {
      onLocationSelect(pos[0], pos[1]);
    }
  };

  return (
    <div className="w-full h-64 md:h-80 rounded-xl overflow-hidden shadow-sm border border-slate-200 dark:border-slate-700 relative z-0 mt-4">
      <MapContainer center={initialPos} zoom={13} style={{ height: '100%', width: '100%', zIndex: 10 }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <LocationMarker position={position} setPosition={handlePositionChange} />
      </MapContainer>
    </div>
  );
};

export default LocationPickerMap;
