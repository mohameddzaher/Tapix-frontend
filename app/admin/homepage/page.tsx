'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { HiOutlineX, HiOutlinePlus, HiOutlineSave } from 'react-icons/hi';
import { Button, Input, Card } from '@/components/ui';
import { cmsApi, adminApi } from '@/lib/api';
import toast from 'react-hot-toast';

type SectionKey =
  | 'homepage_features'
  | 'homepage_why_choose_us'
  | 'homepage_newsletter'
  | 'homepage_hero_badges'
  | 'homepage_hero_categories'
  | 'homepage_hero_promos';

const sections: { key: SectionKey; label: string }[] = [
  { key: 'homepage_features', label: 'Features Bar' },
  { key: 'homepage_why_choose_us', label: 'Why Choose Us' },
  { key: 'homepage_newsletter', label: 'Newsletter' },
  { key: 'homepage_hero_badges', label: 'Hero Trust Badges' },
  { key: 'homepage_hero_categories', label: 'Hero Quick Categories' },
  { key: 'homepage_hero_promos', label: 'Hero Promo Cards' },
];

export default function HomepageContentPage() {
  const [activeTab, setActiveTab] = useState<SectionKey>('homepage_features');

  const { data: cmsData, isLoading } = useQuery({
    queryKey: ['cms-homepage-all'],
    queryFn: () =>
      cmsApi.getMultiple(sections.map((s) => s.key)),
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-dark-900">Homepage Content</h1>
        <p className="text-dark-500 mt-1">
          Manage all homepage sections. Changes appear immediately on the public website.
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-2 border-b border-beige-200 pb-2">
        {sections.map((section) => (
          <button
            key={section.key}
            type="button"
            onClick={() => setActiveTab(section.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === section.key
                ? 'bg-primary-600 text-white'
                : 'bg-white text-dark-600 hover:bg-beige-100 border border-beige-200'
            }`}
          >
            {section.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="animate-pulse space-y-4">
          <div className="h-64 bg-beige-200 rounded-xl"></div>
        </div>
      ) : (
        <>
          {activeTab === 'homepage_features' && (
            <FeaturesEditor data={cmsData?.homepage_features} />
          )}
          {activeTab === 'homepage_why_choose_us' && (
            <WhyChooseUsEditor data={cmsData?.homepage_why_choose_us} />
          )}
          {activeTab === 'homepage_newsletter' && (
            <NewsletterEditor data={cmsData?.homepage_newsletter} />
          )}
          {activeTab === 'homepage_hero_badges' && (
            <HeroBadgesEditor data={cmsData?.homepage_hero_badges} />
          )}
          {activeTab === 'homepage_hero_categories' && (
            <HeroCategoriesEditor data={cmsData?.homepage_hero_categories} />
          )}
          {activeTab === 'homepage_hero_promos' && (
            <HeroPromosEditor data={cmsData?.homepage_hero_promos} />
          )}
        </>
      )}
    </div>
  );
}

// ========== HELPER ==========

function parseCmsValue(data: any, fallback: any) {
  try {
    if (data?.value) {
      return typeof data.value === 'string' ? JSON.parse(data.value) : data.value;
    }
  } catch {}
  return fallback;
}

function useSaveContent(key: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (value: any) => adminApi.updateContent(key, JSON.stringify(value)),
    onSuccess: () => {
      // Invalidate admin bulk query
      queryClient.invalidateQueries({ queryKey: ['cms-homepage-all'] });
      // Invalidate homepage individual component queries (key uses dashes)
      const dashKey = key.replace(/_/g, '-');
      queryClient.invalidateQueries({ queryKey: [`cms-${key}`] });
      queryClient.invalidateQueries({ queryKey: [`cms-${dashKey}`] });
      toast.success('Saved successfully');
    },
    onError: () => toast.error('Failed to save'),
  });
}

// ========== FEATURES EDITOR ==========

function FeaturesEditor({ data }: { data: any }) {
  const [items, setItems] = useState<Array<{ icon: string; title: string; description: string }>>([]);
  const save = useSaveContent('homepage_features');

  useEffect(() => {
    const parsed = parseCmsValue(data, [
      { icon: '🚚', title: 'Free Shipping', description: 'On orders over SAR 2,000' },
      { icon: '🛡️', title: '1 Year Warranty', description: 'Official manufacturer warranty' },
      { icon: '↩️', title: 'Easy Returns', description: '14-day return policy' },
      { icon: '💬', title: '24/7 Support', description: 'Expert assistance anytime' },
    ]);
    setItems(parsed);
  }, [data]);

  return (
    <Card padding="lg" className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-dark-900">Feature Cards</h3>
        <Button
          size="sm"
          variant="outline"
          leftIcon={<HiOutlinePlus size={16} />}
          onClick={() => setItems([...items, { icon: '⭐', title: '', description: '' }])}
        >
          Add Feature
        </Button>
      </div>

      {items.map((item, i) => (
        <div key={i} className="flex gap-3 items-start p-4 bg-beige-50 rounded-lg">
          <input
            className="w-16 px-2 py-2 border border-beige-300 rounded-lg text-center text-xl"
            value={item.icon}
            onChange={(e) => { const n = [...items]; n[i].icon = e.target.value; setItems(n); }}
            placeholder="Icon"
          />
          <div className="flex-1 space-y-2">
            <input
              className="w-full px-3 py-2 border border-beige-300 rounded-lg text-sm"
              value={item.title}
              onChange={(e) => { const n = [...items]; n[i].title = e.target.value; setItems(n); }}
              placeholder="Title"
            />
            <input
              className="w-full px-3 py-2 border border-beige-300 rounded-lg text-sm"
              value={item.description}
              onChange={(e) => { const n = [...items]; n[i].description = e.target.value; setItems(n); }}
              placeholder="Description"
            />
          </div>
          <button type="button" onClick={() => setItems(items.filter((_, j) => j !== i))} className="text-red-500 hover:text-red-700 p-1" title="Remove">
            <HiOutlineX size={18} />
          </button>
        </div>
      ))}

      <Button leftIcon={<HiOutlineSave size={16} />} onClick={() => save.mutate(items)} isLoading={save.isPending}>
        Save Features
      </Button>
    </Card>
  );
}

// ========== WHY CHOOSE US EDITOR ==========

function WhyChooseUsEditor({ data }: { data: any }) {
  const defaultVal = {
    badge: 'Why Shop With Us',
    title: 'The Tapix Difference',
    description: 'We are committed to providing you with the best shopping experience for electronics and smart accessories.',
    reasons: [] as Array<{ icon: string; title: string; description: string }>,
    cta: { title: 'Still Have Questions?', description: '', phone: '+20 123 456 789', buttonText: 'Send a Message', buttonLink: '/contact' },
  };

  const [content, setContent] = useState(defaultVal);
  const save = useSaveContent('homepage_why_choose_us');

  useEffect(() => {
    const parsed = parseCmsValue(data, defaultVal);
    // Deep merge CTA to preserve all fields
    const mergedCta = { ...defaultVal.cta, ...(parsed.cta || {}) };
    setContent({ ...defaultVal, ...parsed, cta: mergedCta });
  }, [data]);

  const updateReason = (i: number, field: string, value: string) => {
    const reasons = [...content.reasons];
    (reasons[i] as any)[field] = value;
    setContent({ ...content, reasons });
  };

  return (
    <div className="space-y-6">
      <Card padding="lg" className="space-y-4">
        <h3 className="font-semibold text-dark-900">Section Header</h3>
        <div className="grid grid-cols-1 gap-4">
          <Input label="Badge Text" value={content.badge} onChange={(e: any) => setContent({ ...content, badge: e.target.value })} />
          <Input label="Title" value={content.title} onChange={(e: any) => setContent({ ...content, title: e.target.value })} />
          <div>
            <label className="block text-sm font-medium text-dark-700 mb-1">Description</label>
            <textarea
              className="w-full px-4 py-2 border border-beige-300 rounded-lg text-sm"
              rows={2}
              value={content.description}
              onChange={(e) => setContent({ ...content, description: e.target.value })}
            />
          </div>
        </div>
      </Card>

      <Card padding="lg" className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-dark-900">Reasons</h3>
          <Button size="sm" variant="outline" leftIcon={<HiOutlinePlus size={16} />}
            onClick={() => setContent({ ...content, reasons: [...content.reasons, { icon: '⭐', title: '', description: '' }] })}>
            Add Reason
          </Button>
        </div>

        {content.reasons.map((reason, i) => (
          <div key={i} className="flex gap-3 items-start p-4 bg-beige-50 rounded-lg">
            <input className="w-16 px-2 py-2 border border-beige-300 rounded-lg text-center text-xl" value={reason.icon} onChange={(e) => updateReason(i, 'icon', e.target.value)} />
            <div className="flex-1 space-y-2">
              <input className="w-full px-3 py-2 border border-beige-300 rounded-lg text-sm" value={reason.title} onChange={(e) => updateReason(i, 'title', e.target.value)} placeholder="Title" />
              <textarea className="w-full px-3 py-2 border border-beige-300 rounded-lg text-sm" rows={2} value={reason.description} onChange={(e) => updateReason(i, 'description', e.target.value)} placeholder="Description" />
            </div>
            <button type="button" onClick={() => setContent({ ...content, reasons: content.reasons.filter((_, j) => j !== i) })} className="text-red-500 hover:text-red-700 p-1" title="Remove">
              <HiOutlineX size={18} />
            </button>
          </div>
        ))}
      </Card>

      <Card padding="lg" className="space-y-4">
        <h3 className="font-semibold text-dark-900">CTA Banner</h3>
        <div className="grid grid-cols-2 gap-4">
          <Input label="CTA Title" value={content.cta.title} onChange={(e: any) => setContent({ ...content, cta: { ...content.cta, title: e.target.value } })} />
          <Input label="Phone Number" value={content.cta.phone} onChange={(e: any) => setContent({ ...content, cta: { ...content.cta, phone: e.target.value } })} />
          <Input label="Button Text" value={content.cta.buttonText} onChange={(e: any) => setContent({ ...content, cta: { ...content.cta, buttonText: e.target.value } })} />
          <Input label="Button Link" value={content.cta.buttonLink} onChange={(e: any) => setContent({ ...content, cta: { ...content.cta, buttonLink: e.target.value } })} />
        </div>
        <div>
          <label className="block text-sm font-medium text-dark-700 mb-1">CTA Description</label>
          <textarea className="w-full px-4 py-2 border border-beige-300 rounded-lg text-sm" rows={2} value={content.cta.description} onChange={(e) => setContent({ ...content, cta: { ...content.cta, description: e.target.value } })} />
        </div>
      </Card>

      <Button leftIcon={<HiOutlineSave size={16} />} onClick={() => save.mutate(content)} isLoading={save.isPending}>
        Save Why Choose Us
      </Button>
    </div>
  );
}

// ========== NEWSLETTER EDITOR ==========

function NewsletterEditor({ data }: { data: any }) {
  const defaultVal = {
    badge: 'Newsletter',
    title: 'Get 10% Off Your First Order',
    description: '',
    benefits: [] as Array<{ icon: string; title: string; description: string }>,
    formTitle: 'Join Our Community',
    subscriberText: 'Over 10,000+ subscribers already',
    buttonText: 'Subscribe & Get 10% Off',
  };

  const [content, setContent] = useState(defaultVal);
  const save = useSaveContent('homepage_newsletter');

  useEffect(() => {
    const parsed = parseCmsValue(data, defaultVal);
    setContent({ ...defaultVal, ...parsed });
  }, [data]);

  return (
    <div className="space-y-6">
      <Card padding="lg" className="space-y-4">
        <h3 className="font-semibold text-dark-900">Newsletter Content</h3>
        <Input label="Badge" value={content.badge} onChange={(e: any) => setContent({ ...content, badge: e.target.value })} />
        <Input label="Title" value={content.title} onChange={(e: any) => setContent({ ...content, title: e.target.value })} />
        <div>
          <label className="block text-sm font-medium text-dark-700 mb-1">Description</label>
          <textarea className="w-full px-4 py-2 border border-beige-300 rounded-lg text-sm" rows={2} value={content.description} onChange={(e) => setContent({ ...content, description: e.target.value })} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Input label="Form Title" value={content.formTitle} onChange={(e: any) => setContent({ ...content, formTitle: e.target.value })} />
          <Input label="Subscriber Text" value={content.subscriberText} onChange={(e: any) => setContent({ ...content, subscriberText: e.target.value })} />
        </div>
        <Input label="Button Text" value={content.buttonText} onChange={(e: any) => setContent({ ...content, buttonText: e.target.value })} />
      </Card>

      <Card padding="lg" className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-dark-900">Benefits</h3>
          <Button size="sm" variant="outline" leftIcon={<HiOutlinePlus size={16} />}
            onClick={() => setContent({ ...content, benefits: [...content.benefits, { icon: '⭐', title: '', description: '' }] })}>
            Add Benefit
          </Button>
        </div>
        {content.benefits.map((b, i) => (
          <div key={i} className="flex gap-3 items-start p-4 bg-beige-50 rounded-lg">
            <input className="w-16 px-2 py-2 border border-beige-300 rounded-lg text-center text-xl" value={b.icon} onChange={(e) => { const n = [...content.benefits]; n[i].icon = e.target.value; setContent({ ...content, benefits: n }); }} />
            <div className="flex-1 space-y-2">
              <input className="w-full px-3 py-2 border border-beige-300 rounded-lg text-sm" value={b.title} onChange={(e) => { const n = [...content.benefits]; n[i].title = e.target.value; setContent({ ...content, benefits: n }); }} placeholder="Title" />
              <input className="w-full px-3 py-2 border border-beige-300 rounded-lg text-sm" value={b.description} onChange={(e) => { const n = [...content.benefits]; n[i].description = e.target.value; setContent({ ...content, benefits: n }); }} placeholder="Description" />
            </div>
            <button type="button" onClick={() => setContent({ ...content, benefits: content.benefits.filter((_, j) => j !== i) })} className="text-red-500 hover:text-red-700 p-1" title="Remove">
              <HiOutlineX size={18} />
            </button>
          </div>
        ))}
      </Card>

      <Button leftIcon={<HiOutlineSave size={16} />} onClick={() => save.mutate(content)} isLoading={save.isPending}>
        Save Newsletter
      </Button>
    </div>
  );
}

// ========== HERO BADGES EDITOR ==========

function HeroBadgesEditor({ data }: { data: any }) {
  const [items, setItems] = useState<Array<{ icon: string; title: string; subtitle: string }>>([]);
  const save = useSaveContent('homepage_hero_badges');

  useEffect(() => {
    setItems(parseCmsValue(data, [
      { icon: '🚚', title: 'Free Shipping', subtitle: 'On orders over SAR 2,000' },
      { icon: '🛡️', title: '1 Year Warranty', subtitle: 'On all products' },
      { icon: '🔒', title: 'Secure Payment', subtitle: 'Multiple options' },
      { icon: '💬', title: '24/7 Support', subtitle: 'Expert assistance' },
    ]));
  }, [data]);

  return (
    <Card padding="lg" className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-dark-900">Trust Badges</h3>
        <Button size="sm" variant="outline" leftIcon={<HiOutlinePlus size={16} />}
          onClick={() => setItems([...items, { icon: '⭐', title: '', subtitle: '' }])}>
          Add Badge
        </Button>
      </div>

      {items.map((item, i) => (
        <div key={i} className="flex gap-3 items-start p-4 bg-beige-50 rounded-lg">
          <input className="w-16 px-2 py-2 border border-beige-300 rounded-lg text-center text-xl" value={item.icon} onChange={(e) => { const n = [...items]; n[i].icon = e.target.value; setItems(n); }} />
          <div className="flex-1 space-y-2">
            <input className="w-full px-3 py-2 border border-beige-300 rounded-lg text-sm" value={item.title} onChange={(e) => { const n = [...items]; n[i].title = e.target.value; setItems(n); }} placeholder="Title" />
            <input className="w-full px-3 py-2 border border-beige-300 rounded-lg text-sm" value={item.subtitle} onChange={(e) => { const n = [...items]; n[i].subtitle = e.target.value; setItems(n); }} placeholder="Subtitle" />
          </div>
          <button type="button" onClick={() => setItems(items.filter((_, j) => j !== i))} className="text-red-500 hover:text-red-700 p-1" title="Remove">
            <HiOutlineX size={18} />
          </button>
        </div>
      ))}

      <Button leftIcon={<HiOutlineSave size={16} />} onClick={() => save.mutate(items)} isLoading={save.isPending}>
        Save Trust Badges
      </Button>
    </Card>
  );
}

// ========== HERO CATEGORIES EDITOR ==========

function HeroCategoriesEditor({ data }: { data: any }) {
  const [items, setItems] = useState<Array<{ emoji: string; label: string; href: string }>>([]);
  const save = useSaveContent('homepage_hero_categories');

  useEffect(() => {
    setItems(parseCmsValue(data, [
      { emoji: '📱', label: 'Smartphones', href: '/categories/smartphones' },
      { emoji: '🎧', label: 'Audio', href: '/categories/audio' },
      { emoji: '⌚', label: 'Smart Watches', href: '/categories/smart-watches' },
      { emoji: '🔌', label: 'Accessories', href: '/categories/accessories' },
    ]));
  }, [data]);

  return (
    <Card padding="lg" className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-dark-900">Quick Categories</h3>
        <Button size="sm" variant="outline" leftIcon={<HiOutlinePlus size={16} />}
          onClick={() => setItems([...items, { emoji: '📦', label: '', href: '' }])}>
          Add Category
        </Button>
      </div>

      {items.map((item, i) => (
        <div key={i} className="flex gap-3 items-center p-4 bg-beige-50 rounded-lg">
          <input className="w-16 px-2 py-2 border border-beige-300 rounded-lg text-center text-xl" value={item.emoji} onChange={(e) => { const n = [...items]; n[i].emoji = e.target.value; setItems(n); }} />
          <input className="flex-1 px-3 py-2 border border-beige-300 rounded-lg text-sm" value={item.label} onChange={(e) => { const n = [...items]; n[i].label = e.target.value; setItems(n); }} placeholder="Label" />
          <input className="flex-1 px-3 py-2 border border-beige-300 rounded-lg text-sm" value={item.href} onChange={(e) => { const n = [...items]; n[i].href = e.target.value; setItems(n); }} placeholder="/categories/..." />
          <button type="button" onClick={() => setItems(items.filter((_, j) => j !== i))} className="text-red-500 hover:text-red-700 p-1" title="Remove">
            <HiOutlineX size={18} />
          </button>
        </div>
      ))}

      <Button leftIcon={<HiOutlineSave size={16} />} onClick={() => save.mutate(items)} isLoading={save.isPending}>
        Save Categories
      </Button>
    </Card>
  );
}

// ========== HERO PROMOS EDITOR ==========

function HeroPromosEditor({ data }: { data: any }) {
  const [items, setItems] = useState<Array<{ emoji: string; title: string; subtitle: string; href: string; color: string }>>([]);
  const save = useSaveContent('homepage_hero_promos');

  useEffect(() => {
    setItems(parseCmsValue(data, [
      { emoji: '🔥', title: 'Flash Deals', subtitle: 'Up to 50% off', href: '/deals', color: 'from-primary-500 to-primary-600' },
      { emoji: '✨', title: 'New Arrivals', subtitle: 'Latest products', href: '/products?new=true', color: 'from-dark-800 to-dark-900' },
      { emoji: '📦', title: 'All Categories', subtitle: 'Browse collection', href: '/categories', color: '' },
      { emoji: '⭐', title: 'Best Sellers', subtitle: 'Top rated items', href: '/products?featured=true', color: '' },
    ]));
  }, [data]);

  return (
    <Card padding="lg" className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-dark-900">Promo Cards</h3>
        <Button size="sm" variant="outline" leftIcon={<HiOutlinePlus size={16} />}
          onClick={() => setItems([...items, { emoji: '🎉', title: '', subtitle: '', href: '', color: '' }])}>
          Add Card
        </Button>
      </div>

      {items.map((item, i) => (
        <div key={i} className="flex gap-3 items-start p-4 bg-beige-50 rounded-lg">
          <input className="w-16 px-2 py-2 border border-beige-300 rounded-lg text-center text-xl" value={item.emoji} onChange={(e) => { const n = [...items]; n[i].emoji = e.target.value; setItems(n); }} />
          <div className="flex-1 space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <input className="px-3 py-2 border border-beige-300 rounded-lg text-sm" value={item.title} onChange={(e) => { const n = [...items]; n[i].title = e.target.value; setItems(n); }} placeholder="Title" />
              <input className="px-3 py-2 border border-beige-300 rounded-lg text-sm" value={item.subtitle} onChange={(e) => { const n = [...items]; n[i].subtitle = e.target.value; setItems(n); }} placeholder="Subtitle" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <input className="px-3 py-2 border border-beige-300 rounded-lg text-sm" value={item.href} onChange={(e) => { const n = [...items]; n[i].href = e.target.value; setItems(n); }} placeholder="Link (e.g. /deals)" />
              <input className="px-3 py-2 border border-beige-300 rounded-lg text-sm" value={item.color} onChange={(e) => { const n = [...items]; n[i].color = e.target.value; setItems(n); }} placeholder="Gradient (e.g. from-red-500 to-primary-500)" />
            </div>
          </div>
          <button type="button" onClick={() => setItems(items.filter((_, j) => j !== i))} className="text-red-500 hover:text-red-700 p-1" title="Remove">
            <HiOutlineX size={18} />
          </button>
        </div>
      ))}

      <Button leftIcon={<HiOutlineSave size={16} />} onClick={() => save.mutate(items)} isLoading={save.isPending}>
        Save Promo Cards
      </Button>
    </Card>
  );
}
