import React, { useState, useMemo, useEffect, Suspense } from 'react';
import "./listPage.scss";
import Filter from "../../components/filter/Filter";
import Card from "../../components/card/Card";
import Map from "../../components/map/Map";
import { Await, useLoaderData, useLocation, useNavigate } from "react-router-dom";
import { useJsApiLoader } from "@react-google-maps/api"; 

// Constants
const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
const LIBRARIES = ["places"];

// --- Geocoding Helpers (Updated to return the best location name) ---
let geocoder = null;
const initGeocoder = () => {
    if (window.google && window.google.maps && !geocoder) {
        geocoder = new window.google.maps.Geocoder();
    }
};

const getAddressFromCoordinates = (lat, lon) => {
    return new Promise((resolve, reject) => {
        if (!geocoder) {
            initGeocoder();
            if (!geocoder) return reject("Google Geocoder not initialized.");
        }
        geocoder.geocode({ location: { lat, lng: lon } }, (results, status) => {
            if (status === "OK" && results[0]) {
                // --- [YAHAN BADLAV HAI] ---
                // Hum 'locality' (e.g., Sector 43), 'postal_town' (e.g., Mandi Dabwali), 
                // ya 'administrative_area_level_2' (e.g., Sirsa) dhoondhenge
                const cityComponent = results[0].address_components.find(c =>
                    c.types.includes('locality') ||
                    c.types.includes('postal_town') ||
                    c.types.includes('administrative_area_level_2')
                );

                const locationName = cityComponent ? cityComponent.long_name : results[0].formatted_address;
                
                console.log("Geocoding Result: Found location name:", locationName);

                resolve({
                    // 'locationForSearch' ko search bar mein use karein
                    locationForSearch: locationName, 
                    fullAddress: results[0].formatted_address, // Poora pata (future use ke liye)
                });
                // --- [END BADLAV] ---
            } else {
                reject(`Reverse geocode failed: ${status}`);
            }
        });
    });
};
// --- END Geocoding Helpers ---


// === LOADING COMPONENT (Waisa hi) ===
const PropertiesLoading = () => {
    return (
        <div className="propertiesLoadingContainer">
            {/* ... (poora loading component waisa hi rahega) ... */}
            <div className="loadingWrapper">
                <div className="iconContainer">
                    <div className="loadingIcon">
                        <div className="houseIcon"></div>
                    </div>
                    <div className="orbitingDot"></div>
                </div>
                <h1>Loading Properties</h1>
                <p>We're finding the perfect homes that match your preferences...</p>
                <div className="loadingBar">
                    <div className="loadingBarProgress"></div>
                </div>
                <span>Please wait while we curate properties for you</span>
            </div>
        </div>
    );
};
// === [END] LOADING COMPONENT ===


