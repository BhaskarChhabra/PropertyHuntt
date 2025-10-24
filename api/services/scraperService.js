// FILE: scraperService.js
import puppeteer from "puppeteer-core";
import chromium from "@sparticuz/chromium";
import os from "os";

class ScraperService {
  async getLocationTrends(city) {
    console.log(`\n--- [ScraperService] (Puppeteer) ATTEMPTING SCRAPE for "${city}" ---`);
    let browser = null;

    try {
      const formattedCity = city.toLowerCase().replace(/\s+/g, "-");
      const url = `https://www.99acres.com/property-rates-and-price-trends-in-${formattedCity}-prffid`;

      console.log(`[ScraperService] Step 1: Launching Headless Browser...`);

      // 🔥 Detect environment
      const isProduction = process.env.NODE_ENV === "production";

      // 🧠 Decide Chrome executable path
      let executablePath;
      if (isProduction) {
        console.log("[ScraperService] Using @sparticuz/chromium in production (Render)...");
        executablePath = await chromium.executablePath;
      } else {
        console.log("[ScraperService] Using local Chrome...");
        executablePath = getLocalChromePath();
      }

      // 🧩 Debug log to confirm what Puppeteer will use
      console.log(`[ScraperService] Resolved Chrome Path: ${executablePath}`);

      // 🧠 Launch Puppeteer
      browser = await puppeteer.launch({
        executablePath,
        args: [
          ...chromium.args,
          "--no-sandbox",
          "--disable-setuid-sandbox",
          "--disable-dev-shm-usage",
          "--single-process",
        ],
        headless: isProduction ? chromium.headless : true,
        defaultViewport: chromium.defaultViewport,
        ignoreHTTPSErrors: true,
      });

      const page = await browser.newPage();
      await page.setUserAgent(
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
      );

      console.log(`[ScraperService] Step 2: Fetching URL: ${url}`);
      await page.goto(url, { waitUntil: "networkidle2", timeout: 30000 });

      console.log(`[ScraperService] Step 3: Page loaded. Waiting for selector 'div.rT__rtW'...`);
      await page.waitForSelector("div.rT__rtW", { timeout: 10000 });
      console.log(`[ScraperService] Selector found.`);

      console.log(`[ScraperService] Step 3a: Scrolling page to trigger lazy loading...`);
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));

      console.log(`[ScraperService] Step 3b: Waiting 2 seconds for JS to load...`);
      await new Promise((resolve) => setTimeout(resolve, 2000));
      console.log(`[ScraperService] Step 3c: Wait complete. Extracting data...`);

      // 📊 Extract data
      const trends = await page.$$eval("div.rT__rtW", (blocks) => {
        const results = [];
        for (let i = 0; i < blocks.length && results.length < 10; i++) {
          const el = blocks[i];

          const localityName =
            el.querySelector("div.rT__locSec a.section_header_semiBold")?.innerText.trim() || null;

          const avgPriceText =
            el.querySelector("div.rT__w2 div.rT__shs")?.innerText.trim() || null;

          let rentalYieldText = "N/A";
          const allCslDivs = el.querySelectorAll("div.rT__csl");
          allCslDivs.forEach((csl) => {
            if (csl.innerText.includes("Rental Yield")) {
              rentalYieldText = csl.nextElementSibling?.innerText.trim() || "N/A";
            }
          });

          const priceChangeText =
            el.querySelector("div.priceTrendsSmallGraph__chartTxt")?.innerText.trim() || "N/A";

          if (localityName && avgPriceText) {
            results.push({
              locality: localityName,
              avgPrice: avgPriceText,
              rentalYield: rentalYieldText,
              priceChange: priceChangeText,
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
      if (browser) await browser.close();

      if (error.message.includes("404") || error.message.includes("timeout")) {
        console.warn(`[ScraperService] Page for "${city}" not found or timed out. Returning empty.`);
        return [];
      }

      throw new Error(`Failed to scrape location trends: ${error.message}`);
    }
  }
}

// 🧩 Helper function for local Chrome path
function getLocalChromePath() {
  const platform = os.platform();

  if (platform === "win32") return "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
  if (platform === "darwin") return "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
  if (platform === "linux") return "/usr/bin/google-chrome";

  throw new Error("Unsupported platform for local Chrome path detection");
}

export default new ScraperService();
