import type { Metadata } from 'next';
import PolicyPageContent from '@/components/PolicyPageContent';

export const metadata: Metadata = {
  title: 'Shipping & Delivery | Tapix',
  description: 'Tapix shipping and delivery: standard and express shipping across Egypt, order tracking, free shipping on orders over SAR 2,000, and delivery timelines.',
  openGraph: {
    title: 'Shipping & Delivery | Tapix',
    description: 'Learn about Tapix shipping methods and delivery timelines.',
  },
};

export default function ShippingPage() {
  return <PolicyPageContent slug="shipping" fallbackTitle="Shipping Information" />;
}
