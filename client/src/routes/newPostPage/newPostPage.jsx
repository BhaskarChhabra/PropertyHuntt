import { useState, useEffect, useRef } from "react";
import "./newPostPage.scss";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import apiRequest from "../../lib/apiRequest";
import UploadWidget from "../../components/uploadWidget/UploadWidget";
import { useNavigate } from "react-router-dom";
import { useJsApiLoader } from "@react-google-maps/api"; 
import LocationPinningMap from "../../components/map/LocationPinningMap.jsx"; 
import axios from "axios"; // 🛑 Necessary for the external AI API call

const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY; 
const LIBRARIES = ["places"];
// NOTE: Assuming VITE_API_URL is like 'http://localhost:8800/api/posts'
const API_BASE_URL_ROOT = import.meta.env.VITE_API_URL.replace('/posts', ''); 

// --- Reusable Google Geocoding/Reverse Geocoding Helpers (MUST be defined outside the component) ---
let geocoder = null;
const initGeocoder = () => {
    if (window.google && window.google.maps && !geocoder) {
        geocoder = new window.google.maps.Geocoder();
    }
};

const getAddressFromCoordinates = (lat, lon) => {
    return new Promise((resolve, reject) => {
        if (!geocoder) {
            reject("Google Geocoder not initialized.");
            return;
        }
        geocoder.geocode({ location: { lat, lng: lon } }, (results, status) => {
            if (status === "OK" && results[0]) {
                const fullAddress = results[0].formatted_address;
                const cityComponent = results[0].address_components.find(c => 
                    c.types.includes('locality') || c.types.includes('postal_town')
                );
                resolve({
                    address: fullAddress,
                    city: cityComponent ? cityComponent.long_name : '',
                });
            } else {
                reject(`Reverse geocode failed: ${status}`);
            }
        });
    });
};
// --- END Geocoding Helpers ---


