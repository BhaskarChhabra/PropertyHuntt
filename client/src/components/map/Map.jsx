import { useEffect, useState } from "react";
import { MapContainer, TileLayer, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import Pin from "../pin/Pin";

// FitBounds component: adjusts view based on items
function FitBounds({ items }) {
  const map = useMap();

  useEffect(() => {
    if (items.length > 1) {
      const bounds = items.map(item => [
        parseFloat(item.latitude),
        parseFloat(item.longitude),
      ]);
      map.fitBounds(bounds, { maxZoom: 12 }); // Fit all points, prevent over zoom
    } else if (items.length === 1) {
      const lat = parseFloat(items[0].latitude);
      const lon = parseFloat(items[0].longitude);
      map.setView([lat, lon], 15); // Zoom for a single point
    }
  }, [items, map]);

  return null;
}

// ResetViewOnEmpty component: resets view when no items
function ResetViewOnEmpty({ items, center, zoom }) {
  const map = useMap();

  useEffect(() => {
    if (items.length === 0) {
      map.setView(center, zoom);
    }
  }, [items, center, zoom, map]);

  return null;
}

// Main Map component
function Map({ items, city, address }) {
  const [center, setCenter] = useState([30, 70]); // Default world center
  const [zoom, setZoom] = useState(1); // Default world zoom

  // Fetch coordinates if no items and city/address is provided
  useEffect(() => {
    if (items.length === 0 && (city || address)) {
      const query = `${address ? address + ' ' : ''}${city ? city : ''}`.trim();

      fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json`, {
        headers: {
          "User-Agent": "your-app-name",
          "Accept-Language": "en",
        },
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.length > 0) {
            setCenter([parseFloat(data[0].lat), parseFloat(data[0].lon)]);
            setZoom(10);
          }
        })
        .catch(() => {
          setCenter([30, 70]); // Fallback on error
          setZoom(1);
        });
    }
  }, [city, address, items]);

  return (
    <MapContainer
      center={center}
      zoom={zoom}
      scrollWheelZoom={false}
      className="map"
      style={{ height: "400px", width: "100%" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {items.map((item) => (
        <Pin item={item} key={item.id} />
      ))}

      {items.length > 0 && <FitBounds items={items} />}
      {items.length === 0 && <ResetViewOnEmpty items={items} center={center} zoom={zoom} />}
    </MapContainer>
  );
}

export default Map;
