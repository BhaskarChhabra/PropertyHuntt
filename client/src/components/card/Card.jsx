import { useState } from "react";
import { Link } from "react-router-dom";
import "./card.scss";

// Share Icon SVG component (no external file needed)
const ShareIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ opacity: 0.7 }}
  >
    <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
    <polyline points="16 6 12 2 8 6" />
    <line x1="12" y1="2" x2="12" y2="15" />
  </svg>
);


function Card({ item, onSave, onSendMessage, style }) {
  const [copied, setCopied] = useState(false);
  const typeClass = item.type === "buy" ? "buy" : "rent";
  const defaultImage = "/noimg.png";

  /**
   * Handles the share button click.
   * Uses the Web Share API if available, otherwise copies the link to the clipboard.
   * @param {React.MouseEvent} e - The click event.
   */
  const handleShare = async (e) => {
    e.preventDefault(); // Prevents navigating when clicking the button
    e.stopPropagation(); // Stops the event from bubbling up to the Link

    const urlToShare = `${window.location.origin}/${item.id}`;
    const shareData = {
      title: item.title,
      text: `Check out this property: ${item.title}`,
      url: urlToShare,
    };

    // Use Web Share API if available
    if (navigator.share) {
      try {
        await navigator.share(shareData);
        console.log("Property shared successfully!");
      } catch (err) {
        console.error("Share failed:", err.message);
      }
    } else {
      // Fallback: Copy to clipboard
      try {
        await navigator.clipboard.writeText(urlToShare);
        setCopied(true);
        // Hide the "Copied!" message after 2 seconds
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error("Failed to copy link:", err.message);
      }
    }
  };


  return (
    <div className='card' style={style}>
      <Link to={`/${item.id}`} className='imageContainer'>
        <img src={item.images?.[0] || defaultImage} alt={item.title || "Property image"} />
        <div className='tags'>
          {item.property && <div className='tag property' style={{'--tag-index': 1}}>{item.property}</div>}
          {item.type && <div className={`tag type ${typeClass}`} style={{'--tag-index': 2}}>{item.type}</div>}
        </div>
        
        {/* Share button with onClick handler */}
        <button className='shareIcon' onClick={handleShare}>
          {/* Using the new SVG component */}
          <ShareIcon />
        </button>

        {/* "Link Copied!" notification */}
        {copied && <div className="copy-notification">Link Copied!</div>}

      </Link>
      <div className='textContainer'>
        <div className="topInfo">
            <p className='address'>
                <img src='/pin.png' alt='Location' />
                <span>{item.address}</span>
            </p>
            {item.views !== undefined && (
                <span className="views">
                    <img src="/eye.png" alt="Views"/>
                    {item.views}
                </span>
            )}
        </div>
        <h2 className='title'>
          <Link to={`/${item.id}`}>{item.title}</Link>
        </h2>
        <p className='priceLabel'>Price</p>
        <p className='price'>₹ {item.price.toLocaleString("en-IN")}</p>
        <div className='features'>
          {item.bedroom && (
            <div className='feature'>
              <img src='/bed.png' alt='Bedrooms' />
              <span>{item.bedroom} Beds</span>
            </div>
          )}
          {item.bathroom && (
            <div className='feature'>
              <img src='/bath.png' alt='Bathrooms' />
              <span>{item.bathroom} Baths</span>
            </div>
          )}
          {item.size && (
             <div className='feature'>
                <img src='/size.png' alt='Area' />
                <span>{item.size} sqft</span>
            </div>
          )}
        </div>
        
        {/* --- UPDATED BUTTONS SECTION --- */}
        <div className='bottom'>
            <div className="actions">
                {onSendMessage && (
                    <button
                        onClick={(e) => { e.stopPropagation(); onSendMessage(item); }}
                        className="contact-btn"
                    >
                        <img src="/chat.png" alt="Chat" /> Contact Landlord
                    </button>
                )}
                <button
                    onClick={(e) => { e.stopPropagation(); onSave(item); }}
                    className={`save-btn ${item.isSaved ? 'saved' : ''}`}
                >
                    <img src="/save.png" alt="Save" />{" "}
                    {item.isSaved ? "Place Saved" : "Save the Place"}
                </button>
            </div>
        </div>

      </div>
    </div>
  );
}

export default Card;

