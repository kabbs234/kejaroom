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
  image_urls?: string[];
};

export default function Browse() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<Listing | null>(null);

  useEffect(() => {
    fetchListings();
  }, []);

  async function fetchListings() {
    const { data } = await supabase
      .from('listings')
      .select('*')
      .order('created_at', { ascending: false });

    setListings(data || []);
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-6xl mx-auto px-6 pt-10">
        <h1 className="text-3xl font-bold">Browse Rooms</h1>

        <div className="grid md:grid-cols-3 gap-6 mt-8">
          {listings.map((room) => (
            <div
              key={room.id}
              onClick={() => setSelectedRoom(room)}
              className="bg-white rounded-xl shadow cursor-pointer"
            >
              <img
                src={
                  room.image_urls?.[0] ||
                  'https://picsum.photos/600/400'
                }
                className="h-56 w-full object-cover rounded-t-xl"
              />

              <div className="p-4">
                <h2 className="font-bold">{room.title}</h2>
                <p>KSh {room.price}</p>
                <p className="text-gray-500">{room.location}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* MODAL */}
      {selectedRoom && (
        <div
          className="fixed inset-0 bg-black/70 flex items-center justify-center"
          onClick={() => setSelectedRoom(null)}
        >
          <div
            className="bg-white max-w-3xl w-full p-6 rounded-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-2xl font-bold mb-4">
              {selectedRoom.title}
            </h2>

            <div className="grid grid-cols-2 gap-2">
              {selectedRoom.image_urls?.map((img, i) => (
                <img
                  key={i}
                  src={img}
                  className="h-40 w-full object-cover rounded"
                />
              ))}
            </div>

            <p className="mt-4">{selectedRoom.description}</p>

            <button
              onClick={() => setSelectedRoom(null)}
              className="mt-4 bg-black text-white px-4 py-2 rounded"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}