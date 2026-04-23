const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

async function saveSearchHistoryRequest(payload: {
  auth0_id: string;
  email: string;
  place_id: string;
  station_name: string;
  query_text: string;
  lat: number;
  lng: number;
}) {
  const response = await fetch(`${API_BASE_URL}/api/search-history`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error("Failed to save search history");
  }

  return response.json();
}
 export { saveSearchHistoryRequest };