import express from 'express';
import {
    generateDescription,
    generateInvestmentInsights,
    analyzeMyListings,
    getFreeLocationTrends
} from '../controllers/ai.controller.js';

const router = express.Router();

// Route 1: Nayi property ke liye description banata hai (Form ke liye)
router.post('/description', generateDescription);

// Route 2: Investment insights banata hai (Form ke liye)
router.post('/insights', generateInvestmentInsights);

// Route 3: Search results ka summary banata hai (ListPage ke liye)
router.post('/summarize', analyzeMyListings);

// Route 4: Live market trends scrape karta hai (ListPage/HomePage ke liye)
router.get('/trends/:city', getFreeLocationTrends);

export default router;