function ListPage() {
    const [selectedPost, setSelectedPost] = useState(null);
    const [isMapSearching, setIsMapSearching] = useState(false); 
    const data = useLoaderData();
    const location = useLocation();
    const navigate = useNavigate();

    const { isLoaded, loadError } = useJsApiLoader({
        googleMapsApiKey: GOOGLE_API_KEY,
        libraries: LIBRARIES,
    });

    // URL se initial parameters lein
    const searchParams = useMemo(() => {
        const params = new URLSearchParams(location.search);
        return {
            city: params.get("city") || "", 
            latitude: params.get("latitude"),
            longitude: params.get("longitude"),
        };
    }, [location.search]);

    // State jo Filter component ke city input ko control karega
    const [pinnedLocation, setPinnedLocation] = useState({
        city: searchParams.city,
        lat: searchParams.latitude,
        lng: searchParams.longitude
    });

    // Geocoder ko initialize karein (Waisa hi)
    useEffect(() => {
        const checkGoogle = setInterval(() => {
            if (window.google && window.google.maps) {
                initGeocoder();
                clearInterval(checkGoogle);
            }
        }, 100);
        return () => clearInterval(checkGoogle);
    }, []);

    const handleCardSelect = (post) => {
        setSelectedPost(post);
    };

    // --- [YAHAN BADLAV KIYA GAYA HAI] ---
    // Function jab user map par PIN karta hai (SEARCH NAHI KARTA)
    const handleMapClick = async (lat, lng) => {
        console.log("Map clicked. Geocoding coordinates...");
        setIsMapSearching(true); 
        try {
            // 'address' ki jagah 'locationForSearch' ka istemal karein
            const { locationForSearch } = await getAddressFromCoordinates(lat, lng);
            console.log("Geocoding success. Setting pinned city:", locationForSearch);
            // PinnedLocation state ko update karein
            setPinnedLocation({ city: locationForSearch, lat: lat.toString(), lng: lng.toString() }); 
        } catch (error) {
            console.error("Map click geocoding failed:", error);
        } finally {
            setIsMapSearching(false); 
        }
    };
    
    // Function jab user "Search This Area" BUTTON click karta hai
    const handleSearchThisArea = async (lat, lng) => {
        console.log("Search This Area button clicked. Searching...");
        setIsMapSearching(true);
        try {
            // 'address' ki jagah 'locationForSearch' ka istemal karein
            const { locationForSearch } = await getAddressFromCoordinates(lat, lng);
            
            const currentParams = new URLSearchParams(location.search);
            // URL mein "city" ko locationForSearch se set karein
            currentParams.set("city", locationForSearch); 
            currentParams.set("latitude", lat.toString());
            currentParams.set("longitude", lng.toString());

            // Pinned city state ko bhi update karein
            setPinnedLocation({ city: locationForSearch, lat: lat.toString(), lng: lng.toString() }); 

            // Search trigger karne ke liye navigate karein
            navigate(`/list?${currentParams.toString()}`);

        } catch (error) {
            console.error("Map search failed:", error);
        } finally {
            setIsMapSearching(false);
        }
    };
    // --- [END BADLAV] ---
    
    
    // Loading/Error states (Waise hi)
    if (loadError) {
        console.error("Google Maps Load Error:", loadError);
        return <div className="error" style={{padding: "20px"}}>Map loading error. Please check your API key or internet connection.</div>;
    }
    if (!isLoaded) {
        console.log("Map script not yet loaded, showing PropertiesLoading...");
        return <PropertiesLoading />;
    }
    console.log("Map script IS LOADED. Proceeding to render ListPage.");

    return (
        <div className="listPageAdvanced">
            {/*                 === [NEW CODE ADDED HERE for the Heading] ===
                This structure mimics the look from the image, where the text is centered 
                above the filter and search bar area. 
                NOTE: You'll need to add appropriate CSS (in listPage.scss) for styling 
                (e.g., centering, font size/weight, spacing).
            */}
            <div className="headerTextContainer">
                <h1>Find Your Perfect Property</h1>
                <p>Discover a curated collection of premium properties</p>
            </div>
            
            <div className="filterSection">
                <div className="wrapper">
                    {/* --- [YAHAN BADLAV HAI] --- */}
                    {/* 'pinnedLocation' object ko prop ke through Filter component mein bhej rahe hain */}
                    <Filter key={pinnedLocation.city} locationFromMap={pinnedLocation} />
                </div>
            </div>

            <Suspense fallback={<PropertiesLoading />}>
                <Await resolve={data.postResponse} errorElement={<p className='error'>Error loading posts!</p>}>
                
                {(postResponse) => {
                    const posts = postResponse.data || []; 
                    console.log("Posts data received in Await:", posts);

                    const mapCenter = {
                        lat: searchParams.latitude ? parseFloat(searchParams.latitude) : (posts[0]?.latitude || 28.6139),
                        lng: searchParams.longitude ? parseFloat(searchParams.longitude) : (posts[0]?.longitude || 77.209),
                    };

                    return (
                        <div className="mainContentArea">
                            
                            <div className="mapSection">
                                {isMapSearching && <div className="map-searching-overlay">Locating...</div>}
                                
                                <Map
                                    items={posts}
                                    selectedItem={selectedPost}
                                    centerLat={mapCenter.lat}
                                    centerLng={mapCenter.lng}
                                    key={location.search} 
                                    
                                    // --- [YAHAN BADLAV HAI] ---
                                    // 'onMapClick' ab naye function (handleMapClick) ko call karega
                                    onMapClick={handleMapClick} 
                                    // 'onSearchArea' purane function (handleSearchThisArea) ko call karega
                                    onSearchArea={handleSearchThisArea} 
                                    // --- [END BADLAV] ---
                                    
                                    isLoaded={isLoaded}
                                    loadError={loadError}
                                />
                            </div>
                            
                            {/* List Container (Waisa hi) */}
                            {posts.length > 0 ? (
                                <div className="listContainer">
                                    <h2>All Listings in {searchParams.city || "Area"}</h2>
                                    {posts.map((post) => (
                                        <Card
                                            key={post.id}
                                            item={post}
                                            isHighlighted={post.id === selectedPost?.id}
                                            onClick={() => handleCardSelect(post)}
                                        />
                                    ))}
                                </div>
                            ) : (
                                <div className="noResults">
                                    <h2>No results found for "{searchParams.city}"</h2>
                                    <p>Try adjusting your search criteria or clicking on the map to search a new area.</p>
                                </div>
                            )}
                        </div>
                    );
                }}
                </Await>
            </Suspense>
        </div>
    );
}

export default ListPage;