'use client';
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'next/navigation';
import Header from '../../components/Header';

export default function EditListing({ params }: { params: { id: string } }) {
  const [formData, setFormData] = useState({
    title: '',
    price: '',
    location: '',
    description: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  useEffect(() => {
    loadListing();
  }, []);

  async function loadListing() {
    const { data, error } = await supabase
      .from('listings')
      .select('*')
      .eq('id', params.id)
      .single();

    if (error || !data) {
      alert("Listing not found");
      router.push('/mylistings');
    } else {
      setFormData({
        title: data.title || '',
        price: data.price || '',
        location: data.location || '',
        description: data.description || '',
      });
    }
    setLoading(false);
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const { error } = await supabase
      .from('listings')
      .update({
        title: formData.title,
        price: parseInt(formData.price),
        location: formData.location,
        description: formData.description,
      })
      .eq('id', params.id);

    if (error) {
      alert('Error saving: ' + error.message);
    } else {
      alert('✅ Listing updated successfully!');
      router.push('/mylistings');
    }
    setSaving(false);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-3xl mx-auto px-6 pt-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Edit Listing</h1>

        <div className="bg-white rounded-3xl shadow p-10 mt-8">
          <form onSubmit={handleSave} className="space-y-8">
            <div>
              <label className="block text-lg font-semibold text-gray-900 mb-2">Room Title</label>
              <input name="title" value={formData.title} onChange={handleChange} required className="w-full border-2 border-gray-400 rounded-2xl px-5 py-4 text-lg" />
            </div>

            <div>
              <label className="block text-lg font-semibold text-gray-900 mb-2">Monthly Rent (KSh)</label>
              <input name="price" value={formData.price} onChange={handleChange} required type="number" className="w-full border-2 border-gray-400 rounded-2xl px-5 py-4 text-lg" />
            </div>

            <div>
              <label className="block text-lg font-semibold text-gray-900 mb-2">Location</label>
              <input name="location" value={formData.location} onChange={handleChange} className="w-full border-2 border-gray-400 rounded-2xl px-5 py-4 text-lg" />
            </div>

            <div>
              <label className="block text-lg font-semibold text-gray-900 mb-2">Description</label>
              <textarea name="description" value={formData.description} onChange={handleChange} rows={6} className="w-full border-2 border-gray-400 rounded-3xl px-5 py-4 text-lg"></textarea>
            </div>

            <div className="flex gap-4">
              <button type="submit" disabled={saving} className="flex-1 bg-emerald-600 text-white py-4 rounded-2xl text-lg font-semibold">
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
              <button type="button" onClick={() => router.push('/mylistings')} className="flex-1 border border-gray-400 py-4 rounded-2xl text-lg">
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}