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

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;

    const files = Array.from(e.target.files);
    setImages(files);

    setPreviews(files.map((file) => URL.createObjectURL(file)));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    let imageUrls: string[] = [];

    if (images.length > 0) {
      const uploaded = await Promise.all(
        images.map(async (file) => {
          const fileName = `${Date.now()}-${file.name}`;

          const { error } = await supabase.storage
            .from('room-images')
            .upload(fileName, file);

          if (error) return null;

          return supabase.storage
            .from('room-images')
            .getPublicUrl(fileName).data.publicUrl;
        })
      );

      imageUrls = uploaded.filter(Boolean) as string[];
    }

    const { data: userData } = await supabase.auth.getUser();

    const { error } = await supabase.from('listings').insert([
      {
        title: formData.title,
        price: parseInt(formData.price) || 15000,
        location: formData.location,
        description: formData.description,
        image_urls: imageUrls,
        user_id: userData.user?.id,
      },
    ]);

    if (error) {
      alert(error.message);
    } else {
      alert('Room posted successfully');

      setFormData({
        title: '',
        price: '',
        location: 'Nairobi',
        description: '',
      });

      setImages([]);
      setPreviews([]);
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-3xl mx-auto px-6 pt-12">
        <h1 className="text-3xl font-bold">Post Room</h1>

        <form onSubmit={handleSubmit} className="space-y-6 mt-6">

          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleImageChange}
          />

          {/* previews */}
          <div className="flex gap-2 flex-wrap">
            {previews.map((p, i) => (
              <img key={i} src={p} className="h-24 w-24 object-cover rounded" />
            ))}
          </div>

          <input
            name="title"
            placeholder="Title"
            value={formData.title}
            onChange={handleChange}
            className="w-full border p-2"
          />

          <input
            name="price"
            placeholder="Price"
            value={formData.price}
            onChange={handleChange}
            className="w-full border p-2"
          />

          <input
            name="location"
            placeholder="Location"
            value={formData.location}
            onChange={handleChange}
            className="w-full border p-2"
          />

          <textarea
            name="description"
            placeholder="Description"
            value={formData.description}
            onChange={handleChange}
            className="w-full border p-2"
          />

          <button
            disabled={loading}
            className="bg-emerald-600 text-white px-4 py-2 rounded"
          >
            {loading ? 'Posting...' : 'Post Room'}
          </button>
        </form>
      </div>
    </div>
  );
}