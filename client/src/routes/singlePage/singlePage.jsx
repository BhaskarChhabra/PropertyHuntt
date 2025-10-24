import "./singlePage.scss";
import Slider from "../../components/slider/Slider";
import { useLoaderData, Link, useNavigate } from "react-router-dom";
import DOMPurify from "dompurify";
import { useState, useEffect, useContext } from "react";
import apiRequest from "../../lib/apiRequest";
import SinglePostMap from "../../components/map/SinglePostMap.jsx";
import axios from "axios";
import { AuthContext } from "../../context/AuthContext";

// --- [NAYA] Modal ko import karein ---
import AiInsightsModal from "../../components/aiInsightsModal/AiInsightsModal";

// Constants (Unchanged)
const AMENITY_TYPES = [
    { label: "Hospitals", type: "hospital" },
    { label: "Doctors", type: "doctor" },
    { label: "Pharmacies", type: "pharmacy" },
    { label: "School", type: "school" },
    { label: "Restaurant", type: "restaurant" },
    { label: "Transit", type: "transit_station" },
];
const API_BASE_URL = import.meta.env.VITE_API_URL;
const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

// ====================================================================
// PlaceDetailsModal Component (Full Code) - Unchanged
// ====================================================================
const PlaceDetailsModal = ({ place, onClose }) => {
    const [activeTab, setActiveTab] = useState('information');
    const [placeDetails, setPlaceDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchDetails = async () => {
            if (!place || !place.place_id) return;

            setLoading(true);
            setPlaceDetails(null);
            setError(null);

            const fields = [
                'name', 'formatted_address', 'rating', 'user_ratings_total',
                'photos', 'reviews', 'type', 'opening_hours', 'url'
            ];

            const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${place.place_id}&fields=${fields.join(',')}&key=${GOOGLE_API_KEY}`;

            try {
                const res = await axios.get(url);

                if (res.data.status === 'OK') {
                    setPlaceDetails(res.data.result);
                } else {
                    setError(`Google API Error: ${res.data.status}`);
                }
            } catch (err) {
                setError("Failed to fetch detailed place data.");
            } finally {
                setLoading(false);
            }
        };
        fetchDetails();
    }, [place]);

    if (!place) return null;
    const details = placeDetails || place;
    const isOpen = details.opening_hours?.open_now;

    return (
        <div className="modalOverlay" onClick={onClose}>
            <div className="modalContent" onClick={(e) => e.stopPropagation()}>
                <div className="modalHeader">
                    <h2>{details.name || "Place Details"}</h2>
                    <button onClick={onClose} className="closeButton">×</button>
                </div>

                <div className="modalTabs">
                    <button
                        className={activeTab === 'information' ? 'active' : ''}
                        onClick={() => setActiveTab('information')}
                    >Information</button>
                    <button
                        className={activeTab === 'photos' ? 'active' : ''}
                        onClick={() => setActiveTab('photos')}
                        disabled={!details.photos || details.photos.length === 0}
                    >Photos ({details.photos?.length || 0})</button>
                    <button
                        className={activeTab === 'reviews' ? 'active' : ''}
                        onClick={() => setActiveTab('reviews')}
                        disabled={!details.reviews || details.reviews.length === 0}
                    >Reviews ({details.reviews?.length || 0})</button>
                </div>

                <div className="modalBody">
                    {loading && <p className="loading-message">Loading full place details...</p>}
                    {error && <p className="error-message">{error}</p>}

                    {!loading && !error && (
                        <>
                            {activeTab === 'information' && (
                                <div className="scrollableContent">
                                    <p><strong>Address:</strong> {details.formatted_address || details.address || "Address not available."}</p>
                                    <p><strong>Rating:</strong> ⭐ {details.rating || 'N/A'} ({details.user_ratings_total || 0} reviews)</p>
                                    <p><strong>Type:</strong> {details.types?.[0].replace(/_/g, ' ') || details.type?.replace(/_/g, ' ') || 'Establishment'}</p>
                                    <p className={`status ${isOpen === true ? 'open' : isOpen === false ? 'closed' : ''}`}>
                                        Status: {isOpen === true ? 'Open now' : isOpen === false ? 'Closed' : 'Opening hours not available'}
                                    </p>

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
                                    {details.photos && details.photos.length > 0 ? (
                                        details.photos.map((photo, index) => (
                                            <img
                                                key={index}
                                                src={`https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${photo.photo_reference}&key=${GOOGLE_API_KEY}`}
                                                alt={`Photo ${index + 1} of ${details.name}`}
                                                className="placePhoto"
                                                loading="lazy"
                                            />
                                        ))
                                    ) : (
                                        <p>No photos available for this location.</p>
                                    )}
                                </div>
                            )}

                            {activeTab === 'reviews' && (
                                <div className="scrollableContent reviewList">
                                    {details.reviews && details.reviews.length > 0 ? (
                                        details.reviews.map((review, index) => (
                                            <div key={index} className="reviewItem">
                                                <h4>{review.author_name}</h4>
                                                <p className="reviewRating">Rating: {'⭐'.repeat(review.rating || 0)} ({review.rating})</p>
                                                <p>{review.text}</p>
                                                <p className="reviewTime">({review.relative_time_description})</p>
                                            </div>
                                        ))
                                    ) : (
                                        <p>No user reviews available.</p>
                                    )}
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};


// ====================================================================
// AmenitiesList Component (Full Code) - Unchanged
// ====================================================================
const AmenitiesList = ({ post, currentType }) => {
    const [amenities, setAmenities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedPlace, setSelectedPlace] = useState(null);

    useEffect(() => {
        const fetchAmenities = async () => {
            if (!currentType) {
                setAmenities([]);
                setLoading(false);
                return;
            }
            setLoading(true);
            try {
                const res = await axios.get(`${API_BASE_URL}/map/amenities`, {
                    params: {
                        lat: post.latitude,
                        lng: post.longitude,
                        types: [currentType]
                    },
                    proxy: false
                });
                setAmenities(res.data);
            } catch (err) {
                console.error(`Error fetching amenities for ${currentType}:`, err);
                setAmenities([]);
            } finally {
                setLoading(false);
            }
        };
        fetchAmenities();
    }, [post.latitude, post.longitude, currentType]);

    const handleViewDetails = (amenity) => {
        setSelectedPlace({
            ...amenity,
            address: amenity.vicinity || amenity.formatted_address || 'Address not available.',
            user_ratings_total: amenity.user_ratings_total || 0
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
                            <p className="no-amenities-found">No popular {currentType.replace(/_/g, ' ')} found nearby (within 1km radius).</p>
                        ) : (
                            amenities.map((amenity, index) => (
                                <div key={amenity.place_id || index} className="amenityCard">
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
                            ))
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};


// ====================================================================
// SinglePage Component (Main Component - handleSendMessage UPDATED)
// ====================================================================
function SinglePage() {
    const post = useLoaderData();
    const [currentPost, setCurrentPost] = useState(post);
    const [saved, setSaved] = useState(currentPost.isSaved);

    const [selectedAmenityType, setSelectedAmenityType] = useState(AMENITY_TYPES[0].type);
    const navigate = useNavigate();

    const { currentUser } = useContext(AuthContext);

    // --- AI Investment Insights States ---
    const [insights, setInsights] = useState(null);
    const [isLoadingInsights, setIsLoadingInsights] = useState(false);
    const [insightsError, setInsightsError] = useState(null);
    const [investmentGoal, setInvestmentGoal] = useState("5000000");

    const [showInsightsModal, setShowInsightsModal] = useState(false);

    const [showSubscriptionPrompt, setShowSubscriptionPrompt] = useState(false);

    // "See More" State for manual description
    const [isExpanded, setIsExpanded] = useState(false);

    // FIX: Updated handleSave function
    const handleSave = async () => {
        if (!currentUser) {
            navigate("/login");
            return;
        }
        const newSavedState = !saved;
        setSaved(newSavedState);
        setCurrentPost(prev => ({ ...prev, isSaved: newSavedState }));
        try {
            await apiRequest.post("/users/save", { postId: currentPost.id });
            console.log("Post save status toggled on backend");
        } catch (err) {
            console.error("Failed to save post:", err);
            setSaved(!newSavedState);
            setCurrentPost(prev => ({ ...prev, isSaved: !newSavedState }));
            alert("Failed to save post. Please try again.");
        }
    };

    // --- 👇 UPDATED FUNCTION ---
    const handleSendMessage = async () => {
        if (!currentUser) {
            navigate("/login");
            return;
        }
        // Basic check for necessary post data
        if (!currentPost || !currentPost.userId || !currentPost.id) {
             console.error("Missing post data required to start chat.");
             alert("Cannot start chat. Post information is incomplete.");
             return;
        }
        try {
            // Call API to create/find the chat
            const res = await apiRequest.post("/chats", {
                receiverId: currentPost.userId,
                postId: currentPost.id
            });

            // --- 👇 PASS CHAT INFO TO /chat route ---
            if (res.data) {
                const chatData = res.data; // API response should be the chat object
                console.log("Chat created/found, navigating to /chat with state:", chatData);

                // Navigate to /chat and pass the chat object in state
                navigate("/chat", {
                    state: {
                        openChat: chatData // Pass the chat object
                    }
                });
            } else {
                 console.error("Failed to get chat data from API response after creating/finding chat.");
                 alert("Could not retrieve chat details. Please try again.");
            }
            // --- 👆 END PASSING INFO ---

        } catch (err) {
            console.error("Failed to start or find chat:", err);
            alert("Failed to start chat. Please try again or check your connection.");
        }
    };
    // --- 👆 END UPDATED FUNCTION ---

    const handleGetInsights = async () => {
        // ... (Keep existing handleGetInsights logic)
         if (!investmentGoal || isNaN(Number(investmentGoal)) || Number(investmentGoal) <= 0) {
            setInsightsError("Please enter a valid positive numeric investment goal.");
            setShowInsightsModal(true);
            return;
        }

        setShowInsightsModal(true);

        setIsLoadingInsights(true);
        setInsightsError(null);
        setInsights(null);
        setShowSubscriptionPrompt(false);

        const payload = {
            title: currentPost.title,
            price: currentPost.price,
            type: currentPost.type,
            address: currentPost.address,
            size: currentPost.postDetail?.size,
            goal: Number(investmentGoal),
            city: currentPost.city
        };

        try {
            const res = await apiRequest.post("/ai/insights", payload);
            setInsights(res.data.analysis);
        } catch (err) {
            console.error("Failed to generate AI insights:", err);
            if (err.response && err.response.status === 403 && err.response.data?.requireSubscription) {
                setInsightsError("Premium subscription required.");
                setShowSubscriptionPrompt(true);
            } else {
               const errorMsg = err.response?.data?.message || "Failed to fetch AI insights.";
               setInsightsError(errorMsg);
            }
        } finally {
            setIsLoadingInsights(false);
        }
    };

    // Description Logic
    const descriptionText = currentPost.postDetail?.desc || "No description provided.";
    const needsTruncation = descriptionText.length > 500;

    // Added check for post data before rendering
     if (!currentPost) {
       return <div>Loading property details...</div>; // Or redirect, or show error
     }

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
                        setInsights(null);
                        setInsightsError(null);
                    }}
                />
            )}

            {/* Slider */}
            <div className="fullWidthSlider">
                {/* Ensure images is an array before passing */}
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
                                    <h1 className="mainTitle">{currentPost.title}</h1>
                                    <div className="price">₹ {(currentPost.price || 0).toLocaleString('en-IN')} {currentPost.type === 'rent' ? '/month' : ''}</div>
                                    <div className="address">
                                        <img src="/pin.png" alt="Location Pin" />
                                        <span>{currentPost.address}</span>
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
                                <div className="featureBox"> <img src="/fee.png" alt="Income Policy" /> <div className="featureText"><span>Property Fees</span><p>{currentPost.postDetail?.income || "N/A"}</p></div> </div>
                                <div className="featureBox"> <img src="/size.png" alt="Property Size" /> <div className="featureText"><span>Size</span><p>{currentPost.postDetail?.size ? `${currentPost.postDetail.size} sqft` : "N/A"}</p></div> </div>
                            </div>

                            {/* Room Sizes & Nearby */}
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
                                    />
                                    <button onClick={handleGetInsights} disabled={isLoadingInsights} className="ai-report-btn">
                                        {isLoadingInsights ? "Analyzing..." : "💎 Generate AI Report"}
                                    </button>
                                </div>
                            </div>
                            {/* Action Buttons */}
                            <div className="buttons section-buttons">
                                {/* Ensure currentUser exists before rendering */}
                                {currentUser && (
                                     <button onClick={handleSendMessage} className="contact-btn"> <img src="/chat.png" alt="Chat" /> Contact Landlord </button>
                                )}
                                {/* Render save button only if user is logged in */}
                                {currentUser && (
                                    <button onClick={handleSave} className={`save-btn ${saved ? 'saved' : ''}`}>
                                        <img src="/save.png" alt="Save" /> {saved ? "Place Saved" : "Save Place"}
                                    </button>
                                )}
                                {/* Optionally, show login prompt if not logged in */}
                                 {!currentUser && (
                                     <Link to="/login" state={{ from: `/ ${currentPost.id}` }} className="login-prompt-btn">Login to Contact or Save</Link>
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
                            <select className="distanceDropdown" defaultValue="1000">
                                 <option value="500">Within 500m</option>
                                 <option value="1000">Within 1km</option>
                                 <option value="2000">Within 2km</option>
                            </select>
                        </div>
                        {/* Map and List */}
                        <div className="amenityMapLayout">
                             <div className="amenityListContainer">
                                 <p className="amenity-list-heading">{ AMENITY_TYPES.find(a=>a.type===selectedAmenityType)?.label || 'Nearby Places' }</p>
                                 {/* Pass necessary props */}
                                 <AmenitiesList post={currentPost} currentType={selectedAmenityType} />
                             </div>
                             <div className="mapContainer">
                                 {/* Ensure post has lat/lng before rendering map */}
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
