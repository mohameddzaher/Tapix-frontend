import type { Metadata } from 'next';
import PolicyPageContent from '@/components/PolicyPageContent';

export const metadata: Metadata = {
  title: 'Warranty Policy | Tapix',
  description: 'Tapix warranty policy: warranty periods by product category, what is covered, how to claim warranty, repair and replacement options, and extended warranty plans.',
  openGraph: {
    title: 'Warranty Policy | Tapix',
    description: 'Learn about Tapix product warranty coverage and claim process.',
  },
};

export default function WarrantyPage() {
  return <PolicyPageContent slug="warranty" fallbackTitle="Warranty Policy" />;
}
