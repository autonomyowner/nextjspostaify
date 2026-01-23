/**
 * Meta Pixel (Facebook Pixel) TypeScript Definitions
 *
 * Provides type-safe access to the fbq() function for tracking events.
 */

export interface MetaPixelStandardEvent {
  // Conversion Events
  AddPaymentInfo: {
    content_category?: string;
    content_ids?: string[];
    contents?: Array<{
      id: string;
      quantity: number;
    }>;
    currency?: string;
    value?: number;
  };
  AddToCart: {
    content_ids?: string[];
    content_name?: string;
    content_type?: string;
    contents?: Array<{
      id: string;
      quantity: number;
    }>;
    currency?: string;
    value?: number;
  };
  AddToWishlist: {
    content_ids?: string[];
    content_name?: string;
    contents?: Array<{
      id: string;
      quantity: number;
    }>;
    currency?: string;
    value?: number;
  };
  CompleteRegistration: {
    content_name?: string;
    currency?: string;
    status?: string;
    value?: number;
  };
  Contact: {
    content_category?: string;
    content_name?: string;
  };
  CustomizeProduct: {
    content_ids?: string[];
    contents?: Array<{
      id: string;
      quantity: number;
    }>;
    currency?: string;
    value?: number;
  };
  Donate: {
    currency?: string;
    value?: number;
  };
  FindLocation: {
    content_category?: string;
    content_name?: string;
  };
  InitiateCheckout: {
    content_category?: string;
    content_name?: string;
    content_ids?: string[];
    contents?: Array<{
      id: string;
      quantity: number;
    }>;
    currency?: string;
    num_items?: number;
    value?: number;
  };
  Lead: {
    content_category?: string;
    content_name?: string;
    currency?: string;
    value?: number;
  };
  Purchase: {
    content_ids?: string[];
    content_name?: string;
    content_type?: string;
    contents?: Array<{
      id: string;
      quantity: number;
    }>;
    currency?: string;
    num_items?: number;
    value: number;
  };
  Schedule: {
    content_category?: string;
    content_name?: string;
  };
  Search: {
    content_category?: string;
    content_ids?: string[];
    contents?: Array<{
      id: string;
      quantity: number;
    }>;
    currency?: string;
    search_string?: string;
    value?: number;
  };
  StartTrial: {
    currency?: string;
    predicted_ltv?: number;
    value?: number;
  };
  SubmitApplication: {
    content_category?: string;
    content_name?: string;
  };
  Subscribe: {
    currency?: string;
    predicted_ltv?: number;
    value?: number;
  };
  ViewContent: {
    content_category?: string;
    content_ids?: string[];
    content_name?: string;
    content_type?: string;
    contents?: Array<{
      id: string;
      quantity: number;
    }>;
    currency?: string;
    value?: number;
  };
}

export type MetaPixelEventName = keyof MetaPixelStandardEvent;

export interface MetaPixelCustomEventParams {
  [key: string]: string | number | boolean | string[] | number[] | null | undefined;
}

/**
 * Meta Pixel fbq function interface
 */
export interface FacebookPixel {
  (command: 'init', pixelId: string, advancedMatching?: Record<string, unknown>): void;
  (command: 'track', eventName: 'PageView'): void;
  <T extends MetaPixelEventName>(
    command: 'track',
    eventName: T,
    parameters?: MetaPixelStandardEvent[T]
  ): void;
  (
    command: 'trackCustom',
    eventName: string,
    parameters?: MetaPixelCustomEventParams
  ): void;
  (command: 'consent', action: 'grant' | 'revoke'): void;
  queue?: unknown[];
  push?: (args: unknown) => void;
  loaded?: boolean;
  version?: string;
  callMethod?: (...args: unknown[]) => void;
}

declare global {
  interface Window {
    fbq: FacebookPixel;
    _fbq?: FacebookPixel;
  }
}

export {};
