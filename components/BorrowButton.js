'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function BorrowButton({ book, rental, availableCopies }) {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const router = useRouter()

  const isBorrowed = rental?.status === 'BORROWED'
  const isUnavailable = availableCopies <= 0 && !isBorrowed

  const handleBorrow = async () => {
    setLoading(true)
    setMessage('')
    try {
      const res = await fetch('/api/borrow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gutendexId: book.id,
          title: book.title,
          author: book.authors?.map(a => a.name).join(', ') || 'Unknown',
          coverImage: book.formats?.['image/jpeg'] || null,
          formats: book.formats || {},
        })
      })
      const data = await res.json()
      if (data.success) {
        setMessage('✓ Borrowed successfully!')
        setTimeout(() => router.refresh(), 800)
      } else {
        setMessage(data.error || 'Something went wrong')
      }
    } catch {
      setMessage('Network error. Please try again.')
    }
    setLoading(false)
  }

  const handleReturn = async () => {
    setLoading(true)
    setMessage('')
    try {
      const res = await fetch('/api/return', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rentalId: rental.id })
      })
      const data = await res.json()
      if (data.success) {
        setMessage('✓ Returned successfully!')
        setTimeout(() => router.refresh(), 800)
      } else {
        setMessage(data.error || 'Something went wrong')
      }
    } catch {
      setMessage('Network error. Please try again.')
    }
    setLoading(false)
  }

  return (
    <div className="flex flex-col gap-3">
      {isBorrowed ? (
        <button
          onClick={handleReturn}
          disabled={loading}
          className="px-6 py-3 rounded-lg text-sm font-medium transition-all disabled:opacity-50"
          style={{
            background: 'rgba(139,58,58,0.15)',
            color: '#e07878',
            border: '1px solid rgba(139,58,58,0.4)',
          }}
        >
          {loading ? 'Returning...' : '↩ Return Book'}
        </button>
      ) : (
        <button
          onClick={handleBorrow}
          disabled={loading || isUnavailable}
          className={`btn-gold px-6 py-3 rounded-lg text-sm ${isUnavailable ? '' : ''}`}
        >
          {loading ? 'Processing...' : isUnavailable ? 'No Copies Available' : '＋ Borrow Book'}
        </button>
      )}

      {message && (
        <p className="text-xs font-medium" style={{
          color: message.startsWith('✓') ? '#7ecdb0' : '#e07878'
        }}>
          {message}
        </p>
      )}
    </div>
  )
}
