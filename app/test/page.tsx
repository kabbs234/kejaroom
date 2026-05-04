import PostCard from "@/app/components/PostCard";

export default function TestPage() {
  return (
    <div className="p-6">
      <PostCard
        post={{
          title: "Test Room",
          location: "Westlands",
          rent: 15000,
          image: "https://picsum.photos/400"
        }}
      />
    </div>
  );
}