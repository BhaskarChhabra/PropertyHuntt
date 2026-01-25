import React, { useState, useMemo, useEffect, Suspense, useCallback, useContext } from 'react'; // Added useCallback and useContext
import "./listPage.scss";
import Filter from "../../components/filter/Filter";
import Card from "../../components/card/Card";
import Map from "../../components/map/Map";
import { Await, useLoaderData, useLocation, useNavigate } from "react-router-dom";
import { useJsApiLoader } from "@react-google-maps/api"; 
import apiRequest from "../../lib/apiRequest"; // API request library import
import { AuthContext } from '../../context/AuthContext'; // Auth context import

// Constants (Unchanged)
const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
const LIBRARIES = ["places"];

// --- Geocoding Helpers (Unchanged) ---
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
                const cityComponent = results[0].address_components.find(c =>
                    c.types.includes('locality') ||
                    c.types.includes('postal_town') ||
                    c.types.includes('administrative_area_level_2')
                );

                const locationName = cityComponent ? cityComponent.long_name : results[0].formatted_address;
                
                console.log("Geocoding Result: Found location name:", locationName);

                resolve({
                    locationForSearch: locationName, 
                    fullAddress: results[0].formatted_address, 
                });
            } else {
                reject(`Reverse geocode failed: ${status}`);
            }
        });
    });
};
// --- END Geocoding Helpers ---


