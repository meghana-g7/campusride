import React, { useEffect, useRef } from 'react';
import L from 'leaflet';

// Custom icons using inline SVG data URI to eliminate external asset loading issues
const createSvgIcon = (color, text, type = 'pin') => {
  let svg = '';
  if (type === 'bike') {
    svg = `<div style="position:relative; width:44px; height:44px; display:flex; align-items:center; justify-content:center;">
      <div style="position:absolute; width:44px; height:44px; border-radius:50%; background:rgba(37,99,235,0.25); animation:ping 1.5s cubic-bezier(0,0,0.2,1) infinite;"></div>
      <div style="position:relative; width:34px; height:34px; border-radius:50%; background:#2563EB; border:3px solid #ffffff; box-shadow:0 4px 10px rgba(0,0,0,0.3); display:flex; align-items:center; justify-content:center;">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="18.5" cy="17.5" r="3.5"/><circle cx="5.5" cy="17.5" r="3.5"/><circle cx="15" cy="5" r="1"/><path d="M12 17.5V14l-3-3 4-3 2 3h2"/>
        </svg>
      </div>
    </div>`;
  } else if (type === 'car') {
    svg = `<div style="position:relative; width:44px; height:44px; display:flex; align-items:center; justify-content:center;">
      <div style="position:absolute; width:44px; height:44px; border-radius:50%; background:rgba(37,99,235,0.25); animation:ping 1.5s cubic-bezier(0,0,0.2,1) infinite;"></div>
      <div style="position:relative; width:34px; height:34px; border-radius:50%; background:#1E293B; border:3px solid #ffffff; box-shadow:0 4px 10px rgba(0,0,0,0.3); display:flex; align-items:center; justify-content:center;">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9C2.1 11.2 2 11.6 2 12v4c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/>
        </svg>
      </div>
    </div>`;
  } else {
    // Elegant Google Maps Pin
    svg = `<div style="display:flex; flex-direction:column; align-items:center;">
      <svg xmlns="http://www.w3.org/2000/svg" width="30" height="38" viewBox="0 0 30 38">
        <path fill="${color}" stroke="#ffffff" stroke-width="2" d="M15 0C6.7 0 0 6.7 0 15c0 10.5 15 23 15 23s15-12.5 15-23c0-8.3-6.7-15-15-15z"/>
        <circle cx="15" cy="15" r="5.5" fill="#ffffff"/>
      </svg>
    </div>`;
  }

  return L.divIcon({
    className: 'custom-leaflet-icon',
    html: `<div style="display:flex; flex-direction:column; align-items:center;">
             ${svg}
             ${text ? `<span style="background:rgba(15,23,42,0.85); color:white; font-size:10px; font-weight:800; padding:2px 7px; border-radius:6px; margin-top:-2px; white-space:nowrap; box-shadow:0 2px 4px rgba(0,0,0,0.2);">${text}</span>` : ''}
           </div>`,
    iconSize: [44, 52],
    iconAnchor: [22, 42]
  });
};

const MapView = ({
  center = [13.0805, 77.5458], // Sambhram Institute of Technology (SAIT)
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
  const driverMarkerRef = useRef(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      // Initialize Leaflet map with smooth panning
      const map = L.map(mapContainerRef.current, {
        center,
        zoom,
        zoomControl: false,
        attributionControl: false
      });

      // Google Maps Standard Roadmap Vector Tiles (Direct Google Maps street data)
      const googleRoadmap = L.tileLayer('https://mt{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
        maxZoom: 20,
        subdomains: ['0', '1', '2', '3'],
        attribution: 'Map data © Google Maps'
      });

      // Fallback clean tile layer in case of network restriction
      const cartoFallback = L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        maxZoom: 19,
        subdomains: 'abcd'
      });

      googleRoadmap.on('tileerror', () => {
        cartoFallback.addTo(map);
      });

      googleRoadmap.addTo(map);

      layerGroupRef.current = L.layerGroup().addTo(map);
      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;
    const layerGroup = layerGroupRef.current;
    layerGroup.clearLayers();

    const bounds = [];

    // Add Pickup Marker (Green)
    if (pickupCoords && pickupCoords.lat && pickupCoords.lng) {
      const pLatLng = [pickupCoords.lat, pickupCoords.lng];
      L.marker(pLatLng, {
        icon: createSvgIcon('#10B981', 'Pickup (SAIT)', 'pin')
      }).addTo(layerGroup);
      bounds.push(pLatLng);
    }

    // Add Drop Marker (Red)
    if (dropCoords && dropCoords.lat && dropCoords.lng) {
      const dLatLng = [dropCoords.lat, dropCoords.lng];
      L.marker(dLatLng, {
        icon: createSvgIcon('#EF4444', 'Drop-off', 'pin')
      }).addTo(layerGroup);
      bounds.push(dLatLng);
    }

    // Add or Update Driver Live Moving Marker (Blue Bike/Car with live pulse)
    if (driverCoords && driverCoords.lat && driverCoords.lng) {
      const drLatLng = [driverCoords.lat, driverCoords.lng];
      const iconType = driverType.toLowerCase() === 'car' ? 'car' : 'bike';
      const driverMarker = L.marker(drLatLng, {
        icon: createSvgIcon('#2563EB', 'Live Captain', iconType),
        zIndexOffset: 1000
      }).addTo(layerGroup);
      driverMarkerRef.current = driverMarker;
      bounds.push(drLatLng);
    }

    // Google Maps Navigation Polyline Route
    if (showRoute && pickupCoords && dropCoords) {
      // Waypoints for realistic road curve between SAIT and Destination
      const midLat = (pickupCoords.lat + dropCoords.lat) / 2;
      const midLng = (pickupCoords.lng + dropCoords.lng) / 2;

      const latlngs = [
        [pickupCoords.lat, pickupCoords.lng],
        [midLat + 0.0018, midLng - 0.0022],
        [midLat - 0.0008, midLng + 0.0012],
        [dropCoords.lat, dropCoords.lng]
      ];

      // Route Outer Border (Google Maps dark blue casing)
      L.polyline(latlngs, {
        color: '#1D4ED8',
        weight: 7,
        opacity: 0.95,
        lineCap: 'round',
        lineJoin: 'round'
      }).addTo(layerGroup);

      // Route Inner Fill (Google Maps vibrant cyan/blue line)
      L.polyline(latlngs, {
        color: '#60A5FA',
        weight: 4,
        opacity: 1,
        lineCap: 'round',
        lineJoin: 'round'
      }).addTo(layerGroup);
    }

    if (bounds.length > 1) {
      map.fitBounds(bounds, { padding: [45, 45], maxZoom: 16 });
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
