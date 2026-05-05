import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6">
      <h1 className="text-4xl font-bold">🏠 KejaRoom</h1>
      <p className="text-gray-600">Find rooms & roommates in Nairobi</p>

      <div className="flex gap-4">
        <Link
          href="/browse"
          className="bg-emerald-600 text-white px-6 py-3 rounded-xl"
        >
          Browse Rooms
        </Link>

        <Link
          href="/post"
          className="bg-black text-white px-6 py-3 rounded-xl"
        >
          Post a Room
        </Link>
      </div>
    </div>
  );
}