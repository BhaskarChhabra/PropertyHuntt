import express from "express";
import { getCoordinates, getNearbyAmenities } from "../controllers/map.controller.js"; // Import new function

const router = express.Router();

router.get("/geocode", getCoordinates);

// NEW Route: GET /api/map/amenities?lat=X&lng=Y
router.get("/amenities", getNearbyAmenities); 

export default router;