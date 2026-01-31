import React from "react";
import BangladeshMap from "./BangladeshMap";
import { useMemo, useState } from "react";
import warehousesData from "../../../public/warehouses.json";
const Coverage = () => {
  const [query, setQuery] = useState("");
  const [selectedWarehouse, setSelectedWarehouse] = useState(null);

  const warehouses = useMemo(() => warehousesData, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];

    return warehouses
      .map((w) => {
        const covered = (w.covered_area || []).join(" ").toLowerCase();
        const haystack =
          `${w.region} ${w.district} ${w.city} ${covered}`.toLowerCase();

        return haystack.includes(q) ? w : null;
      })
      .filter(Boolean)
      .slice(0, 8); // limit results
  }, [query, warehouses]);

  const activeCount = useMemo(
    () => warehouses.filter((w) => w.status === "active").length,
    [warehouses]
  );

  return (
    <div className="min-h-screen bg-base-100 px-4 py-8">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-3xl font-bold">
              We are available in 64 districts
            </h1>
            <p className="mt-1 text-base-content/70 text-sm">
              Active warehouses in your data:{" "}
              <span className="font-semibold">{activeCount}</span>
            </p>
          </div>

          {selectedWarehouse ? (
            <button
              className="btn btn-outline btn-sm"
              onClick={() => {
                setSelectedWarehouse(null);
                setQuery("");
              }}
            >
              Clear selection
            </button>
          ) : null}
        </div>

        {/* Search */}
        <div className="mt-6 max-w-xl">
          <div className="form-control relative">
            <input
              type="text"
              placeholder="Search by district, city, region, or covered area..."
              className="input input-bordered w-full"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />

            {/* Results dropdown */}
            {query.trim() && (
              <div className="absolute top-[110%] z-[999] w-full">
                <div className="card bg-base-200 shadow">
                  <div className="card-body p-2">
                    {filtered.length === 0 ? (
                      <div className="text-sm text-base-content/70 px-2 py-2">
                        No matches found.
                      </div>
                    ) : (
                      <ul className="menu menu-sm">
                        {filtered.map((w, i) => (
                          <li key={`${w.district}-${i}`}>
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedWarehouse(w);
                                setQuery(w.district);
                              }}
                              className="flex flex-col items-start gap-0"
                            >
                              <span className="font-semibold">
                                {w.district}
                              </span>
                              <span className="text-xs opacity-70">
                                {w.region} • {w.city} •{" "}
                                {w.covered_area?.length || 0} areas
                              </span>
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Selected info */}
          {selectedWarehouse ? (
            <div className="mt-4 alert">
              <div className="flex flex-col gap-1">
                <div className="font-semibold">
                  Selected: {selectedWarehouse.district} (
                  {selectedWarehouse.region})
                </div>
                <div className="text-sm">
                  Covered: {selectedWarehouse.covered_area.join(", ")}
                </div>
              </div>
            </div>
          ) : null}
        </div>

        {/* Map */}
        <div className="mt-8 h-[550px] w-full rounded-xl overflow-hidden shadow bg-base-200">
          <BangladeshMap
            warehouses={warehouses}
            selectedWarehouse={selectedWarehouse}
          />
        </div>
      </div>
    </div>
  );
};

export default Coverage;
