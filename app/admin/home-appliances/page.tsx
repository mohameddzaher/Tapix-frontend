'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useQuery } from '@tanstack/react-query';
import {
  HiOutlinePlus,
  HiOutlineExternalLink,
  HiOutlinePencil,
  HiOutlineEye,
  HiOutlineTrash,
} from 'react-icons/hi';
import { Button, Card, Spinner } from '@/components/ui';
import { categoriesApi, productsApi } from '@/lib/api';
import { queryKeys } from '@/lib/query-client';

const CATEGORY_SLUG = 'home-appliances';

export default function AdminHomeAppliancesPage() {
  const [page, setPage] = useState(1);

  // Fetch the home-appliances category
  const { data: category, isLoading: catLoading } = useQuery({
    queryKey: queryKeys.categories.detail(CATEGORY_SLUG),
    queryFn: () => categoriesApi.getBySlug(CATEGORY_SLUG),
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

  // Fetch all categories to find subcategories
  const { data: allCategories = [] } = useQuery({
    queryKey: queryKeys.categories.list(),
    queryFn: categoriesApi.getAll,
    staleTime: 5 * 60 * 1000,
  });

  const subcategories = allCategories.filter(
    (cat: any) => cat.parentId === category?._id
  );

  // Fetch products in this category
  const { data: productsData, isLoading: prodLoading } = useQuery({
    queryKey: queryKeys.products.list({ category: category?._id, limit: 20, page }),
    queryFn: () => productsApi.getAll({ category: category?._id, limit: 20, page }),
    enabled: !!category?._id,
  });

  const products = productsData?.products || [];
  const pagination = productsData?.pagination;

  // Loading state
  if (catLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  // Category not found
  if (!category) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold text-dark-900">Home Appliances</h1>
        <Card padding="lg" className="text-center py-16">
          <div className="w-16 h-16 bg-beige-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">🏠</span>
          </div>
          <h2 className="text-lg font-semibold text-dark-900">
            Category Not Found
          </h2>
          <p className="mt-2 text-dark-500 max-w-md mx-auto">
            The &quot;home-appliances&quot; category doesn&apos;t exist yet. Create it to start managing Home Appliances products.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Link href="/admin/categories/new">
              <Button variant="primary" leftIcon={<HiOutlinePlus size={18} />}>
                Create &quot;Home Appliances&quot; Category
              </Button>
            </Link>
          </div>
          <div className="mt-4 p-4 bg-beige-50 rounded-lg text-left max-w-sm mx-auto">
            <p className="text-xs font-medium text-dark-700 mb-2">Quick Setup:</p>
            <ol className="text-xs text-dark-500 space-y-1 list-decimal list-inside">
              <li>Create a category named &quot;Home Appliances&quot;</li>
              <li>Make sure the slug is &quot;home-appliances&quot;</li>
              <li>Add subcategories (Washing Machines, Refrigerators, etc.)</li>
              <li>Assign products to the category</li>
            </ol>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-dark-900">Home Appliances</h1>
          <p className="text-dark-500 mt-1 text-sm">
            Manage the Home Appliances category, subcategories, and products
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/home-appliances" target="_blank">
            <Button variant="outline" size="sm" leftIcon={<HiOutlineExternalLink size={16} />}>
              View Page
            </Button>
          </Link>
          <Link href={`/admin/categories/${category._id}`}>
            <Button variant="outline" size="sm" leftIcon={<HiOutlinePencil size={16} />}>
              Edit Category
            </Button>
          </Link>
          <Link href="/admin/products/new">
            <Button size="sm" leftIcon={<HiOutlinePlus size={16} />}>
              Add Product
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card padding="md">
          <p className="text-xs text-dark-500 uppercase tracking-wider">Category</p>
          <p className="text-lg font-semibold text-dark-900 mt-1">{category.name}</p>
        </Card>
        <Card padding="md">
          <p className="text-xs text-dark-500 uppercase tracking-wider">Slug</p>
          <p className="text-lg font-semibold text-dark-900 mt-1 font-mono">{category.slug}</p>
        </Card>
        <Card padding="md">
          <p className="text-xs text-dark-500 uppercase tracking-wider">Total Products</p>
          <p className="text-lg font-semibold text-primary-600 mt-1">
            {pagination?.total || category.productCount || 0}
          </p>
        </Card>
        <Card padding="md">
          <p className="text-xs text-dark-500 uppercase tracking-wider">Subcategories</p>
          <p className="text-lg font-semibold text-primary-600 mt-1">{subcategories.length}</p>
        </Card>
      </div>

      {/* Subcategories */}
      <Card padding="none">
        <div className="px-6 py-4 border-b border-beige-200 flex items-center justify-between">
          <h2 className="font-semibold text-dark-900">Subcategories</h2>
          <Link href="/admin/categories/new">
            <Button variant="ghost" size="sm" leftIcon={<HiOutlinePlus size={16} />}>
              Add Subcategory
            </Button>
          </Link>
        </div>
        {subcategories.length === 0 ? (
          <div className="px-6 py-8 text-center">
            <p className="text-dark-500 text-sm">No subcategories yet.</p>
            <p className="text-dark-400 text-xs mt-1">
              Add subcategories like &quot;Washing Machines&quot;, &quot;Refrigerators&quot;, &quot;Air Conditioners&quot;, etc.
            </p>
            <Link href="/admin/categories/new">
              <Button variant="outline" size="sm" className="mt-3" leftIcon={<HiOutlinePlus size={14} />}>
                Create Subcategory
              </Button>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-beige-50 border-b border-beige-200">
                <tr>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-dark-500 uppercase">Name</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-dark-500 uppercase">Slug</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-dark-500 uppercase">Products</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-dark-500 uppercase">Status</th>
                  <th className="text-right px-6 py-3 text-xs font-semibold text-dark-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-beige-200">
                {subcategories.map((sub: any) => (
                  <tr key={sub._id} className="hover:bg-beige-50 transition-colors">
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-3">
                        {sub.image && (
                          <div className="w-8 h-8 rounded-lg bg-beige-100 overflow-hidden flex-shrink-0">
                            <Image
                              src={sub.image}
                              alt={sub.name}
                              width={32}
                              height={32}
                              className="w-full h-full object-cover"
                              unoptimized
                            />
                          </div>
                        )}
                        <span className="font-medium text-dark-900">{sub.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-3 text-sm text-dark-500 font-mono">{sub.slug}</td>
                    <td className="px-6 py-3 text-sm text-dark-600">{sub.productCount || 0}</td>
                    <td className="px-6 py-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          sub.isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {sub.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-right">
                      <Link href={`/admin/categories/${sub._id}`}>
                        <Button variant="ghost" size="sm">
                          <HiOutlinePencil size={16} />
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Products */}
      <Card padding="none">
        <div className="px-6 py-4 border-b border-beige-200 flex items-center justify-between">
          <h2 className="font-semibold text-dark-900">
            Products ({pagination?.total || 0})
          </h2>
          <Link href="/admin/products/new">
            <Button variant="ghost" size="sm" leftIcon={<HiOutlinePlus size={16} />}>
              Add Product
            </Button>
          </Link>
        </div>

        {prodLoading ? (
          <div className="px-6 py-8 flex items-center justify-center">
            <Spinner />
          </div>
        ) : products.length === 0 ? (
          <div className="px-6 py-8 text-center">
            <p className="text-dark-500 text-sm">No products in this category yet.</p>
            <Link href="/admin/products/new">
              <Button variant="outline" size="sm" className="mt-3" leftIcon={<HiOutlinePlus size={14} />}>
                Add First Product
              </Button>
            </Link>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-beige-50 border-b border-beige-200">
                  <tr>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-dark-500 uppercase">Product</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-dark-500 uppercase">SKU</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-dark-500 uppercase">Price</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-dark-500 uppercase">Stock</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-dark-500 uppercase">Status</th>
                    <th className="text-right px-6 py-3 text-xs font-semibold text-dark-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-beige-200">
                  {products.map((product: any) => (
                    <tr key={product._id} className="hover:bg-beige-50 transition-colors">
                      <td className="px-6 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-beige-100 overflow-hidden flex-shrink-0">
                            {product.images?.[0]?.url ? (
                              <Image
                                src={product.images[0].url}
                                alt={product.title}
                                width={40}
                                height={40}
                                className="w-full h-full object-cover"
                                unoptimized
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-dark-300 text-xs">
                                N/A
                              </div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-dark-900 text-sm truncate max-w-[200px]">
                              {product.title}
                            </p>
                            {product.brand && (
                              <p className="text-xs text-dark-400">{product.brand}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-3 text-sm text-dark-500 font-mono">{product.sku}</td>
                      <td className="px-6 py-3">
                        <div className="text-sm font-medium text-dark-900">
                          SAR {product.price?.toFixed(2)}
                        </div>
                        {product.discount > 0 && (
                          <div className="text-xs text-red-500">-{product.discount}%</div>
                        )}
                      </td>
                      <td className="px-6 py-3">
                        <span
                          className={`text-sm font-medium ${
                            product.stockQuantity > 10
                              ? 'text-green-600'
                              : product.stockQuantity > 0
                                ? 'text-amber-600'
                                : 'text-red-600'
                          }`}
                        >
                          {product.stockQuantity}
                        </span>
                      </td>
                      <td className="px-6 py-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            product.isActive
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {product.isActive ? 'Active' : 'Draft'}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Link href={`/products/${product.slug}`} target="_blank">
                            <Button variant="ghost" size="sm" title="View">
                              <HiOutlineEye size={16} />
                            </Button>
                          </Link>
                          <Link href={`/admin/products/${product._id}`}>
                            <Button variant="ghost" size="sm" title="Edit">
                              <HiOutlinePencil size={16} />
                            </Button>
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className="px-6 py-4 border-t border-beige-200 flex items-center justify-between">
                <p className="text-sm text-dark-500">
                  Page {pagination.page} of {pagination.totalPages}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={pagination.page === 1}
                    onClick={() => setPage((p) => p - 1)}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={pagination.page === pagination.totalPages}
                    onClick={() => setPage((p) => p + 1)}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </Card>
    </div>
  );
}
