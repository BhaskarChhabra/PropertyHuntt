import { useState, useEffect, useRef } from "react";
import "./filter.scss";
import { useSearchParams } from "react-router-dom";
import { useJsApiLoader } from "@react-google-maps/api";

// --- Icons for the new UI ---
import { TfiLocationPin } from "react-icons/tfi";
import { HiOutlineAdjustmentsHorizontal, HiOutlineArrowRight, HiOutlineXMark } from "react-icons/hi2";

const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
const LIBRARIES = ["places"];

// --- [BADLAV] 'locationFromMap' prop ko receive karein ---
function Filter({ locationFromMap }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // --- Initial state ab URL se ya map prop se aa sakta hai ---
  const [query, setQuery] = useState({
    type: searchParams.get("type") || "buy",
    // Agar map se location aayi hai, toh usse use karein, warna URL se, warna khaali
    city: locationFromMap?.city || searchParams.get("city") || "",
    property: searchParams.get("property") || "",
    minPrice: searchParams.get("minPrice") || "",
    maxPrice: searchParams.get("maxPrice") || "",
    bedroom: searchParams.get("bedroom") || "",
    latitude: locationFromMap?.lat || searchParams.get("latitude") || "",
    longitude: locationFromMap?.lng || searchParams.get("longitude") || "",
  });
  
  const [error, setError] = useState("");
  const cityInputRef = useRef(null);
  const autocomplete = useRef(null);
  
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: GOOGLE_API_KEY,
    libraries: LIBRARIES,
  });

  // --- [YAHI HAI ASLI FIX] ---
  // Yeh 'useEffect' tab chalega jab 'locationFromMap' prop (map click se) badlega
  useEffect(() => {
    if (locationFromMap && locationFromMap.city) {
      // Input field ki value ko update kar dein
      setQuery((prev) => ({ 
        ...prev, 
        city: locationFromMap.city,
        latitude: locationFromMap.lat,
        longitude: locationFromMap.lng
      }));
      console.log("Filter.js: Received new location from map:", locationFromMap.city);
    }
  }, [locationFromMap]); // Dependency
  // --- [END FIX] ---

  // Google Autocomplete ka logic (waisa hi)
  useEffect(() => {
    if (isLoaded && cityInputRef.current && !autocomplete.current) {
      autocomplete.current = new window.google.maps.places.Autocomplete(
        cityInputRef.current,
        {
          types: ["geocode"],
          componentRestrictions: { country: "in" },
        }
      );
      autocomplete.current.addListener("place_changed", () => {
        const place = autocomplete.current.getPlace();
        if (place.geometry) {
          const lat = place.geometry.location.lat();
          const lng = place.geometry.location.lng();
          const localityComp = place.address_components.find(
            (c) =>
              c.types.includes("sublocality") ||
              c.types.includes("locality") ||
              c.types.includes("postal_town") ||
              c.types.includes("administrative_area_level_1")
          );
          const locationName = localityComp ? localityComp.long_name : place.name;
          setQuery((prev) => ({
            ...prev,
            city: locationName,
            latitude: lat.toString(),
            longitude: lng.toString(),
          }));
        }
      });
    }
  }, [isLoaded]);

  // Input change handler (waisa hi)
  const handleChange = (e) => {
    setQuery((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  // Search button handler (waisa hi)
  const handleFilter = () => {
    if (!query.city) {
      setError("Please select a city or locality to search.");
      return;
    }
    setError(""); // Clear error
    
    // --- [BADLAV] ---
    // Jab search ho, toh lat/lng ko bhi URL mein add karein
    setSearchParams({
        type: query.type,
        city: query.city,
        property: query.property,
        minPrice: query.minPrice,
        maxPrice: query.maxPrice,
        bedroom: query.bedroom,
        latitude: query.latitude,
        longitude: query.longitude
    });
    // -----------------
    
    setIsModalOpen(false); // Modal band karein
  };

  const switchType = (type) => {
    setQuery((prev) => ({ ...prev, type }));
  };

  if (!isLoaded) {
    return <div className="loading-state">Loading Location Filters...</div>;
  }

  return (
    <div className="filter-search-bar">
      {/* 1. Buy/Rent buttons */}
      <div className="type-filters">
        <button onClick={() => switchType("buy")} className={`type-btn ${query.type === "buy" ? "active" : ""}`}>
          🏠 Buy
        </button>
        <button onClick={() => switchType("rent")} className={`type-btn ${query.type === "rent" ? "active" : ""}`}>
          🤝 Rent
        </button>
      </div>

      {/* 2. Main search bar group */}
      <div className="search-input-group">
        <div className="location-input">
          <TfiLocationPin />
          <input
            ref={cityInputRef}
            type="text"
            name="city"
            // --- [BADLAV] ---
            // 'defaultValue' ki jagah 'value' use karein taaki React state se control ho
            value={query.city} 
            // -----------------
            placeholder="Enter city, locality, or landmark..."
            disabled={!isLoaded}
            onChange={handleChange} // onChange zaroori hai 'value' ke saath
          />
        </div>

        <button className="filter-btn" onClick={() => setIsModalOpen(true)}>
          <HiOutlineAdjustmentsHorizontal /> Filters
        </button>

        <button className="search-btn" onClick={handleFilter}>
          Search <HiOutlineArrowRight />
        </button>
      </div>
      {error && <span className="error-message">{error}</span>}

      {/* --- FILTER MODAL (Waisa hi) --- */}
      {isModalOpen && (
        <div className="filter-modal-overlay">
          <div className="filter-modal-content">
            <button className="close-btn" onClick={() => setIsModalOpen(false)}>
              <HiOutlineXMark />
            </button>
            <h2>Advanced Filters</h2>
            <div className="modal-filters">
              {/* All other filters */}
              <div className="item">
                <label htmlFor="property">Property</label>
                <select name="property" id="property" value={query.property} onChange={handleChange}>
                  <option value="">Any</option>
                  <option value="apartment">Apartment</option>
                  <option value="house">House</option>
                  <option value="condo">Condo</option>
                  <option value="land">Land</option>
                </select>
              </div>
              <div className="item">
                <label htmlFor="minPrice">Min Price</label>
                <input type="number" id="minPrice" name="minPrice" value={query.minPrice} onChange={handleChange} placeholder="Any" />
              </div>
              <div className="item">
                <label htmlFor="maxPrice">Max Price</label>
                <input type="number" id="maxPrice" name="maxPrice" value={query.maxPrice} onChange={handleChange} placeholder="Any" />
              </div>
              <div className="item">
                <label htmlFor="bedroom">Bedroom</label>
                <input type="number" id="bedroom" name="bedroom" value={query.bedroom} onChange={handleChange} placeholder="Any" />
              </div>
            </div>
            <button className="apply-filters-btn" onClick={handleFilter}>Apply Filters</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Filter;