import type { Metadata } from 'next'
import { SignInForm } from '@/components/auth/SignInForm'

export const metadata: Metadata = {
  title: 'Sign In',
  description: 'Sign in to your POSTAIFY account to manage your social media content.',
}

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-black px-4">
      <SignInForm />
    </div>
  )
}
