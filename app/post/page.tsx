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
  const [previews, setPreviews] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const selectedFiles = Array.from(e.target.files);
    setImages(selectedFiles);

    const newPreviews: string[] = [];
    selectedFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = () => newPreviews.push(reader.result as string);
      reader.readAsDataURL(file);
    });
    setPreviews(newPreviews);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    let mainImage = '';

    if (images.length > 0) {
      const fileName = Date.now() + '-' + images[0].name;
      const { data } = await supabase.storage
        .from('room-images')
        .upload(fileName, images[0]);

      if (data) mainImage = supabase.storage.from('room-images').getPublicUrl(fileName).data.publicUrl;
    }

    await supabase.from('listings').insert([{
      title: formData.title,
      price: Number(formData.price),
      location: formData.location,
      description: formData.description,
      image_url: mainImage,
      user_id: (await supabase.auth.getUser()).data.user?.id
    }]);

    alert(`✅ Posted successfully! (${images.length} photos selected - showing first one)`);
    setFormData({ title: '', price: '', location: 'Nairobi', description: '' });
    setImages([]);
    setPreviews([]);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-3xl mx-auto px-6 pt-12">
        <h1 className="text-4xl font-bold text-gray-900">Post Your Room</h1>

        <div className="bg-white rounded-3xl p-10 mt-8 shadow">
          <form onSubmit={handleSubmit}>
            <div className="mb-8">
              <label className="block text-lg font-semibold mb-3">Select Photos</label>
              <input type="file" multiple accept="image/*" onChange={handleImageSelect} className="w-full" />
              
              {previews.length > 0 && (
                <div className="grid grid-cols-4 gap-3 mt-6">
                  {previews.map((src, i) => (
                    <div key={i} className="relative">
                      <img src={src} className="rounded-2xl h-24 object-cover w-full" />
                      <div className="absolute top-1 left-1 bg-black text-white text-xs px-2 py-0.5 rounded">
                        {i === 0 ? 'Main' : ''}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <input name="title" placeholder="Room Title" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} required className="w-full border-2 border-gray-300 rounded-2xl px-5 py-4 mb-6" />
            <input name="price" type="number" placeholder="Price (KSh)" value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} required className="w-full border-2 border-gray-300 rounded-2xl px-5 py-4 mb-6" />

            <button type="submit" disabled={loading} className="w-full bg-emerald-600 text-white py-4 rounded-2xl text-lg font-semibold">
              {loading ? "Posting..." : "Post Room"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}