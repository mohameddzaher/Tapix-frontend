import type { Metadata } from 'next';
import CareersPageContent from '@/components/CareersPageContent';

export const metadata: Metadata = {
  title: 'Careers | Tapix',
  description: 'Join the Tapix team! Explore career opportunities in e-commerce, marketing, logistics, and more. Help us deliver the best electronics shopping experience across Egypt.',
  openGraph: {
    title: 'Careers at Tapix',
    description: 'Explore career opportunities at Tapix.',
  },
};

export default function CareersPage() {
  return <CareersPageContent />;
}
