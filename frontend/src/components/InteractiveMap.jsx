import { useEffect, useRef, useState } from 'react';
import { useTheme } from '../context/ThemeContext';

// Helper to resolve coordinates based on name or location text
const getCoordinates = (locationText = '', nameText = '') => {
  const text = (locationText + ' ' + nameText).toLowerCase();
  
  if (text.includes('manali')) return [32.2396, 77.1887];
  if (text.includes('shimla')) return [31.1048, 77.1734];
  if (text.includes('goa')) return [15.2993, 74.1240];
  if (text.includes('kerala') || text.includes('alleppey') || text.includes('munnar')) return [9.4981, 76.3388];
  if (text.includes('mussoorie') || text.includes('dehradun')) return [30.4599, 78.0664];
  if (text.includes('jaipur')) return [26.9124, 75.7873];
  if (text.includes('udaipur')) return [24.5854, 73.7125];
  if (text.includes('rishikesh')) return [30.0869, 78.2676];
  if (text.includes('darjeeling')) return [27.0410, 88.2627];
  if (text.includes('ooty')) return [11.4102, 76.6950];
  
  // Default fallback (center of India coordinates slightly offset to avoid overlapping)
  const hash = locationText.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const latOffset = ((hash % 10) - 5) * 0.15;
  const lngOffset = (((hash >> 2) % 10) - 5) * 0.15;
  return [22.5937 + latOffset, 78.9629 + lngOffset];
};

export default function InteractiveMap({ homestays = [], activeHomestayId = null, height = '100%' }) {
  const { darkMode } = useTheme();
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef([]);
  const [leafletLoaded, setLeafletLoaded] = useState(false);

  /* eslint-disable react-hooks/set-state-in-effect */
  // Load Leaflet dynamically via CDN
  useEffect(() => {
    if (window.L) {
      setLeafletLoaded(true);
      return;
    }

    // Add CSS stylesheet
    const cssId = 'leaflet-cdn-css';
    if (!document.getElementById(cssId)) {
      const link = document.createElement('link');
      link.id = cssId;
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }

    // Add JS script
    const scriptId = 'leaflet-cdn-js';
    if (!document.getElementById(scriptId)) {
      const script = document.createElement('script');
      script.id = scriptId;
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.async = true;
      script.onload = () => setLeafletLoaded(true);
      document.body.appendChild(script);
    }
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  // Initialize and update Map
  useEffect(() => {
    if (!leafletLoaded || !mapContainerRef.current) return;

    const L = window.L;

    // Clean up existing map instance if any
    if (mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
    }

    // Determine map center
    let center = [22.5937, 78.9629]; // default center
    let zoom = 5;

    if (homestays.length === 1) {
      center = getCoordinates(homestays[0].location, homestays[0].name);
      zoom = 12;
    } else if (homestays.length > 1) {
      // Find average of coords or focus on first one
      const coords = homestays.map((h) => getCoordinates(h.location, h.name));
      const activeStay = homestays.find(h => h._id === activeHomestayId);
      if (activeStay) {
        center = getCoordinates(activeStay.location, activeStay.name);
        zoom = 10;
      } else {
        const sumLat = coords.reduce((sum, c) => sum + c[0], 0);
        const sumLng = coords.reduce((sum, c) => sum + c[1], 0);
        center = [sumLat / coords.length, sumLng / coords.length];
        zoom = coords.length > 5 ? 5 : 6;
      }
    }

    // Initialize Map
    mapRef.current = L.map(mapContainerRef.current).setView(center, zoom);

    // Standard map tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(mapRef.current);

    // Clear previous markers
    markersRef.current = [];

    // Add markers
    homestays.forEach((h) => {
      const coords = getCoordinates(h.location, h.name);
      
      // Premium styled HTML marker (renders price tag)
      const pricePinHTML = `
        <div class="relative flex items-center justify-center">
          <div class="px-2.5 py-1 rounded-full text-[11px] font-bold text-white shadow-md border border-white/20 transition-all duration-200 hover:scale-110 cursor-pointer ${
            h._id === activeHomestayId 
              ? 'bg-amber-500 scale-110 ring-4 ring-amber-500/20' 
              : 'bg-primary-600 hover:bg-primary-700'
          }">
            ₹${h.pricePerNight?.toLocaleString()}
          </div>
          <div class="absolute -bottom-1 w-2 h-2 rotate-45 border-r border-b border-white/10 ${
            h._id === activeHomestayId ? 'bg-amber-500' : 'bg-primary-600'
          }"></div>
        </div>
      `;

      const customIcon = L.divIcon({
        html: pricePinHTML,
        className: 'custom-leaflet-marker',
        iconSize: [60, 30],
        iconAnchor: [30, 30],
      });

      const popupContent = `
        <div class="w-48 overflow-hidden rounded-xl font-sans text-gray-900">
          <img src="${h.image ? (h.image.startsWith('http') ? h.image : `https://staywise-kappa.vercel.app${h.image}`) : 'https://images.unsplash.com/photo-1542718610-a1d656d1884c?w=300'}" 
               alt="${h.name}" 
               class="w-full h-24 object-cover" 
               onerror="this.src='https://images.unsplash.com/photo-1542718610-a1d656d1884c?w=300'"/>
          <div class="p-3">
            <h4 class="font-bold text-sm leading-tight truncate m-0">${h.name}</h4>
            <p class="text-xs text-gray-500 mt-1 flex items-center gap-1">📍 ${h.location}</p>
            <div class="flex items-center justify-between mt-2 pt-2 border-t border-gray-100">
              <span class="text-xs text-amber-500 font-semibold">★ ${h.rating || '0.0'}</span>
              <a href="/homestays/${h._id}" class="text-xs font-bold text-primary-600 hover:underline">View Details</a>
            </div>
          </div>
        </div>
      `;

      const marker = L.marker(coords, { icon: customIcon })
        .addTo(mapRef.current)
        .bindPopup(popupContent, {
          closeButton: false,
          className: 'custom-leaflet-popup'
        });

      if (h._id === activeHomestayId) {
        marker.openPopup();
      }

      markersRef.current.push({ id: h._id, marker });
    });

    // Cleanup on unmount
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [leafletLoaded, homestays, activeHomestayId]);

  return (
    <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-inner border border-gray-250 dark:border-gray-700 bg-gray-100 dark:bg-dark-900 animate-fadeIn" style={{ minHeight: '350px' }}>
      {!leafletLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-50 dark:bg-dark-900 z-10 space-x-2">
          <div className="w-5 h-5 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs text-gray-400">Loading interactive map...</span>
        </div>
      )}
      
      <div 
        ref={mapContainerRef} 
        style={{ height }} 
        className={`w-full z-0 ${darkMode ? 'leaflet-dark-mode' : ''}`}
      />

      {/* Styled filter injection for dark mode */}
      <style>{`
        .leaflet-dark-mode .leaflet-tile {
          filter: invert(1) hue-rotate(180deg) brightness(0.9) contrast(1.1) !important;
        }
        .leaflet-container {
          font-family: inherit;
        }
        .custom-leaflet-popup .leaflet-popup-content-wrapper {
          border-radius: 1rem;
          padding: 0;
          overflow: hidden;
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
        }
        .custom-leaflet-popup .leaflet-popup-content {
          margin: 0;
          width: 12rem !important;
        }
        .custom-leaflet-popup .leaflet-popup-tip {
          box-shadow: none;
        }
      `}</style>
    </div>
  );
}
