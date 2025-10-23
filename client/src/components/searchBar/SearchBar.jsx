import { useState, useEffect, useRef } from "react";
import "./searchBar.scss";
// import { Link } from "react-router-dom"; // We'll replace this with a conditional action
import { useNavigate } from "react-router-dom"; // <-- Import useNavigate for programmatic navigation
import { useJsApiLoader } from "@react-google-maps/api";

// --- React Icons (Install this: npm install react-icons) ---
import { TfiLocationPin } from "react-icons/tfi";
import { HiOutlineAdjustmentsHorizontal, HiOutlineArrowRight } from "react-icons/hi2";

const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
const LIBRARIES = ["places"];

const types = ["buy", "rent"];

function SearchBar() {
  const navigate = useNavigate(); // <-- Initialize useNavigate
  
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: GOOGLE_API_KEY,
    libraries: LIBRARIES,
  });

  const cityInputRef = useRef(null);
  const autocomplete = useRef(null);
  const [showError, setShowError] = useState(false); // <-- State for showing an error

  const [query, setQuery] = useState({
    type: "buy",
    city: "",
    address: "",
    minPrice: 0,
    maxPrice: 0,
    latitude: "",
    longitude: "",
  });

  // --- Google Autocomplete Logic (No changes here) ---
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
          const lat = place.geometry.location.lat().toString();
          const lon = place.geometry.location.lng().toString();
          const fullAddress = place.formatted_address || place.name;

          const cityComp = place.address_components.find(c =>
            c.types.includes("locality") || c.types.includes("postal_town")
          );
          const cityName = cityComp ? cityComp.long_name : "";

          setQuery(prev => ({
            ...prev,
            city: cityName,
            address: fullAddress,
            latitude: lat,
            longitude: lon,
          }));

          if (cityInputRef.current) cityInputRef.current.value = fullAddress;
        } else {
          setQuery(prev => ({
            ...prev,
            city: cityInputRef.current.value,
            address: cityInputRef.current.value,
            latitude: "",
            longitude: "",
          }));
        }
        setShowError(false); // Clear error on successful place selection
      });
    }
  }, [isLoaded]);

  const switchType = (val) => setQuery(prev => ({ ...prev, type: val }));

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "city" || name === "address") {
      setQuery(prev => ({ ...prev, [name]: value, latitude: "", longitude: "" }));
      setShowError(false); // Clear error as user starts typing
    } else {
      // This will handle minPrice/maxPrice if you add them back
      setQuery(prev => ({ ...prev, [name]: value }));
    }
  };

  /**
   * New Handler for the Search Button Click
   */
  const handleSearch = (e) => {
    e.preventDefault(); // Important: Prevent default link/form submission if you were using a <form>

    const locationValue = query.city.trim() || query.address.trim();

    if (!locationValue) {
      // 1. Show an error message (this is a better UX than an alert)
      setShowError(true);
      // Optional: Add a shake animation to the input field via CSS class
      return; // Stop the search process
    }

    // 2. If valid, construct the URL and navigate programmatically
    const queryString = `/list?type=${query.type}&city=${query.city}&address=${query.address}&minPrice=${query.minPrice}&maxPrice=${query.maxPrice}&latitude=${query.latitude}&longitude=${query.longitude}`;
    
    navigate(queryString);
  };
  // -----------------------------------------------------------------

  // --- UPDATED JSX TO MATCH THE MOCKUP STYLE ---
  return (
    // We wrap the components in a form to handle the submit action on the button
    // The className="new-search-mockup" is used as the container
    <div className="new-search-mockup"> 
      
      {/* 1. Buy/Rent buttons, styled as type-filters */}
      <div className="type-filters">
        {types.map(t => (
          <button
            key={t}
            onClick={() => switchType(t)}
            className={`type-btn ${query.type === t ? "active" : ""}`}
          >
            {t === "buy" ? "🏠 Buy" : "🤝 Rent"}
          </button>
        ))}
      </div>

      {/* 2. Search input group */}
      {/* Replaced the wrapper <div> with a <form> for better accessibility and to handle submission */}
      <form onSubmit={handleSearch} className="search-input-group"> 
        
        {/* Location Input (wraps the functional city input) */}
        <div className={`location-input ${showError ? 'error-border' : ''}`}> {/* Optional: Add error class for styling */}
          <TfiLocationPin />
          <input
            type="text"
            name="city"
            placeholder={isLoaded ? "Enter city, locality, or landmark..." : "Loading map..."}
            onChange={handleChange}
            ref={cityInputRef}
            disabled={!isLoaded}
          />
        </div>
        
        {/* Error Message */}
        {showError && (
          <p className="error-message">Please enter a city or location to search.</p>
        )}

        {/* Filter Button (from mockup) - Wire this to a modal for min/max price */}
        <button type="button" className="filter-btn"> {/* type="button" prevents it from submitting the form */}
          <HiOutlineAdjustmentsHorizontal /> Filters
        </button>
        
        {/* Search Button (functional Link + mockup style) 
           We replace the <Link> with a <button type="submit"> and use handleSearch
        */}
        <button 
          type="submit" // Will trigger the handleSearch function on form submit
          className="search-btn-link search-btn" // Reused your existing classes for styling
          disabled={!isLoaded}
        >
          Search <HiOutlineArrowRight />
        </button>
        
        {/* NOTE: minPrice and maxPrice inputs are hidden to match the mockup. */}
      </form>
    </div>
  );
}

export default SearchBar;