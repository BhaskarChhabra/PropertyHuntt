import React, { useState, useEffect } from "react"; // <-- useEffect aur useState import karein
import "./aiInsightsModal.scss";
import DOMPurify from "dompurify";
import jsPDF from "jspdf";

// Helper component for arrows (No change)
const TrendArrow = ({ direction }) => {
  if (direction === "Up") {
    return <span className="trend-arrow up">↑</span>;
  }
  if (direction === "Down") {
    return <span className="trend-arrow down">↓</span>;
  }
  return <span className="trend-arrow stable">→</span>;
};

// PDF ke liye text saaf karne waala function (No change)
const sanitizeForPDF = (text) => {
  if (!text) return "N/A";
  return text
    .replace(/\*\*(.*?)\*\*/g, "$1") 
    .replace(/₹/g, "Rs. ")          
    .replace(/[📊📈🎯⚠️💡💎]/g, "") 
    .replace(/[^\x00-\x7F]/g, ""); 
};

const AiInsightsModal = ({ data, onClose, isLoading, error, propertyTitle }) => {

  // --- [NAYA] Stopwatch Timer ke liye State ---
  const [elapsedTime, setElapsedTime] = useState(0);
  // ------------------------------------------

  // --- [NAYA] Stopwatch Timer Logic ---
  useEffect(() => {
    let interval = null;

    if (isLoading) {
      // Jab loading shuru ho, timer 0 se start karein
      setElapsedTime(0); 
      
      interval = setInterval(() => {
        // Har second, time ko 1 se badhayein
        setElapsedTime(prevTime => prevTime + 1);
      }, 1000);
    } 
    
    // Jab loading band ho (data aa jaaye ya error aaye), interval ko saaf karein
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isLoading]); // Yeh effect tab chalega jab 'isLoading' badlega
  // ------------------------------------

  
  // PDF Download Handler (No change)
  const handleDownloadPDF = () => {
    // ... (poora download logic waisa hi)
    if (!data) return;
    const doc = new jsPDF();
    let yPos = 20; 
    const addText = (text, size, style, indent = 15) => {
      const sanitizedText = sanitizeForPDF(text);
      doc.setFontSize(size);
      doc.setFont("helvetica", style);
      const splitText = doc.splitTextToSize(sanitizedText, 180); 
      doc.text(splitText, indent, yPos);
      yPos += (splitText.length * (size / 2)) + 4; 
    };
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.text(sanitizeForPDF("AI Investment Opportunity Report"), 105, yPos, { align: "center" });
    yPos += 10;
    doc.setFontSize(14);
    doc.setFont("helvetica", "normal");
    doc.text(sanitizeForPDF(`Property: ${propertyTitle || "N/A"}`), 105, yPos, { align: "center" });
    yPos += 15;
    addText("Price Analysis", 14, "bold");
    addText(`Verdict: ${data.priceAnalysis.verdict}`, 12, "bold", 20);
    addText(data.priceAnalysis.reasoning, 11, "normal", 20);
    yPos += 5;
    addText("Market Trend", 14, "bold");
    addText(`Trend: ${data.marketTrend.changeText || "N/A"}`, 12, "bold", 20);
    addText(data.marketTrend.insight, 11, "normal", 20);
    yPos += 5;
    addText("Recommended Strategy", 14, "bold");
    addText(`Strategy: ${data.investmentStrategy.recommendation}`, 12, "bold", 20);
    addText(data.investmentStrategy.reasoning, 11, "normal", 20);
    yPos += 5;
    addText("Key Risk", 14, "bold");
    addText(data.keyRisk.title, 12, "bold", 20);
    addText(data.keyRisk.details, 11, "normal", 20);
    yPos += 5;
    addText("Key Opportunity", 14, "bold");
    addText(data.keyOpportunity.title, 12, "bold", 20);
    addText(data.keyOpportunity.details, 11, "normal", 20);
    const safeTitle = (sanitizeForPDF(propertyTitle) || "Property").replace(/[^a-z0-9]/gi, '_');
    doc.save(`AI_Report_${safeTitle}.pdf`);
  };

  
  // Loading/Error state (Updated with timer)
  const renderBody = () => {
    if (isLoading) {
      return (
        <div className="modalBody loading-state">
          <div className="loader-icon"></div>
          {/* --- [YAHAN BADLAV HAI] --- */}
          <h3>Generating Your Report... ({elapsedTime}s)</h3>
          {/* --------------------------- */}
          <p>This may take a moment. The AI is analyzing the property and live market data.</p>
        </div>
      );
    }

    if (error) {
       return (
        <div className="modalBody error-state">
          <div className="icon-container error">❌</div>
          <h3>Analysis Failed</h3>
          <p>{error}</p>
        </div>
       );
    }

    // Data loaded successfully state (Original JSX)
    if (data) {
      const { priceAnalysis, marketTrend, investmentStrategy, keyRisk, keyOpportunity } = data;
      return (
        <div className="modalBody">
          {/* Price Analysis */}
          <div className="analysis-section price-analysis">
            <div className="icon-container">📊</div>
            <h3>Price Analysis</h3>
            <p className={`verdict ${priceAnalysis?.verdict?.toLowerCase().replace(' ', '-')}`}>
              Verdict: <strong>{priceAnalysis?.verdict || "N/A"}</strong>
            </p>
            <p className="reasoning" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(priceAnalysis?.reasoning) }}></p>
          </div>

          {/* Market Trend */}
          <div className="analysis-section market-trend">
            <div className="icon-container">📈</div>
            <h3>Market Trend</h3>
            <div className="trend-display">
              <TrendArrow direction={marketTrend?.direction} />
              <strong>{marketTrend?.changeText || "N/A"}</strong>
            </div>
            <p className="reasoning" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(marketTrend?.insight) }}></p>
          </div>

          {/* Recommended Strategy */}
          <div className="analysis-section strategy">
            <div className="icon-container">🎯</div>
            <h3>Recommended Strategy</h3>
            <p className="verdict-strategy">
              <strong>{investmentStrategy?.recommendation || "N/A"}</strong>
            </p>
            <p className="reasoning" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(investmentStrategy?.reasoning) }}></p>
          </div>

          {/* Risk & Opportunity */}
          <div className="risk-opportunity-grid">
            <div className="analysis-section key-risk">
              <div className="icon-container">⚠️</div>
              <h3>Key Risk</h3>
              <p className="title">{keyRisk?.title || "N/A"}</p>
              <p className="reasoning" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(keyRisk?.details) }}></p>
            </div>
            <div className="analysis-section key-opportunity">
              <div className="icon-container">💡</div>
              <h3>Key Opportunity</h3>
              <p className="title">{keyOpportunity?.title || "N/A"}</p>
              <p className="reasoning" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(keyOpportunity?.details) }}></p>
            </div>
          </div>
        </div>
      );
    }
    
    return null; // Fallback
  };

  return (
    <div className="aiModalOverlay" onClick={onClose}>
      <div className="aiModalContent" onClick={(e) => e.stopPropagation()}>
        <button className="closeButton" onClick={onClose}>×</button>
        
        <div className="modalHeader">
          <span className="premium-badge">💎 AI-Powered Analysis</span>
          <h2>Investment Opportunity Report</h2>
        </div>

        {renderBody()} 

        {/* Footer with Download Button */}
        {data && !isLoading && !error && (
          <div className="modalFooter">
            {/* --- [YAHAN BADLAV HAI] --- */}
            <span className="generation-time">
              Generated in {elapsedTime} seconds
            </span>
            {/* --------------------------- */}
            <button className="downloadButton" onClick={handleDownloadPDF}>
              Download as PDF
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AiInsightsModal;