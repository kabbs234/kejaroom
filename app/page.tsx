import Header from './components/Header';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <section className="bg-white py-24">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-5xl md:text-6xl font-bold text-gray-900 leading-tight mb-6">
            Find Your Perfect<br />Room or Roommate in Kenya
          </h2>
          <p className="text-xl text-gray-600 mb-10">
            The easiest way to find rooms and trustworthy roommates in Nairobi and beyond.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/browse" className="bg-emerald-600 text-white px-10 py-4 rounded-2xl text-lg font-semibold hover:bg-emerald-700">
              Browse Rooms
            </Link>
            <Link href="/post" className="border-2 border-gray-800 text-gray-800 px-10 py-4 rounded-2xl text-lg font-semibold hover:bg-gray-100">
              Post a Room
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}