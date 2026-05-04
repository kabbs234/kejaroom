export default function PostCard({ post }: any) {
  return (
    <div className="bg-white rounded-3xl shadow-md overflow-hidden hover:shadow-xl transition">

      {/* IMAGE */}
      {post.image && (
        <img
          src={post.image}
          className="w-full h-64 object-cover"
        />
      )}

      {/* CONTENT */}
      <div className="p-5">

        <h2 className="text-lg font-semibold text-gray-900">
          {post.title}
        </h2>

        <p className="text-gray-600 mt-1">
          {post.location}
        </p>

        <p className="text-emerald-600 font-bold mt-2">
          KSh {post.rent}
        </p>

        {/* BUTTONS */}
        <div className="flex gap-3 mt-4 text-sm">

          <button className="px-4 py-2 bg-gray-100 rounded-xl">
            View
          </button>

          <button className="px-4 py-2 bg-emerald-600 text-white rounded-xl">
            Contact
          </button>

        </div>

      </div>
    </div>
  );
}