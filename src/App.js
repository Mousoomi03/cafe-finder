import React, { useState, useEffect, useRef } from 'react';
import { Coffee, Heart, RotateCcw, X, MapPin, Star, Clock, Navigation } from 'lucide-react';

// --- CONFIGURATION ---
const USE_MOCK_DATA = false;
const GOOGLE_API_KEY = process.env.REACT_APP_GOOGLE_API_KEY;
// --- MOCK DATA ---
const MOCK_CAFES = [
  { id: 1, name: "The Daily Grind", rating: 4.8, open_now: true, photo: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=600&q=80" },
  { id: 2, name: "Espresso Lab", rating: 4.5, open_now: true, photo: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=600&q=80" },
  { id: 3, name: "Bean & Leaf", rating: 4.2, open_now: false, photo: "https://images.unsplash.com/photo-1497935586351-b67a49e012bf?auto=format&fit=crop&w=600&q=80" },
];

// 1. Swipeable Card Component with 3D Effects
const SwipeableCard = ({ data, onSwipe, index }) => {
  const cardRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const startPos = useRef({ x: 0, y: 0 });
  const isTop = index === 0;

  const handlePointerDown = (e) => {
    if (!isTop) return;
    setIsDragging(true);
    startPos.current = { 
      x: e.clientX || e.touches?.[0]?.clientX, 
      y: e.clientY || e.touches?.[0]?.clientY 
    };
    if (cardRef.current) cardRef.current.style.transition = 'none';
  };

  const handlePointerMove = (e) => {
    if (!isDragging || !isTop || !cardRef.current) return;
    if (e.cancelable) e.preventDefault();
    
    const clientX = e.clientX || e.touches?.[0]?.clientX;
    const deltaX = clientX - startPos.current.x;
    
    // Calculate rotation and opacity based on drag distance
    const rotate = deltaX * 0.08;
    const opacity = 1 - Math.abs(deltaX) / 1000;
    
    cardRef.current.style.transform = `translateX(${deltaX}px) rotate(${rotate}deg) scale(1.05)`;
    cardRef.current.style.opacity = opacity;
    
    // Visual feedback on cursor
    cardRef.current.style.cursor = 'grabbing';
  };

  const handlePointerUp = (e) => {
    if (!isDragging || !isTop || !cardRef.current) return;
    
    setIsDragging(false);
    cardRef.current.style.cursor = 'grab';
    
    const clientX = e.clientX || e.changedTouches?.[0]?.clientX;
    const deltaX = clientX - startPos.current.x;
    const threshold = 120; // Drag threshold

    if (Math.abs(deltaX) > threshold) {
      const direction = deltaX > 0 ? 'right' : 'left';
      const endX = direction === 'right' ? window.innerWidth + 200 : -window.innerWidth - 200;
      
      cardRef.current.style.transition = 'transform 0.4s ease-in, opacity 0.4s ease-in';
      cardRef.current.style.transform = `translateX(${endX}px) rotate(${deltaX * 0.05}deg)`;
      cardRef.current.style.opacity = '0';
      
      setTimeout(() => {
        onSwipe(direction, data);
      }, 300);
    } else {
      // Snap back to center
      cardRef.current.style.transition = 'transform 0.5s cubic-bezier(0.2, 0.8, 0.2, 1.2)';
      cardRef.current.style.transform = 'translate(0px, 0px) rotate(0deg) scale(1)';
      cardRef.current.style.opacity = '1';
    }
  };

  // 3D Stacking Logic
  const stackStyle = {
    zIndex: 50 - index,
    transform: `scale(${1 - index * 0.06}) translateY(${index * 25}px) translateZ(${-index * 20}px)`,
    opacity: index > 2 ? 0 : 1,
    filter: `brightness(${100 - index * 10}%) blur(${index * 1}px)`,
    transition: 'all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
  };

  return (
    <div
      ref={cardRef}
      onMouseDown={handlePointerDown}
      onMouseMove={handlePointerMove}
      onMouseUp={handlePointerUp}
      onMouseLeave={handlePointerUp}
      onTouchStart={handlePointerDown}
      onTouchMove={handlePointerMove}
      onTouchEnd={handlePointerUp}
      className={`absolute inset-0 w-full h-full rounded-[30px] overflow-hidden shadow-2xl border border-white/40 bg-white select-none ${isTop ? 'cursor-grab touch-none' : 'pointer-events-none'}`}
      style={{
        ...stackStyle,
        boxShadow: isTop 
          ? '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.5) inset' 
          : '0 10px 30px -10px rgba(0,0,0,0.1)' 
      }}
    >
      {/* Image Section */}
      <div className="relative h-[68%] w-full overflow-hidden">
        <img 
          src={data.photo} 
          alt={data.name}
          className="w-full h-full object-cover pointer-events-none"
          draggable="false"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-90"></div>
        
        {/* Top Badges */}
        <div className="absolute top-4 right-4 flex gap-2">
          <div className={`backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-white shadow-lg flex items-center gap-1 ${data.open_now ? 'bg-green-500/80' : 'bg-red-500/80'}`}>
            <Clock size={12} />
            {data.open_now ? 'OPEN' : 'CLOSED'}
          </div>
        </div>

        {/* Name Overlay */}
        <div className="absolute bottom-0 left-0 w-full p-5 text-white">
           <h2 className="text-3xl font-black tracking-tight leading-tight drop-shadow-lg mb-1">{data.name}</h2>
           <div className="flex items-center text-yellow-400 font-bold text-sm">
             {[...Array(5)].map((_, i) => (
                <Star key={i} size={14} fill={i < Math.round(data.rating) ? "currentColor" : "none"} strokeWidth={3} className={i < Math.round(data.rating) ? "" : "text-gray-400"} />
             ))}
             <span className="ml-2 text-white/90">({data.rating})</span>
           </div>
        </div>
      </div>
      
      {/* Content Section */}
      <div className="h-[32%] bg-white/80 backdrop-blur-xl p-5 flex flex-col justify-between">
        <div className="space-y-3">
          <p className="flex items-center gap-3 text-gray-600 text-sm font-medium bg-gray-50 p-2 rounded-xl">
            <div className="p-1.5 bg-green-100 rounded-full text-green-600">
              <Heart size={14} />
            </div>
            <span>Swipe <b className="text-green-600">Right</b> to Save</span>
          </p>
          <p className="flex items-center gap-3 text-gray-600 text-sm font-medium bg-gray-50 p-2 rounded-xl">
             <div className="p-1.5 bg-red-100 rounded-full text-red-600">
              <X size={14} />
            </div>
            <span>Swipe <b className="text-red-600">Left</b> to Skip</span>
          </p>
        </div>
      </div>

      {/* Swipe Feedback Overlays */}
      {isDragging && isTop && (
        <>
          <div className="absolute top-10 right-10 border-4 border-green-500 text-green-500 font-black text-4xl px-4 py-2 rounded-xl transform -rotate-12 opacity-0 transition-opacity duration-200 swipe-hint-right bg-white/20 backdrop-blur-sm">
            LIKE
          </div>
          <div className="absolute top-10 left-10 border-4 border-red-500 text-red-500 font-black text-4xl px-4 py-2 rounded-xl transform rotate-12 opacity-0 transition-opacity duration-200 swipe-hint-left bg-white/20 backdrop-blur-sm">
            NOPE
          </div>
        </>
      )}
    </div>
  );
};

// 2. Saved List Component
const SavedList = ({ isOpen, onClose, items, onRemove }) => {
  const handleMapClick = (cafe, e) => {
    e.stopPropagation();
    const searchQuery = encodeURIComponent(cafe.name + ' cafe');
    window.open(`https://www.google.com/maps/search/?api=1&query=${searchQuery}`, '_blank');
  };

  return (
    <div className={`fixed inset-0 z-[60] transition-all duration-500 ${isOpen ? 'visible' : 'invisible'}`}>
      {/* Backdrop */}
      <div 
        className={`absolute inset-0 bg-black/30 backdrop-blur-sm transition-opacity duration-500 ${isOpen ? 'opacity-100' : 'opacity-0'}`}
        onClick={onClose}
      />
      
      {/* Drawer */}
      <div className={`absolute bottom-0 left-0 right-0 h-[85vh] bg-white rounded-t-[3rem] shadow-[0_-10px_40px_rgba(0,0,0,0.2)] transform transition-transform duration-500 cubic-bezier(0.32, 0.72, 0, 1) ${isOpen ? 'translate-y-0' : 'translate-y-full'}`}>
        <div className="flex flex-col h-full p-6">
          
          {/* Handle bar */}
          <div className="w-16 h-1.5 bg-gray-300 rounded-full mx-auto mb-6 flex-shrink-0" />
          
          <div className="flex justify-between items-center mb-6 flex-shrink-0">
            <div>
              <h2 className="text-3xl font-black text-gray-800">Your List</h2>
              <p className="text-gray-500 font-medium">{items.length} spots saved</p>
            </div>
            <button onClick={onClose} className="p-3 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors">
              <X size={20} />
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto space-y-4 pb-8 pr-2 custom-scrollbar">
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-center text-gray-400">
                <Heart size={64} className="mb-4 text-gray-200" />
                <p className="text-lg font-medium">Your collection is empty.</p>
              </div>
            ) : (
              items.map((cafe) => (
                <div 
                  key={cafe.id}
                  className="group flex gap-4 p-3 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
                >
                  <img src={cafe.photo} alt={cafe.name} className="w-24 h-24 rounded-xl object-cover shadow-sm" />
                  <div className="flex-1 py-1 flex flex-col justify-between min-w-0">
                    <div>
                      <h3 className="font-bold text-lg text-gray-800 truncate">{cafe.name}</h3>
                      <div className="flex items-center gap-1 text-yellow-500 text-sm font-bold">
                        <Star size={14} fill="currentColor" /> {cafe.rating}
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                       <button
                        onClick={(e) => handleMapClick(cafe, e)}
                        className="flex-1 flex items-center justify-center gap-1.5 bg-blue-50 text-blue-600 py-2 rounded-lg text-xs font-bold hover:bg-blue-100 transition-colors"
                      >
                        <Navigation size={12} /> Directions
                      </button>
                      <button
                        onClick={() => onRemove(cafe.id)}
                        className="px-3 bg-red-50 text-red-500 rounded-lg hover:bg-red-100 transition-colors"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
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

  useEffect(() => {
    loadCafes();
  }, []);

  const formatCafes = (results) => {
    return results.map(place => ({
      id: place.place_id,
      name: place.name,
      rating: place.rating,
      open_now: place.opening_hours?.open_now,
      // API Proxy logic maintained
      photo: (place.photos && place.photos.length > 0)
        ? `/api/photo?ref=${place.photos[0].photo_reference}`
        : "https://via.placeholder.com/400x300?text=No+Image"
    }));
  };

  const fetchCafesAtLocation = async (lat, lng) => {
    try {
      const response = await fetch(`/api/cafes?lat=${lat}&lng=${lng}`);
      const contentType = response.headers.get("content-type");
      if (response.ok && contentType && contentType.includes("application/json")) {
         const data = await response.json();
         if (data.results) {
             setCafes(formatCafes(data.results));
             return; 
         }
      }
    } catch (err) {
      console.error("Failed to fetch cafes:", err);
      alert("Unable to load cafes. Please try again.");
    }
  };

  const loadCafes = async () => {
    setLoading(true);
    await fetchNearbyCafes();
    setLoading(false);
  };

  const fetchNearbyCafes = async () => {
    if (!navigator.geolocation) return alert("Geolocation not supported");

    const cache = JSON.parse(localStorage.getItem('cachedLocation') || '{}');
    const now = Date.now();

    if (cache.timestamp && now - cache.timestamp < 600000) { // 10 mins
      await fetchCafesAtLocation(cache.lat, cache.lng);
    } else {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const { latitude, longitude } = pos.coords;
          localStorage.setItem('cachedLocation', JSON.stringify({ lat: latitude, lng: longitude, timestamp: now }));
          await fetchCafesAtLocation(latitude, longitude);
        },
        () => {
          alert("Location access denied. Please enable location services.");
          setLoading(false);
        }
      );
    }
  };

  const handleSwipe = (direction, cafe) => {
    setCafes(prev => prev.filter(c => c.id !== cafe.id));
    if (direction === 'right') {
      if (!savedCafes.some(c => c.id === cafe.id)) {
        const newSaved = [...savedCafes, cafe];
        setSavedCafes(newSaved);
        localStorage.setItem('savedCafes', JSON.stringify(newSaved));
      }
    }
  };

  return (
    // Main Container with Animated Gradient Background
    <div className="relative h-screen w-full bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 overflow-hidden font-sans flex flex-col">
      
      {/* Dynamic Background Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-300/30 rounded-full blur-[80px] animate-blob"></div>
      <div className="absolute top-[20%] right-[-10%] w-[35%] h-[35%] bg-pink-300/30 rounded-full blur-[80px] animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-[-10%] left-[20%] w-[45%] h-[45%] bg-blue-300/30 rounded-full blur-[80px] animate-blob animation-delay-4000"></div>

      {/* Header */}
      <header className="relative z-10 pt-8 pb-4 text-center flex-none animate-fade-in">
        <div className="inline-flex items-center justify-center gap-4 bg-white/50 backdrop-blur-xl px-8 py-4 rounded-3xl border-2 border-white/60 shadow-2xl animate-float" style={{boxShadow: '0 20px 60px rgba(168,85,247,0.3), 0 0 0 1px rgba(255,255,255,0.5)'}}>
          <div className="p-3 bg-gradient-to-br from-pink-500 via-rose-500 to-orange-500 rounded-2xl shadow-lg animate-pulse-slow" style={{boxShadow: '0 10px 30px rgba(236,72,153,0.5)'}}>
            <Coffee className="text-white animate-wiggle" size={28} strokeWidth={2.5} />
          </div>
          <h1 className="text-4xl sm:text-5xl font-black bg-gradient-to-r from-purple-600 via-pink-500 to-red-500 bg-clip-text text-transparent tracking-tight animate-gradient-shift" style={{textShadow: '0 4px 20px rgba(168,85,247,0.4)', transform: 'translateZ(20px)'}}>
            Cafe Finder
          </h1>
        </div>
        
      </header>

      {/* Main Content - Flex Grow to fill space */}
      <main className="flex-1 relative flex flex-col items-center justify-center w-full max-w-md mx-auto px-4 z-20">
        
        {/* Card Stack Container with Perspective */}
        <div className="relative w-full aspect-[3/4] max-h-[65vh] min-h-[400px] perspective-container">
          
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-16 h-16 border-4 border-white/30 border-t-pink-500 rounded-full animate-spin shadow-xl"></div>
            </div>
          )}

          {!loading && cafes.length === 0 && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center bg-white/60 backdrop-blur-xl rounded-[3rem] border border-white shadow-xl animate-fade-in p-8">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                 <Coffee size={40} className="text-gray-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">All Caught Up!</h3>
              <p className="text-gray-500 mb-8">You've explored all the cafes in this area.</p>
              <button 
                onClick={loadCafes}
                className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl font-bold shadow-lg shadow-blue-500/30 hover:scale-105 transition-transform"
              >
                <RotateCcw size={20} strokeWidth={2.5} />
                Start Over
              </button>
            </div>
          )}

          {cafes.map((cafe, index) => {
            if (index > 2) return null; // Only render top 3 for performance
            return (
              <SwipeableCard 
                key={cafe.id} 
                data={cafe} 
                onSwipe={handleSwipe}
                index={index}
              />
            );
          })}
        </div>

      </main>

      {/* Control Bar */}
      <div className="relative z-50 px-6 pb-8 pt-2 w-full max-w-md mx-auto">
        <div className="flex justify-between items-center bg-white/70 backdrop-blur-xl rounded-3xl p-2 shadow-[0_8px_32px_rgba(0,0,0,0.12)] border border-white/50">
          
          <button 
            onClick={loadCafes}
            className="p-4 rounded-2xl text-gray-500 hover:bg-gray-100 transition-all hover:scale-110 active:scale-95 group"
          >
            <RotateCcw size={24} className="group-hover:-rotate-180 transition-transform duration-500" />
          </button>
          
          <div className="flex gap-4">
            <button 
              onClick={() => cafes.length > 0 && handleSwipe('left', cafes[0])}
              className="w-16 h-16 rounded-full bg-white text-red-500 shadow-lg shadow-red-500/20 hover:shadow-red-500/40 border border-red-50 flex items-center justify-center transition-all hover:scale-110 active:scale-90"
            >
              <X size={32} strokeWidth={3} />
            </button>

            <button 
              onClick={() => cafes.length > 0 && handleSwipe('right', cafes[0])}
              className="w-16 h-16 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 text-white shadow-lg shadow-green-500/30 hover:shadow-green-500/50 flex items-center justify-center transition-all hover:scale-110 active:scale-90"
            >
              <Heart size={30} fill="currentColor" strokeWidth={0} />
            </button>
          </div>
          
          <button 
            onClick={() => setShowSaved(true)}
            className="p-4 rounded-2xl text-yellow-500 hover:bg-yellow-50 transition-all hover:scale-110 active:scale-95 relative"
          >
            <Star size={24} fill={savedCafes.length > 0 ? "currentColor" : "none"} />
            {savedCafes.length > 0 && (
              <span className="absolute top-3 right-3 w-2.5 h-2.5 bg-red-500 rounded-full ring-2 ring-white animate-ping" />
            )}
          </button>
        </div>
      </div>

      <SavedList 
        isOpen={showSaved} 
        onClose={() => setShowSaved(false)} 
        items={savedCafes} 
        onRemove={(id) => {
          const newSaved = savedCafes.filter(c => c.id !== id);
          setSavedCafes(newSaved);
          localStorage.setItem('savedCafes', JSON.stringify(newSaved));
        }}
      />

      {/* Global CSS for animations */}
      <style>{`
        .perspective-container {
          perspective: 1200px;
          perspective-origin: 50% 100%;
        }
        
        .swipe-hint-right, .swipe-hint-left { opacity: 0; }
        
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotateX(0deg); }
          50% { transform: translateY(-10px) rotateX(2deg); }
        }
        
        @keyframes gradient-shift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        
        @keyframes wiggle {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(-5deg); }
          75% { transform: rotate(5deg); }
        }
        
        @keyframes pulse-slow {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .animate-blob {
          animation: blob 7s infinite;
        }
        
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        
        .animate-gradient-shift {
          background-size: 200% 200%;
          animation: gradient-shift 3s ease infinite;
        }
        
        .animate-wiggle {
          animation: wiggle 2s ease-in-out infinite;
        }
        
        .animate-pulse-slow {
          animation: pulse-slow 2s ease-in-out infinite;
        }
        
        .animate-fade-in {
          animation: fade-in 0.8s ease-out;
        }
        
        .animate-fade-in-delay {
          animation: fade-in 1s ease-out 0.3s both;
        }
        
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        
        .animation-delay-4000 {
          animation-delay: 4s;
        }

        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: rgba(200, 200, 200, 0.5);
          border-radius: 20px;
        }
      `}</style>
    </div>
  );
};

export default App;
