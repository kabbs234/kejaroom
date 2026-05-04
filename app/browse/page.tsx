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

  useEffect(() => {
    async function fetchListings() {
      const { data, error } = await supabase
        .from('listings')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching listings:', error);
      } else {
        setListings(data || []);
      }
      setLoading(false);
    }

    fetchListings();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-7xl mx-auto px-6 pt-10">
        <h1 className="text-4xl font-bold text-gray-900">Browse Rooms</h1>
        <p className="text-gray-600">Latest listings</p>

        {loading ? (
          <p className="mt-8">Loading rooms...</p>
        ) : listings.length === 0 ? (
          <p className="mt-8 text-gray-600">No rooms yet. Post the first one!</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-8">
            {listings.map((room) => (
              <div key={room.id} className="bg-white rounded-3xl overflow-hidden shadow hover:shadow-xl transition">
                {room.image_url ? (
                  <img 
                    src={room.image_url} 
                    alt={room.title}
                    className="w-full h-64 object-cover"
                  />
                ) : (
                  <div className="h-64 bg-gray-200 flex items-center justify-center text-6xl">🏠</div>
                )}
                <div className="p-6">
                  <h3 className="font-semibold text-xl text-gray-900">{room.title}</h3>
                  {room.price && <p className="text-2xl font-bold text-emerald-600 mt-1">KSh {room.price}</p>}
                  {room.location && <p className="text-gray-600">{room.location}</p>}
                  {room.description && <p className="text-gray-600 mt-4 text-sm line-clamp-3">{room.description}</p>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}