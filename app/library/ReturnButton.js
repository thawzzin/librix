'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function ReturnButton({ rentalId }) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleReturn = async () => {
    if (!confirm('Return this book?')) return
    setLoading(true)
    try {
      const res = await fetch('/api/return', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rentalId })
      })
      const data = await res.json()
      if (data.success) router.refresh()
    } catch {}
    setLoading(false)
  }

  return (
    <button
      onClick={handleReturn}
      disabled={loading}
      className="text-xs cursor-pointer font-medium px-3 py-1.5 rounded transition-all disabled:opacity-50"
      style={{
        background: 'rgba(139,58,58,0.15)',
        color: '#e07878',
        border: '1px solid rgba(139,58,58,0.3)'
      }}
    >
      {loading ? 'Returning…' : 'Return'}
    </button>
  )
}
