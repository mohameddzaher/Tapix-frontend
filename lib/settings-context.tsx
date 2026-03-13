'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import { settingsApi } from './api';

// Default settings matching all public fields from the backend
const defaultSettings = {
  // General
  siteName: 'Tapix',
  siteDescription: '',
  siteEmail: '',
  sitePhone: '',
  siteAddress: '',
  currency: 'SAR',
  timezone: 'Asia/Riyadh',
  dateFormat: 'DD/MM/YYYY',
  maintenanceMode: false,
  maintenanceMessage: '',

  // Shipping
  shippingFee: 50,
  freeShippingThreshold: 500,
  enableFreeShipping: true,
  estimatedDeliveryDays: 3,

  // Payment
  enableTax: true,
  taxRate: 15,
  taxLabel: 'VAT',
  enableCOD: true,
  codFee: 0,
  enableOnlinePayment: true,

  // Social Media
  socialFacebook: '',
  socialInstagram: '',
  socialTwitter: '',
  socialYoutube: '',
  socialTiktok: '',
  socialLinkedin: '',
  socialWhatsapp: '',
  socialSnapchat: '',
  socialLinktree: '',

  // Appearance
  logo: '',
  favicon: '',
  primaryColor: '#B98B64',
  secondaryColor: '#1A1A1A',
  accentColor: '#F5F0E8',
  headerStyle: 'default' as 'default' | 'transparent' | 'colored',
  footerStyle: 'default' as 'default' | 'minimal' | 'expanded',
  productCardStyle: 'default' as 'default' | 'minimal' | 'detailed',

  // SEO
  metaTitle: 'Tapix - Premium E-Commerce',
  metaDescription: '',
  metaKeywords: [] as string[],

  // Homepage Sections
  homepageSections: [
    { key: 'hero', enabled: true, order: 0 },
    { key: 'features', enabled: true, order: 1 },
    { key: 'deals', enabled: true, order: 2 },
    { key: 'categoryStrip', enabled: true, order: 3 },
    { key: 'featured', enabled: true, order: 4 },
    { key: 'brands', enabled: true, order: 5 },
    { key: 'whyChooseUs', enabled: true, order: 6 },
    { key: 'testimonials', enabled: true, order: 7 },
    { key: 'newsletter', enabled: true, order: 8 },
  ] as Array<{ key: string; enabled: boolean; order: number }>,

  // Features
  enableReviews: true,
  reviewsRequireApproval: true,
  enableWishlist: true,
  enableCompare: true,
  maxCompareProducts: 4,
  enableRecentlyViewed: true,
  recentlyViewedLimit: 10,
  enableReferralProgram: false,
  referralRewardAmount: 50,
  referralRewardType: 'fixed' as 'fixed' | 'percentage',
};

export type Settings = typeof defaultSettings;

interface SettingsContextValue {
  settings: Settings;
  isLoading: boolean;
  formatPrice: (price: number) => string;
}

const SettingsContext = createContext<SettingsContextValue | null>(null);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const { data, isLoading } = useQuery({
    queryKey: ['public-settings'],
    queryFn: settingsApi.getPublic,
    staleTime: 2 * 60 * 1000, // Cache for 2 minutes
    refetchOnWindowFocus: true,
  });

  const settings = { ...defaultSettings, ...data };

  const formatPrice = (price: number) => {
    const formatted = price.toLocaleString();
    return `${settings.currency} ${formatted}`;
  };

  return (
    <SettingsContext.Provider value={{ settings, isLoading, formatPrice }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}

// Hook for just getting the currency formatter
export function useCurrency() {
  const { formatPrice, settings } = useSettings();
  return { formatPrice, currency: settings.currency };
}
