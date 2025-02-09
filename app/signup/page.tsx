'use client'
import { Header } from '@/components/header'
import SignUp from '@/components/signup'
import { SessionProvider, useSession } from 'next-auth/react'

export default function IndexPage() {
  const session = useSession();
  return (
    <SessionProvider>
      <Header/>
      <SignUp/>
    </SessionProvider>
  )
}
