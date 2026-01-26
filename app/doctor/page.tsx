// Doctor entry: login or dashboard redirect
'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function DoctorEntry() {
  const router = useRouter()
  useEffect(() => {
    const doctor = typeof window !== 'undefined' ? window.localStorage.getItem('doctor') : null
    if (doctor) {
      router.replace('/doctor/dashboard')
    } else {
      router.replace('/login/doctor')
    }
  }, [router])
  return null
}
