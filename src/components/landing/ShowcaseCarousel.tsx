'use client'

import { useEffect, useRef } from 'react'
import Image from 'next/image'

// Showcase images generated with POSTAIFY
const SHOWCASE_IMAGES = [
  { src: '/showcase/2u927olyrcPKOG_RUL0i1_image.webp', alt: 'AI Generated Art 1' },
  { src: '/showcase/3g_Kme12Lh0hFAbJ5yutx_image.webp', alt: 'AI Generated Art 2' },
  { src: '/showcase/pCEV-To8xMkakPUnW9-Ah_image.png', alt: 'AI Generated Logo 1' },
  { src: '/showcase/pd5DdD40hb8AIhaZNFaSv_image.png', alt: 'AI Generated Logo 2' },
  { src: '/showcase/tcWPiVvM-wF4lz7Pnrv-A_image.png', alt: 'AI Generated Logo 3' },
  { src: '/showcase/ylmPui2FjNHpEi_3x8zL0_2fe6ae340f9b4c19a2d7decf7693967b.jpg', alt: 'AI Generated Art 3' },
]

export function ShowcaseCarousel() {
  const scrollRef = useRef<HTMLDivElement>(null)
  const animationRef = useRef<number | null>(null)
  const scrollPosition = useRef(0)

  useEffect(() => {
    const scrollContainer = scrollRef.current
    if (!scrollContainer) return

    // Speed: pixels per frame (60fps = ~16.67ms per frame)
    const speed = 0.8

    const animate = () => {
      scrollPosition.current += speed

      // Reset position for seamless loop
      const singleSetWidth = scrollContainer.scrollWidth / 2
      if (scrollPosition.current >= singleSetWidth) {
        scrollPosition.current = 0
      }

      scrollContainer.style.transform = `translateX(-${scrollPosition.current}px)`
      animationRef.current = requestAnimationFrame(animate)
    }

    animationRef.current = requestAnimationFrame(animate)

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [])

  // Double the images for seamless loop
  const doubledImages = [...SHOWCASE_IMAGES, ...SHOWCASE_IMAGES]

  return (
    <section className="py-16 overflow-hidden bg-black">
      <div className="max-w-7xl mx-auto px-4 mb-8">
        <h2 className="text-2xl md:text-3xl font-bold text-center text-white mb-2">
          Created with POSTAIFY
        </h2>
        <p className="text-center text-gray-400">
          AI-generated images and logos in seconds
        </p>
      </div>

      {/* Carousel container */}
      <div className="relative">
        {/* Gradient fade left */}
        <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-black to-transparent z-10 pointer-events-none" />

        {/* Gradient fade right */}
        <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-black to-transparent z-10 pointer-events-none" />

        {/* Scrolling track */}
        <div
          ref={scrollRef}
          className="flex gap-6 will-change-transform"
          style={{ width: 'max-content' }}
        >
          {doubledImages.map((image, index) => (
            <div
              key={index}
              className="relative flex-shrink-0 w-64 h-64 md:w-80 md:h-80 rounded-2xl overflow-hidden bg-gray-900 border border-gray-800 shadow-xl hover:border-yellow-500/50 transition-colors"
            >
              <Image
                src={image.src}
                alt={image.alt}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 256px, 320px"
                loading="lazy"
              />
              {/* Subtle overlay on hover */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 hover:opacity-100 transition-opacity" />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
