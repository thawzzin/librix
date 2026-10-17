import BookSkeleton from "@/components/BookSkeleton";

export default function BooksLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8 h-12 w-72 skeleton" />
      <div className="mb-8 h-11 w-full skeleton" />
      <BookSkeleton />
    </div>
  );
}
