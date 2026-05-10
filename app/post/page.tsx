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
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImage(file);
      const reader = new FileReader();
      reader.onload = () => setPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    let imageUrl = '';

    if (image) {
      const fileName = `${Date.now()}-${image.name}`;
      const { data } = await supabase.storage
        .from('room-images')
        .upload(fileName, image);

      if (data) {
        imageUrl = supabase.storage.from('room-images').getPublicUrl(fileName).data.publicUrl;
      }
    }

    const { data: userData } = await supabase.auth.getUser();

    const { error } = await supabase.from('listings').insert([{
      title: formData.title,
      price: parseInt(formData.price) || 15000,
      location: formData.location,
      description: formData.description,
      image_url: imageUrl,
      user_id: userData.user?.id
    }]);

    if (error) {
      alert('Error posting: ' + error.message);
    } else {
      alert('✅ Room posted successfully!');
      setFormData({ title: '', price: '', location: 'Nairobi', description: '' });
      setImage(null);
      setPreview(null);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-3xl mx-auto px-6 pt-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Post Your Room</h1>

        <div className="bg-white rounded-3xl shadow p-10 mt-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            <div>
              <label className="block text-lg font-semibold text-gray-900 mb-2">Room Photo</label>
              <input type="file" accept="image/*" onChange={handleImageChange} className="w-full border-2 border-gray-400 rounded-2xl px-5 py-4" />
              {preview && <img src={preview} className="mt-4 h-48 rounded-2xl object-cover" />}
            </div>

            <div>
              <label className="block text-lg font-semibold text-gray-900 mb-2">Room Title</label>
              <input name="title" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} required type="text" placeholder="e.g. Spacious Single Room in Kilimani" className="w-full border-2 border-gray-400 rounded-2xl px-5 py-4 text-lg" />
            </div>

            <div>
              <label className="block text-lg font-semibold text-gray-900 mb-2">Monthly Rent (KSh)</label>
              <input name="price" value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} required type="number" placeholder="18000" className="w-full border-2 border-gray-400 rounded-2xl px-5 py-4 text-lg" />
            </div>

            <button type="submit" disabled={loading} className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-400 text-white font-semibold py-5 rounded-2xl text-xl transition">
              {loading ? 'Posting...' : 'Post Room'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}