'use client';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import Header from '../components/Header';
import Link from 'next/link';

type Listing = {
  id: string;
  title: string;
  price?: number;
  location?: string;
  description?: string;
  image_url?: string;
};

export default function MyListings() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMyListings();
  }, []);

  async function loadMyListings() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      window.location.href = '/login';
      return;
    }

    const { data, error } = await supabase
      .from('listings')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) console.error(error);
    else setListings(data || []);
    setLoading(false);
  }

  async function deleteListing(id: string) {
    if (!confirm("Are you sure you want to delete this listing?")) return;

    const { error } = await supabase
      .from('listings')
      .delete()
      .eq('id', id);

    if (error) {
      alert("Failed to delete: " + error.message);
    } else {
      alert("Listing deleted successfully");
      loadMyListings(); // Refresh
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-7xl mx-auto px-6 pt-10">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900">My Listings</h1>
          <Link href="/post" className="bg-emerald-600 text-white px-6 py-3 rounded-2xl hover:bg-emerald-700">
            + Post New Room
          </Link>
        </div>

        {loading ? (
          <p className="text-center py-12">Loading your listings...</p>
        ) : listings.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-2xl text-gray-600">You haven't posted any rooms yet</p>
            <Link href="/post" className="mt-6 inline-block bg-emerald-600 text-white px-8 py-4 rounded-2xl">
              Post Your First Room
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {listings.map((room) => (
              <div key={room.id} className="bg-white rounded-3xl overflow-hidden shadow hover:shadow-xl">
                <img 
                  src={room.image_url || "https://picsum.photos/id/1015/600/400"} 
                  alt={room.title}
                  className="w-full h-64 object-cover"
                />
                <div className="p-6">
                  <h3 className="font-semibold text-xl text-gray-900">{room.title}</h3>
                  {room.price && <p className="text-2xl font-bold text-emerald-600 mt-2">KSh {room.price}</p>}
                  {room.location && <p className="text-gray-600">{room.location}</p>}

                  <button 
                    onClick={() => deleteListing(room.id)}
                    className="mt-6 w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-2xl font-medium"
                  >
                    Delete Listing
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}