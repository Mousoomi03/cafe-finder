import React, { useState, useEffect, useRef } from 'react';
import { Coffee, Heart, RotateCcw, X, MapPin, Star, Clock } from 'lucide-react';

// --- CONFIGURATION ---
const USE_MOCK_DATA = true;
const GOOGLE_API_KEY = "YOUR_API_KEY_HERE"; 

// --- MOCK DATA ---
const MOCK_CAFES = [
  { id: 1, name: "The Daily Grind", rating: 4.8, open_now: true, photo: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=600&q=80" },
  { id: 2, name: "Espresso Lab", rating: 4.5, open_now: true, photo: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=600&q=80" },
  { id: 3, name: "Bean & Leaf", rating: 4.2, open_now: false, photo: "https://images.unsplash.com/photo-1497935586351-b67a49e012bf?auto=format&fit=crop&w=600&q=80" },
  { id: 4, name: "Morning Brew", rating: 4.9, open_now: true, photo: "https://images.unsplash.com/photo-1521017432531-fbd92d768814?auto=format&fit=crop&w=600&q=80" },
  { id: 5, name: "Code & Coffee", rating: 5.0, open_now: true, photo: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=600&q=80" }
];

// --- COMPONENTS ---

// 1. Swipeable Card Component
// Handles the physics of dragging, rotating, and dismissing cards
const SwipeableCard = ({ data, onSwipe, style, isTop }) => {
  const cardRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const startPos = useRef({ x: 0, y: 0 });

  const handlePointerDown = (e) => {
    if (!isTop) return;
    setIsDragging(true);
    startPos.current = { x: e.clientX, y: e.clientY };
    e.target.setPointerCapture(e.pointerId);
    if (cardRef.current) cardRef.current.style.transition = 'none';
  };

  const handlePointerMove = (e) => {
    if (!isDragging || !isTop || !cardRef.current) return;
    
    const deltaX = e.clientX - startPos.current.x;
    const rotate = deltaX * 0.05; // 5% rotation based on X movement
    
    cardRef.current.style.transform = `translateX(${deltaX}px) rotate(${rotate}deg)`;
    
    // Visual feedback for opacity if needed, but we'll stick to simple movement for now
  };

  const handlePointerUp = (e) => {
    if (!isDragging || !isTop || !cardRef.current) return;
    
    setIsDragging(false);
    e.target.releasePointerCapture(e.pointerId);
    
    const deltaX = e.clientX - startPos.current.x;
    const threshold = 100; // Pixels to trigger a swipe

    if (Math.abs(deltaX) > threshold) {
      // Swipe Triggered
      const direction = deltaX > 0 ? 'right' : 'left';
      const endX = direction === 'right' ? 1000 : -1000;
      
      cardRef.current.style.transition = 'transform 0.4s ease-out';
      cardRef.current.style.transform = `translateX(${endX}px) rotate(${deltaX * 0.05}deg)`;
      
      setTimeout(() => {
        onSwipe(direction, data);
      }, 200); // Wait slightly for animation to start visually
    } else {
      // Reset (Snap back)
      cardRef.current.style.transition = 'transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
      cardRef.current.style.transform = 'translate(0px, 0px) rotate(0deg)';
    }
  };

  return (
    <div
      ref={cardRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      className={`absolute w-full h-full bg-white rounded-3xl shadow-xl overflow-hidden cursor-grab active:cursor-grabbing touch-none select-none border border-gray-100 ${isTop ? 'z-50' : ''}`}
      style={style}
    >
      <div className="relative h-64 bg-gray-200 pointer-events-none">
        <img 
          src={data.photo} 
          alt={data.name}
          className="w-full h-full object-cover"
          draggable="false"
        />
        <div className="absolute bottom-0 left-0 w-full h-20 bg-gradient-to-t from-black/60 to-transparent"></div>
        <div className="absolute bottom-4 left-4 text-white">
          <h2 className="text-2xl font-bold drop-shadow-md">{data.name}</h2>
        </div>
      </div>
      
      <div className="p-6 pointer-events-none">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-1 bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-sm font-semibold">
            <Star size={16} fill="currentColor" />
            <span>{data.rating}</span>
          </div>
          <div className={`flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-semibold ${data.open_now ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            <Clock size={16} />
            <span>{data.open_now ? 'Open Now' : 'Closed'}</span>
          </div>
        </div>
        
        <div className="space-y-2 text-gray-500 text-sm">
          <p className="flex items-center gap-2">
            <MapPin size={16} />
            <span>Swipe right to save to your list</span>
          </p>
          <p className="flex items-center gap-2">
            <X size={16} />
            <span>Swipe left to skip</span>
          </p>
        </div>
      </div>

      {/* Overlay feedback hints */}
      {isDragging && isTop && (
        <>
          <div className="absolute top-8 right-8 border-4 border-green-500 text-green-500 font-bold text-3xl px-4 py-2 rounded-lg transform -rotate-12 opacity-0 transition-opacity duration-200 swipe-hint-right">
            LIKE
          </div>
          <div className="absolute top-8 left-8 border-4 border-red-500 text-red-500 font-bold text-3xl px-4 py-2 rounded-lg transform rotate-12 opacity-0 transition-opacity duration-200 swipe-hint-left">
            NOPE
          </div>
        </>
      )}
    </div>
  );
};

// 2. Saved List Component
const SavedList = ({ isOpen, onClose, items }) => {
  return (
    <div className={`fixed inset-0 bg-white z-[60] transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-y-0' : 'translate-y-full'}`}>
      <div className="p-6 h-full flex flex-col">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Your Favorite Spots</h2>
          <button onClick={onClose} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200">
            <X size={24} />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto space-y-4">
          {items.length === 0 ? (
            <div className="text-center text-gray-400 mt-20">
              <Heart size={48} className="mx-auto mb-4 opacity-50" />
              <p>No cafes saved yet.</p>
              <p className="text-sm">Get swiping to build your list!</p>
            </div>
          ) : (
            items.map((cafe) => (
              <div key={cafe.id} className="flex items-center gap-4 p-3 bg-white border border-gray-100 rounded-xl shadow-sm">
                <img src={cafe.photo} alt={cafe.name} className="w-16 h-16 rounded-lg object-cover bg-gray-200" />
                <div>
                  <h3 className="font-bold text-gray-800">{cafe.name}</h3>
                  <div className="flex items-center text-yellow-500 text-sm">
                    <Star size={14} fill="currentColor" className="mr-1" />
                    {cafe.rating}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

// 3. Main App Component
const App = () => {
  const [cafes, setCafes] = useState([]);
  const [savedCafes, setSavedCafes] = useState(() => {
    const local = localStorage.getItem('savedCafes');
    return local ? JSON.parse(local) : [];
  });
  const [showSaved, setShowSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  // Initialize Data
  useEffect(() => {
    loadCafes();
  }, []);

  const loadCafes = async () => {
    setLoading(true);
    if (USE_MOCK_DATA) {
      // Simulate network delay
      setTimeout(() => {
        setCafes([...MOCK_CAFES]);
        setLoading(false);
      }, 800);
    } else {
      await fetchNearbyCafes();
      setLoading(false);
    }
  };

  const fetchNearbyCafes = async () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported");
      return;
    }
    
    // Simple Promise wrapper for geolocation
    const getPos = () => new Promise((resolve, reject) => 
      navigator.geolocation.getCurrentPosition(resolve, reject)
    );

    try {
      const position = await getPos();
      const { latitude, longitude } = position.coords;
      const res = await fetch(`/api/places?lat=${latitude}&lng=${longitude}`);
      const data = await res.json();
      
      if (data.results) {
        const formatted = data.results.map(place => ({
          id: place.place_id,
          name: place.name,
          rating: place.rating,
          open_now: place.opening_hours?.open_now,
          photo: place.photos 
            ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${place.photos[0].photo_reference}&key=${GOOGLE_API_KEY}`
            : "https://via.placeholder.com/400x300?text=No+Image"
        }));
        setCafes(formatted);
      }
    } catch (err) {
      console.error("Fetch error:", err);
      alert("Failed to load cafes. Check console.");
    }
  };

  const handleSwipe = (direction, cafe) => {
    // Remove the swiped card from the stack
    setCafes(prev => prev.filter(c => c.id !== cafe.id));

    if (direction === 'right') {
      // Save logic
      if (!savedCafes.some(c => c.id === cafe.id)) {
        const newSaved = [...savedCafes, cafe];
        setSavedCafes(newSaved);
        localStorage.setItem('savedCafes', JSON.stringify(newSaved));
      }
    }
  };

  return (
    <div className="relative min-h-screen bg-gray-50 flex flex-col overflow-hidden font-sans text-gray-800">
      
      {/* Header */}
      <header className="pt-8 pb-4 text-center z-10 px-4">
        <div className="flex items-center justify-center gap-2 mb-1">
          <Coffee className="text-red-500" size={28} />
          <h1 className="text-2xl font-bold tracking-tight">Cafe Finder</h1>
        </div>
        <p className="text-gray-400 text-sm">Find your next brew</p>
      </header>

      {/* Main Card Stack Area */}
      <main className="flex-1 flex flex-col items-center justify-start pt-6 relative">
        <div className="relative w-full max-w-sm h-[450px] px-4">
          
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center z-0">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
            </div>
          )}

          {!loading && cafes.length === 0 && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center z-0 animate-fade-in p-8">
              <div className="bg-white p-6 rounded-full shadow-md mb-4">
                <Coffee size={40} className="text-gray-300" />
              </div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No more cafes!</h3>
              <p className="text-gray-500 mb-6">You've viewed all nearby locations.</p>
              <button 
                onClick={loadCafes}
                className="flex items-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-full font-semibold shadow-lg hover:bg-blue-600 transition-colors"
              >
                <RotateCcw size={18} />
                Start Over
              </button>
            </div>
          )}

          {/* Render Stack */}
          {cafes.map((cafe, index) => {
            // Only render the top 2 cards for performance and visual stacking
            if (index > cafes.length - 3) return null; // Logic is actually: render ALL, but only top is interactive.
            // Better stack logic:
            // The last element in the array is usually "on top" in CSS unless we z-index manually.
            // But dragging usually pops/removes elements. 
            // Let's rely on standard array order: Index 0 is bottom, Index Length-1 is top.
            
            const isTop = index === 0; // We will shift() from the array, so index 0 is actually the one we interact with usually? 
            // Wait, standard stack: 
            // If I map: [A, B, C]. React renders A then B then C. C is on top (highest z-index naturally).
            // So if I filter, I remove C? Or A?
            // Let's assume index 0 is the TOP card for simplicity of data management (queue),
            // BUT we must use z-index to force it visual top.
            
            return (
              <SwipeableCard 
                key={cafe.id} 
                data={cafe} 
                onSwipe={handleSwipe}
                isTop={index === 0} 
                style={{ 
                  zIndex: 100 - index,
                  transform: `scale(${1 - index * 0.05}) translateY(${index * 15}px)`,
                  opacity: index > 2 ? 0 : 1 // Hide cards deep in stack
                }}
              />
            );
          })}
        </div>
      </main>

      {/* Control Bar */}
      <div className="pb-8 px-8 w-full max-w-md mx-auto z-50">
        <div className="flex justify-between items-center bg-white rounded-2xl shadow-xl p-2 border border-gray-100">
          <button 
            onClick={loadCafes}
            className="p-4 rounded-xl text-gray-400 hover:bg-gray-50 transition-colors"
          >
            <RotateCcw size={24} />
          </button>
          
          <button 
            onClick={() => {
                if(cafes.length > 0) handleSwipe('left', cafes[0]);
            }}
            className="p-4 rounded-xl text-red-400 hover:bg-red-50 hover:text-red-500 transition-colors"
          >
            <X size={32} />
          </button>

          <button 
             onClick={() => {
                if(cafes.length > 0) handleSwipe('right', cafes[0]);
            }}
            className="p-4 rounded-xl text-green-400 hover:bg-green-50 hover:text-green-500 transition-colors"
          >
            <Heart size={32} fill="currentColor" className="text-green-500/20" />
          </button>
          
          <button 
            onClick={() => setShowSaved(true)}
            className="relative p-4 rounded-xl text-yellow-500 hover:bg-yellow-50 transition-colors"
          >
            <Star size={24} fill={savedCafes.length > 0 ? "currentColor" : "none"} />
            {savedCafes.length > 0 && (
              <span className="absolute top-3 right-3 w-2 h-2 bg-red-500 rounded-full"></span>
            )}
          </button>
        </div>
      </div>

      {/* Saved List Overlay */}
      <SavedList 
        isOpen={showSaved} 
        onClose={() => setShowSaved(false)} 
        items={savedCafes} 
      />

      {/* Global Style overrides for specific swipe hint visibility logic */}
      <style>{`
        .swipe-hint-right, .swipe-hint-left { opacity: 0; }
        /* Simple logic: we rely on JS to rotate, but here we can add helper classes if we wanted */
      `}</style>
    </div>
  );
};

export default App;