// === LOADING COMPONENT (Unchanged) ===
const PropertiesLoading = () => {
    return (
        <div className="propertiesLoadingContainer">
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
    const { currentUser } = useContext(AuthContext); // Get currentUser
    const [selectedPost, setSelectedPost] = useState(null);
    const [isMapSearching, setIsMapSearching] = useState(false); 
    const data = useLoaderData();
    const location = useLocation();
    const navigate = useNavigate();

    // 💡 State to manage the list data for local save/unsave updates
    const [listPosts, setListPosts] = useState([]); 

    const { isLoaded, loadError } = useJsApiLoader({
        googleMapsApiKey: GOOGLE_API_KEY,
        libraries: LIBRARIES,
    });

    // URL se initial parameters lein (Unchanged)
    const searchParams = useMemo(() => {
        const params = new URLSearchParams(location.search);
        return {
            city: params.get("city") || "", 
            latitude: params.get("latitude"),
            longitude: params.get("longitude"),
        };
    }, [location.search]);

    // State jo Filter component ke city input ko control karega (Unchanged)
    const [pinnedLocation, setPinnedLocation] = useState({
        city: searchParams.city,
        lat: searchParams.latitude,
        lng: searchParams.longitude
    });

    // Geocoder ko initialize karein (Unchanged)
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

    // FIX 1: Initial load aur data preparation
    useEffect(() => {
        const setInitialPosts = async () => {
            if (data.postResponse) {
                try {
                    const postResponse = await data.postResponse;
                    const initialPosts = postResponse.data || [];
                    
                    // Assuming your loader returns an array of posts, 
                    // and your Card component handles isSaved status.
                    // If the backend doesn't provide isSaved for the list, 
                    // you'd need a separate call here to fetch saved IDs.
                    // For now, we trust the loader data structure is correct.
                    setListPosts(initialPosts); 
                    
                } catch (err) {
                    console.error("Error setting initial posts:", err);
                }
            }
        };
        setInitialPosts();
    }, [data.postResponse]);

    // FIX 2: Define handleSavePost function to be passed to Card
    const handleSavePost = useCallback(async (post) => {
        if (!currentUser) {
            navigate("/login");
            return;
        }

        const isCurrentlySaved = post.isSaved;

        // Optimistic UI update on the list
        setListPosts(prev => prev.map(p => 
            p.id === post.id ? { ...p, isSaved: !isCurrentlySaved } : p
        ));

        try {
            await apiRequest.post("/users/save", { postId: post.id });
            console.log("Post save status toggled on backend");
        } catch (err) {
            console.error("Failed to save post on List Page:", err);
            
            // Revert UI update on failure
            setListPosts(prev => prev.map(p => 
                p.id === post.id ? { ...p, isSaved: isCurrentlySaved } : p
            ));
            alert("Failed to save place. Please try again.");
        }
    }, [currentUser, navigate]);

    // --- handleMapClick and handleSearchThisArea functions (Unchanged) ---
    const handleMapClick = async (lat, lng) => {
        console.log("Map clicked. Geocoding coordinates...");
        setIsMapSearching(true); 
        try {
            const { locationForSearch } = await getAddressFromCoordinates(lat, lng);
            console.log("Geocoding success. Setting pinned city:", locationForSearch);
            setPinnedLocation({ city: locationForSearch, lat: lat.toString(), lng: lng.toString() }); 
        } catch (error) {
            console.error("Map click geocoding failed:", error);
        } finally {
            setIsMapSearching(false); 
        }
    };
    
    const handleSearchThisArea = async (lat, lng) => {
        console.log("Search This Area button clicked. Searching...");
        setIsMapSearching(true);
        try {
            const { locationForSearch } = await getAddressFromCoordinates(lat, lng);
            
            const currentParams = new URLSearchParams(location.search);
            currentParams.set("city", locationForSearch); 
            currentParams.set("latitude", lat.toString());
            currentParams.set("longitude", lng.toString());

            setPinnedLocation({ city: locationForSearch, lat: lat.toString(), lng: lng.toString() }); 

            navigate(`/list?${currentParams.toString()}`);

        } catch (error) {
            console.error("Map search failed:", error);
        } finally {
            setIsMapSearching(false);
        }
    };
    // --- End handleMapClick/handleSearchThisArea ---
    
    // Loading/Error states (Unchanged)
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
            <div className="headerTextContainer">
                <h1>Find Your Perfect Property</h1>
                <p>Discover a curated collection of premium properties</p>
            </div>
            
            <div className="filterSection">
                <div className="wrapper">
                    <Filter key={pinnedLocation.city} locationFromMap={pinnedLocation} />
                </div>
            </div>

            <Suspense fallback={<PropertiesLoading />}>
                <Await resolve={data.postResponse} errorElement={<p className='error'>Error loading posts!</p>}>
                
                {() => {
                    // Use listPosts from state, not postResponse.data directly, 
                    // as state holds the up-to-date saved status.
                    const posts = listPosts; 
                    
                    const mapCenter = {
                        // Use searchParams/listPosts for initial center
                        lat: searchParams.latitude ? parseFloat(searchParams.latitude) : (posts[0]?.latitude || 28.6139),
                        lng: searchParams.longitude ? parseFloat(searchParams.longitude) : (posts[0]?.longitude || 77.209),
                    };

                    return (
                        <div className="mainContentArea">
                            
                            <div className="mapSection">
                                {isMapSearching && <div className="map-searching-overlay">Locating...</div>}
                                
                                <Map
                                    items={posts} // Use posts from state
                                    selectedItem={selectedPost}
                                    centerLat={mapCenter.lat}
                                    centerLng={mapCenter.lng}
                                    key={location.search} 
                                    onMapClick={handleMapClick} 
                                    onSearchArea={handleSearchThisArea} 
                                    isLoaded={isLoaded}
                                    loadError={loadError}
                                />
                            </div>
                            
                            {/* List Container */}
                            {posts.length > 0 ? (
                                <div className="listContainer">
                                    <h2>All Listings in {searchParams.city || "Area"}</h2>
                                    {posts.map((post) => (
                                        <Card
                                            key={post.id}
                                            item={post}
                                            isHighlighted={post.id === selectedPost?.id}
                                            onClick={() => handleCardSelect(post)}
                                            onSave={handleSavePost} // 👈 THE FIX: Pass the function
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
