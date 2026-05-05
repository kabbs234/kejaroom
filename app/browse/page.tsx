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
};

export default function Browse() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchListings = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('listings')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error(error);
    } else {
      setListings(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchListings();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-7xl mx-auto px-6 pt-10">
        <div className="flex justify-between items-center">
          <h1 className="text-4xl font-bold text-gray-900">Browse Rooms</h1>
          <button 
            onClick={fetchListings}
            className="bg-gray-200 hover:bg-gray-300 px-5 py-2 rounded-xl text-sm font-medium"
          >
            🔄 Refresh
          </button>
        </div>

        {loading ? (
          <p className="text-center mt-12 text-gray-700">Loading rooms...</p>
        ) : listings.length === 0 ? (
          <p className="text-center mt-12 text-gray-700">No rooms yet. Post the first one!</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-10">
            {listings.map((room) => (
              <div key={room.id} className="bg-white rounded-3xl overflow-hidden shadow hover:shadow-xl">
                <img 
                  src={room.image_url || "https://picsum.photos/id/1015/600/400"} 
                  alt={room.title}
                  className="w-full h-64 object-cover"
                />
                <div className="p-6">
                  <h3 className="text-2xl font-semibold text-gray-900">{room.title}</h3>
                  {room.price && <p className="text-3xl font-bold text-emerald-600 mt-3">KSh {room.price}</p>}
                  {room.location && <p className="text-lg text-gray-700 mt-1">{room.location}</p>}
                  {room.description && <p className="text-gray-600 mt-4">{room.description}</p>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}