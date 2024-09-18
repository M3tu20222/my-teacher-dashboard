'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import TeacherDashboard from '@/components/TeacherDashboard'

export default function Home() {
  const [user, setUser] = useState(null)
  const router = useRouter()

  useEffect(() => {
    const loggedInUser = localStorage.getItem('user')
    if (loggedInUser) {
      setUser(JSON.parse(loggedInUser))
    } else {
      router.push('/login')
    }
  }, [router])

  if (!user) {
    return <div>Loading...</div>
  }

  return <TeacherDashboard user={user} />
}