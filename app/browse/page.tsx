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
  room_type?: string;
  image_url?: string;
  created_at?: string;
};

export default function Browse() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [priceRange, setPriceRange] = useState('all');
  const [roomType, setRoomType] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

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

  // Apply filters
  const filteredListings = listings
    .filter(room => {
      const matchesSearch = room.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (room.description && room.description.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesLocation = !selectedLocation || room.location === selectedLocation;
      
      const matchesPrice = 
        priceRange === 'all' ||
        (priceRange === 'under10k' && (room.price || 0) < 10000) ||
        (priceRange === '10k-25k' && (room.price || 0) >= 10000 && (room.price || 0) <= 25000) ||
        (priceRange === 'above25k' && (room.price || 0) > 25000);

      const matchesType = roomType === 'all' || room.room_type === roomType;

      return matchesSearch && matchesLocation && matchesPrice && matchesType;
    })
    .sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime();
      if (sortBy === 'price-low') return (a.price || 0) - (b.price || 0);
      if (sortBy === 'price-high') return (b.price || 0) - (a.price || 0);
      return 0;
    });

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-7xl mx-auto px-6 pt-10">
        <h1 className="text-4xl font-bold text-gray-900">Browse Rooms</h1>
        <p className="text-gray-600 mt-2">Find your perfect room or roommate in Kenya</p>

        {/* Advanced Filters */}
        <div className="mt-8 bg-white p-6 rounded-3xl shadow-sm grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <input 
            type="text" 
            placeholder="Search rooms..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border-2 border-gray-300 rounded-2xl px-5 py-4 focus:border-emerald-600"
          />

          <select value={selectedLocation} onChange={(e) => setSelectedLocation(e.target.value)} className="border-2 border-gray-300 rounded-2xl px-5 py-4">
            <option value="">All Locations</option>
            <option value="Kilimani">Kilimani</option>
            <option value="Westlands">Westlands</option>
            <option value="Lavington">Lavington</option>
            <option value="Rongai">Rongai</option>
          </select>

          <select value={priceRange} onChange={(e) => setPriceRange(e.target.value)} className="border-2 border-gray-300 rounded-2xl px-5 py-4">
            <option value="all">All Prices</option>
            <option value="under10k">Under KSh 10,000</option>
            <option value="10k-25k">KSh 10,000 - 25,000</option>
            <option value="above25k">Above KSh 25,000</option>
          </select>

          <select value={roomType} onChange={(e) => setRoomType(e.target.value)} className="border-2 border-gray-300 rounded-2xl px-5 py-4">
            <option value="all">All Types</option>
            <option value="Single Room">Single Room</option>
            <option value="Master Bedroom">Master Bedroom</option>
            <option value="Studio">Studio</option>
          </select>

          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="border-2 border-gray-300 rounded-2xl px-5 py-4">
            <option value="newest">Newest First</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
          </select>
        </div>

        {/* Results */}
        {loading ? (
          <p className="text-center mt-12">Loading rooms...</p>
        ) : filteredListings.length === 0 ? (
          <p className="text-center mt-12 text-gray-600">No rooms found matching your filters.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-10">
            {filteredListings.map((room) => (
              <div key={room.id} className="bg-white rounded-3xl overflow-hidden shadow hover:shadow-2xl transition-all">
                <img 
                  src={room.image_url || "https://picsum.photos/id/1015/600/400"} 
                  alt={room.title}
                  className="w-full h-64 object-cover"
                />
                <div className="p-6">
                  <div className="flex justify-between items-start">
                    <h3 className="font-semibold text-xl text-gray-900">{room.title}</h3>
                    {room.price && <p className="text-2xl font-bold text-emerald-600">KSh {room.price}</p>}
                  </div>
                  {room.location && <p className="text-gray-600 mt-1">{room.location}</p>}
                  {room.description && <p className="text-gray-600 mt-4 line-clamp-3">{room.description}</p>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}