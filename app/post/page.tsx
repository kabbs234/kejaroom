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
      setImages(newFiles);

      const previews: string[] = [];
      newFiles.forEach(file => {
        const reader = new FileReader();
        reader.onload = (ev) => previews.push(ev.target!.result as string);
        reader.readAsDataURL(file);
      });
      setImagePreviews(previews);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    let mainImageUrl = '';

    // Upload only the first image for now
    if (images.length > 0) {
      const fileName = `${Date.now()}-${images[0].name}`;
      const { data, error } = await supabase.storage
        .from('room-images')
        .upload(fileName, images[0]);

      if (!error) {
        mainImageUrl = supabase.storage.from('room-images').getPublicUrl(fileName).data.publicUrl;
      }
    }

    const { error } = await supabase.from('listings').insert([{
      title: formData.title,
      price: parseInt(formData.price) || 15000,
      location: formData.location,
      description: formData.description,
      image_url: mainImageUrl,
      user_id: (await supabase.auth.getUser()).data.user?.id
    }]);

    if (error) {
      alert('Error: ' + error.message);
    } else {
      alert(`✅ Room posted successfully! (${images.length} photo(s) selected - only first shown for now)`);
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
              <label className="block text-lg font-semibold text-gray-900 mb-2">
                Room Photos <span className="text-sm font-normal text-gray-500">(First photo will be main image)</span>
              </label>
              <input 
                type="file" 
                multiple 
                accept="image/*" 
                onChange={handleImageChange} 
                className="w-full border-2 border-gray-400 rounded-2xl px-5 py-4"
              />

              {imagePreviews.length > 0 && (
                <div className="mt-6 grid grid-cols-3 gap-4">
                  {imagePreviews.map((preview, index) => (
                    <div key={index} className="relative">
                      <img src={preview} alt="preview" className="w-full h-32 object-cover rounded-2xl border" />
                      <div className="absolute top-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                        {index === 0 ? 'Main' : 'Extra'}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="block text-lg font-semibold text-gray-900 mb-2">Room Title</label>
              <input name="title" value={formData.title} onChange={handleChange} required type="text" placeholder="e.g. Spacious Single Room in Kilimani" className="w-full border-2 border-gray-400 rounded-2xl px-5 py-4 text-lg" />
            </div>

            <div>
              <label className="block text-lg font-semibold text-gray-900 mb-2">Monthly Rent (KSh)</label>
              <input name="price" value={formData.price} onChange={handleChange} required type="number" placeholder="18000" className="w-full border-2 border-gray-400 rounded-2xl px-5 py-4 text-lg" />
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-400 text-white font-semibold py-5 rounded-2xl text-xl"
            >
              {loading ? 'Posting...' : 'Post Room'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}