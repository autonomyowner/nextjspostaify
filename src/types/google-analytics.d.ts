/**
 * Google Analytics 4 (GA4) TypeScript Definitions
 *
 * Provides type-safe access to the gtag() function for tracking events.
 */

/**
 * GA4 Recommended Events Parameters
 * https://developers.google.com/analytics/devguides/collection/ga4/reference/events
 */
export interface GA4EventParams {
  // E-commerce Events
  add_payment_info: {
    currency?: string;
    value?: number;
    coupon?: string;
    payment_type?: string;
    items?: GA4Item[];
  };
  add_to_cart: {
    currency?: string;
    value?: number;
    items?: GA4Item[];
  };
  begin_checkout: {
    currency?: string;
    value?: number;
    coupon?: string;
    items?: GA4Item[];
  };
  purchase: {
    currency?: string;
    transaction_id: string;
    value: number;
    affiliation?: string;
    coupon?: string;
    shipping?: number;
    tax?: number;
    items?: GA4Item[];
  };

  // User Engagement Events
  sign_up: {
    method?: string;
  };
  login: {
    method?: string;
  };
  search: {
    search_term: string;
  };
  select_content: {
    content_type?: string;
    item_id?: string;
  };
  share: {
    method?: string;
    content_type?: string;
    item_id?: string;
  };

  // Custom Event Parameters
  [key: string]: Record<string, string | number | boolean | string[] | GA4Item[] | undefined>;
}

/**
 * GA4 Item object for e-commerce events
 */
export interface GA4Item {
  item_id?: string;
  item_name?: string;
  affiliation?: string;
  coupon?: string;
  currency?: string;
  discount?: number;
  index?: number;
  item_brand?: string;
  item_category?: string;
  item_category2?: string;
  item_category3?: string;
  item_category4?: string;
  item_category5?: string;
  item_list_id?: string;
  item_list_name?: string;
  item_variant?: string;
  location_id?: string;
  price?: number;
  quantity?: number;
}

/**
 * GA4 Config Parameters
 */
export interface GA4ConfigParams {
  page_title?: string;
  page_location?: string;
  page_path?: string;
  send_page_view?: boolean;
  user_id?: string;
  user_properties?: Record<string, string | number | boolean>;
  [key: string]: string | number | boolean | Record<string, unknown> | undefined;
}

/**
 * GA4 gtag function interface
 */
export interface Gtag {
  (command: 'config', targetId: string, config?: GA4ConfigParams): void;
  (command: 'set', config: Record<string, unknown>): void;
  (command: 'set', targetId: string, config: Record<string, unknown>): void;
  (command: 'event', eventName: keyof GA4EventParams, eventParams?: GA4EventParams[keyof GA4EventParams]): void;
  (command: 'event', eventName: string, eventParams?: Record<string, unknown>): void;
  (command: 'get', targetId: string, fieldName: string, callback?: (value: string) => void): void;
  (command: 'consent', consentArg: 'default' | 'update', consentParams: Record<string, string>): void;
}

declare global {
  interface Window {
    gtag: Gtag;
    dataLayer: unknown[];
  }
}

export {};
