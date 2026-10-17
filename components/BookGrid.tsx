import BookCard from "./BookCard";
import type { GutendexBook } from "@/types/gutendex";
import type { RentalRecord } from "@/types/library";

interface BookGridProps {
  books: GutendexBook[];
  rentals?: RentalRecord[];
}

function isPastDue(dueDate: Date): boolean {
  return dueDate.getTime() < Date.now();
}

export default function BookGrid({ books, rentals = [] }: BookGridProps) {
  if (books.length === 0) return null;

  const rentalMap = new Map(
    rentals.map((rental) => [rental.gutendexId, rental]),
  );

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 stagger-children">
      {books.map((book) => {
        const rental = rentalMap.get(String(book.id));
        return (
          <BookCard
            key={book.id}
            book={book}
            rentalStatus={
              rental?.status === "BORROWED" && isPastDue(rental.dueDate)
                ? "OVERDUE"
                : rental?.status
            }
          />
        );
      })}
    </div>
  )
}
