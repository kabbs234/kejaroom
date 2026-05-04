'use client';
import { useState } from 'react';
import { supabase } from '../lib/supabase';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function Register() {
  const [form, setForm] = useState({
    full_name: '',
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Create user
    const { error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: {
          full_name: form.full_name,
        }
      }
    });

    if (error) {
      alert('Registration failed: ' + error.message);
    } else {
      alert('Registration successful! Please check your email to confirm.');
      router.push('/login');
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-3xl shadow p-10">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-900">Create Account</h1>
        
        <form onSubmit={handleRegister} className="space-y-6">
          <div>
            <label className="block text-gray-700 mb-2 font-medium">Full Name</label>
            <input 
              name="full_name"
              value={form.full_name}
              onChange={handleChange}
              type="text" 
              className="w-full border-2 border-gray-300 rounded-2xl px-5 py-4 text-lg text-gray-900" 
              required 
            />
          </div>
          <div>
            <label className="block text-gray-700 mb-2 font-medium">Email</label>
            <input 
              name="email"
              value={form.email}
              onChange={handleChange}
              type="email" 
              className="w-full border-2 border-gray-300 rounded-2xl px-5 py-4 text-lg text-gray-900" 
              required 
            />
          </div>
          <div>
            <label className="block text-gray-700 mb-2 font-medium">Password</label>
            <input 
              name="password"
              value={form.password}
              onChange={handleChange}
              type="password" 
              className="w-full border-2 border-gray-300 rounded-2xl px-5 py-4 text-lg text-gray-900" 
              required 
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-4 rounded-2xl font-semibold text-lg disabled:bg-gray-400"
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p className="text-center mt-6 text-gray-600">
          Already have an account? <Link href="/login" className="text-emerald-600 font-medium">Log In</Link>
        </p>
      </div>
    </div>
  );
}