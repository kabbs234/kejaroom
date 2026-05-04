'use client';
import Link from 'next/link';
import { supabase } from '../lib/supabase';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Header() {
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    // Check current user
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.refresh();
  };

  return (
    <header className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-5 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-600 rounded-2xl flex items-center justify-center text-white font-bold text-2xl">K</div>
          <h1 className="text-3xl font-bold text-gray-900">KejaRoom</h1>
        </div>

        <nav className="hidden md:flex items-center gap-8 text-gray-700 font-medium">
          <Link href="/" className="hover:text-emerald-600">Home</Link>
          <Link href="/browse" className="hover:text-emerald-600">Browse Rooms</Link>
          <Link href="/post" className="hover:text-emerald-600">Post a Room</Link>
        </nav>

        <div className="flex items-center gap-4">
          {user ? (
            <>
              <span className="text-sm text-gray-600">Hi, {user.email}</span>
              <button onClick={handleLogout} className="text-red-600 hover:underline">Log Out</button>
            </>
          ) : (
            <>
              <Link href="/login" className="px-5 py-2 text-gray-700 hover:bg-gray-100 rounded-xl">Log In</Link>
              <Link href="/register" className="bg-emerald-600 text-white px-5 py-2 rounded-xl hover:bg-emerald-700">Sign Up</Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}