function NewPostPage() { 
    const { isLoaded } = useJsApiLoader({
        googleMapsApiKey: GOOGLE_API_KEY,
        libraries: LIBRARIES,
    });
    
    // 🛑 NEW STATES for AI Generation
    const [aiLoading, setAiLoading] = useState(false);
    const [aiError, setAiError] = useState(null);
    const formRef = useRef(null); // Ref to access all form data easily

    const [value, setValue] = useState(""); // ReactQuill content
    const [images, setImages] = useState([]);
    const [error, setError] = useState("");
    const [autoLat, setAutoLat] = useState("");
    const [autoLon, setAutoLon] = useState("");
    const [autoAddress, setAutoAddress] = useState("");
    const [autoCity, setAutoCity] = useState("");

    const navigate = useNavigate();
    const addressInputRef = useRef(null); 
    const autocomplete = useRef(null); 

    // ... (useEffect for Autocomplete and Geocoder initialization remains here) ...
    useEffect(() => {
        if (isLoaded) {
            initGeocoder();
            
            if (addressInputRef.current && !autocomplete.current) {
                autocomplete.current = new window.google.maps.places.Autocomplete(addressInputRef.current, {
                    types: ['address'],
                    componentRestrictions: { country: 'in' }, 
                });

                autocomplete.current.addListener('place_changed', () => {
                    const place = autocomplete.current.getPlace();
                    if (place.geometry) {
                        const lat = place.geometry.location.lat();
                        const lon = place.geometry.location.lng();
                        const address = place.formatted_address || place.name;
                        const cityComponent = place.address_components.find(c => 
                            c.types.includes('locality') || c.types.includes('postal_town')
                        );
                        const city = cityComponent ? cityComponent.long_name : '';
                        
                        setAutoLat(lat);
                        setAutoLon(lon);
                        setAutoAddress(address);
                        setAutoCity(city);
                    }
                });
            }
        }
    }, [isLoaded]);
    
    const handleMapPin = async (latitude, longitude) => {
        setAutoLat(latitude);
        setAutoLon(longitude);
        
        try {
            const addressData = await getAddressFromCoordinates(latitude, longitude);
            if (addressData) {
                setAutoAddress(addressData.address);
                setAutoCity(addressData.city);
            } else {
                setAutoAddress("Approximate Location (Address not found)");
                setAutoCity("");
            }
        } catch (err) {
            console.error("Failed to reverse geocode location", err);
            setAutoAddress(""); 
            setAutoCity("");
        }
    };

    const handleUseMyLocation = () => {
        if (!navigator.geolocation) {
            alert("Geolocation is not supported by your browser");
            return;
        }
        if (!isLoaded) {
            alert("Map services are still loading, please wait a moment.");
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                handleMapPin(latitude, longitude); 
            },
            (error) => {
                alert("Unable to retrieve your location: " + error.message);
                console.error(error);
            }
        );
    };

    // 🛑 NEW AI GENERATION HANDLER FUNCTION
    const handleGenerateAI = async () => {
        setAiError(null);
        
        // 1. Collect form data using the ref
        const formData = new FormData(formRef.current);
        const inputs = Object.fromEntries(formData);
        
        // 2. Validation check (ensure necessary fields are filled)
        if (!inputs.title || !inputs.price || !autoAddress || !inputs.bedroom || !inputs.bathroom) {
            setAiError("Please fill Title, Price, Address, Bedrooms, and Bathrooms before generating AI description.");
            return;
        }

        setAiLoading(true);

        try {
            // 3. Prepare payload for backend (Handling type conversion for safety)
            const payload = {
                title: inputs.title,
                price: parseInt(inputs.price) || 0,
                type: inputs.type,
                bedroom: parseInt(inputs.bedroom) || 1,
                bathroom: parseInt(inputs.bathroom) || 1,
                address: autoAddress,
                details: {
                    utilities: inputs.utilities,
                    pet: inputs.pet,
                    income: inputs.income,
                    // Using tertiary operator to ensure fields that expect INT are sent as INT or NULL (for optional fields)
                    size: inputs.size ? parseInt(inputs.size) : null, 
                    school: inputs.school ? parseInt(inputs.school) : null,
                    bus: inputs.bus ? parseInt(inputs.bus) : null,
                    // NOTE: restaurant: inputs.restaurant (kept as string/number for AI prompt, will be fixed below for submission)
                    restaurant: inputs.restaurant, 
                },
            };

            // 4. Call the backend AI endpoint (Fixed URL from previous step)
            const res = await axios.post(`${API_BASE_URL_ROOT}/ai/describe`, payload); 

            // 5. Populate the ReactQuill editor with the generated description
            if (res.data.description) {
                setValue(res.data.description);
                setAiError(null);
            } else {
                setAiError("AI returned an empty description.");
            }

        } catch (err) {
            console.error("AI Generation Failed:", err);
            // Use the fallback description from the server if available
            const fallbackDesc = err.response?.data?.description || "Failed to contact AI service. Check server logs.";
            setAiError(fallbackDesc);
        } finally {
            setAiLoading(false);
        }
    };

    // 🛑 Existing Submission Handler (Fixed Prisma type errors here)
    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const inputs = Object.fromEntries(formData);
        
        if (!autoLat || !autoLon) {
            setError("Please ensure a location is selected using Autocomplete, the map, or 'Use Location'.");
            return;
        }

        try {
            // Helper function to safely parse optional number fields for Prisma
            const safeParseInt = (val) => val ? parseInt(val) : null;

            const res = await apiRequest.post("/posts", {
                postData: {
                    title: inputs.title,
                    price: parseInt(inputs.price),
                    address: autoAddress, 
                    city: autoCity, 
                    bedroom: parseInt(inputs.bedroom),
                    bathroom: parseInt(inputs.bathroom),
                    type: inputs.type,
                    property: inputs.property,
                    latitude: autoLat.toString(), 
                    longitude: autoLon.toString(), 
                    images: images,
                },
                postDetail: {
                    // Use the state value (which holds the AI or manual input)
                    desc: value, 
                    utilities: inputs.utilities,
                    pet: inputs.pet,
                    income: inputs.income,
                    size: safeParseInt(inputs.size),
                    school: safeParseInt(inputs.school),
                    bus: safeParseInt(inputs.bus),
                    // 🛑 FINAL FIX for Prisma error: Ensure restaurant is INT or NULL
                    restaurant: safeParseInt(inputs.restaurant), 
                },
            });

            navigate("/" + res.data.id);
        } catch (err) {
            console.log(err);
            setError("Failed to create post. Check console for details.");
        }
    };


    if (!isLoaded) return <div>Loading Google Maps services...</div>;

    return (
        <div className="newPostPage">
            <div className="formContainer">
                <div className="headerWithButton">
                    <h1>Add New Post</h1>
                    <button type="button" className="useLocationBtn" onClick={handleUseMyLocation}>
                        Use Current Location
                    </button>
                </div>
                <div className="wrapper">
                    <form onSubmit={handleSubmit} ref={formRef}> {/* 🛑 Attach form ref */}
                        
                        <div className="item">
                            <label htmlFor="title">Title</label>
                            <input id="title" name="title" type="text" />
                        </div>
                        <div className="item">
                            <label htmlFor="price">Price</label>
                            <input id="price" name="price" type="number" />
                        </div>
                        <div className="item">
                            <label htmlFor="address">Complete Address (Autocomplete)</label>
                            <input
                                id="address"
                                name="address"
                                type="text"
                                ref={addressInputRef} 
                                value={autoAddress}
                                onChange={(e) => setAutoAddress(e.target.value)}
                                placeholder="Start typing the address (Google Autocomplete)"
                            />
                        </div>
                        
                        <div className="item description">
                            <div className="description-header">
                                <label htmlFor="desc">Description</label>
                                {/* 🛑 AI GENERATION BUTTON */}
                                <button
                                    type="button"
                                    onClick={handleGenerateAI}
                                    className={`ai-generate-btn ${aiLoading ? 'loading' : ''}`}
                                    disabled={aiLoading}
                                >
                                    {aiLoading ? 'Generating...' : 'Generate with AI ✨'}
                                </button>
                            </div>

                            <ReactQuill theme="snow" onChange={setValue} value={value} />
                            {aiError && <span className="ai-error">{aiError}</span>}
                        </div>

                        <div className="item">
                            <label htmlFor="city">City (Autofilled)</label>
                            <input
                                id="city"
                                name="city"
                                type="text"
                                value={autoCity}
                                onChange={(e) => setAutoCity(e.target.value)}
                                placeholder="City"
                            />
                        </div>
                        
                        {/* ... (Map and Location Pinning section remains here) ... */}
                        <div className="item full-width-map">
                            <label>Or Pin Location Manually</label>
                            <LocationPinningMap 
                                autoLat={autoLat}
                                autoLon={autoLon}
                                onMapClick={handleMapPin} 
                                isLoaded={isLoaded}
                            />
                        </div>
                        
                        <div className="item">
                            <label htmlFor="latitude">Latitude</label>
                            <input id="latitude" name="latitude" type="text" value={autoLat} readOnly placeholder="Auto-generated" />
                        </div>
                        <div className="item">
                            <label htmlFor="longitude">Longitude</label>
                            <input id="longitude" name="longitude" type="text" value={autoLon} readOnly placeholder="Auto-generated" />
                        </div>
                        
                        {/* ... (Remaining Post Data & Post Detail fields remain here) ... */}
                        
                        <div className="item">
                            <label htmlFor="bedroom">Bedroom Number</label>
                            <input min={1} id="bedroom" name="bedroom" type="number" />
                        </div>
                        <div className="item">
                            <label htmlFor="bathroom">Bathroom Number</label>
                            <input min={1} id="bathroom" name="bathroom" type="number" />
                        </div>
                        
                        <div className="item">
                            <label htmlFor="type">Type</label>
                            <select name="type">
                                <option value="rent" defaultChecked>Rent</option>
                                <option value="buy">Buy</option>
                            </select>
                        </div>
                        <div className="item">
                            <label htmlFor="property">Property</label>
                            <select name="property">
                                <option value="apartment">Apartment</option>
                                <option value="house">House</option>
                                <option value="condo">Condo</option>
                                <option value="land">Land</option>
                            </select>
                        </div>

                        <div className="item">
                            <label htmlFor="utilities">Utilities Policy</label>
                            <select name="utilities">
                                <option value="owner">Owner is responsible</option>
                                <option value="tenant">Tenant is responsible</option>
                                <option value="shared">Shared</option>
                            </select>
                        </div>
                        <div className="item">
                            <label htmlFor="pet">Pet Policy</label>
                            <select name="pet">
                                <option value="allowed">Allowed</option>
                                <option value="not-allowed">Not Allowed</option>
                            </select>
                        </div>
                        <div className="item">
                            <label htmlFor="income">Income Policy</label>
                            <input
                                id="income"
                                name="income"
                                type="text"
                                placeholder="Income Policy"
                            />
                        </div>
                        <div className="item">
                            <label htmlFor="size">Total Size (sqft)</label>
                            <input min={0} id="size" name="size" type="number" />
                        </div>
                        <div className="item">
                            <label htmlFor="school">School (m)</label>
                            <input min={0} id="school" name="school" type="number" />
                        </div>
                        <div className="item">
                            <label htmlFor="bus">Bus Stop (m)</label>
                            <input min={0} id="bus" name="bus" type="number" />
                        </div>
                        <div className="item">
                            <label htmlFor="restaurant">Restaurant (m)</label>
                            <input min={0} id="restaurant" name="restaurant" type="number" />
                        </div>

                        <button className="sendButton" disabled={!isLoaded || !autoLat}>Add</button>
                        {error && <span>{error}</span>}
                    </form>
                </div>
            </div>
            <div className="sideContainer">
                {images.map((image, index) => (
                    <img src={image} key={index} alt={`Property Image ${index + 1}`} />
                ))}
                <UploadWidget
                    uwConfig={{
                        multiple: true,
                        cloudName: "lamadev",
                        uploadPreset: "estate",
                        folder: "posts",
                    }}
                    setState={setImages}
                />
            </div>
        </div>
    );
}

export default NewPostPage;