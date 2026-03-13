'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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

export default function EditBannerPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const bannerId = params.id as string;

  const { data: banner, isLoading: bannerLoading } = useQuery({
    queryKey: ['banner', bannerId],
    queryFn: () => adminApi.getBanner(bannerId),
    enabled: !!bannerId,
  });

  const updateMutation = useMutation({
    mutationFn: (data: BannerForm) => {
      const payload: any = { ...data };
      if (!payload.mobileImage) delete payload.mobileImage;
      if (!payload.link) delete payload.link;
      if (!payload.startsAt) delete payload.startsAt;
      if (!payload.endsAt) delete payload.endsAt;
      return adminApi.updateBanner(bannerId, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['banner', bannerId] });
      toast.success('Banner updated');
      router.push('/admin/banners');
    },
    onError: () => toast.error('Failed to update banner'),
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<BannerForm>({
    resolver: zodResolver(bannerSchema),
  });

  useEffect(() => {
    if (banner) {
      reset({
        title: banner.title,
        titleAr: banner.titleAr || '',
        subtitle: banner.subtitle || '',
        subtitleAr: banner.subtitleAr || '',
        image: banner.image || '',
        mobileImage: banner.mobileImage || '',
        link: banner.link || '',
        linkText: banner.linkText || '',
        linkTextAr: banner.linkTextAr || '',
        position: banner.position || 'hero_main',
        backgroundColor: banner.backgroundColor || '#ffffff',
        textColor: banner.textColor || '#000000',
        order: banner.order || 0,
        startsAt: banner.startsAt ? new Date(banner.startsAt).toISOString().slice(0, 16) : '',
        endsAt: banner.endsAt ? new Date(banner.endsAt).toISOString().slice(0, 16) : '',
        isActive: banner.isActive,
      });
    }
  }, [banner, reset]);

  if (bannerLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-64 bg-beige-200 rounded-xl"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/banners">
          <Button variant="ghost" size="sm">
            <HiOutlineArrowLeft size={20} />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-semibold text-dark-900">Edit Banner</h1>
          <p className="text-dark-500 mt-1">{banner?.title}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <form onSubmit={handleSubmit((data) => updateMutation.mutate(data))} className="lg:col-span-2">
          <Card padding="lg" className="space-y-6">
            <Input
              label="Banner Title"
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
              error={errors.image?.message}
              {...register('image')}
            />

            <Input
              label="Mobile Image URL"
              placeholder="Optional mobile-optimized image"
              error={errors.mobileImage?.message}
              {...register('mobileImage')}
            />

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Link URL"
                error={errors.link?.message}
                {...register('link')}
              />

              <Input
                label="Link Text"
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
              <Button type="submit" isLoading={updateMutation.isPending}>
                Update Banner
              </Button>
              <Link href="/admin/banners">
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </Link>
            </div>
          </Card>
        </form>

        <div>
          <Card padding="md">
            <h3 className="font-medium text-dark-900 mb-4">Preview</h3>
            <div className="aspect-video bg-beige-100 rounded-lg overflow-hidden">
              {banner?.image ? (
                <img
                  src={banner.image}
                  alt={banner.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-beige-400">
                  No image
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
