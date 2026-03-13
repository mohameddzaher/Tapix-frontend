import type { Metadata } from 'next';
import PolicyPageContent from '@/components/PolicyPageContent';

export const metadata: Metadata = {
  title: 'Returns & Exchanges | Tapix',
  description: 'Tapix returns and exchanges: 14-day return window, exchange process, refund timelines, and how to handle defective or damaged products.',
  openGraph: {
    title: 'Returns & Exchanges | Tapix',
    description: 'Learn about Tapix return policy and exchange process.',
  },
};

export default function ReturnsPage() {
  return <PolicyPageContent slug="returns" fallbackTitle="Returns & Exchanges" />;
}
