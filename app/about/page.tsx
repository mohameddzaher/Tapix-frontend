import type { Metadata } from 'next';
import AboutPageContent from '@/components/AboutPageContent';

export const metadata: Metadata = {
  title: 'About Us | Tapix',
  description: 'Learn about Tapix - Egypt\'s leading store for electronics and smart accessories. Our story, mission, values, and the team behind Tapix.',
  openGraph: {
    title: 'About Tapix',
    description: 'Learn about Tapix - Egypt\'s leading store for electronics and smart accessories.',
  },
};

export default function AboutPage() {
  return <AboutPageContent />;
}
