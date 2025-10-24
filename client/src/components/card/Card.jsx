import { useState, useContext } from "react"; // Added useContext
import { Link } from "react-router-dom";
import "./card.scss";
import { IoTrashBinOutline } from "react-icons/io5"; // Trash icon
import { AuthContext } from "../../context/AuthContext"; // Import AuthContext

// Share Icon Component
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

// Card Component
function Card({ item, onSave, onSendMessage, onDelete, showDelete, style }) {
    const [copied, setCopied] = useState(false);
    const { currentUser } = useContext(AuthContext); // Get current user
    const typeClass = item.type === "buy" ? "buy" : "rent";
    const defaultImage = "/noimg.png";

    // Handle Share Click
    const handleShare = async (e) => {
        e.preventDefault();
        e.stopPropagation();

        const urlToShare = `${window.location.origin}/${item.id}`;
        const shareData = {
            title: item.title || "Check out this property",
            text: `Check out this property: ${item.title || ''}`,
            url: urlToShare,
        };

        if (navigator.share) {
            try {
                await navigator.share(shareData);
                console.log("Property shared successfully!");
            } catch (err) {
                console.error("Share failed:", err.message);
            }
        } else {
            // Fallback: Copy to clipboard using execCommand for better iframe compatibility
            try {
                const textArea = document.createElement("textarea");
                textArea.value = urlToShare;
                textArea.style.position = "fixed"; // Prevent scrolling to bottom
                textArea.style.top = "0";
                textArea.style.left = "0";
                textArea.style.opacity = "0";
                document.body.appendChild(textArea);
                textArea.focus();
                textArea.select();
                let success = false;
                try {
                    success = document.execCommand('copy');
                } catch (execErr) {
                    console.error("Fallback execCommand copy failed:", execErr);
                    success = false;
                }
                document.body.removeChild(textArea);

                if (success) {
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                } else {
                     // If execCommand failed, try Clipboard API as last resort
                    if (navigator.clipboard) {
                         try {
                              await navigator.clipboard.writeText(urlToShare);
                              setCopied(true);
                              setTimeout(() => setCopied(false), 2000);
                         } catch (clipErr) {
                              console.error("Clipboard API copy failed:", clipErr);
                              alert("Could not copy link automatically. Please copy it manually.");
                         }
                    } else {
                         alert("Could not copy link automatically. Please copy it manually.");
                    }
                }
            } catch (err) {
                console.error("Failed to copy link:", err.message);
                alert("Could not copy link automatically. Please copy it manually.");
            }
        }
    };

    // Handle Delete Click
    const handleDeleteClick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (onDelete) {
            // Optional: Add confirmation here if you didn't add it in ProfilePage
            // if (window.confirm("Are you sure you want to delete this post?")) {
                 onDelete(item.id);
            // }
        }
    };

     // Determine if the contact button should be shown/enabled
     // Show if onSendMessage exists AND the current user is not the post owner
     const canSendMessage = onSendMessage && currentUser?.id !== item.userId;

    // Basic check for valid item
    if (!item || !item.id) {
        console.warn("Card component received invalid item:", item);
        return null; // Don't render anything if item is invalid
    }

    return (
        <div className='card' style={style}>
            <Link to={`/${item.id}`} className='imageContainer'>
                <img src={item.images?.[0] || defaultImage} alt={item.title || "Property image"} />
                <div className='tags'>
                    {item.property && <div className='tag property' style={{ '--tag-index': 1 }}>{item.property}</div>}
                    {item.type && <div className={`tag type ${typeClass}`} style={{ '--tag-index': 2 }}>{item.type}</div>}
                </div>

                {/* Conditional Delete Button */}
                {showDelete && onDelete && (
                    <button className='deleteIcon' onClick={handleDeleteClick} title="Delete Post">
                        <IoTrashBinOutline size={18} />
                    </button>
                )}

                {/* Share Button */}
                <button className='shareIcon' onClick={handleShare} title="Share Post">
                    <ShareIcon />
                </button>

                {/* Copy Notification */}
                {copied && <div className="copy-notification">Link Copied!</div>}
            </Link>

            <div className='textContainer'>
                <div className="topInfo">
                    <p className='address'>
                        <img src='/pin.png' alt='Location' />
                        {/* Ensure address exists */}
                        <span>{item.address || 'Address unavailable'}</span>
                    </p>
                    {/* Ensure item.views is a number */}
                    {(typeof item.views === 'number') && (
                        <span className="views">
                            <img src="/eye.png" alt="Views" />
                            {item.views}
                        </span>
                    )}
                </div>
                <h2 className='title'>
                    {/* Ensure title exists */}
                    <Link to={`/${item.id}`}>{item.title || 'Property Title'}</Link>
                </h2>
                <p className='priceLabel'>Price</p>
                 {/* Ensure price exists and is a number before formatting */}
                <p className='price'>₹ { (typeof item.price === 'number') ? item.price.toLocaleString("en-IN") : 'N/A'}</p>

                <div className='features'>
                    {item.bedroom > 0 && ( // Check if bedroom count is positive
                        <div className='feature'>
                            <img src='/bed.png' alt='Bedrooms' />
                            <span>{item.bedroom} Bed{item.bedroom > 1 ? 's' : ''}</span>
                        </div>
                    )}
                    {item.bathroom > 0 && ( // Check if bathroom count is positive
                        <div className='feature'>
                            <img src='/bath.png' alt='Bathrooms' />
                            <span>{item.bathroom} Bath{item.bathroom > 1 ? 's' : ''}</span>
                        </div>
                    )}
                    {item.size > 0 && ( // Check if size is positive
                        <div className='feature'>
                            <img src='/size.png' alt='Area' />
                            <span>{item.size} sqft</span>
                        </div>
                    )}
                </div>

                {/* Buttons Section */}
                <div className='bottom'>
                    <div className="actions">
                        {/* Conditionally render Contact button */}
                        {canSendMessage && (
                            <button
                                onClick={(e) => { e.stopPropagation(); onSendMessage(item); }}
                                className="contact-btn"
                                title="Contact Landlord" // Add title for icon only button
                            >
                                <img src="/chat.png" alt="Chat" />
                                {/* Text might be hidden by CSS depending on profilePage.scss override */}
                                {/* Contact Landlord */}
                            </button>
                        )}
                        {/* Always render Save button if onSave exists */}
                        {onSave && (
                            <button
                                onClick={(e) => { e.stopPropagation(); onSave(item); }}
                                className={`save-btn ${item.isSaved ? 'saved' : ''}`}
                                title={item.isSaved ? "Unsave Post" : "Save Post"}
                            >
                                <img src="/save.png" alt="Save" />
                                {/* Text might be hidden by CSS depending on profilePage.scss override */}
                                {/* {item.isSaved ? "Saved" : "Save"} */}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Card;

