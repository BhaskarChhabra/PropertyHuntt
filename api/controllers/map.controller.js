import axios from "axios";
// import prisma from "../lib/prisma.js"; // Not needed in this specific controller
// import jwt from "jsonwebtoken"; // Not needed in this specific controller

// NOTE: We assume 'dotenv' is configured in your index.js/server.js 
// to load the GOOGLE_API_KEY from your .env file.
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY; 

/**
 * Converts a text query (city/address) into geographical coordinates (lat/lng)
 * using the Google Geocoding API. This is used to set the map's initial center.
 */
export const getCoordinates = async (req, res) => {
  const { query } = req.query; // Expecting the search term from the front-end

  try {
    // ✅ Input Validation Check
    if (!query) {
      return res.status(400).json({ message: "Query parameter (city/address) is required" });
    }

    // ✅ Make the external API request
    const url = "https://maps.googleapis.com/maps/api/geocode/json";
    const params = {
      address: query,
      key: GOOGLE_API_KEY,
    };

    const apiResponse = await axios.get(url, { params });

    // ✅ Process the response
    if (apiResponse.data.results && apiResponse.data.results.length > 0) {
      const location = apiResponse.data.results[0].geometry.location;
      
      // Send only the required coordinates in the desired format: { lat: X.XXX, lng: Y.YYY }
      return res.status(200).json({ lat: location.lat, lng: location.lng });
    } else {
      // ✅ Handle case where Google API finds no matching location
      return res.status(404).json({ message: "Location not found by Google Geocoding" });
    }
  } catch (err) {
    // ✅ Centralized error handling
    console.error("Geocoding API Error:", err.message);
    res.status(500).json({ message: "Failed to fetch coordinates from Google API" });
  }
};


/**
 * Fetches nearby amenities of SPECIFIC types around a given location 
 * using the Google Places API (Nearby Search).
 * It uses the 'types' array/string sent from the frontend to filter the search.
 */
export const getNearbyAmenities = async (req, res) => {
    const { lat, lng, types } = req.query; 
    
    // Convert comma-separated string 'hospital,doctor' to an array ['hospital', 'doctor']
    let amenityTypes = Array.isArray(types) ? types : (typeof types === 'string' ? types.split(',') : null);

    try {
        if (!lat || !lng || !amenityTypes || amenityTypes.length === 0) {
            return res.status(400).json({ 
                message: "Latitude, Longitude, and at least one amenity type are required." 
            });
        }

        let allAmenities = [];
        
        // Loop only over the requested types (usually just one type from the SinglePage)
        for (const type of amenityTypes) {
            const cleanType = type.trim(); 
            
            const url = "https://maps.googleapis.com/maps/api/place/nearbysearch/json";
            const params = {
                location: `${lat},${lng}`,
                radius: 1000, // Search within 1km radius
                type: cleanType, 
                key: GOOGLE_API_KEY,
            };

            const apiResponse = await axios.get(url, { params });
            
            if (apiResponse.data.results?.length) {
                // 🛑 CRITICAL FIX: Return ALL results (no .slice())
                const allResults = apiResponse.data.results.map(p => ({
                    place_id: p.place_id,
                    name: p.name,
                    rating: p.rating,
                    user_ratings_total: p.user_ratings_total,
                    type: cleanType, 
                    location: p.geometry.location, // { lat, lng } format
                }));
                allAmenities.push(...allResults);
            }
        }
        
        res.status(200).json(allAmenities);
    } catch (err) {
        console.error("Google Places API Error:", err.message);
        res.status(500).json({ message: "Failed to fetch nearby amenities." });
    }
};


/**
 * Fetches detailed information for a single place_id using the 
 * Google Places Details API. This acts as a CORS proxy for the frontend.
 * The frontend must now call THIS endpoint instead of calling the Google API directly.
 */
export const getPlaceDetails = async (req, res) => {
    // 1. Get the placeId from the frontend request
    const { placeId } = req.query;

    try {
        // 2. Input Validation
        if (!placeId) {
            return res.status(400).json({ message: "placeId parameter is required." });
        }

        // 3. Define the fields required for the frontend modal
        // We only request specific fields to minimize costs.
        const fields = [
            'name', 'formatted_address', 'rating', 'user_ratings_total',
            'photos', 'reviews', 'type', 'opening_hours', 'url', 'website', 'formatted_phone_number'
        ];

        // 4. Construct the URL for the Google Place Details API
        const url = "https://maps.googleapis.com/maps/api/place/details/json";
        const params = {
            place_id: placeId,
            fields: fields.join(','), // Join the array into a comma-separated string
            key: GOOGLE_API_KEY,
        };

        // 5. Make the server-to-server request (NO CORS issue here)
        const apiResponse = await axios.get(url, { params });
        
        const data = apiResponse.data;

        // 6. Process and Send the Response
        if (data.status === 'OK') {
            // Send ONLY the 'result' object back to the frontend
            return res.status(200).json(data.result);
        } else if (data.status === 'NOT_FOUND' || data.status === 'ZERO_RESULTS') {
            return res.status(404).json({ message: `Google API Status: ${data.status}. Place ID: ${placeId}` });
        } else {
            // Handle other Google API errors (e.g., INVALID_REQUEST, OVER_QUERY_LIMIT)
            console.error("Google Place Details API Error Status:", data.status, data.error_message);
            return res.status(500).json({ message: `Google API Error: ${data.status}` });
        }

    } catch (err) {
        // Centralized error handling for network issues
        console.error("Place Details Proxy API Error:", err.message);
        res.status(500).json({ message: "Failed to fetch place details through proxy." });
    }
};
