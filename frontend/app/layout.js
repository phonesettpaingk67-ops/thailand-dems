import './globals.css'
import ClientLayout from '../components/ClientLayout'
import { Inter, Poppins } from 'next/font/google'

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const poppins = Poppins({ 
  weight: ['300', '400', '500', '600', '700', '800'],
  subsets: ['latin'],
  variable: '--font-poppins',
  display: 'swap',
})

export const metadata = {
  title: 'Thailand DEMS - Disaster & Emergency Management System',
  description: 'Advanced disaster management platform with real-time interactive maps, shelter coordination, supply tracking, and volunteer management',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🚨</text></svg>" />
      </head>
      <body className={`${inter.variable} ${poppins.variable} font-poppins antialiased`}>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  )
}
