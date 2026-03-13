'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { HiOutlineArrowLeft } from 'react-icons/hi';
import { Button, Input, Textarea, Card, Checkbox } from '@/components/ui';
import { adminApi } from '@/lib/api';
import toast from 'react-hot-toast';

const bannerSchema = z.object({
  title: z.string().min(2, 'Title must be at least 2 characters'),
  titleAr: z.string().optional(),
  subtitle: z.string().optional(),
  subtitleAr: z.string().optional(),
  image: z.string().url('Please enter a valid image URL'),
  mobileImage: z.string().url('Please enter a valid URL').optional().or(z.literal('')),
  link: z.string().url('Please enter a valid URL').optional().or(z.literal('')),
  linkText: z.string().optional(),
  linkTextAr: z.string().optional(),
  position: z.string(),
  backgroundColor: z.string().optional(),
  textColor: z.string().optional(),
  order: z.number(),
  startsAt: z.string().optional().or(z.literal('')),
  endsAt: z.string().optional().or(z.literal('')),
  isActive: z.boolean(),
});

type BannerForm = z.infer<typeof bannerSchema>;

export default function NewBannerPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<BannerForm>({
    resolver: zodResolver(bannerSchema),
    defaultValues: {
      isActive: true,
      position: 'hero_main',
      order: 0,
      backgroundColor: '#ffffff',
      textColor: '#000000',
    },
  });

  const onSubmit = async (data: BannerForm) => {
    setIsLoading(true);
    try {
      // Clean optional empty strings
      const payload: any = { ...data };
      if (!payload.mobileImage) delete payload.mobileImage;
      if (!payload.link) delete payload.link;
      if (!payload.startsAt) delete payload.startsAt;
      if (!payload.endsAt) delete payload.endsAt;

      await adminApi.createBanner(payload);
      toast.success('Banner created successfully');
      router.push('/admin/banners');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create banner');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/banners">
          <Button variant="ghost" size="sm">
            <HiOutlineArrowLeft size={20} />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-semibold text-dark-900">New Banner</h1>
          <p className="text-dark-500 mt-1">Create a new promotional banner</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="max-w-2xl">
        <Card padding="lg" className="space-y-6">
          <Input
            label="Banner Title"
            placeholder="e.g., Ramadan Sale"
            error={errors.title?.message}
            {...register('title')}
          />

          <Input
            label="Banner Title (Arabic)"
            placeholder="أدخل عنوان البانر بالعربية"
            dir="rtl"
            {...register('titleAr')}
          />

          <Textarea
            label="Subtitle / Description"
            placeholder="Enter banner subtitle or description"
            rows={2}
            {...register('subtitle')}
          />

          <Textarea
            label="Subtitle (Arabic)"
            placeholder="أدخل الوصف بالعربية"
            rows={2}
            dir="rtl"
            {...register('subtitleAr')}
          />

          <Input
            label="Image URL *"
            placeholder="https://example.com/banner.jpg"
            error={errors.image?.message}
            {...register('image')}
          />

          <Input
            label="Mobile Image URL"
            placeholder="https://example.com/banner-mobile.jpg (optional)"
            error={errors.mobileImage?.message}
            {...register('mobileImage')}
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Link URL"
              placeholder="/products or https://..."
              error={errors.link?.message}
              {...register('link')}
            />

            <Input
              label="Link Text"
              placeholder="e.g., Shop Now"
              {...register('linkText')}
            />
          </div>

          <Input
            label="Link Text (Arabic)"
            placeholder="مثال: تسوق الآن"
            dir="rtl"
            {...register('linkTextAr')}
          />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-dark-700 mb-1">
                Position
              </label>
              <select
                className="w-full px-4 py-2 border border-beige-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                {...register('position')}
              >
                <option value="hero_main">Hero Main</option>
                <option value="hero_secondary">Hero Secondary</option>
                <option value="flash_deals">Flash Deals</option>
                <option value="home_middle">Home Middle</option>
                <option value="home_bottom">Home Bottom</option>
                <option value="category_top">Category Top</option>
                <option value="product_sidebar">Product Sidebar</option>
              </select>
            </div>

            <Input
              label="Display Order"
              type="number"
              placeholder="0"
              {...register('order', { valueAsNumber: true })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-dark-700 mb-1">
                Background Color
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  className="h-10 w-14 rounded border border-beige-300 cursor-pointer"
                  {...register('backgroundColor')}
                />
                <Input
                  placeholder="#ffffff"
                  {...register('backgroundColor')}
                  className="flex-1"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-dark-700 mb-1">
                Text Color
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  className="h-10 w-14 rounded border border-beige-300 cursor-pointer"
                  {...register('textColor')}
                />
                <Input
                  placeholder="#000000"
                  {...register('textColor')}
                  className="flex-1"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-dark-700 mb-1">
                Start Date (optional)
              </label>
              <input
                type="datetime-local"
                className="w-full px-4 py-2 border border-beige-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                {...register('startsAt')}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-dark-700 mb-1">
                End Date (optional)
              </label>
              <input
                type="datetime-local"
                className="w-full px-4 py-2 border border-beige-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                {...register('endsAt')}
              />
            </div>
          </div>

          <Checkbox
            label="Active"
            description="Banner is visible on the website"
            {...register('isActive')}
          />

          <div className="flex gap-3 pt-4">
            <Button type="submit" isLoading={isLoading}>
              Create Banner
            </Button>
            <Link href="/admin/banners">
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </Link>
          </div>
        </Card>
      </form>
    </div>
  );
}
