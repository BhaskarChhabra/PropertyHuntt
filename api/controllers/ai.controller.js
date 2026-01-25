import aiService from '../services/aiService.js';
import scraperService from '../services/scraperService.js'; // <-- Scraper ko import kiya

/**
 * Controller 1: Nayi property ke liye description banata hai
 * (Ismein koi badlav nahi)
 */

/**
 * Controller 2: Investment insights banata hai
 * --- [CONSOLE LOGS ADD KIYE GAYE HAIN] ---
 */
export const generateInvestmentInsights = async (req, res) => {
  console.log("\n--- [aiController] INSIGHTS REQUEST RECEIVED ---"); // Log 1: Request entry
  try {
    // 1. Frontend se 'city' bhi lein
    const { title, price, address, goal, city } = req.body;
    if (!title || !price || !address || !goal || !city) {
      console.error("❌ [aiController] Error: Missing data. Need city.");
      return res.status(400).json({ message: "Missing required data (title, price, address, goal, or city)." });
    }
    console.log(`[aiController] Data received: City=${city}, Goal=${goal}`); // Log 2: Data check

    // 2. [NAYA STEP] Market data scrape karein
    let marketTrends = null;
    try {
      // --- SCRAPER CALL LOG ---
      console.log(`\n🧠 [aiController] ---- STEP 1: Calling scraperService for city: ${city} ----`); // Log 3: Calling scraper
      marketTrends = await scraperService.getLocationTrends(city);
      console.log(`✅ [aiController] ---- STEP 2: Scraper finished. Data found:`, marketTrends); // Log 4: Scraper result
      // -----------------------------

    } catch (scrapeError) {
      console.warn(`⚠️ [aiController] ---- STEP 2: Scraper FAILED for ${city}. Proceeding without market data. Error: ${scrapeError.message}`); // Log 4 (Alt): Scraper failed
      // Agar scraping fail ho, toh bhi feature chalna chahiye
    }

    // 3. [UPDATED STEP] AI Service ko property data AUR market data, dono bhejien
    console.log(`\n🤖 [aiController] ---- STEP 3: Calling aiService with property data AND market trends... ----`); // Log 5: Calling AI Service
    const analysis = await aiService.generateInvestmentInsights(
        req.body,       // Poora property data (jismein goal, price, etc. hai)
        marketTrends    // Scrape kiya hua live data (ya null)
    );

    console.log("\n✅ [aiController] ---- STEP 4: AI Analysis complete. Sending final response to client. ----"); // Log 6: Sending response
    // 'analysis' ab ek JSON object hai jo aiService se aaya hai
    res.status(200).json({ analysis });

  } catch (error) {
    console.error(`❌ [aiController] Fatal error in generateInvestmentInsights: ${error.message}`);
    res.status(500).json({ message: error.message });
  }
};

/**
 * Controller 3: User ke search results ka summary banata hai (Aapke DB se)
 * (Ismein koi badlav nahi)
 */
export const analyzeMyListings = async (req, res) => {
    try {
        const { properties, city, maxPrice, type } = req.body;
        if (!properties || !city || !type) {
            return res.status(400).json({ 
                success: false, 
                message: 'Properties, city, and type are required' 
            });
        }
        const searchCriteria = { city, maxPrice, type };
        const analysis = await aiService.analyzeProperties(
            properties,
            searchCriteria
        );
        res.json({ success: true, analysis });
    } catch (error) {
        console.error('Error analyzing properties:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to analyze properties',
            error: error.message
        });
    }
};

/**
 * Controller 4: Live market trends (Scraping + AI)
 * (Ismein koi badlav nahi)
 */
export const getFreeLocationTrends = async (req, res) => {
    try {
        const { city } = req.params;
        if (!city) {
            return res.status(400).json({ success: false, message: 'City is required' });
        }
        // 1. Scrape real data
        const trendsData = await scraperService.getLocationTrends(city);
        // 2. Analyze that data
        const analysis = await aiService.analyzeLocationTrends(trendsData, city);
        res.json({
            success: true,
            locations: trendsData,
            analysis
        });
    } catch (error) {
        console.error('Error in free location trends controller:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to get location trends',
            error: error.message
        });
    }
};