import type { BlogCardData } from "@/actions/blog.actions";
import BlogCard from "../(all-blogs)/blogs-cards";

interface CollectionsCardsProps {
  blogs: BlogCardData[];
}

export default function CollectionsCards({ blogs }: CollectionsCardsProps) {
  if (!blogs || blogs.length === 0) {
    return (
      <div className="text-center py-12 rounded-xl bg-muted">
        <p className="text-muted-foreground">
          No articles found in this collection yet.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
      {blogs.map((blog) => (
        <BlogCard key={blog.id} blog={blog} />
      ))}
    </div>
  );
}
