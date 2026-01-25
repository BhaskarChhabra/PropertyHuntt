import { Link } from "react-router-dom";
import "./postCard.scss"; // Assuming you will create this SCSS file

// Helper function to format price (e.g., adds commas or 'M' for millions)
const formatPrice = (price) => {
  if (price === undefined || price === null) return 'Price N/A';
  // Example: Convert to millions if large, otherwise use commas
  if (price >= 1000000) {
    return (price / 1000000).toFixed(1) + 'M';
  }
  return price.toLocaleString('en-US');
};

// Helper function for a time ago badge (needs actual implementation based on post.createdAt)
const getTimeAgo = (createdAt) => {
  // *** Placeholder implementation - replace with actual logic ***
  // e.g., using a library like 'timeago.js' or custom logic
  return "N MONTHS AGO"; 
};

// The component receives an 'item' (the post object) as a prop.
function PostCard({ item }) {
  // Determine if it's a rental to display '/month'
  const isRental = item.type === "rent" || item.type === "rental" || item.pricePer === "month";

  // Use dummy values if your API response is missing bedRooms or bathRooms
  const beds = item.bedRooms || 2; 
  const rests = item.bathRooms || 1; 

  return (
    <div className="postCard">
      <Link to={`/${item.id}`} className="imageContainer">
        {/* Time Ago Badge */}
        <div className="timeAgoBadge">{getTimeAgo(item.createdAt)}</div>
        {/* Main Image - ensure item.images is an array */}
        <img src={item.images?.[0] || '/noimage.jpg'} alt={item.title} />
      </Link>
      
      <div className="textContainer">
        {/* Location - using 'city' and 'address' together */}
        <div className="location">
          <img src="/pin.png" alt="Location Pin" />
          <span>{item.address || item.city || 'Unknown Location'}</span>
        </div>

        {/* Property Title */}
        <Link to={`/${item.id}`} className="titleLink">
          <h2>{item.title}</h2>
        </Link>
        
        {/* Price */}
        <p className="price">
          {`Ksh ${formatPrice(item.price)}`} 
          {isRental && ` /month`}
        </p>
        
        {/* Features (Beds and Rests) */}
        <div className="features">
          <div className="feature">
            <img src="/bed.png" alt="Bed Icon" />
            <span>{beds} Bed{beds !== 1 ? 's' : ''}</span>
          </div>
          <div className="feature">
            <img src="/bath.png" alt="Rest Icon" />
            <span>{rests} Rest{rests !== 1 ? 's' : ''}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PostCard;