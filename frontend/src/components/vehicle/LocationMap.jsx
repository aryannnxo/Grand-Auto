import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { useEffect } from 'react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { MapPin, ExternalLink } from 'lucide-react';

// Fix for default marker icon in leaflet with React
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

const MapUpdater = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);
  return null;
};

const LocationMap = ({ latitude, longitude, locationName, isExact = true }) => {
  if (!latitude || !longitude) return null;

  const position = [latitude, longitude];

  return (
    <div className="pt-6 border-t border-slate-100 dark:border-white/5 mt-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-heading font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
          Pickup Location
        </h3>
        <button className="text-xs font-bold text-primary-500 hover:text-primary-600 dark:hover:text-primary-400 flex items-center gap-1.5 transition-colors bg-primary-50 dark:bg-primary-900/20 px-3 py-1.5 rounded-full">
          <ExternalLink size={14} /> View full map
        </button>
      </div>

      <div className="w-full bg-slate-50 dark:bg-[#111111] p-2 md:p-3 rounded-3xl border border-slate-200/60 dark:border-white/5 shadow-lg shadow-slate-200/20 dark:shadow-black/20">
        <div className="w-full h-64 md:h-[300px] rounded-2xl overflow-hidden relative z-0">
          <MapContainer center={position} zoom={15} scrollWheelZoom={false} style={{ height: '100%', width: '100%', zIndex: 10 }}>
            <MapUpdater center={position} />
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={position}>
              <Popup>
                {locationName || 'Vehicle Pickup Location'}
              </Popup>
            </Marker>
          </MapContainer>
          
          {/* Subtle overlay gradient to blend map with UI */}
          <div className="absolute inset-0 border-[4px] border-white/10 dark:border-black/10 rounded-2xl pointer-events-none z-20 mix-blend-overlay"></div>
        </div>
      </div>
      
      {locationName && (
        <div className="mt-4 flex items-center gap-3 px-2">
          <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-900 flex items-center justify-center text-primary-500 shrink-0">
            <MapPin size={20} />
          </div>
          <div>
            <p className="text-sm text-slate-900 dark:text-white font-bold leading-none mb-1">
              {locationName}
            </p>
            {!isExact && (
              <span className="text-[10px] font-bold text-amber-500 uppercase tracking-wider">
                Approximate Location
              </span>
            )}
            {isExact && (
              <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider">
                Exact Location Verified
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default LocationMap;
