import React, { useState, useEffect } from 'react'
import { Inter } from 'next/font/google'
import type { Metadata } from 'next'
import { Providers } from './providers'
import ClientWrapper from './ClientWrapper'
const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Teacher Dashboard',
  description: 'A dashboard for teachers to manage students and scores',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>
          <ClientWrapper>{children}</ClientWrapper>
        </Providers>
      </body>
    </html>
  )
}