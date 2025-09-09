"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function RegisterPage() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to the new combined auth page
    router.replace('/auth')
  }, [router])

  return null // Will redirect automatically
}