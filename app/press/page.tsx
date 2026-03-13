import type { Metadata } from 'next';
import PressPageContent from '@/components/PressPageContent';

export const metadata: Metadata = {
  title: 'Press & Media | Tapix',
  description: 'Tapix press and media resources. Company facts, press releases, media inquiries, and brand assets for Egypt\'s leading electronics and smart accessories store.',
  openGraph: {
    title: 'Press & Media | Tapix',
    description: 'Latest news and media resources from Tapix.',
  },
};

export default function PressPage() {
  return <PressPageContent />;
}
