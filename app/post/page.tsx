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
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setImages(prev => [...prev, ...newFiles]);

      newFiles.forEach(file => {
        const reader = new FileReader();
        reader.onload = (ev) => setImagePreviews(prev => [...prev, ev.target!.result as string]);
        reader.readAsDataURL(file);
      });
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    let imageUrls: string[] = [];

    // Upload images
    for (const image of images) {
      const fileName = `${Date.now()}-${image.name}`;
      const { data, error } = await supabase.storage
        .from('room-images')
        .upload(fileName, image);

      if (!error) {
        const url = supabase.storage.from('room-images').getPublicUrl(fileName).data.publicUrl;
        imageUrls.push(url);
      }
    }

    const { error } = await supabase.from('listings').insert([{
      title: formData.title,
      price: parseInt(formData.price) || 15000,
      location: formData.location,
      description: formData.description,
      image_url: imageUrls[0] || null,        // First image as main
      user_id: (await supabase.auth.getUser()).data.user?.id
    }]);

    if (error) {
      alert('Error: ' + error.message);
    } else {
      alert('✅ Room posted successfully!');
      setFormData({ title: '', price: '', location: 'Nairobi', description: '' });
      setImages([]);
      setImagePreviews([]);
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
              <label className="block text-lg font-semibold text-gray-900 mb-2">Room Photos</label>
              <input type="file" multiple accept="image/*" onChange={handleImageChange} className="w-full border-2 border-gray-400 rounded-2xl px-5 py-4" />
              
              {imagePreviews.length > 0 && (
                <div className="grid grid-cols-4 gap-3 mt-4">
                  {imagePreviews.map((preview, i) => (
                    <div key={i} className="relative">
                      <img src={preview} className="w-full h-20 object-cover rounded-xl" />
                      <button type="button" onClick={() => removeImage(i)} className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full">×</button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Other fields */}
            <div>
              <label className="block text-lg font-semibold text-gray-900 mb-2">Room Title</label>
              <input name="title" value={formData.title} onChange={handleChange} required type="text" placeholder="Room Title" className="w-full border-2 border-gray-400 rounded-2xl px-5 py-4 text-lg" />
            </div>

            <div>
              <label className="block text-lg font-semibold text-gray-900 mb-2">Monthly Rent (KSh)</label>
              <input name="price" value={formData.price} onChange={handleChange} required type="number" placeholder="18000" className="w-full border-2 border-gray-400 rounded-2xl px-5 py-4 text-lg" />
            </div>

            <button type="submit" disabled={loading} className="w-full bg-emerald-600 text-white py-5 rounded-2xl text-xl font-semibold">
              {loading ? 'Posting...' : 'Post Room'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}