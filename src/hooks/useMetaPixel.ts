'use client'

import { useCallback } from 'react'
import type {
  MetaPixelEventName,
  MetaPixelStandardEvent,
  MetaPixelCustomEventParams,
} from '@/types/meta-pixel'

/**
 * Custom hook for Meta Pixel event tracking
 *
 * Provides a type-safe interface for tracking standard and custom events.
 *
 * @example
 * ```tsx
 * const { trackEvent, trackCustomEvent } = useMetaPixel();
 *
 * // Track a standard event
 * trackEvent('Lead', { content_name: 'Newsletter Signup' });
 *
 * // Track a custom event
 * trackCustomEvent('ContentGenerated', { type: 'post', brand: 'MyBrand' });
 * ```
 */
export function useMetaPixel() {
  /**
   * Checks if Meta Pixel is available
   */
  const isPixelLoaded = useCallback((): boolean => {
    return typeof window !== 'undefined' && typeof window.fbq === 'function'
  }, [])

  /**
   * Track a standard Meta Pixel event
   *
   * @param eventName - Standard event name (e.g., 'Purchase', 'Lead', 'ViewContent')
   * @param parameters - Event-specific parameters
   */
  const trackEvent = useCallback(
    <T extends MetaPixelEventName>(
      eventName: T,
      parameters?: MetaPixelStandardEvent[T]
    ) => {
      if (!isPixelLoaded()) {
        console.warn('[Meta Pixel] fbq is not loaded. Event not tracked:', eventName)
        return
      }

      try {
        window.fbq('track', eventName, parameters)

        if (process.env.NODE_ENV === 'development') {
          console.log('[Meta Pixel] Event tracked:', eventName, parameters)
        }
      } catch (error) {
        console.error('[Meta Pixel] Error tracking event:', error)
      }
    },
    [isPixelLoaded]
  )

  /**
   * Track a custom Meta Pixel event
   *
   * @param eventName - Custom event name (e.g., 'ContentGenerated', 'BrandCreated')
   * @param parameters - Custom event parameters
   */
  const trackCustomEvent = useCallback(
    (eventName: string, parameters?: MetaPixelCustomEventParams) => {
      if (!isPixelLoaded()) {
        console.warn(
          '[Meta Pixel] fbq is not loaded. Custom event not tracked:',
          eventName
        )
        return
      }

      try {
        window.fbq('trackCustom', eventName, parameters)

        if (process.env.NODE_ENV === 'development') {
          console.log('[Meta Pixel] Custom event tracked:', eventName, parameters)
        }
      } catch (error) {
        console.error('[Meta Pixel] Error tracking custom event:', error)
      }
    },
    [isPixelLoaded]
  )

  /**
   * Track PageView event manually
   * (Note: PageView is automatically tracked on initial load)
   */
  const trackPageView = useCallback(() => {
    if (!isPixelLoaded()) {
      console.warn('[Meta Pixel] fbq is not loaded. PageView not tracked.')
      return
    }

    try {
      window.fbq('track', 'PageView')

      if (process.env.NODE_ENV === 'development') {
        console.log('[Meta Pixel] PageView tracked')
      }
    } catch (error) {
      console.error('[Meta Pixel] Error tracking PageView:', error)
    }
  }, [isPixelLoaded])

  /**
   * Grant or revoke user consent for pixel tracking
   *
   * @param action - 'grant' to enable tracking, 'revoke' to disable
   */
  const setConsent = useCallback(
    (action: 'grant' | 'revoke') => {
      if (!isPixelLoaded()) {
        console.warn('[Meta Pixel] fbq is not loaded. Consent not set.')
        return
      }

      try {
        window.fbq('consent', action)

        if (process.env.NODE_ENV === 'development') {
          console.log('[Meta Pixel] Consent:', action)
        }
      } catch (error) {
        console.error('[Meta Pixel] Error setting consent:', error)
      }
    },
    [isPixelLoaded]
  )

  return {
    isPixelLoaded,
    trackEvent,
    trackCustomEvent,
    trackPageView,
    setConsent,
  }
}

/**
 * Helper function to track conversion value events
 *
 * @param eventName - Conversion event name
 * @param value - Monetary value
 * @param currency - Currency code (default: 'USD')
 * @param additionalParams - Additional event parameters
 */
export function trackConversion<T extends MetaPixelEventName>(
  trackEvent: ReturnType<typeof useMetaPixel>['trackEvent'],
  eventName: T,
  value: number,
  currency = 'USD',
  additionalParams?: Partial<MetaPixelStandardEvent[T]>
) {
  trackEvent(eventName, {
    value,
    currency,
    ...additionalParams,
  } as MetaPixelStandardEvent[T])
}
