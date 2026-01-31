import React from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import { useEffect, useMemo } from "react";
import "leaflet/dist/leaflet.css";

function FixLeafletIcon() {
  useEffect(() => {
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl:
        "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
      iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
      shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    });
  }, []);
  return null;
}

function FlyToSelected({ selected }) {
  const map = useMap();

  useEffect(() => {
    if (!selected) return;
    map.flyTo([selected.latitude, selected.longitude], 11, { duration: 0.8 });
  }, [selected, map]);

  return null;
}

const BangladeshMap = ({ warehouses = [], selectedWarehouse }) => {
    const center = useMemo(() => [23.685, 90.3563], []);
  return (
    <MapContainer center={center} zoom={7} scrollWheelZoom className="h-full w-full">
      <FixLeafletIcon />
      <FlyToSelected selected={selectedWarehouse} />

      <TileLayer
        attribution="&copy; OpenStreetMap contributors"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {warehouses.map((w, idx) => (
        <Marker key={`${w.district}-${idx}`} position={[w.latitude, w.longitude]}>
          <Popup>
            <div className="space-y-1">
              <div className="font-semibold">{w.district}</div>
              <div className="text-xs opacity-70">
                Region: {w.region} • City: {w.city}
              </div>

              <div className="text-xs">
                <span className="font-semibold">Status:</span>{" "}
                <span className={w.status === "active" ? "text-green-600" : "text-red-600"}>
                  {w.status}
                </span>
              </div>

              <div className="text-xs">
                <span className="font-semibold">Covered Areas:</span>{" "}
                {Array.isArray(w.covered_area) ? w.covered_area.join(", ") : ""}
              </div>

              {w.flowchart ? (
                <a
                  href={w.flowchart}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-blue-600 underline"
                >
                  View flowchart
                </a>
              ) : null}
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};

export default BangladeshMap;
