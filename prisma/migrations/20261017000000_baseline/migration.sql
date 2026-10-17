-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "books" (
    "id" TEXT NOT NULL,
    "gutendex_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "author" TEXT NOT NULL,
    "cover_image" TEXT,
    "formats" JSONB DEFAULT '{}',
    "total_copies" INTEGER NOT NULL,
    "available_copies" INTEGER NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "books_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rentals" (
    "id" TEXT NOT NULL,
    "book_id" TEXT,
    "gutendex_id" TEXT NOT NULL,
    "borrowed_at" TIMESTAMPTZ NOT NULL,
    "due_date" TIMESTAMPTZ NOT NULL,
    "returned_at" TIMESTAMPTZ,
    "status" TEXT NOT NULL,

    CONSTRAINT "rentals_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "books_gutendex_id_key" ON "books"("gutendex_id");

-- CreateIndex
CREATE INDEX "rentals_status_idx" ON "rentals"("status");

-- CreateIndex
CREATE INDEX "rentals_gutendex_idx" ON "rentals"("gutendex_id");

-- AddForeignKey
ALTER TABLE "rentals" ADD CONSTRAINT "rentals_book_id_fkey" FOREIGN KEY ("book_id") REFERENCES "books"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
