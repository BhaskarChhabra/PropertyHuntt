import puppeteer from 'puppeteer';

class ScraperService {

  async getLocationTrends(city) {
    console.log(`\n--- [ScraperService] (Puppeteer) ATTEMPTING SCRAPE for "${city}" ---`);
    let browser = null;

    try {
      const formattedCity = city.toLowerCase().replace(/\s+/g, '-');
      const url = `https://www.99acres.com/property-rates-and-price-trends-in-${formattedCity}-prffid`;
      
      console.log(`[ScraperService] Step 1: Launching Headless Browser...`);
      browser = await puppeteer.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--single-process'
        ]
      });
      
      const page = await browser.newPage();
      await page.setUserAgent('Mozilla/5.o (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
      
      console.log(`[ScraperService] Step 2: Fetching URL: ${url}`);
      await page.goto(url, { waitUntil: 'networkidle2' }); 

      console.log(`[ScraperService] Step 3: Page loaded. Waiting for selector 'div.rT__rtW'...`);
      await page.waitForSelector('div.rT__rtW', { timeout: 10000 });
      console.log(`[ScraperService] Selector found.`);

      // --- [YAHAN BADLAV KIYA GAYA HAI] ---
      // Page ko neeche scroll karo taaki saara lazy-loaded data (priceChange) load ho jaaye
      console.log(`[ScraperService] Step 3a: Scrolling page to trigger lazy loading...`);
      await page.evaluate(() => {
        window.scrollTo(0, document.body.scrollHeight);
      });
      
      // JavaScript ko load hone ke liye 2 second ka extra time do
      console.log(`[ScraperService] Step 3b: Waiting 2 seconds for JS to load...`);
      await new Promise(resolve => setTimeout(resolve, 2000)); 
      console.log(`[ScraperService] Step 3c: Wait complete. Extracting data...`);
      // --- [END BADLAV] ---

      console.log(`[ScraperService] Step 4: Extracting data...`);

      // Data nikaalne ka tareeka (bina :contains ke)
      const trends = await page.$$eval('div.rT__rtW', (blocks) => {
        const results = [];
        for (let i = 0; i < blocks.length && results.length < 10; i++) {
          const el = blocks[i];
          
          const localityName = el.querySelector('div.rT__locSec a.section_header_semiBold')?.innerText.trim() || null;
          
          const avgPriceText = el.querySelector('div.rT__w2 div.rT__shs')?.innerText.trim() || null;
          
          let rentalYieldText = "N/A";
          const allCslDivs = el.querySelectorAll('div.rT__csl'); 
          allCslDivs.forEach(csl => {
              if (csl.innerText.includes("Rental Yield")) {
                  rentalYieldText = csl.nextElementSibling?.innerText.trim() || "N/A";
              }
          });
          
          const priceChangeText = el.querySelector('div.priceTrendsSmallGraph__chartTxt')?.innerText.trim() || 'N/A';

          if (localityName && avgPriceText) {
            results.push({
              locality: localityName,
              avgPrice: avgPriceText,
              rentalYield: rentalYieldText,
              priceChange: priceChangeText
            });
          }
        }
        return results;
      });

      if (trends.length === 0) {
        console.warn("⚠️ [ScraperService] Step 5: No valid data extracted. Website structure might have changed.");
        throw new Error("Could not scrape data. Selectors might be outdated.");
      }

      console.log(`📈 [ScraperService] Step 5: Successfully scraped ${trends.length} trends.`);
      console.log(`[ScraperService] Final Scraped Data Preview:`, trends);
      
      await browser.close();
      return trends;

    } catch (error) {
      console.error(`❌ [ScraperService] Scraping FAILED: ${error.message}`);
      if (browser) {
        await browser.close();
      }
      
      if (error.message.includes('404') || error.message.includes('timeout')) {
         console.warn(`[ScraperService] Page for "${city}" not found or timed out. Returning empty.`);
         return []; 
      }
      
      throw new Error(`Failed to scrape location trends: ${error.message}`);
    }
  }
}

export default new ScraperService();