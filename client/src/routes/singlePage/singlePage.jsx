import "./singlePage.scss";
import Slider from "../../components/slider/Slider";
import { useLoaderData, Link, useNavigate } from "react-router-dom";
import DOMPurify from "dompurify";
import { useState, useEffect, useContext } from "react";
import apiRequest from "../../lib/apiRequest"; // Your backend API request helper
import SinglePostMap from "../../components/map/SinglePostMap.jsx";
// Removed axios import as apiRequest should handle it, or keep if needed elsewhere
// import axios from "axios";
import { AuthContext } from "../../context/AuthContext";
import AiInsightsModal from "../../components/aiInsightsModal/AiInsightsModal";

// Constants
const AMENITY_TYPES = [
    { label: "Hospitals", type: "hospital" },
    { label: "Doctors", type: "doctor" },
    { label: "Pharmacies", type: "pharmacy" },
    { label: "School", type: "school" },
    { label: "Restaurant", type: "restaurant" },
    { label: "Transit", type: "transit_station" },
];
// Removed API_BASE_URL and GOOGLE_API_KEY as they are mainly used in backend now

// ====================================================================
// PlaceDetailsModal Component (CORS FIX APPLIED)
// ====================================================================
const PlaceDetailsModal = ({ place, onClose }) => {
    const [activeTab, setActiveTab] = useState('information');
    const [placeDetails, setPlaceDetails] = useState(null); // Stores detailed data from backend
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchDetails = async () => {
            if (!place || !place.place_id) return;

            setLoading(true);
            setPlaceDetails(null);
            setError(null);

            // --- 👇 CALL YOUR BACKEND PROXY INSTEAD OF GOOGLE DIRECTLY ---
            try {
                // Use your apiRequest helper to call your backend endpoint
                // Ensure the path '/map/details' matches your backend route
                const res = await apiRequest.get(`/map/details?placeId=${place.place_id}`);

                // Your backend returns the 'result' object directly
                setPlaceDetails(res.data);
                console.log("Fetched Place Details from Backend:", res.data);

            } catch (err) {
                console.error("Failed to fetch detailed place data via backend:", err);
                const errorMsg = err.response?.data?.message || "Failed to fetch place details.";
                setError(errorMsg);
            } finally {
                setLoading(false);
            }
            // --- 👆 END BACKEND CALL ---
        };
        fetchDetails();
    }, [place]); // Re-fetch when the place prop changes

    if (!place) return null;

    // Use fetched details if available, otherwise fallback to initial place data
    const details = placeDetails || place;
    // Safely check opening_hours and open_now
    const isOpen = details.opening_hours?.open_now;
    // Get photo URL (using Google API key directly here is okay for constructing image URLs)
    const getPhotoUrl = (photoRef) => {
        const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY; // Get key here just for photo URL
        if (!photoRef || !apiKey) return "/noimg.png"; // Fallback image
        return `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${photoRef}&key=${apiKey}`;
    }


    return (
        <div className="modalOverlay" onClick={onClose}>
            <div className="modalContent" onClick={(e) => e.stopPropagation()}>
                <div className="modalHeader">
                    <h2>{details.name || "Place Details"}</h2>
                    <button onClick={onClose} className="closeButton" aria-label="Close modal">×</button>
                </div>

                <div className="modalTabs">
                    <button
                        className={activeTab === 'information' ? 'active' : ''}
                        onClick={() => setActiveTab('information')}
                    >Information</button>
                    <button
                        className={activeTab === 'photos' ? 'active' : ''}
                        onClick={() => setActiveTab('photos')}
                        // Disable if no photos array or it's empty
                        disabled={!Array.isArray(details.photos) || details.photos.length === 0}
                    >Photos ({details.photos?.length || 0})</button>
                    <button
                        className={activeTab === 'reviews' ? 'active' : ''}
                        onClick={() => setActiveTab('reviews')}
                         // Disable if no reviews array or it's empty
                        disabled={!Array.isArray(details.reviews) || details.reviews.length === 0}
                    >Reviews ({details.reviews?.length || 0})</button>
                </div>

                <div className="modalBody">
                    {loading && <p className="loading-message">Loading place details...</p>}
                    {error && <p className="error-message">{error}</p>}

                    {!loading && !error && placeDetails && ( // Ensure placeDetails are loaded
                        <>
                            {activeTab === 'information' && (
                                <div className="scrollableContent">
                                    <p><strong>Address:</strong> {details.formatted_address || details.address || "N/A"}</p>
                                    <p><strong>Rating:</strong> ⭐ {details.rating || 'N/A'} ({details.user_ratings_total || 0} reviews)</p>
                                    {/* Safely access types array */}
                                    <p><strong>Type:</strong> {(details.types?.[0]?.replace(/_/g, ' ') || details.type?.replace(/_/g, ' ') || 'Establishment').toLocaleUpperCase()}</p>
                                    <p className={`status ${isOpen === true ? 'open' : isOpen === false ? 'closed' : ''}`}>
                                        Status: {isOpen === true ? 'Open now' : isOpen === false ? 'Closed' : 'Hours unavailable'}
                                    </p>
                                    {/* Display phone number if available */}
                                    {details.formatted_phone_number && <p><strong>Phone:</strong> <a href={`tel:${details.formatted_phone_number}`}>{details.formatted_phone_number}</a></p>}
                                     {/* Display website if available */}
                                    {details.website && <p><strong>Website:</strong> <a href={details.website} target="_blank" rel="noopener noreferrer">{details.website}</a></p>}

                                    {details.opening_hours?.weekday_text && (
                                        <div className="hours-list">
                                            <h4>Opening Hours:</h4>
                                            <ul>
                                                {details.opening_hours.weekday_text.map((day, index) => (
                                                    <li key={index}>{day}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                    {details.url && <p><a href={details.url} target="_blank" rel="noopener noreferrer">View on Google Maps</a></p>}
                                </div>
                            )}

                            {activeTab === 'photos' && (
                                <div className="scrollableContent photoGrid">
                                    {/* Ensure photos is an array and has items */}
                                    {Array.isArray(details.photos) && details.photos.length > 0 ? (
                                        details.photos.map((photo, index) => (
                                            <img
                                                key={index}
                                                // Use helper function to construct URL
                                                src={getPhotoUrl(photo.photo_reference)}
                                                alt={`Photo ${index + 1} of ${details.name || 'place'}`}
                                                className="placePhoto"
                                                loading="lazy"
                                                // Add a simple error handler for broken images
                                                onError={(e) => e.currentTarget.src = '/noimg.png'}
                                            />
                                        ))
                                    ) : (
                                        <p>No photos available.</p>
                                    )}
                                </div>
                            )}

                            {activeTab === 'reviews' && (
                                <div className="scrollableContent reviewList">
                                     {/* Ensure reviews is an array and has items */}
                                    {Array.isArray(details.reviews) && details.reviews.length > 0 ? (
                                        details.reviews.map((review, index) => (
                                            <div key={index} className="reviewItem">
                                                <h4>{review.author_name}</h4>
                                                <p className="reviewRating">Rating: {'⭐'.repeat(review.rating || 0)} ({review.rating})</p>
                                                <p>{review.text}</p>
                                                <p className="reviewTime">({review.relative_time_description})</p>
                                            </div>
                                        ))
                                    ) : (
                                        <p>No reviews available.</p>
                                    )}
                                </div>
                            )}
                        </>
                    )}
                     {/* Show message if details failed to load and not loading */}
                     {!loading && !placeDetails && !error && (
                         <p>Could not load details for this place.</p>
                     )}
                </div>
            </div>
        </div>
    );
};


// ====================================================================
// AmenitiesList Component (No Changes Needed Here)
// ====================================================================
const AmenitiesList = ({ post, currentType }) => {
    // ... (Keep existing AmenitiesList logic using axios or apiRequest to call /map/amenities) ...
     const [amenities, setAmenities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedPlace, setSelectedPlace] = useState(null);

    useEffect(() => {
        const fetchAmenities = async () => {
            if (!currentType || !post?.latitude || !post?.longitude) { // Added checks for post lat/lng
                setAmenities([]);
                setLoading(false);
                return;
            }
            setLoading(true);
            try {
                 // Using apiRequest assuming it's configured for GET with params
                 const res = await apiRequest.get(`/map/amenities`, {
                     params: {
                         lat: post.latitude,
                         lng: post.longitude,
                         types: currentType // Pass single type
                     }
                 });
                setAmenities(res.data || []); // Ensure data is an array
            } catch (err) {
                console.error(`Error fetching amenities for ${currentType}:`, err);
                setAmenities([]);
            } finally {
                setLoading(false);
            }
        };
        fetchAmenities();
    }, [post?.latitude, post?.longitude, currentType]); // Use optional chaining for dependencies

    const handleViewDetails = (amenity) => {
        // Pass minimal necessary info to trigger modal fetch
        setSelectedPlace({
            place_id: amenity.place_id,
            name: amenity.name, // Pass name for initial header display
            // Don't pass potentially outdated details like address/rating here
        });
    };

    if (!currentType) return <p className="select-prompt">Select an amenity type above to see details.</p>;
    if (loading) return <p className="loading-list">Searching for {currentType.replace(/_/g, ' ')}...</p>;

    return (
        <>
            {selectedPlace && <PlaceDetailsModal place={selectedPlace} onClose={() => setSelectedPlace(null)} />}

            <div className="amenitiesList">
                <div className="amenityGroup">
                    <div className="amenityCards">
                        {amenities.length === 0 ? (
                            <p className="no-amenities-found">No popular {currentType.replace(/_/g, ' ')} found nearby (within 1km).</p>
                        ) : (
                             // Ensure amenities is an array before mapping
                            Array.isArray(amenities) && amenities.map((amenity) => (
                                // Add check for amenity and place_id
                                amenity && amenity.place_id && (
                                     <div key={amenity.place_id} className="amenityCard">
                                        <div className="cardInfo">
                                            <h4>{amenity.name}</h4>
                                            <p className="rating">⭐ {amenity.rating || 'N/A'} ({amenity.user_ratings_total || 0} reviews)</p>
                                        </div>
                                        <button
                                            className="detailButton"
                                            onClick={() => handleViewDetails(amenity)}
                                        >
                                            View Details
                                        </button>
                                     </div>
                                )
                            ))
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};


// ====================================================================
// SinglePage Component (Main Component - No Major Changes)
// ====================================================================
function SinglePage() {
    // ... (Keep existing state, handlers: handleSave, handleSendMessage, handleGetInsights) ...
    const post = useLoaderData();
    const [currentPost, setCurrentPost] = useState(post);
    const [saved, setSaved] = useState(currentPost?.isSaved || false); // Default to false if post is invalid initially

    const [selectedAmenityType, setSelectedAmenityType] = useState(AMENITY_TYPES[0]?.type || null); // Default to first type or null
    const navigate = useNavigate();

    const { currentUser } = useContext(AuthContext);

    // AI States
    const [insights, setInsights] = useState(null);
    const [isLoadingInsights, setIsLoadingInsights] = useState(false);
    const [insightsError, setInsightsError] = useState(null);
    const [investmentGoal, setInvestmentGoal] = useState("5000000");
    const [showInsightsModal, setShowInsightsModal] = useState(false);
    // Removed showSubscriptionPrompt state as modal handles it

    // Description State
    const [isExpanded, setIsExpanded] = useState(false);

    // Update local state if loader data changes (e.g., navigating between posts)
     useEffect(() => {
        if (post) {
             setCurrentPost(post);
             setSaved(post.isSaved || false);
        }
     }, [post]);


    const handleSave = async () => {
        if (!currentUser) { navigate("/login"); return; }
        if (!currentPost?.id) return; // Don't save if no valid post

        const newSavedState = !saved;
        setSaved(newSavedState);
        // Optimistically update currentPost state as well
        setCurrentPost(prev => prev ? ({ ...prev, isSaved: newSavedState }) : null);

        try {
            await apiRequest.post("/users/save", { postId: currentPost.id });
            console.log("Post save status toggled on backend");
        } catch (err) {
            console.error("Failed to save post:", err);
            // Revert UI on error
            setSaved(!newSavedState);
             setCurrentPost(prev => prev ? ({ ...prev, isSaved: !newSavedState }) : null);
            alert("Failed to save post. Please try again.");
        }
    };

    const handleSendMessage = async () => {
        if (!currentUser) { navigate("/login"); return; }
        if (!currentPost?.userId || !currentPost?.id) {
             alert("Cannot start chat. Post information incomplete."); return;
        }
        try {
            const res = await apiRequest.post("/chats", {
                receiverId: currentPost.userId,
                postId: currentPost.id
            });
            if (res.data) {
                navigate("/chat", { state: { openChat: res.data } });
            } else {
                 alert("Could not retrieve chat details.");
            }
        } catch (err) {
            console.error("Failed to start chat:", err);
            alert("Failed to start chat. Please try again.");
        }
    };

    const handleGetInsights = async () => {
        // ... (Keep existing handleGetInsights logic, ensure checks for currentPost) ...
         if (!currentPost) return; // Ensure post data is available

        if (!investmentGoal || isNaN(Number(investmentGoal)) || Number(investmentGoal) <= 0) {
            setInsightsError("Please enter a valid positive numeric investment goal.");
            setShowInsightsModal(true);
            return;
        }

        setShowInsightsModal(true);
        setIsLoadingInsights(true);
        setInsightsError(null);
        setInsights(null);
        // setShowSubscriptionPrompt(false); // Removed, handled by error check

        const payload = {
            title: currentPost.title, price: currentPost.price, type: currentPost.type,
            address: currentPost.address, size: currentPost.postDetail?.size,
            goal: Number(investmentGoal), city: currentPost.city
        };

        try {
            const res = await apiRequest.post("/ai/insights", payload);
            setInsights(res.data.analysis);
        } catch (err) {
            console.error("Failed to generate AI insights:", err);
             // Check specific error for subscription required (adjust status/code if needed)
             if (err.response && err.response.status === 403) {
                 setInsightsError("Premium subscription required to generate AI reports.");
                 // No need for separate state, modal can display link based on error message content
             } else {
                const errorMsg = err.response?.data?.message || "Failed to fetch AI insights.";
                setInsightsError(errorMsg);
             }
        } finally {
            setIsLoadingInsights(false);
        }
    };

    // Return loading state if post data isn't available yet
    if (!currentPost) {
        return <div className="loading-page">Loading property details...</div>;
    }

    // Prepare description text safely
    const descriptionText = currentPost.postDetail?.desc || "No description provided.";
    const needsTruncation = descriptionText.length > 500; // Example length

    return (
        <div className="singlePage">

            {showInsightsModal && (
                <AiInsightsModal
                    data={insights}
                    isLoading={isLoadingInsights}
                    error={insightsError}
                    propertyTitle={currentPost.title}
                    onClose={() => {
                        setShowInsightsModal(false);
                        // Reset AI state when closing modal
                        setInsights(null);
                        setInsightsError(null);
                        setIsLoadingInsights(false);
                    }}
                />
            )}

            {/* Slider */}
            <div className="fullWidthSlider">
                 {/* Ensure images is always an array */}
                <Slider images={Array.isArray(currentPost.images) ? currentPost.images : []} />
            </div>

            <div className="contentWrapper">
                {/* Top Section */}
                <div className="twoColumnLayout">

                    {/* Left Column: Details */}
                    <div className="details">
                        <div className="details-content-wrapper">
                            <div className="top-content">
                                <div className="infoSection">
                                    <h1 className="mainTitle">{currentPost.title || 'Property Title'}</h1>
                                    {/* Ensure price exists */}
                                    <div className="price">₹ {(currentPost.price || 0).toLocaleString('en-IN')} {currentPost.type === 'rent' ? '/month' : ''}</div>
                                    <div className="address">
                                        <img src="/pin.png" alt="Location Pin" />
                                        <span>{currentPost.address || 'Address unavailable'}</span>
                                    </div>
                                    <div className="roomFeatures">
                                        <div className="featureItem"> <img src="/bed.png" alt="Beds" /> <span>{currentPost.bedroom || 'N/A'} Bed(s)</span> </div>
                                        <div className="featureItem"> <img src="/bath.png" alt="Bath" /> <span>{currentPost.bathroom || 'N/A'} Bath(s)</span> </div>
                                    </div>
                                </div>

                                <h3 className="sectionTitle">Property Description</h3>
                                <p
                                    className={`description ${!isExpanded && needsTruncation ? 'truncated' : ''}`}
                                    dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(descriptionText) }}
                                ></p>
                                {needsTruncation && (
                                    <button className="see-more-btn" onClick={() => setIsExpanded(prev => !prev)}>
                                        {isExpanded ? "Show Less" : "Show More"}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Features */}
                    <div className="features">
                        <div className="wrapper">

                            {/* General Features */}
                            <p className="title">General Features</p>
                            <div className="generalFeaturesGrid">
                                <div className="featureBox"> <img src="/utility.png" alt="Utility" /> <div className="featureText"><span>Utilities</span><p>{currentPost.postDetail?.utilities || "N/A"}</p></div> </div>
                                <div className="featureBox"> <img src="/pet.png" alt="Pet Policy" /> <div className="featureText"><span>Pet Policy</span><p>{currentPost.postDetail?.pet || "N/A"}</p></div> </div>
                                <div className="featureBox"> <img src="/fee.png" alt="Property Fees" /> <div className="featureText"><span>Property Fees</span><p>{currentPost.postDetail?.income || "N/A"}</p></div> </div>
                                <div className="featureBox"> <img src="/size.png" alt="Property Size" /> <div className="featureText"><span>Size</span><p>{currentPost.postDetail?.size ? `${currentPost.postDetail.size} sqft` : "N/A"}</p></div> </div>
                            </div>

                            {/* Nearby Distances */}
                            <p className="title">Nearby Distances (approx. meters)</p>
                            <div className="roomSizeInfo">
                                <div className="detail-item"><span>School:</span><span className="value">{currentPost.postDetail?.school ? `${currentPost.postDetail.school}m` : "N/A"}</span></div>
                                <div className="detail-item"><span>Bus Stop:</span><span className="value">{currentPost.postDetail?.bus ? `${currentPost.postDetail.bus}m` : "N/A"}</span></div>
                                <div className="detail-item"><span>Restaurant:</span><span className="value">{currentPost.postDetail?.restaurant ? `${currentPost.postDetail.restaurant}m` : "N/A"}</span></div>
                            </div>


                            <div className="aiCtaSection">
                                <p>Get a detailed AI-powered investment report for this property.</p>
                                <div className="ai-input-group">
                                    <span>Target ₹</span>
                                    <input
                                        type="number"
                                        placeholder="e.g., 5000000"
                                        value={investmentGoal}
                                        onChange={(e) => setInvestmentGoal(e.target.value)}
                                        disabled={isLoadingInsights}
                                        aria-label="Investment Goal Input"
                                    />
                                    <button onClick={handleGetInsights} disabled={isLoadingInsights} className="ai-report-btn">
                                        {isLoadingInsights ? "Analyzing..." : "💎 Generate AI Report"}
                                    </button>
                                </div>
                            </div>
                            {/* Action Buttons */}
                            <div className="buttons section-buttons">
                                {/* Only show buttons if user is logged in */}
                                {currentUser && (
                                     <>
                                        <button onClick={handleSendMessage} className="contact-btn"> <img src="/chat.png" alt="Chat" /> Contact Landlord </button>
                                        <button onClick={handleSave} className={`save-btn ${saved ? 'saved' : ''}`}>
                                            <img src="/save.png" alt="Save" /> {saved ? "Place Saved" : "Save Place"}
                                        </button>
                                     </>
                                )}
                                {/* Show login prompt if not logged in */}
                                {!currentUser && (
                                     <Link
                                         to="/login"
                                         // Pass current location to redirect back after login
                                         state={{ from: location.pathname }}
                                         className="login-prompt-btn"
                                     >
                                         Login to Contact or Save
                                     </Link>
                                )}
                            </div>


                        </div>
                    </div>
                </div> {/* End twoColumnLayout */}

                {/* Bottom Section (Map/Amenities) */}
                <div className="fullWidthSection">
                    <div className="wrapper">
                        <p className="title map-amenities-title">Nearby Services Finder</p>
                        {/* Amenity Filters */}
                        <div className="amenityFilterButtons">
                            <div className="buttonRow">
                                {AMENITY_TYPES.map(a => ( <button key={a.type} onClick={() => setSelectedAmenityType(a.type)} className={selectedAmenityType === a.type ? 'active' : ''}> {a.label} </button> ))}
                            </div>
                             {/* Removed distance dropdown as it wasn't used in API call */}
                            {/* <select className="distanceDropdown" defaultValue="1000"> ... </select> */}
                        </div>
                        {/* Map and List */}
                        <div className="amenityMapLayout">
                             <div className="amenityListContainer">
                                 <p className="amenity-list-heading">{ AMENITY_TYPES.find(a=>a.type===selectedAmenityType)?.label || 'Nearby Places' }</p>
                                 {/* Ensure post is passed */}
                                 {currentPost && <AmenitiesList post={currentPost} currentType={selectedAmenityType} />}
                             </div>
                             <div className="mapContainer">
                                 {/* Ensure post has lat/lng */}
                                 {currentPost.latitude && currentPost.longitude && (
                                     <SinglePostMap post={currentPost} selectedType={selectedAmenityType} />
                                 )}
                             </div>
                        </div>
                    </div>
                </div> {/* End fullWidthSection */}
            </div> {/* End contentWrapper */}
        </div> // End singlePage
    );
}

export default SinglePage;

