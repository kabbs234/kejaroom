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
    setError('');
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) setImage(e.target.files[0]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

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

    // GET LOGGED IN USER 👇
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      setError("You must be logged in to post a room");
      setLoading(false);
      return;
    }

    // Upload image
    if (image) {
      const fileExt = image.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('room-images')
        .upload(fileName, image);

      if (!uploadError) {
        imageUrl = supabase.storage
          .from('room-images')
          .getPublicUrl(fileName).data.publicUrl;
      }
    }

    // SAVE TO DATABASE (NOW WITH OWNER)
    const { error: insertError } = await supabase.from('listings').insert([{
      title: formData.title.trim(),
      price: parseInt(formData.price),
      location: formData.location,
      description: formData.description.trim(),
      image_url: imageUrl,
      user_id: user.id   // 🔥 THIS IS THE IMPORTANT ADDITION
    }]);

    if (insertError) {
      setError('Failed to post room: ' + insertError.message);
    } else {
      alert('✅ Room posted successfully!');
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

            <input type="file" accept="image/*" onChange={handleImageChange} />

            <input
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Room title"
              className="border p-3 w-full"
            />

            <input
              name="price"
              value={formData.price}
              onChange={handleChange}
              placeholder="Price"
              type="number"
              className="border p-3 w-full"
            />

            <input
              name="location"
              value={formData.location}
              onChange={handleChange}
              className="border p-3 w-full"
            />

            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="border p-3 w-full"
            />

            <button
              type="submit"
              disabled={loading}
              className="bg-emerald-600 text-white px-6 py-3 rounded-xl w-full"
            >
              {loading ? 'Posting...' : 'Post Room'}
            </button>

          </form>
        </div>
      </div>
    </div>
  );
}