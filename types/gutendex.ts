export interface GutendexPerson {
  name: string;
  birth_year: number | null;
  death_year: number | null;
}

export interface GutendexBook {
  id: number;
  title: string;
  authors: GutendexPerson[];
  translators: GutendexPerson[];
  subjects: string[];
  bookshelves: string[];
  languages: string[];
  copyright: boolean | null;
  media_type: string;
  formats: Record<string, string>;
  download_count: number;
  summaries?: string[];
  author?: string;
  coverImage?: string | null;
  gutendexId?: string;
}

export interface GutendexResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: GutendexBook[];
}
