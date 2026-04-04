'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HiOutlineSearch,
  HiOutlinePlus,
  HiOutlinePencil,
  HiOutlineTrash,
  HiOutlineX,
  HiOutlineDownload,
} from 'react-icons/hi';
import { Card, Button, Skeleton } from '@/components/ui';
import { b2bApi } from '@/lib/api';
import { exportToCSV, b2bProductColumns } from '@/lib/export';
import { formatCurrency, cn } from '@/lib/utils';
import toast from 'react-hot-toast';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface Product {
  _id: string;
  name: string;
  sku?: string;
  description?: string;
  category?: string;
  quantity: number;
  costPerUnit: number;
  totalCost?: number;
  onlinePrice?: number;
  offlinePrice?: number;
  specs?: string;
  supplier?: { _id: string; name: string } | string;
}

interface Supplier {
  _id: string;
  name: string;
}

type ModalMode = 'add' | 'edit' | null;

const LIMIT = 15;

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------
export default function B2BProductsPage() {
  const queryClient = useQueryClient();

  // State
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 400);
    return () => clearTimeout(t);
  }, [search]);

  // ---- Queries ----
  const { data, isLoading } = useQuery({
    queryKey: ['b2b-products', { page, limit: LIMIT, search: debouncedSearch }],
    queryFn: () => b2bApi.getProducts({ page, limit: LIMIT, search: debouncedSearch }),
  });

  const { data: suppliers = [] } = useQuery<Supplier[]>({
    queryKey: ['b2b-suppliers-all'],
    queryFn: () => b2bApi.getAllSuppliers(),
  });

  const products: Product[] = data?.products || [];
  const pagination = data?.pagination;

  // ---- Mutations ----
  const createMutation = useMutation({
    mutationFn: (formData: any) => b2bApi.createProduct(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['b2b-products'] });
      toast.success('Product created');
      closeModal();
    },
    onError: () => toast.error('Failed to create product'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => b2bApi.updateProduct(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['b2b-products'] });
      toast.success('Product updated');
      closeModal();
    },
    onError: () => toast.error('Failed to update product'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => b2bApi.deleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['b2b-products'] });
      toast.success('Product deleted');
      setDeleteTarget(null);
    },
    onError: () => toast.error('Failed to delete product'),
  });

  // ---- Handlers ----
  const openAdd = () => {
    setEditingProduct(null);
    setModalMode('add');
  };

  const openEdit = (product: Product) => {
    setEditingProduct(product);
    setModalMode('edit');
  };

  const closeModal = () => {
    setModalMode(null);
    setEditingProduct(null);
  };

  const handleFormSubmit = (formData: any) => {
    if (modalMode === 'edit' && editingProduct) {
      updateMutation.mutate({ id: editingProduct._id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const isMutating = createMutation.isPending || updateMutation.isPending;

  // ---- Helpers ----
  const getSupplierName = (product: Product): string => {
    if (!product.supplier) return '---';
    if (typeof product.supplier === 'object') return product.supplier.name;
    const found = suppliers.find((s) => s._id === product.supplier);
    return found?.name || '---';
  };

  const getQuantityBadge = (qty: number) => {
    if (qty === 0)
      return <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">Out of Stock</span>;
    if (qty <= 5)
      return (
        <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
          {qty}
        </span>
      );
    if (qty <= 20)
      return (
        <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          {qty}
        </span>
      );
    return (
      <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
        {qty}
      </span>
    );
  };

  // ---- Render ----
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-dark-900">B2B Products</h1>
          <p className="text-dark-500 mt-1">Manage your wholesale product catalog</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={async () => {
              toast.loading('Exporting all products...', { id: 'export' });
              try {
                const all = await b2bApi.getProducts({ limit: 9999 });
                exportToCSV(all.products, b2bProductColumns, 'b2b-products');
                toast.success('Exported!', { id: 'export' });
              } catch { toast.error('Export failed', { id: 'export' }); }
            }}
            className="flex items-center gap-2 px-4 py-2 bg-dark-800 text-white rounded-lg hover:bg-dark-700 transition-colors text-sm"
          >
            <HiOutlineDownload size={16} />
            Export
          </button>
          <Button onClick={openAdd} leftIcon={<HiOutlinePlus size={18} />}>
            Add Product
          </Button>
        </div>
      </div>

      {/* Search */}
      <Card padding="md">
        <div className="relative">
          <HiOutlineSearch size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400" />
          <input
            type="text"
            placeholder="Search products by name, SKU, or category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-beige-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
          />
        </div>
      </Card>

      {/* Table */}
      <Card padding="none">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-beige-50 border-b border-beige-200">
              <tr>
                {['Name', 'SKU', 'Category', 'Qty', 'Cost/Unit', 'Online Price', 'Offline Price', 'Supplier', 'Actions'].map(
                  (h) => (
                    <th
                      key={h}
                      className={cn(
                        'px-6 py-4 text-xs font-semibold text-dark-500 uppercase tracking-wider',
                        h === 'Actions' ? 'text-right' : 'text-left'
                      )}
                    >
                      {h}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-beige-200">
              {isLoading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i}>
                    <td colSpan={9} className="px-6 py-4">
                      <Skeleton className="h-10 w-full" />
                    </td>
                  </tr>
                ))
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center text-dark-500">
                    No products found
                  </td>
                </tr>
              ) : (
                products.map((product) => (
                  <motion.tr
                    key={product._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-beige-50"
                  >
                    <td className="px-6 py-4 text-sm font-medium text-dark-900 max-w-[200px] truncate">
                      {product.name}
                    </td>
                    <td className="px-6 py-4 text-sm text-dark-600 font-mono">
                      {product.sku || '---'}
                    </td>
                    <td className="px-6 py-4 text-sm text-dark-600">
                      {product.category || '---'}
                    </td>
                    <td className="px-6 py-4">{getQuantityBadge(product.quantity ?? 0)}</td>
                    <td className="px-6 py-4 text-sm text-dark-600">
                      {formatCurrency(product.costPerUnit ?? 0)}
                    </td>
                    <td className="px-6 py-4 text-sm text-dark-600">
                      {product.onlinePrice != null ? formatCurrency(product.onlinePrice) : '---'}
                    </td>
                    <td className="px-6 py-4 text-sm text-dark-600">
                      {product.offlinePrice != null ? formatCurrency(product.offlinePrice) : '---'}
                    </td>
                    <td className="px-6 py-4 text-sm text-dark-600">{getSupplierName(product)}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openEdit(product)}
                          className="p-2 rounded-lg hover:bg-beige-100 text-dark-500 hover:text-primary-600 transition-colors"
                          title="Edit"
                        >
                          <HiOutlinePencil size={16} />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(product)}
                          className="p-2 rounded-lg hover:bg-red-50 text-dark-500 hover:text-red-600 transition-colors"
                          title="Delete"
                        >
                          <HiOutlineTrash size={16} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-beige-200">
            <p className="text-sm text-dark-500">
              Showing {(page - 1) * LIMIT + 1} to{' '}
              {Math.min(page * LIMIT, pagination.total)} of {pagination.total} products
            </p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(page - 1)}>
                Previous
              </Button>
              {/* Page numbers */}
              {Array.from({ length: Math.min(pagination.totalPages, 5) }, (_, i) => {
                let pageNum: number;
                if (pagination.totalPages <= 5) {
                  pageNum = i + 1;
                } else if (page <= 3) {
                  pageNum = i + 1;
                } else if (page >= pagination.totalPages - 2) {
                  pageNum = pagination.totalPages - 4 + i;
                } else {
                  pageNum = page - 2 + i;
                }
                return (
                  <Button
                    key={pageNum}
                    variant={pageNum === page ? 'primary' : 'outline'}
                    size="sm"
                    onClick={() => setPage(pageNum)}
                    className="min-w-[36px]"
                  >
                    {pageNum}
                  </Button>
                );
              })}
              <Button
                variant="outline"
                size="sm"
                disabled={page === pagination.totalPages}
                onClick={() => setPage(page + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Add / Edit Modal */}
      <AnimatePresence>
        {modalMode && (
          <ProductModal
            mode={modalMode}
            product={editingProduct}
            suppliers={suppliers}
            onSubmit={handleFormSubmit}
            onClose={closeModal}
            isPending={isMutating}
          />
        )}
      </AnimatePresence>

      {/* Delete Confirmation */}
      <AnimatePresence>
        {deleteTarget && (
          <DeleteConfirmation
            productName={deleteTarget.name}
            isPending={deleteMutation.isPending}
            onConfirm={() => deleteMutation.mutate(deleteTarget._id)}
            onCancel={() => setDeleteTarget(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Product Modal
// ---------------------------------------------------------------------------
interface ProductModalProps {
  mode: 'add' | 'edit';
  product: Product | null;
  suppliers: Supplier[];
  onSubmit: (data: any) => void;
  onClose: () => void;
  isPending: boolean;
}

function ProductModal({ mode, product, suppliers, onSubmit, onClose, isPending }: ProductModalProps) {
  const [form, setForm] = useState({
    name: product?.name || '',
    sku: product?.sku || '',
    description: product?.description || '',
    category: product?.category || '',
    quantity: product?.quantity ?? '',
    costPerUnit: product?.costPerUnit ?? '',
    totalCost: product?.totalCost ?? '',
    onlinePrice: product?.onlinePrice ?? '',
    offlinePrice: product?.offlinePrice ?? '',
    specs: product?.specs || '',
    supplier:
      typeof product?.supplier === 'object'
        ? product?.supplier?._id || ''
        : product?.supplier || '',
  });

  const [totalCostOverride, setTotalCostOverride] = useState(false);

  // Auto-calculate total cost
  const computedTotalCost =
    form.quantity !== '' && form.costPerUnit !== ''
      ? Number(form.quantity) * Number(form.costPerUnit)
      : '';

  const displayTotalCost = totalCostOverride ? form.totalCost : computedTotalCost;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (name === 'totalCost') {
      setTotalCostOverride(true);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.name.trim()) {
      toast.error('Product name is required');
      return;
    }
    if (form.quantity === '' || Number(form.quantity) < 0) {
      toast.error('Valid quantity is required');
      return;
    }
    if (form.costPerUnit === '' || Number(form.costPerUnit) < 0) {
      toast.error('Valid cost per unit is required');
      return;
    }

    const payload: any = {
      name: form.name.trim(),
      quantity: Number(form.quantity),
      costPerUnit: Number(form.costPerUnit),
    };

    if (form.sku.trim()) payload.sku = form.sku.trim();
    if (form.description.trim()) payload.description = form.description.trim();
    if (form.category.trim()) payload.category = form.category.trim();
    if (displayTotalCost !== '') payload.totalCost = Number(displayTotalCost);
    if (form.onlinePrice !== '') payload.onlinePrice = Number(form.onlinePrice);
    if (form.offlinePrice !== '') payload.offlinePrice = Number(form.offlinePrice);
    if (form.specs.trim()) payload.specs = form.specs.trim();
    if (form.supplier) payload.supplier = form.supplier;

    onSubmit(payload);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.2 }}
        className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-beige-200">
          <h2 className="text-lg font-semibold text-dark-900">
            {mode === 'add' ? 'Add Product' : 'Edit Product'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-beige-100 text-dark-400 transition-colors"
          >
            <HiOutlineX size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-dark-700 mb-1">
              Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Product name"
              className="w-full border border-beige-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
            />
          </div>

          {/* SKU + Category row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-dark-700 mb-1">SKU</label>
              <input
                type="text"
                name="sku"
                value={form.sku}
                onChange={handleChange}
                placeholder="e.g. PRD-001"
                className="w-full border border-beige-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-dark-700 mb-1">Category</label>
              <input
                type="text"
                name="category"
                value={form.category}
                onChange={handleChange}
                placeholder="e.g. Electronics"
                className="w-full border border-beige-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-dark-700 mb-1">Description</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={2}
              placeholder="Brief product description..."
              className="w-full border border-beige-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none resize-none"
            />
          </div>

          {/* Quantity + Cost per Unit */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-dark-700 mb-1">
                Quantity <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="quantity"
                value={form.quantity}
                onChange={handleChange}
                min={0}
                placeholder="0"
                className="w-full border border-beige-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-dark-700 mb-1">
                Cost Per Unit (SAR) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="costPerUnit"
                value={form.costPerUnit}
                onChange={handleChange}
                min={0}
                step="0.01"
                placeholder="0.00"
                className="w-full border border-beige-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
              />
            </div>
          </div>

          {/* Total Cost */}
          <div>
            <label className="block text-sm font-medium text-dark-700 mb-1">
              Total Cost (SAR){' '}
              <span className="text-xs text-dark-400 font-normal">
                {totalCostOverride ? '(manual override)' : '(auto-calculated)'}
              </span>
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                name="totalCost"
                value={totalCostOverride ? form.totalCost : computedTotalCost}
                onChange={handleChange}
                min={0}
                step="0.01"
                placeholder="0.00"
                className={cn(
                  'flex-1 border border-beige-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none',
                  !totalCostOverride && 'bg-beige-50 text-dark-500'
                )}
                readOnly={!totalCostOverride}
              />
              {totalCostOverride && (
                <button
                  type="button"
                  onClick={() => {
                    setTotalCostOverride(false);
                    setForm((prev) => ({ ...prev, totalCost: '' }));
                  }}
                  className="px-3 py-2 text-xs bg-beige-100 hover:bg-beige-200 rounded-lg text-dark-600 transition-colors whitespace-nowrap"
                >
                  Auto
                </button>
              )}
            </div>
          </div>

          {/* Online Price + Offline Price */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-dark-700 mb-1">
                Online Price (SAR)
              </label>
              <input
                type="number"
                name="onlinePrice"
                value={form.onlinePrice}
                onChange={handleChange}
                min={0}
                step="0.01"
                placeholder="0.00"
                className="w-full border border-beige-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-dark-700 mb-1">
                Offline Price (SAR)
              </label>
              <input
                type="number"
                name="offlinePrice"
                value={form.offlinePrice}
                onChange={handleChange}
                min={0}
                step="0.01"
                placeholder="0.00"
                className="w-full border border-beige-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
              />
            </div>
          </div>

          {/* Supplier */}
          <div>
            <label className="block text-sm font-medium text-dark-700 mb-1">Supplier</label>
            <select
              name="supplier"
              value={form.supplier}
              onChange={handleChange}
              className="w-full border border-beige-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none bg-white"
            >
              <option value="">Select supplier...</option>
              {suppliers.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          {/* Specs */}
          <div>
            <label className="block text-sm font-medium text-dark-700 mb-1">Specs</label>
            <textarea
              name="specs"
              value={form.specs}
              onChange={handleChange}
              rows={3}
              placeholder="Technical specifications, dimensions, etc..."
              className="w-full border border-beige-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-dark-600 hover:text-dark-900 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPending
                ? mode === 'add'
                  ? 'Creating...'
                  : 'Saving...'
                : mode === 'add'
                ? 'Create Product'
                : 'Save Changes'}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Delete Confirmation
// ---------------------------------------------------------------------------
interface DeleteConfirmationProps {
  productName: string;
  isPending: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

function DeleteConfirmation({ productName, isPending, onConfirm, onCancel }: DeleteConfirmationProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onCancel}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.2 }}
        className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-lg font-semibold text-dark-900 mb-2">Delete Product</h3>
        <p className="text-sm text-dark-600 mb-6">
          Are you sure you want to delete{' '}
          <span className="font-medium text-dark-900">{productName}</span>? This action cannot be
          undone.
        </p>
        <div className="flex items-center justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-dark-600 hover:text-dark-900 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isPending}
            className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
