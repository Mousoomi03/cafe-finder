
# ☕ Cafe Finder

A **React-based web application** that helps users discover nearby cafes using a Tinder-like swipe interface. Users can swipe right to save their favorite spots and swipe left to pass.

**Live Demo:** [Cafe Finder](https://cafefinder.vercel.app/)

## ✨ Features

* **Real-time Geolocation:** Automatically detects the user's current position to provide relevant local results.
* **Interactive Mapping:** Full integration with Google Maps for visual navigation.
* **Swipe Interface:** Intuitive card-based UI where users swipe right to "Like" (save) and left to "Pass".
* **Saved Favorites:** View a curated list of all your saved cafes.
* **Responsive Design:** Fully optimized for mobile and desktop devices using Tailwind CSS.
* **Real-time Data:** Displays ratings, opening status, and photos directly from Google Maps.

---

## 🛠️ Technical Stack
- **Frontend:** React.js (Hooks & Context API)
- **APIs:** Google Maps JavaScript API, Google Places API
- **Styling:** CSS3 (Flexbox/Grid)
- **State Management:** Functional components with `useState` and `useEffect` hooks.

---
## 🏗️ How it Works
The application workflow involves:
1. **Permission:** Requesting user geolocation via the Browser API.
2. **Fetch:** Calling the Google Places Library to search for `type: cafe` within a specified radius.
3. **Render:** Dynamically rendering custom map markers and a searchable sidebar list.
4. **State Management:** Handling API responses efficiently to prevent unnecessary re-renders and optimize performance.

---
## Prerequisites

* **Node.js** (v14 or higher)
* **npm** (v6 or higher)
* **Google Maps API Key** with the *Places API* enabled.


---

## 🔑 API Configuration

This project uses the **Google Maps Places API**. You need to configure your API key for both the frontend (images) and the backend (search results).

### 1. Local Development

Open `src/App.js` and replace the placeholder with your actual API key:

```javascript
const HARDCODED_KEY = "YOUR_ACTUAL_GOOGLE_API_KEY";

```

> **Note on CORS:** For local development, you may encounter CORS errors since the Google Places API does not natively support client-side requests from localhost. The app includes a built-in fallback to `cors-anywhere.herokuapp.com` for this purpose.

### 2. Deployment (Vercel)

To deploy on Vercel:

1. Push your code to GitHub.
2. Import the project into Vercel.
3. Add your API Key as an **Environment Variable** in the Vercel dashboard settings to keep it secure.
