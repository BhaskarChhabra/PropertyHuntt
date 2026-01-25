import express from "express";
// 👇 Import the getPlaceDetails function
import { getCoordinates, getNearbyAmenities, getPlaceDetails } from "../controllers/map.controller.js";

const router = express.Router();

// Existing route for geocoding
router.get("/geocode", getCoordinates);

// Existing route for nearby amenities
router.get("/amenities", getNearbyAmenities);

// --- 👇 ADDED THIS ROUTE ---
// NEW Route: GET /api/map/details?placeId=XYZ
router.get("/details", getPlaceDetails);
// --- 👆 END ADDED ROUTE ---

export default router;
