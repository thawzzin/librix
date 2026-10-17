export default function LibraryLoading() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8 h-12 w-64 skeleton" />
      <div className="mb-8 h-20 w-full skeleton" />
      <div className="space-y-4" aria-label="Loading library">
        {Array.from({ length: 3 }, (_, index) => (
          <div key={index} className="h-32 w-full skeleton" />
        ))}
      </div>
    </div>
  );
}
