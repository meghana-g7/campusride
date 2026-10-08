import React, { useEffect, useRef } from 'react';
import L from 'leaflet';

// Custom icons using inline SVG data URI to eliminate external asset loading issues
const createSvgIcon = (color, text, type = 'pin') => {
  let svg = '';
  if (type === 'bike') {
    svg = `<svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="${color}" stroke="#ffffff" stroke-width="1.5"><circle cx="12" cy="12" r="11" fill="${color}"/><path fill="#ffffff" d="M15.5 5.5c-.8 0-1.5.7-1.5 1.5s.7 1.5 1.5 1.5 1.5-.7 1.5-1.5-.7-1.5-1.5-1.5zm-8 4C6.1 9.5 5 10.6 5 12s1.1 2.5 2.5 2.5 2.5-1.1 2.5-2.5-1.1-2.5-2.5-2.5zm9 0c-1.4 0-2.5 1.1-2.5 2.5s1.1 2.5 2.5 2.5 2.5-1.1 2.5-2.5-1.1-2.5-2.5-2.5z"/></svg>`;
  } else if (type === 'car') {
    svg = `<svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="${color}" stroke="#ffffff" stroke-width="1.5"><circle cx="12" cy="12" r="11" fill="${color}"/><path fill="#ffffff" d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/></svg>`;
  } else {
    svg = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="42" viewBox="0 0 32 42">
      <path fill="${color}" stroke="#ffffff" stroke-width="2" d="M16 0C7.2 0 0 7.2 0 16c0 12 16 26 16 26s16-14 16-26c0-8.8-7.2-16-16-16z"/>
      <circle cx="16" cy="16" r="6" fill="#ffffff"/>
    </svg>`;
  }

  return L.divIcon({
    className: 'custom-leaflet-icon',
    html: `<div style="display:flex; flex-direction:column; align-items:center;">
             ${svg}
             ${text ? `<span style="background:rgba(0,0,0,0.75); color:white; font-size:10px; font-weight:bold; padding:2px 6px; border-radius:4px; margin-top:2px; white-space:nowrap;">${text}</span>` : ''}
           </div>`,
    iconSize: [36, 46],
    iconAnchor: [18, 42]
  });
};

const MapView = ({
  center = [13.0805, 77.5458],
  zoom = 14,
  pickupCoords,
  dropCoords,
  driverCoords,
  driverType = 'Bike',
  showRoute = true,
  className = 'h-64 w-full'
}) => {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const layerGroupRef = useRef(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      // Initialize Leaflet map
      const map = L.map(mapContainerRef.current, {
        center,
        zoom,
        zoomControl: false,
        attributionControl: false
      });

      // CartoDB Positron / OSM style clean tile layer
      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        maxZoom: 19,
        subdomains: 'abcd'
      }).addTo(map);

      layerGroupRef.current = L.layerGroup().addTo(map);
      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;
    const layerGroup = layerGroupRef.current;
    layerGroup.clearLayers();

    const bounds = [];

    // Add Pickup Marker
    if (pickupCoords && pickupCoords.lat && pickupCoords.lng) {
      const pLatLng = [pickupCoords.lat, pickupCoords.lng];
      const marker = L.marker(pLatLng, {
        icon: createSvgIcon('#10B981', 'Pickup', 'pin')
      }).addTo(layerGroup);
      bounds.push(pLatLng);
    }

    // Add Drop Marker
    if (dropCoords && dropCoords.lat && dropCoords.lng) {
      const dLatLng = [dropCoords.lat, dropCoords.lng];
      const marker = L.marker(dLatLng, {
        icon: createSvgIcon('#EF4444', 'Drop', 'pin')
      }).addTo(layerGroup);
      bounds.push(dLatLng);
    }

    // Add Driver Marker
    if (driverCoords && driverCoords.lat && driverCoords.lng) {
      const drLatLng = [driverCoords.lat, driverCoords.lng];
      const iconType = driverType.toLowerCase() === 'car' ? 'car' : 'bike';
      L.marker(drLatLng, {
        icon: createSvgIcon('#2563EB', 'Captain', iconType)
      }).addTo(layerGroup);
      bounds.push(drLatLng);
    }

    // Route polyline
    if (showRoute && pickupCoords && dropCoords) {
      const latlngs = [
        [pickupCoords.lat, pickupCoords.lng],
        // Intermediate waypoint for realistic curved road display
        [
          (pickupCoords.lat + dropCoords.lat) / 2 + 0.002,
          (pickupCoords.lng + dropCoords.lng) / 2 - 0.003
        ],
        [dropCoords.lat, dropCoords.lng]
      ];

      L.polyline(latlngs, {
        color: '#3B82F6',
        weight: 5,
        opacity: 0.85,
        lineCap: 'round',
        dashArray: '1, 8'
      }).addTo(layerGroup);

      // Main solid line
      L.polyline(latlngs, {
        color: '#2563EB',
        weight: 4,
        opacity: 0.9,
        lineCap: 'round'
      }).addTo(layerGroup);
    }

    if (bounds.length > 1) {
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 15 });
    } else if (bounds.length === 1) {
      map.setView(bounds[0], zoom);
    } else {
      map.setView(center, zoom);
    }
  }, [center, zoom, pickupCoords, dropCoords, driverCoords, driverType, showRoute]);

  // Clean up
  useEffect(() => {
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  return (
    <div className={`relative overflow-hidden rounded-2xl ${className}`}>
      <div ref={mapContainerRef} className="w-full h-full" />
    </div>
  );
};

export default MapView;
