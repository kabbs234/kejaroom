'use client';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import Header from '../components/Header';

type Listing = {
  id: string;
  title: string;
  price?: number;
  location?: string;
  description?: string;
  image_url?: string;
  images?: string[];   // For multiple photos
};

export default function Browse() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRoom, setSelectedRoom] = useState<Listing | null>(null);

  useEffect(() => {
    fetchListings();
  }, []);

  async function fetchListings() {
    const { data, error } = await supabase
      .from('listings')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) console.error(error);
    else setListings(data || []);
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-7xl mx-auto px-6 pt-10">
        <h1 className="text-4xl font-bold text-gray-900">Browse Rooms in Kenya</h1>
        <p className="text-gray-600 mt-2">Click on any room to see full details and photos</p>

        {loading ? (
          <p className="text-center mt-12">Loading rooms...</p>
        ) : listings.length === 0 ? (
          <p className="text-center mt-12 text-gray-600">No rooms yet. Be the first to post!</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-10">
            {listings.map((room) => (
              <div 
                key={room.id} 
                onClick={() => setSelectedRoom(room)}
                className="bg-white rounded-3xl overflow-hidden shadow hover:shadow-2xl transition-all cursor-pointer"
              >
                <img 
                  src={room.image_url || room.images?.[0] || "https://picsum.photos/id/1015/600/400"} 
                  alt={room.title}
                  className="w-full h-64 object-cover"
                />
                <div className="p-6">
                  <h3 className="font-semibold text-xl text-gray-900">{room.title}</h3>
                  {room.price && <p className="text-3xl font-bold text-emerald-600 mt-2">KSh {room.price}</p>}
                  {room.location && <p className="text-gray-700 mt-1">{room.location}</p>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Room Detail Modal (Like Airbnb) */}
      {selectedRoom && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={() => setSelectedRoom(null)}>
          <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-auto" onClick={e => e.stopPropagation()}>
            {/* Photo Gallery */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 p-4">
              {selectedRoom.images && selectedRoom.images.length > 0 ? (
                selectedRoom.images.map((url, i) => (
                  <img key={i} src={url} className="rounded-2xl h-64 object-cover" />
                ))
              ) : (
                <img src={selectedRoom.image_url || "https://picsum.photos/id/1015/600/400"} className="rounded-2xl h-64 object-cover col-span-2" />
              )}
            </div>

            <div className="p-8">
              <h2 className="text-3xl font-bold text-gray-900">{selectedRoom.title}</h2>
              {selectedRoom.price && <p className="text-4xl font-bold text-emerald-600 mt-4">KSh {selectedRoom.price}</p>}
              {selectedRoom.location && <p className="text-xl text-gray-700 mt-2">{selectedRoom.location}</p>}

              <div className="mt-8">
                <h3 className="font-semibold text-lg mb-3">Description</h3>
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                  {selectedRoom.description || "No description provided."}
                </p>
              </div>

              <button 
                onClick={() => setSelectedRoom(null)}
                className="mt-10 w-full bg-gray-900 text-white py-4 rounded-2xl text-lg font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}