'use client'

import { useCallback } from 'react'
import type { GA4EventParams, GA4ConfigParams } from '@/types/google-analytics'

/**
 * Custom hook for Google Analytics 4 (GA4) event tracking
 *
 * Provides a type-safe interface for tracking GA4 events.
 *
 * @example
 * ```tsx
 * const { trackEvent, trackPageView } = useGA4();
 *
 * // Track a recommended event
 * trackEvent('purchase', {
 *   transaction_id: 'T_12345',
 *   value: 25.99,
 *   currency: 'USD',
 * });
 *
 * // Track a custom event
 * trackEvent('content_generated', { platform: 'Instagram', style: 'viral' });
 * ```
 */
export function useGA4() {
  /**
   * Checks if GA4 is available
   */
  const isGtagLoaded = useCallback((): boolean => {
    return typeof window !== 'undefined' && typeof window.gtag === 'function'
  }, [])

  /**
   * Track a GA4 event
   *
   * @param eventName - Event name (e.g., 'purchase', 'sign_up', 'login')
   * @param eventParams - Event-specific parameters
   */
  const trackEvent = useCallback(
    <T extends keyof GA4EventParams>(
      eventName: T | string,
      eventParams?: GA4EventParams[T] | Record<string, unknown>
    ) => {
      if (!isGtagLoaded()) {
        console.warn('[GA4] gtag is not loaded. Event not tracked:', eventName)
        return
      }

      try {
        window.gtag('event', eventName as string, eventParams as Record<string, unknown>)

        if (process.env.NODE_ENV === 'development') {
          console.log('[GA4] Event tracked:', eventName, eventParams)
        }
      } catch (error) {
        console.error('[GA4] Error tracking event:', error)
      }
    },
    [isGtagLoaded]
  )

  /**
   * Track a page view manually
   *
   * @param pageTitle - Optional page title
   * @param pagePath - Optional page path (defaults to current path)
   * @param pageLocation - Optional full URL (defaults to current URL)
   */
  const trackPageView = useCallback(
    (pageTitle?: string, pagePath?: string, pageLocation?: string) => {
      if (!isGtagLoaded()) {
        console.warn('[GA4] gtag is not loaded. Page view not tracked.')
        return
      }

      try {
        const config: GA4ConfigParams = {
          page_title: pageTitle || document.title,
          page_path: pagePath || window.location.pathname,
          page_location: pageLocation || window.location.href,
        }

        window.gtag('config', 'G-VWE8FSW324', config)

        if (process.env.NODE_ENV === 'development') {
          console.log('[GA4] Page view tracked:', config)
        }
      } catch (error) {
        console.error('[GA4] Error tracking page view:', error)
      }
    },
    [isGtagLoaded]
  )

  /**
   * Set user ID for cross-device tracking
   *
   * @param userId - User ID
   */
  const setUserId = useCallback(
    (userId: string) => {
      if (!isGtagLoaded()) {
        console.warn('[GA4] gtag is not loaded. User ID not set.')
        return
      }

      try {
        window.gtag('config', 'G-VWE8FSW324', {
          user_id: userId,
        })

        if (process.env.NODE_ENV === 'development') {
          console.log('[GA4] User ID set:', userId)
        }
      } catch (error) {
        console.error('[GA4] Error setting user ID:', error)
      }
    },
    [isGtagLoaded]
  )

  /**
   * Set user properties for better segmentation
   *
   * @param properties - User properties object
   */
  const setUserProperties = useCallback(
    (properties: Record<string, string | number | boolean>) => {
      if (!isGtagLoaded()) {
        console.warn('[GA4] gtag is not loaded. User properties not set.')
        return
      }

      try {
        window.gtag('set', 'user_properties', properties)

        if (process.env.NODE_ENV === 'development') {
          console.log('[GA4] User properties set:', properties)
        }
      } catch (error) {
        console.error('[GA4] Error setting user properties:', error)
      }
    },
    [isGtagLoaded]
  )

  /**
   * Grant or update consent for analytics tracking (GDPR)
   *
   * @param consentMode - 'granted' or 'denied'
   */
  const setConsent = useCallback(
    (consentMode: 'granted' | 'denied') => {
      if (!isGtagLoaded()) {
        console.warn('[GA4] gtag is not loaded. Consent not set.')
        return
      }

      try {
        window.gtag('consent', 'update', {
          analytics_storage: consentMode,
          ad_storage: consentMode,
        })

        if (process.env.NODE_ENV === 'development') {
          console.log('[GA4] Consent updated:', consentMode)
        }
      } catch (error) {
        console.error('[GA4] Error setting consent:', error)
      }
    },
    [isGtagLoaded]
  )

  return {
    isGtagLoaded,
    trackEvent,
    trackPageView,
    setUserId,
    setUserProperties,
    setConsent,
  }
}

/**
 * Helper function to track conversion value events
 *
 * @param trackEvent - The trackEvent function from useGA4 hook
 * @param eventName - Event name
 * @param value - Monetary value
 * @param currency - Currency code (default: 'USD')
 * @param additionalParams - Additional event parameters
 */
export function trackConversion(
  trackEvent: ReturnType<typeof useGA4>['trackEvent'],
  eventName: string,
  value: number,
  currency = 'USD',
  additionalParams?: Record<string, unknown>
) {
  trackEvent(eventName, {
    value,
    currency,
    ...additionalParams,
  })
}
