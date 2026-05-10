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
  user_id?: string;
};

export default function Browse() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    getCurrentUser();
    fetchListings();
  }, []);

  async function getCurrentUser() {
    const { data } = await supabase.auth.getUser();
    setCurrentUser(data.user);
  }

  async function fetchListings() {
    const { data, error } = await supabase
      .from('listings')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) console.error(error);
    else setListings(data || []);
    setLoading(false);
  }

  async function deleteListing(id: string) {
    if (!confirm("Delete this listing?")) return;

    const { error } = await supabase.from('listings').delete().eq('id', id);
    if (error) {
      alert("Delete failed: " + error.message);
    } else {
      alert("Listing deleted");
      fetchListings(); // Refresh
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-7xl mx-auto px-6 pt-10">
        <h1 className="text-4xl font-bold text-gray-900">Browse Rooms</h1>
        <p className="text-gray-600 mt-2">Latest available rooms in Kenya</p>

        {loading ? (
          <p className="text-center mt-12">Loading rooms...</p>
        ) : listings.length === 0 ? (
          <p className="text-center mt-12 text-gray-600">No rooms yet.</p>
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
                  <h3 className="font-semibold text-xl text-gray-900">{room.title}</h3>
                  {room.price && <p className="text-3xl font-bold text-emerald-600 mt-2">KSh {room.price}</p>}
                  {room.location && <p className="text-gray-700">{room.location}</p>}

                  {/* Show Delete button only if owner */}
                  {currentUser && room.user_id === currentUser.id && (
                    <button 
                      onClick={() => deleteListing(room.id)}
                      className="mt-4 w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-2xl text-sm font-medium"
                    >
                      Delete Listing
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}