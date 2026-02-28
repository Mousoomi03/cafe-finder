export default async function handler(req, res) {
  const { lat, lng } = req.query;

  if (!lat || !lng) {
    return res.status(400).json({ error: "Missing coordinates" });
  }

  const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;

  const endpoint = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=1500&type=cafe&key=${GOOGLE_API_KEY}`;

  try {
    const response = await fetch(endpoint);
    const data = await response.json();
    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({ error: "Failed to fetch places" });
  }
}
