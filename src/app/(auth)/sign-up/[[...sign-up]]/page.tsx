import type { Metadata } from 'next'
import { SignUpForm } from '@/components/auth/SignUpForm'

export const metadata: Metadata = {
  title: 'Sign Up',
  description: 'Create your free POSTAIFY account and start generating AI-powered social media content.',
}

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-black px-4">
      <SignUpForm />
    </div>
  )
}
