import './globals.css'

import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'UnRAR Browser WASM - Next.js Demo',
  description: 'Extract RAR archives in your browser using WebAssembly',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="zh-CN">
      <body className="antialiased">{children}</body>
    </html>
  )
}
