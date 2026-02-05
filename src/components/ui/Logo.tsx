'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'

interface LogoProps {
  size?: 'sm' | 'md' | 'lg'
  useRouterLink?: boolean
}

export function Logo({ size = 'md', useRouterLink = false }: LogoProps) {
  const sizeClasses = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl'
  }

  const logoSizes = {
    sm: 24,
    md: 28,
    lg: 32
  }

  const content = (
    <span className="flex items-center gap-2">
      <Image
        src="/logo.png"
        alt="Postaify"
        width={logoSizes[size]}
        height={logoSizes[size]}
        className="rounded-full"
      />
      <span>
        <span className="text-white">Post</span>
        <motion.span
          className="text-primary inline-block"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.6,
            ease: 'easeOut'
          }}
        >
          <motion.span
            className="inline-block"
            animate={{
              opacity: [1, 0.4, 1],
              textShadow: [
                '0 0 0px rgba(234, 179, 8, 0)',
                '0 0 20px rgba(234, 179, 8, 0.8)',
                '0 0 0px rgba(234, 179, 8, 0)'
              ]
            }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
          >
            aify
          </motion.span>
        </motion.span>
      </span>
    </span>
  )

  const className = `${sizeClasses[size]} font-bold tracking-tight`

  if (useRouterLink) {
    return (
      <Link href="/" className={className} dir="ltr">
        {content}
      </Link>
    )
  }

  return (
    <a href="/" className={className} dir="ltr">
      {content}
    </a>
  )
}
