import { useState, useEffect } from "react";
import { APIProvider, Map, AdvancedMarker, useMap } from "@vis.gl/react-google-maps";
import { useGetStationStatuses, useUpdateStationStatus } from "@/api/StationApi";

interface Station {
  place_id: string;
  name: string;
  lat: number;
  lng: number;
}

type FilterStatus = "all" | "available" | "unavailable" | "unknown";

function PetrolStations({ stations, setStations, filter, search }: {
  stations: Station[];
  setStations: React.Dispatch<React.SetStateAction<Station[]>>;
  filter: FilterStatus;
  search: string;
}) {
  const map = useMap();
  const { statuses } = useGetStationStatuses();
  const { updateStatus } = useUpdateStationStatus();
  const [selected, setSelected] = useState<Station | null>(null);

  useEffect(() => {
    if (!map) return;

    const service = new google.maps.places.PlacesService(map);
    const searchAreas = [
      { lat: -29.3142, lng: 27.4833 }, // Maseru
      { lat: -29.8167, lng: 27.7333 }, // Mafeteng
      { lat: -30.3500, lng: 27.5000 }, // Quthing
      { lat: -29.1000, lng: 28.2333 }, // Leribe
      { lat: -29.5333, lng: 28.0333 }, // Berea
      { lat: -29.6167, lng: 27.5500 }, // Mohale's Hoek
      { lat: -28.76659, lng: 28.24937 }, // Butha-Buthe
      { lat: -29.3333, lng: 28.7833 }, // Thaba-Tseka
      { lat: -30.0833, lng: 28.0500 }, // Qacha's Nek
      { lat: -29.7833, lng: 28.3667 }, // Mokhotlong
    ];

    searchAreas.forEach((location) => {
      service.nearbySearch(
        { location, radius: 30000, type: "gas_station" },
        (results: google.maps.places.PlaceResult[] | null, status: google.maps.places.PlacesServiceStatus) => {
          if (status !== google.maps.places.PlacesServiceStatus.OK || !results) return;
          const newStations: Station[] = results.map((r) => ({
            place_id: r.place_id!,
            name: r.name!,
            lat: r.geometry!.location!.lat(),
            lng: r.geometry!.location!.lng(),
          }));
          setStations((prev) => {
            const existingIds = new Set(prev.map((s) => s.place_id));
            const unique = newStations.filter((s) => !existingIds.has(s.place_id));
            return [...prev, ...unique];
          });
        }
      );
    });
  }, [map]);

  const getPinColor = (place_id: string) => {
    if (!statuses || !(place_id in statuses)) return '#9CA3AF'
    return statuses[place_id].has_fuel ? '#22C55E' : '#EF4444'
  }

  const handleUpdateStatus = async (has_fuel: boolean) => {
    if (!selected) return
    await updateStatus({
      place_id: selected.place_id,
      name: selected.name,
      lat: selected.lat,
      lng: selected.lng,
      has_fuel,
    })
    setSelected(null)
  }

  const filteredStations = stations.filter((station) => {
    // apply name search
    const matchesSearch = station.name.toLowerCase().includes(search.toLowerCase())

    // apply status filter
    const stationStatus = statuses?.[station.place_id]
    const matchesFilter =
      filter === "all" ||
      (filter === "available" && stationStatus?.has_fuel === true) ||
      (filter === "unavailable" && stationStatus?.has_fuel === false) ||
      (filter === "unknown" && !stationStatus)

    return matchesSearch && matchesFilter
  })

  return (
    <>
      {filteredStations.map((station) => (
        <AdvancedMarker
          key={station.place_id}
          position={{ lat: station.lat, lng: station.lng }}
          title={station.name}
          onClick={() => setSelected(station)}
        >
          <div style={{
            width: 16,
            height: 16,
            borderRadius: '50%',
            backgroundColor: getPinColor(station.place_id),
            border: '2px solid white',
            boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
          }} />
        </AdvancedMarker>
      ))}

      {selected && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-white rounded-lg shadow-lg p-4 z-50 w-72">
          <h3 className="font-bold text-lg mb-1">{selected.name}</h3>
          {statuses?.[selected.place_id] && (
            <p className="text-sm text-gray-500 mb-2">
              Last updated by: {statuses[selected.place_id].updated_by_email}
            </p>
          )}
          <p className="text-sm text-gray-600 mb-3">Update fuel availability:</p>
          <div className="flex gap-2">
            <button
              onClick={() => handleUpdateStatus(true)}
              className="flex-1 bg-green-500 text-white py-2 rounded hover:bg-green-600"
            >
              ✅ Has Fuel
            </button>
            <button
              onClick={() => handleUpdateStatus(false)}
              className="flex-1 bg-red-500 text-white py-2 rounded hover:bg-red-600"
            >
              ❌ No Fuel
            </button>
          </div>
          <button
            onClick={() => setSelected(null)}
            className="mt-2 w-full text-sm text-gray-500 hover:text-gray-700"
          >
            Cancel
          </button>
        </div>
      )}
    </>
  );
}

export default function HomePage() {
  const [stations, setStations] = useState<Station[]>([]);
  const [filter, setFilter] = useState<FilterStatus>("all");
  const [search, setSearch] = useState("");

  return (
    <APIProvider
      apiKey={import.meta.env.VITE_PUBLIC_GOOGLE_MAPS_API_KEY}
      libraries={["places"]}
    >
      {/* Search and filter bar */}
      <div className="flex flex-col md:flex-row gap-2 p-3 bg-white border-b shadow-sm">
        <input
          type="text"
          placeholder="Search petrol station..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <div className="flex gap-2">
          {(["all", "available", "unavailable", "unknown"] as FilterStatus[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-2 rounded-lg text-sm font-medium capitalize border transition-colors ${
                filter === f
                  ? f === "available" ? "bg-green-500 text-white border-green-500"
                  : f === "unavailable" ? "bg-red-500 text-white border-red-500"
                  : f === "unknown" ? "bg-gray-400 text-white border-gray-400"
                  : "bg-blue-500 text-white border-blue-500"
                  : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"
              }`}
            >
              {f === "available" ? "🟢 Has Fuel"
                : f === "unavailable" ? "🔴 No Fuel"
                : f === "unknown" ? "⚪ Unknown"
                : "All"}
            </button>
          ))}
        </div>
      </div>

      <div style={{ height: "calc(80vh - 60px)" }} className="relative">
        <Map
          zoom={9}
          center={{ lat: -29.6, lng: 28.2 }}
          mapId="lesotho-petrol-map"
          gestureHandling="greedy"
        >
          <PetrolStations
            stations={stations}
            setStations={setStations}
            filter={filter}
            search={search}
          />
        </Map>
      </div>
    </APIProvider>
  );
}