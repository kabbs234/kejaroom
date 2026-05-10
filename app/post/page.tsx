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

  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setSelectedImages(files);

      const newPreviews: string[] = [];
      files.forEach(file => {
        const reader = new FileReader();
        reader.onload = () => newPreviews.push(reader.result as string);
        reader.readAsDataURL(file);
      });
      setPreviews(newPreviews);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const uploadedUrls: string[] = [];

    // Upload all selected images
    for (const file of selectedImages) {
      const fileName = `${Date.now()}-${file.name}`;
      const { data, error } = await supabase.storage
        .from('room-images')
        .upload(fileName, file);

      if (!error) {
        const url = supabase.storage.from('room-images').getPublicUrl(fileName).data.publicUrl;
        uploadedUrls.push(url);
      }
    }

    // Save to database
    const { error } = await supabase.from('listings').insert([{
      title: formData.title,
      price: parseInt(formData.price) || 15000,
      location: formData.location,
      description: formData.description,
      image_url: uploadedUrls[0] || null,        // First photo as main
      images: uploadedUrls,                      // All photos saved here
      user_id: (await supabase.auth.getUser()).data.user?.id
    }]);

    if (error) {
      alert('Error: ' + error.message);
    } else {
      alert(`✅ Room posted with ${uploadedUrls.length} photos!`);
      setFormData({ title: '', price: '', location: 'Nairobi', description: '' });
      setSelectedImages([]);
      setPreviews([]);
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
              <label className="block text-lg font-semibold mb-2">Upload Photos (Multiple allowed)</label>
              <input type="file" multiple accept="image/*" onChange={handleImageChange} className="w-full border-2 border-gray-400 rounded-2xl px-5 py-4" />
              
              {previews.length > 0 && (
                <div className="grid grid-cols-4 gap-3 mt-6">
                  {previews.map((src, i) => (
                    <img key={i} src={src} className="h-24 object-cover rounded-2xl" />
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="block text-lg font-semibold mb-2">Room Title</label>
              <input name="title" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} required className="w-full border-2 border-gray-400 rounded-2xl px-5 py-4" />
            </div>

            <div>
              <label className="block text-lg font-semibold mb-2">Monthly Rent (KSh)</label>
              <input name="price" value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} required type="number" className="w-full border-2 border-gray-400 rounded-2xl px-5 py-4" />
            </div>

            <button type="submit" disabled={loading} className="w-full bg-emerald-600 text-white py-5 rounded-2xl text-xl font-semibold">
              {loading ? 'Posting...' : `Post Room (${selectedImages.length} photos)`}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}