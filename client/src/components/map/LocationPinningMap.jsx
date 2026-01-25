import React, { useState, useEffect, useRef } from 'react';
import { GoogleMap, Marker } from "@react-google-maps/api";

const MAP_CONTAINER_STYLE = { width: '100%', height: '300px', borderRadius: '8px', border: '1px solid #ccc' };
const DEFAULT_POSITION = { lat: 20.5937, lng: 78.9629 }; // Center of India
const INITIAL_ZOOM = 4;

function LocationPinningMap({ autoLat, autoLon, onMapClick, isLoaded }) {
  const mapRef = useRef(null);
  const [position, setPosition] = useState(
    (autoLat && autoLon) ? { lat: parseFloat(autoLat), lng: parseFloat(autoLon) } : DEFAULT_POSITION
  );
  const [zoom, setZoom] = useState(INITIAL_ZOOM);
  const isMapReady = useRef(false);

  // Sync state changes from parent (e.g., when Autocomplete is used)
  useEffect(() => {
    if (autoLat && autoLon) {
      const newPos = { lat: parseFloat(autoLat), lng: parseFloat(autoLon) };
      setPosition(newPos);
      setZoom(14); // Zoom in when specific coordinates are available

      // Pan the map only after it has loaded and if the new position is different
      if (mapRef.current) {
        mapRef.current.panTo(newPos);
      }
    } else {
        // If coordinates are cleared, revert to default view
        setPosition(DEFAULT_POSITION);
        setZoom(INITIAL_ZOOM);
        if (mapRef.current) {
            mapRef.current.panTo(DEFAULT_POSITION);
            mapRef.current.setZoom(INITIAL_ZOOM);
        }
    }
  }, [autoLat, autoLon]);

  const handleMapLoad = React.useCallback(map => {
    mapRef.current = map;
    isMapReady.current = true;
    // Set initial position based on props or default center
    if (autoLat && autoLon) {
        map.setCenter({ lat: parseFloat(autoLat), lng: parseFloat(autoLon) });
        map.setZoom(14);
    }
  }, [autoLat, autoLon]);

  const handleInteractionEnd = (event) => {
    // This handles both map click and marker drag end
    const newLat = event.latLng.lat();
    const newLon = event.latLng.lng();
    
    // 1. Update component's local position/zoom
    setPosition({ lat: newLat, lng: newLon });
    setZoom(14);
    
    // 2. Call the parent function to update the form fields and run Reverse Geocoding
    if (onMapClick) {
        onMapClick(newLat, newLon);
    }
  };
  
  if (!isLoaded) return <div>Loading Map Interaction...</div>;

  return (
    <GoogleMap
      mapContainerStyle={MAP_CONTAINER_STYLE}
      // Map center is controlled by state
      center={position} 
      zoom={zoom}
      onLoad={handleMapLoad}
      // Map click event
      onClick={handleInteractionEnd} 
      options={{ disableDefaultUI: true, zoomControl: true, streetViewControl: true }}
    >
      {/* Marker position is controlled by state, allowing it to move on click/drag */}
      {/* We show the marker only if we have coordinates, including the default center */}
      <Marker 
          position={position}
          draggable={true} // Allow dragging
          onDragEnd={handleInteractionEnd} // Handle drag end
      />
    </GoogleMap>
  );
}

export default LocationPinningMap;