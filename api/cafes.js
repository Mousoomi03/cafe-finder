export default async function handler(request, response) {
  // Get the latitude and longitude from the frontend request
  const { lat, lng } = request.query;

  // 1. Get your API Key
  // OPTION A (Secure): Set GOOGLE_API_KEY in Vercel Project Settings -> Environment Variables
  // OPTION B (Quick Test): Replace process.env.GOOGLE_API_KEY below with your actual "AIza..." string
  const apiKey = process.env.GOOGLE_API_KEY; 

  if (!apiKey) {
    return response.status(500).json({ error: 'API Key missing in server configuration' });
  }

  // 2. The Google Maps URL
  const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=1500&type=cafe&key=${apiKey}`;

  try {
    // 3. Fetch from Google (Server-to-Server, so no CORS issues!)
    const googleResponse = await fetch(url);
    const data = await googleResponse.json();

    // 4. Send data back to your frontend
    response.status(200).json(data);
  } catch (error) {
    response.status(500).json({ error: 'Failed to fetch data' });
  }
}