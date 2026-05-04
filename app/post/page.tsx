'use client';
import { useState } from 'react';
import { supabase } from '../lib/supabase';
import Header from '../components/Header';

export default function PostRoom() {
  const [formData, setFormData] = useState({
    title: '',
    price: '',
    location: 'Nairobi',
    description: '',
  });
  const [image, setImage] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(''); // Clear error when user types
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) setImage(e.target.files[0]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic Validation
    if (!formData.title.trim()) {
      setError("Please enter a room title");
      return;
    }
    if (!formData.price || parseInt(formData.price) < 1000) {
      setError("Price must be at least KSh 1,000");
      return;
    }
    if (!formData.description.trim()) {
      setError("Please add a description");
      return;
    }

    setLoading(true);
    setError('');

    let imageUrl = '';

    // Upload image
    if (image) {
      const fileExt = image.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;

      const { data, error: uploadError } = await supabase.storage
        .from('room-images')
        .upload(fileName, image);

      if (uploadError) {
        console.error(uploadError);
      } else {
        imageUrl = supabase.storage.from('room-images').getPublicUrl(fileName).data.publicUrl;
      }
    }

    // Save to database
    const { error: insertError } = await supabase.from('listings').insert([{
      title: formData.title.trim(),
      price: parseInt(formData.price),
      location: formData.location,
      description: formData.description.trim(),
      image_url: imageUrl,
    }]);

    if (insertError) {
      setError('Failed to post room: ' + insertError.message);
    } else {
      alert('✅ Room posted successfully!');
      // Reset form
      setFormData({ title: '', price: '', location: 'Nairobi', description: '' });
      setImage(null);
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-3xl mx-auto px-6 pt-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Post Your Room</h1>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-2xl mb-6">
            {error}
          </div>
        )}

        <div className="bg-white rounded-3xl shadow p-10 mt-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            <div>
              <label className="block text-lg font-semibold text-gray-900 mb-2">Room Photo (Optional)</label>
              <input type="file" accept="image/*" onChange={handleImageChange} className="w-full border-2 border-gray-400 rounded-2xl px-5 py-4" />
            </div>

            <div>
              <label className="block text-lg font-semibold text-gray-900 mb-2">Room Title <span className="text-red-500">*</span></label>
              <input name="title" value={formData.title} onChange={handleChange} required type="text" placeholder="e.g. Spacious Single Room in Kilimani" className="w-full border-2 border-gray-400 rounded-2xl px-5 py-4 text-lg" />
            </div>

            <div>
              <label className="block text-lg font-semibold text-gray-900 mb-2">Monthly Rent (KSh) <span className="text-red-500">*</span></label>
              <input name="price" value={formData.price} onChange={handleChange} required type="number" placeholder="18000" className="w-full border-2 border-gray-400 rounded-2xl px-5 py-4 text-lg" />
            </div>

            <div>
              <label className="block text-lg font-semibold text-gray-900 mb-2">Location</label>
              <input name="location" value={formData.location} onChange={handleChange} type="text" className="w-full border-2 border-gray-400 rounded-2xl px-5 py-4 text-lg" />
            </div>

            <div>
              <label className="block text-lg font-semibold text-gray-900 mb-2">Description <span className="text-red-500">*</span></label>
              <textarea name="description" value={formData.description} onChange={handleChange} rows={6} placeholder="Describe the room, amenities, rules..." className="w-full border-2 border-gray-400 rounded-3xl px-5 py-4 text-lg"></textarea>
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-400 text-white font-semibold py-5 rounded-2xl text-xl transition"
            >
              {loading ? 'Posting your room...' : 'Post Room'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}