import { Marker, InfoWindow } from "@react-google-maps/api";
import { useState } from "react";

function Pin({ item }) {
  const [isOpen, setIsOpen] = useState(false);
  // Ensure the coordinates are parsed to numbers for the Google Maps API
  const position = { 
    lat: parseFloat(item.latitude), 
    lng: parseFloat(item.longitude) 
  };

  return (
    <Marker
      position={position}
      onClick={() => setIsOpen(true)}
    >
      {/* InfoWindow acts as the popup when the Marker is clicked */}
      {isOpen && (
        <InfoWindow
          onCloseClick={() => setIsOpen(false)}
          position={position}
        >
          <div className="infoWindowContent">
            <h3>{item.title}</h3>
            <p>Price: ${item.price}</p>
            <a href={`/list/${item.id}`}>View Details</a>
          </div>
        </InfoWindow>
      )}
    </Marker>
  );
}

export default Pin;