import BookCard from './BookCard'

export default function BookGrid({ books, rentals = [] }) {
  if (!books || books.length === 0) return null

  const rentalMap = {}
  rentals.forEach(r => { rentalMap[String(r.gutendexId)] = r })

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 stagger-children">
      {books.map(book => (
        <BookCard
          key={book.id}
          book={book}
          rentalStatus={rentalMap[String(book.id)]?.isOverdue ? 'OVERDUE' : rentalMap[String(book.id)]?.status}
        />
      ))}
    </div>
  )
}
