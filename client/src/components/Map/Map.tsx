import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";

const icon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});
const defaultIcon = new L.Icon.Default();

export function createDivIcon(text: number) {
  return L.divIcon({
    className: "map-marker",
    html: `<span class="map-marker-text">${text}</span>`,
    iconSize: [34, 34],
    iconAnchor: [17, 34]
  });
}

// 10 example positions (latitude/longitude in Pakistan)
const positions = [
  { lat: 31.5204, lng: 74.3587, label: { pick: "#1", id: "PK-1A", time: "10:00 AM", duration: "8 min", tonnage: "3.6 tons", wind: "12 mph" } },
  { lat: 31.5300, lng: 74.3600, label: { pick: "#2", id: "PK-2B", time: "10:15 AM", duration: "10 min", tonnage: "4.0 tons", wind: "15 mph" } },
  { lat: 31.5400, lng: 74.3700, label: { pick: "#3", id: "PK-3C", time: "10:30 AM", duration: "7 min", tonnage: "2.5 tons", wind: "10 mph" } },
  { lat: 31.5500, lng: 74.3800, label: { pick: "#4", id: "PK-4D", time: "10:45 AM", duration: "12 min", tonnage: "5.0 tons", wind: "20 mph" } },
  { lat: 31.5600, lng: 74.3900, label: { pick: "#5", id: "PK-5E", time: "11:00 AM", duration: "9 min", tonnage: "3.2 tons", wind: "14 mph" } },
  { lat: 31.5700, lng: 74.4000, label: { pick: "#6", id: "PK-6F", time: "11:15 AM", duration: "11 min", tonnage: "4.5 tons", wind: "18 mph" } },
  { lat: 31.5800, lng: 74.4100, label: { pick: "#7", id: "PK-7G", time: "11:30 AM", duration: "8 min", tonnage: "3.8 tons", wind: "16 mph" } },
  { lat: 31.5900, lng: 74.4200, label: { pick: "#8", id: "PK-8H", time: "11:45 AM", duration: "6 min", tonnage: "2.9 tons", wind: "11 mph" } },
  { lat: 31.6000, lng: 74.4300, label: { pick: "#9", id: "PK-9I", time: "12:00 PM", duration: "10 min", tonnage: "4.1 tons", wind: "15 mph" } },
  { lat: 31.6100, lng: 74.4400, label: { pick: "#10", id: "PK-10J", time: "12:15 PM", duration: "9 min", tonnage: "3.5 tons", wind: "13 mph" } }
];

export default function MyMap() {
  return (
    <div className="absolute inset-0 z-0">
      <MapContainer
        center={[31.5204, 74.3587]}
        zoom={13}
        minZoom={10}
        maxZoom={15}
        style={{ height: "400px", width: "100%" }}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {positions.map((pos, index) => (
          <Marker key={index} position={[pos.lat, pos.lng]} icon={createDivIcon(index + 1)}>
            <Popup>
              <ul style={{ paddingLeft: "15px", margin: 0 }}>
                <li><strong>Pick:</strong> {pos.label.pick}</li>
                <li><strong>ID:</strong> {pos.label.id}</li>
                <li><strong>Time:</strong> {pos.label.time}</li>
                <li><strong>Duration:</strong> {pos.label.duration}</li>
                <li><strong>Tonnage:</strong> {pos.label.tonnage}</li>
                <li><strong>Wind:</strong> {pos.label.wind}</li>
              </ul>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
