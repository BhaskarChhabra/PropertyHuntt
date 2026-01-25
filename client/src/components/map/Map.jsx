import React, { useEffect, useRef, useState } from "react";
// --- [BADLAV] useJsApiLoader yahan se hata diya gaya hai ---
import { GoogleMap, Marker, InfoWindow } from "@react-google-maps/api";
// axios import ki zaroorat nahi lag rahi, hata raha hoon
// import axios from 'axios'; 

// --- [BADLAV] Ye constants ab ListPage.js mein hain ---
// const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
// const LIBRARIES = ["places"];

// Constants
const MAP_CONTAINER_STYLE = { width: "100%", height: "100%" };
const DEFAULT_CENTER = { lat: 28.61, lng: 77.21 };
const WORLD_ZOOM = 3;


// --- [BADLAV] Props mein 'isLoaded' aur 'loadError' add karein ---
function Map({ items, selectedItem, centerLat, centerLng, onMapClick, onSearchArea, isLoaded, loadError }) {
    
    const mapRef = useRef(null);
    const [showSearchButton, setShowSearchButton] = useState(false);

    // --- [DEBUG] Console logs add kiye gaye ---
    console.log("--- Map Component Render ---");
    console.log("isLoaded Prop:", isLoaded);
    console.log("loadError Prop:", loadError);
    console.log("Items Prop:", items);
    console.log("SelectedItem Prop:", selectedItem);

    // --- [BADLAV] useJsApiLoader hook yahan se hata diya gaya hai ---
    // const { isLoaded, loadError } = useJsApiLoader({ ... });

    const onMapLoad = React.useCallback(map => {
        mapRef.current = map;
        console.log("Map Loaded (onMapLoad triggered)");

        if (items && items.length > 0 && !selectedItem) {
            console.log("Fitting bounds for items...");
            const bounds = new window.google.maps.LatLngBounds();
            items.forEach(item => {
                const lat = parseFloat(item.latitude);
                const lng = parseFloat(item.longitude);
                if (!isNaN(lat) && !isNaN(lng)) {
                    bounds.extend({ lat, lng });
                }
            });
            if (bounds.getCenter()) {
                map.fitBounds(bounds);
            }
        }
    }, [items, selectedItem]);

    useEffect(() => {
        if (selectedItem && mapRef.current) {
            console.log("Panning to selected item:", selectedItem.id);
            const lat = parseFloat(selectedItem.latitude);
            const lng = parseFloat(selectedItem.longitude);
            if (!isNaN(lat) && !isNaN(lng)) {
                const position = { lat, lng };
                mapRef.current.panTo(position);
                mapRef.current.setZoom(15);
            }
        }
    }, [selectedItem]);

    // Ye checks ab props par kaam karenge
    if (loadError) {
        console.error("Map Load Error:", loadError);
        return <div>Map loading error.</div>;
    }
    if (!isLoaded) {
        console.warn("Map is NOT loaded yet.");
        return <div>Loading Map...</div>;
    }

    console.log("Map is loaded, rendering GoogleMap component...");

    return (
        <>
            {showSearchButton && (
                <button
                    className="search-area-btn"
                    // ... (button logic waisa hi rahega) ...
                >
                    Search This Area
                </button>
            )}

            <GoogleMap
                mapContainerStyle={MAP_CONTAINER_STYLE}
                center={{ lat: centerLat, lng: centerLng }}
                zoom={ (items && items.length > 0) ? 12 : WORLD_ZOOM}
                onLoad={onMapLoad}
                options={{ scrollwheel: true, streetViewControl: false, mapTypeControl: false }}
                onClick={(e) => onMapClick && onMapClick(e.latLng.lat(), e.latLng.lng())}
                onDragEnd={() => setShowSearchButton(true)}
                onZoomChanged={() => setShowSearchButton(true)}
            >
                {/* --- [DEBUG] Items loop ke liye log --- */}
                {items && items.length > 0 ? (
                    items.map((item) => {
                        const isSelected = item.id === selectedItem?.id;
                        const position = { 
                            lat: parseFloat(item.latitude), 
                            lng: parseFloat(item.longitude) 
                        };
                        
                        if (isNaN(position.lat) || isNaN(position.lng)) {
                            console.warn("Skipping item with invalid coordinates:", item);
                            return null; 
                        }

                        // console.log(`Rendering Marker for item ${item.id} at`, position); // (Optional: bohot saare logs aa sakte hain)

                        return (
                            <Marker 
                                key={item.id} 
                                position={position} 
                                // icon prop use nahi kar rahe (default pin)
                            >
                                {isSelected && (
                                    <InfoWindow position={position}>
                                        <div><strong>{item.title}</strong></div>
                                    </InfoWindow>
                                )}
                            </Marker>
                        );
                    })
                ) : (
                    // --- [DEBUG] Agar items nahi hain ---
                    console.log("No items to display on map.")
                )}
            </GoogleMap>
        </>
    );
}

export default React.memo(Map);