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

      // Create previews
      newFiles.forEach(file => {
        const reader = new FileReader();
        reader.onload = (e) => {
          if (e.target?.result) {
            setImagePreviews(prev => [...prev, e.target!.result as string]);
          }
        };
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

    let uploadedUrls: string[] = [];

    // Upload multiple images
    for (const image of images) {
      const fileExt = image.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;

      const { data, error } = await supabase.storage
        .from('room-images')
        .upload(fileName, image);

      if (!error && data) {
        const publicUrl = supabase.storage.from('room-images').getPublicUrl(fileName).data.publicUrl;
        uploadedUrls.push(publicUrl);
      }
    }

    // Save room with image URLs
    const { error: insertError } = await supabase.from('listings').insert([{
      title: formData.title,
      price: parseInt(formData.price) || 15000,
      location: formData.location,
      description: formData.description,
      image_url: uploadedUrls[0] || null,           // Main image
      // You can add image_urls array later if you update the table
    }]);

    if (insertError) {
      alert('Error: ' + insertError.message);
    } else {
      alert(`✅ Room posted successfully with ${uploadedUrls.length} photo(s)!`);
      // Reset form
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

            {/* Multiple Photo Upload */}
            <div>
              <label className="block text-lg font-semibold text-gray-900 mb-3">Room Photos (You can upload multiple)</label>
              <input 
                type="file" 
                accept="image/*" 
                multiple
                onChange={handleImageChange} 
                className="w-full border-2 border-gray-400 rounded-2xl px-5 py-4"
              />

              {/* Image Previews */}
              {imagePreviews.length > 0 && (
                <div className="grid grid-cols-3 gap-4 mt-6">
                  {imagePreviews.map((preview, index) => (
                    <div key={index} className="relative">
                      <img src={preview} alt="preview" className="w-full h-32 object-cover rounded-2xl" />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Rest of the form */}
            <div>
              <label className="block text-lg font-semibold text-gray-900 mb-2">Room Title</label>
              <input name="title" value={formData.title} onChange={handleChange} required type="text" placeholder="e.g. Spacious Single Room in Kilimani" className="w-full border-2 border-gray-400 rounded-2xl px-5 py-4 text-lg" />
            </div>

            <div>
              <label className="block text-lg font-semibold text-gray-900 mb-2">Monthly Rent (KSh)</label>
              <input name="price" value={formData.price} onChange={handleChange} required type="number" placeholder="18000" className="w-full border-2 border-gray-400 rounded-2xl px-5 py-4 text-lg" />
            </div>

            <div>
              <label className="block text-lg font-semibold text-gray-900 mb-2">Location</label>
              <input name="location" value={formData.location} onChange={handleChange} type="text" className="w-full border-2 border-gray-400 rounded-2xl px-5 py-4 text-lg" />
            </div>

            <div>
              <label className="block text-lg font-semibold text-gray-900 mb-2">Description</label>
              <textarea name="description" value={formData.description} onChange={handleChange} rows={6} placeholder="Describe the room..." className="w-full border-2 border-gray-400 rounded-3xl px-5 py-4 text-lg"></textarea>
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-400 text-white font-semibold py-5 rounded-2xl text-xl transition"
            >
              {loading ? 'Posting...' : `Post Room (${images.length} photos)`}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}