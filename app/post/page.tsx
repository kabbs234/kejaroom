'use client';
import { useState } from 'react';
import { supabase } from '../lib/supabase';
import Header from '../components/Header';

export default function PostRoom() {
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
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
      const { data, error } = await supabase.storage
        .from('room-images')
        .upload(fileName, image);

      if (error) {
        console.error("Upload Error:", error);
        alert("Photo upload failed: " + error.message);
      } else if (data) {
        imageUrl = supabase.storage.from('room-images').getPublicUrl(fileName).data.publicUrl;
      }
    }

    const { data: userData } = await supabase.auth.getUser();

    const { error } = await supabase.from('listings').insert([{
      title: title,
      price: parseInt(price) || 15000,
      image_url: imageUrl || null,
      user_id: userData.user?.id
    }]);

    if (error) {
      alert('Error posting: ' + error.message);
    } else {
      alert(`✅ Posted! ${image ? 'With 1 photo' : 'No photo'}`);
      setTitle('');
      setPrice('');
      setImage(null);
      setPreview(null);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-3xl mx-auto px-6 pt-12">
        <h1 className="text-4xl font-bold text-gray-900">Post Your Room</h1>

        <div className="bg-white rounded-3xl shadow p-10 mt-8">
          <form onSubmit={handleSubmit}>
            <div className="mb-8">
              <label className="block font-semibold mb-2">Room Photo</label>
              <input type="file" accept="image/*" onChange={handleImage} className="w-full border-2 border-gray-400 rounded-2xl p-4" />
              {preview && <img src={preview} className="mt-4 h-48 rounded-2xl" />}
            </div>

            <input 
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
              placeholder="Room Title" 
              required 
              className="w-full border-2 border-gray-400 rounded-2xl px-5 py-4 mb-6 text-lg" 
            />

            <input 
              value={price} 
              onChange={(e) => setPrice(e.target.value)} 
              type="number" 
              placeholder="Price (KSh)" 
              required 
              className="w-full border-2 border-gray-400 rounded-2xl px-5 py-4 mb-6 text-lg" 
            />

            <button type="submit" disabled={loading} className="w-full bg-emerald-600 text-white py-5 rounded-2xl text-xl">
              {loading ? 'Posting...' : 'Post Room'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}