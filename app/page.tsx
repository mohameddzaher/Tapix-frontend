"use client";

import { ComponentType } from "react";
import {
  Hero,
  Features,
  Brands,
  FeaturedProducts,
  DealsSection,
  WhyChooseUs,
  Testimonials,
  Newsletter,
  SecondaryBanner,
  CategoryStrip,
} from "@/components/home";
import { useSettings } from "@/lib/settings-context";

// Map section keys to their components
const sectionMap: Record<string, ComponentType> = {
  hero: Hero,
  features: Features,
  categoryStrip: CategoryStrip,
  deals: DealsSection,
  featured: FeaturedProducts,
  brands: Brands,
  whyChooseUs: WhyChooseUs,
  testimonials: Testimonials,
  newsletter: Newsletter,
};

// Default section order (used if settings haven't loaded yet)
const defaultSections = [
  { key: "hero", enabled: true, order: 0 },
  { key: "features", enabled: true, order: 1 },
  { key: "deals", enabled: true, order: 2 },
  { key: "categoryStrip", enabled: true, order: 3 },
  { key: "featured", enabled: true, order: 4 },
  { key: "brands", enabled: true, order: 5 },
  { key: "whyChooseUs", enabled: true, order: 6 },
  { key: "testimonials", enabled: true, order: 7 },
  { key: "newsletter", enabled: true, order: 8 },
];

export default function HomePage() {
  const { settings } = useSettings();

  const sections =
    settings.homepageSections?.length > 0
      ? settings.homepageSections
      : defaultSections;

  // Sort by order, filter enabled, render
  const sortedSections = [...sections]
    .filter((s) => s.enabled)
    .sort((a, b) => a.order - b.order);

  return (
    <>
      {sortedSections.map((section) => {
        const Component = sectionMap[section.key];
        if (!Component) return null;

        // SecondaryBanner always renders right after hero
        if (section.key === "hero") {
          return (
            <div key={section.key}>
              <Component />
              <SecondaryBanner />
            </div>
          );
        }

        return <Component key={section.key} />;
      })}
    </>
  );
}
