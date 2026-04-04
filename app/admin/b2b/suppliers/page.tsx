'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import {
  HiOutlineSearch,
  HiOutlinePlus,
  HiOutlinePencil,
  HiOutlineTrash,
  HiOutlinePhone,
  HiOutlineMail,
  HiOutlineArrowLeft,
  HiOutlineDownload,
} from 'react-icons/hi';
import { Button, Input, Textarea, Card, Modal, ConfirmModal } from '@/components/ui';
import { b2bApi } from '@/lib/api';
import { exportToCSV, b2bSupplierColumns } from '@/lib/export';
import toast from 'react-hot-toast';

interface SupplierFormData {
  name: string;
  contactPerson?: string;
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  country?: string;
  notes?: string;
}

interface Supplier {
  _id: string;
  name: string;
  contactPerson?: string;
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  country?: string;
  notes?: string;
  totalPurchases?: number;
  totalAmountPaid?: number;
  status?: string;
  products?: any[];
}

export default function B2BSuppliersPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [selectedSupplierId, setSelectedSupplierId] = useState<string | null>(null);
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; id: string; name: string }>({
    isOpen: false,
    id: '',
    name: '',
  });

  // --- Queries ---
  const { data, isLoading } = useQuery({
    queryKey: ['b2b-suppliers', page, search],
    queryFn: () => b2bApi.getSuppliers({ page, limit: 20, search }),
  });

  const suppliers: Supplier[] = data?.suppliers || [];
  const pagination = data?.pagination;

  const { data: supplierDetail, isLoading: isDetailLoading } = useQuery({
    queryKey: ['b2b-supplier', selectedSupplierId],
    queryFn: () => b2bApi.getSupplier(selectedSupplierId!),
    enabled: !!selectedSupplierId,
  });

  // --- Form ---
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SupplierFormData>({
    defaultValues: { country: 'Saudi Arabia' },
  });

  const openAddModal = () => {
    setEditingSupplier(null);
    reset({ name: '', contactPerson: '', phone: '', email: '', address: '', city: '', country: 'Saudi Arabia', notes: '' });
    setModalOpen(true);
  };

  const openEditModal = (supplier: Supplier) => {
    setEditingSupplier(supplier);
    reset({
      name: supplier.name,
      contactPerson: supplier.contactPerson || '',
      phone: supplier.phone || '',
      email: supplier.email || '',
      address: supplier.address || '',
      city: supplier.city || '',
      country: supplier.country || 'Saudi Arabia',
      notes: supplier.notes || '',
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingSupplier(null);
  };

  // --- Mutations ---
  const createMutation = useMutation({
    mutationFn: (data: SupplierFormData) => b2bApi.createSupplier(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['b2b-suppliers'] });
      toast.success('Supplier created successfully');
      closeModal();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create supplier');
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: SupplierFormData) => b2bApi.updateSupplier(editingSupplier!._id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['b2b-suppliers'] });
      queryClient.invalidateQueries({ queryKey: ['b2b-supplier', editingSupplier!._id] });
      toast.success('Supplier updated successfully');
      closeModal();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update supplier');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => b2bApi.deleteSupplier(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['b2b-suppliers'] });
      toast.success('Supplier deleted successfully');
      setDeleteModal({ isOpen: false, id: '', name: '' });
      if (selectedSupplierId === deleteModal.id) {
        setSelectedSupplierId(null);
      }
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete supplier');
    },
  });

  const onSubmit = (data: SupplierFormData) => {
    if (editingSupplier) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  const isSaving = createMutation.isPending || updateMutation.isPending;

  // --- Detail View ---
  if (selectedSupplierId) {
    const detail: Supplier | undefined = supplierDetail;

    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => setSelectedSupplierId(null)}>
            <HiOutlineArrowLeft size={18} />
          </Button>
          <div>
            <h1 className="text-2xl font-semibold text-dark-900">
              {isDetailLoading ? 'Loading...' : detail?.name || 'Supplier'}
            </h1>
            <p className="text-dark-500 mt-1">Supplier details and products</p>
          </div>
        </div>

        {isDetailLoading ? (
          <Card padding="md">
            <div className="space-y-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-6 bg-beige-200 rounded animate-pulse" />
              ))}
            </div>
          </Card>
        ) : detail ? (
          <>
            <Card padding="md">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {detail.contactPerson && (
                  <div>
                    <p className="text-xs font-semibold text-dark-500 uppercase mb-1">Contact Person</p>
                    <p className="text-dark-900">{detail.contactPerson}</p>
                  </div>
                )}
                {detail.phone && (
                  <div>
                    <p className="text-xs font-semibold text-dark-500 uppercase mb-1">Phone</p>
                    <p className="text-dark-900 flex items-center gap-1"><HiOutlinePhone size={14} />{detail.phone}</p>
                  </div>
                )}
                {detail.email && (
                  <div>
                    <p className="text-xs font-semibold text-dark-500 uppercase mb-1">Email</p>
                    <p className="text-dark-900 flex items-center gap-1"><HiOutlineMail size={14} />{detail.email}</p>
                  </div>
                )}
                {detail.address && (
                  <div>
                    <p className="text-xs font-semibold text-dark-500 uppercase mb-1">Address</p>
                    <p className="text-dark-900">{detail.address}</p>
                  </div>
                )}
                {detail.city && (
                  <div>
                    <p className="text-xs font-semibold text-dark-500 uppercase mb-1">City</p>
                    <p className="text-dark-900">{detail.city}</p>
                  </div>
                )}
                {detail.country && (
                  <div>
                    <p className="text-xs font-semibold text-dark-500 uppercase mb-1">Country</p>
                    <p className="text-dark-900">{detail.country}</p>
                  </div>
                )}
                <div>
                  <p className="text-xs font-semibold text-dark-500 uppercase mb-1">Total Purchases</p>
                  <p className="text-dark-900 font-medium">{detail.totalPurchases || 0}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-dark-500 uppercase mb-1">Total Amount Paid</p>
                  <p className="text-dark-900 font-medium">SAR {(detail.totalAmountPaid || 0).toLocaleString()}</p>
                </div>
                {detail.notes && (
                  <div className="md:col-span-2 lg:col-span-3">
                    <p className="text-xs font-semibold text-dark-500 uppercase mb-1">Notes</p>
                    <p className="text-dark-700 whitespace-pre-wrap">{detail.notes}</p>
                  </div>
                )}
              </div>
            </Card>

            {/* Supplier Products */}
            <div>
              <h2 className="text-lg font-semibold text-dark-900 mb-4">Products</h2>
              <Card padding="none">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-beige-50 border-b border-beige-200">
                      <tr>
                        <th className="text-left px-6 py-4 text-xs font-semibold text-dark-500 uppercase">Product</th>
                        <th className="text-left px-6 py-4 text-xs font-semibold text-dark-500 uppercase">SKU</th>
                        <th className="text-left px-6 py-4 text-xs font-semibold text-dark-500 uppercase">Cost Price</th>
                        <th className="text-left px-6 py-4 text-xs font-semibold text-dark-500 uppercase">Quantity</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-beige-200">
                      {!detail.products || detail.products.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="px-6 py-12 text-center text-dark-500">No products found for this supplier</td>
                        </tr>
                      ) : (
                        detail.products.map((product: any, index: number) => (
                          <motion.tr key={product._id || index} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="hover:bg-beige-50">
                            <td className="px-6 py-4 font-medium text-dark-900">{product.name}</td>
                            <td className="px-6 py-4 text-dark-600">{product.sku || '-'}</td>
                            <td className="px-6 py-4 text-dark-600">SAR {(product.costPrice || 0).toLocaleString()}</td>
                            <td className="px-6 py-4 text-dark-600">{product.quantity ?? '-'}</td>
                          </motion.tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>
          </>
        ) : (
          <Card padding="md">
            <p className="text-center text-dark-500">Supplier not found</p>
          </Card>
        )}
      </div>
    );
  }

  // --- List View ---
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-dark-900">B2B Suppliers</h1>
          <p className="text-dark-500 mt-1">Manage your suppliers and their products</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={async () => {
              toast.loading('Exporting...', { id: 'export' });
              try {
                const all = await b2bApi.getSuppliers({ limit: 9999 });
                exportToCSV(all.suppliers, b2bSupplierColumns, 'b2b-suppliers');
                toast.success('Exported!', { id: 'export' });
              } catch { toast.error('Export failed', { id: 'export' }); }
            }}
            className="flex items-center gap-2 px-4 py-2 bg-dark-800 text-white rounded-lg hover:bg-dark-700 transition-colors text-sm"
          >
            <HiOutlineDownload size={16} />
            Export
          </button>
          <Button leftIcon={<HiOutlinePlus size={18} />} onClick={openAddModal}>
            Add Supplier
          </Button>
        </div>
      </div>

      {/* Search */}
      <Card padding="md">
        <Input
          placeholder="Search suppliers by name, contact, or city..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          leftIcon={<HiOutlineSearch size={18} />}
        />
      </Card>

      {/* Table */}
      <Card padding="none">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-beige-50 border-b border-beige-200">
              <tr>
                <th className="text-left px-6 py-4 text-xs font-semibold text-dark-500 uppercase">Name</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-dark-500 uppercase">Contact Person</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-dark-500 uppercase">Phone</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-dark-500 uppercase">Email</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-dark-500 uppercase">City</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-dark-500 uppercase">Purchases</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-dark-500 uppercase">Amount Paid</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-dark-500 uppercase">Status</th>
                <th className="text-right px-6 py-4 text-xs font-semibold text-dark-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-beige-200">
              {isLoading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i}>
                    <td colSpan={9} className="px-6 py-4">
                      <div className="h-8 bg-beige-200 rounded animate-pulse"></div>
                    </td>
                  </tr>
                ))
              ) : suppliers.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center text-dark-500">No suppliers found</td>
                </tr>
              ) : (
                suppliers.map((supplier) => (
                  <motion.tr key={supplier._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="hover:bg-beige-50">
                    <td className="px-6 py-4">
                      <button
                        onClick={() => setSelectedSupplierId(supplier._id)}
                        className="font-medium text-primary-600 hover:text-primary-700 hover:underline"
                      >
                        {supplier.name}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-dark-600">{supplier.contactPerson || '-'}</td>
                    <td className="px-6 py-4 text-dark-600">
                      {supplier.phone ? (
                        <span className="flex items-center gap-1"><HiOutlinePhone size={14} />{supplier.phone}</span>
                      ) : '-'}
                    </td>
                    <td className="px-6 py-4 text-dark-600">
                      {supplier.email ? (
                        <span className="flex items-center gap-1 text-sm"><HiOutlineMail size={14} />{supplier.email}</span>
                      ) : '-'}
                    </td>
                    <td className="px-6 py-4 text-dark-600">{supplier.city || '-'}</td>
                    <td className="px-6 py-4 text-dark-600">{supplier.totalPurchases || 0}</td>
                    <td className="px-6 py-4 font-medium text-dark-900">SAR {(supplier.totalAmountPaid || 0).toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        supplier.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {supplier.status === 'active' ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditModal(supplier)}
                        >
                          <HiOutlinePencil size={18} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeleteModal({ isOpen: true, id: supplier._id, name: supplier.name })}
                          className="text-error-600 hover:bg-error-50"
                        >
                          <HiOutlineTrash size={18} />
                        </Button>
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
              Page {page} of {pagination.totalPages} ({pagination.total} suppliers)
            </p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(page - 1)}>
                Previous
              </Button>
              <Button variant="outline" size="sm" disabled={page === pagination.totalPages} onClick={() => setPage(page + 1)}>
                Next
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={closeModal}
        title={editingSupplier ? 'Edit Supplier' : 'Add Supplier'}
        size="lg"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-dark-700 mb-1">
              Name <span className="text-error-500">*</span>
            </label>
            <input
              {...register('name', { required: 'Supplier name is required' })}
              className="w-full px-3 py-2 border border-beige-300 rounded-lg text-dark-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Supplier name"
            />
            {errors.name && <p className="text-error-500 text-xs mt-1">{errors.name.message}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-dark-700 mb-1">Contact Person</label>
              <input
                {...register('contactPerson')}
                className="w-full px-3 py-2 border border-beige-300 rounded-lg text-dark-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Contact person name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-dark-700 mb-1">Phone</label>
              <input
                {...register('phone')}
                className="w-full px-3 py-2 border border-beige-300 rounded-lg text-dark-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="+966 5XX XXX XXXX"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-dark-700 mb-1">Email</label>
            <input
              {...register('email')}
              type="email"
              className="w-full px-3 py-2 border border-beige-300 rounded-lg text-dark-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="supplier@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-dark-700 mb-1">Address</label>
            <input
              {...register('address')}
              className="w-full px-3 py-2 border border-beige-300 rounded-lg text-dark-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Street address"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-dark-700 mb-1">City</label>
              <input
                {...register('city')}
                className="w-full px-3 py-2 border border-beige-300 rounded-lg text-dark-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="City"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-dark-700 mb-1">Country</label>
              <input
                {...register('country')}
                className="w-full px-3 py-2 border border-beige-300 rounded-lg text-dark-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Country"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-dark-700 mb-1">Notes</label>
            <textarea
              {...register('notes')}
              rows={3}
              className="w-full px-3 py-2 border border-beige-300 rounded-lg text-dark-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
              placeholder="Any additional notes..."
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" type="button" onClick={closeModal}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? 'Saving...' : editingSupplier ? 'Update Supplier' : 'Create Supplier'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, id: '', name: '' })}
        onConfirm={() => deleteMutation.mutate(deleteModal.id)}
        title="Delete Supplier"
        message={`Are you sure you want to delete "${deleteModal.name}"? This action cannot be undone.`}
        confirmText="Delete"
        variant="danger"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
