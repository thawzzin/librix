'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function SearchBar({ initialValue = '' }) {
  const [query, setQuery] = useState(initialValue)
  const router = useRouter()

  const handleSubmit = (e) => {
    e.preventDefault()
    if (query.trim()) {
      router.push(`/books?search=${encodeURIComponent(query.trim())}`)
    } else {
      router.push('/books')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <div className="relative flex-1">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" style={{color:'var(--text-muted)'}}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
        </svg>
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search by title, author, subject..."
          className="w-full pl-10 pr-4 py-2.5 rounded-lg text-sm"
          style={{background:'var(--bg-card)', color:'var(--text-primary)', border:'1px solid var(--border-medium)'}}
        />
      </div>
      <button
        type="submit"
        className="btn-gold px-5 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap"
      >
        Search
      </button>
    </form>
  )
}
