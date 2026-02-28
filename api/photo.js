export default async function handler(request, response) {
  const { ref } = request.query;
  const apiKey = process.env.GOOGLE_API_KEY;

  if (!apiKey) {
    return response.status(500).json({ error: 'API Key missing' });
  }

  // Google Places Photo URL
  const url = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${ref}&key=${apiKey}`;

  try {
    const imageResponse = await fetch(url);
    
    // Forward the image data to the frontend
    const imageBuffer = await imageResponse.arrayBuffer();
    response.setHeader('Content-Type', imageResponse.headers.get('content-type'));
    response.send(Buffer.from(imageBuffer));
  } catch (error) {
    response.status(500).json({ error: 'Failed to fetch image' });
  }
}
