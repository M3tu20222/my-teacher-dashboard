'use client'

import React, { useState, useEffect } from 'react'

export default function ClientWrapper({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState(null)

  useEffect(() => {
    const loggedInUser = localStorage.getItem('user')
    if (loggedInUser) {
      setUser(JSON.parse(loggedInUser))
    }
  }, [])

  return <>{children}</>
}