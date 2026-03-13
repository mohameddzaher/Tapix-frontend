import type { Metadata } from 'next';
import FAQPageContent from '@/components/FAQPageContent';

export const metadata: Metadata = {
  title: 'FAQ - Frequently Asked Questions | Tapix',
  description: 'Find answers to common questions about Tapix orders, payments, delivery, returns, warranty, and more. Get help with your shopping experience.',
  openGraph: {
    title: 'FAQ | Tapix',
    description: 'Find answers to common questions about Tapix orders, payments, delivery, and returns.',
  },
};

export default function FAQPage() {
  return <FAQPageContent />;
}
