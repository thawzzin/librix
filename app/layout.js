import './globals.css'
import Navbar from '@/components/Navbar'

export const metadata = {
  title: 'Folio — Digital Library',
  description: 'Borrow, read, and discover books from our digital collection',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Navbar />
        <main className="min-h-screen">
          {children}
        </main>
        <footer className="border-t mt-20 py-8 text-center" style={{borderColor:'var(--border-subtle)'}}>
          <p className="font-display italic text-sm" style={{color:'var(--text-muted)'}}>
            Folio — A digital library experience
          </p>
        </footer>
      </body>
    </html>
  )
}
