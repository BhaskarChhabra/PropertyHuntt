import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { GoogleMap, useJsApiLoader, Marker } from "@react-google-maps/api";

const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
const API_BASE_URL = import.meta.env.VITE_API_URL;
const MAP_CONTAINER_STYLE = { width: "100%", height: "100%", borderRadius: "10px" }; 
const LIBRARIES = ["places"];

// Helper to define custom icons for visual differentiation (URLs are fine here)
const AMENITY_ICONS = {
    'hospital': 'http://maps.google.com/mapfiles/ms/icons/red-dot.png',
    'doctor': 'http://maps.google.com/mapfiles/ms/icons/red-dot.png',
    'pharmacy': 'http://maps.google.com/mapfiles/ms/icons/yellow-dot.png',
    'school': 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png',
    'restaurant': 'http://maps.google.com/mapfiles/ms/icons/green-dot.png',
    'transit_station': 'http://maps.google.com/mapfiles/ms/icons/purple-dot.png',
    'default': 'http://maps.google.com/mapfiles/ms/icons/ltblue-dot.png',
};

// 🛑 FIX 1: PROPERTY_ICON definition needs to be inside or conditional,
// as 'window.google.maps.Size' is undefined before load.
// We will move its construction logic inside the component body, after isLoaded check.
// We remove the old constant definition here to prevent the crash.

function SinglePostMap({ post, selectedType }) {
    const [amenities, setAmenities] = useState([]);
    const position = { lat: parseFloat(post.latitude), lng: parseFloat(post.longitude) };
    
    // We use GoogleMap as the component name for clarity
    const { isLoaded } = useJsApiLoader({
        googleMapsApiKey: GOOGLE_API_KEY,
        libraries: LIBRARIES,
    });

    // Fetch amenities ONLY for the selected type
    useEffect(() => {
        const fetchAmenities = async () => {
            if (!selectedType) {
                setAmenities([]);
                return;
            }

            try {
                // Send the single selected type to the back-end
                const res = await axios.get(`${API_BASE_URL}/map/amenities`, {
                    params: { lat: post.latitude, lng: post.longitude, types: [selectedType] }, 
                    proxy: false 
                });
                
                // Assuming res.data gives an array of amenities with 'location: { lat, lng }' and 'type'
                setAmenities(res.data.filter(a => a.type === selectedType)); 
            } catch (err) {
                console.error(`Error fetching amenities for map (${selectedType}):`, err);
                setAmenities([]);
            }
        };
        const timer = setTimeout(fetchAmenities, 300); 
        return () => clearTimeout(timer);
    }, [post.latitude, post.longitude, selectedType]); 

    
    if (!isLoaded) return <div>Loading Map...</div>;

    // 🛑 FIX 2: Define PROPERTY_ICON here, where 'window.google.maps' is guaranteed to exist.
    // If you need to access Google Maps objects, they must be used after isLoaded is true.
    const PROPERTY_ICON_LOADED = { 
        url: 'http://maps.google.com/mapfiles/ms/icons/orange-dot.png', 
        scaledSize: new window.google.maps.Size(40, 40), 
        labelOrigin: new window.google.maps.Point(20, 10) 
    };

    return (
        <GoogleMap
            mapContainerStyle={MAP_CONTAINER_STYLE}
            center={position}
            zoom={14} 
            options={{ disableDefaultUI: true, zoomControl: true, streetViewControl: false }}
        >
            {/* 1. Main Property Marker */}
            <Marker 
                position={position} 
                label={{ text: "HOME", color: "white", fontWeight: "bold", fontSize: "10px" }}
                icon={PROPERTY_ICON_LOADED} // 🛑 Use the loaded icon object
            />

            {/* 2. Nearby Amenities Markers (Dynamic based on selectedType) */}
            {amenities.map((amenity, index) => (
                <Marker
                    key={amenity.place_id || index}
                    position={amenity.location} 
                    icon={AMENITY_ICONS[amenity.type] || AMENITY_ICONS.default}
                    title={amenity.name}
                />
            ))}
        </GoogleMap>
    );
}

export default SinglePostMap;
