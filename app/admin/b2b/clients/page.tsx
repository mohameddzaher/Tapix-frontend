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
  HiOutlineOfficeBuilding,
  HiOutlineDownload,
} from 'react-icons/hi';
import { Button, Input, Textarea, Card, Modal, ConfirmModal } from '@/components/ui';
import { b2bApi } from '@/lib/api';
import { exportToCSV, b2bClientColumns } from '@/lib/export';
import toast from 'react-hot-toast';

interface ClientFormData {
  name: string;
  companyName?: string;
  contactPerson?: string;
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  country?: string;
  taxNumber?: string;
  notes?: string;
}

interface Client {
  _id: string;
  name: string;
  companyName?: string;
  contactPerson?: string;
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  country?: string;
  taxNumber?: string;
  notes?: string;
  totalOrders: number;
  totalSpent: number;
  status: string;
  createdAt: string;
  sales?: Sale[];
}

interface Sale {
  _id: string;
  invoiceNumber: string;
  date: string;
  items: { name: string; quantity: number; price: number }[];
  total: number;
  status: string;
}

export default function B2BClientsPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; id: string; name: string }>({
    isOpen: false,
    id: '',
    name: '',
  });

  // --- Queries ---
  const { data, isLoading } = useQuery({
    queryKey: ['b2b-clients', page, search],
    queryFn: () => b2bApi.getClients({ page, limit: 20, search }),
  });

  const clients: Client[] = data?.clients || [];
  const pagination = data?.pagination;

  const { data: clientDetail, isLoading: isDetailLoading } = useQuery({
    queryKey: ['b2b-client', selectedClientId],
    queryFn: () => b2bApi.getClient(selectedClientId!),
    enabled: !!selectedClientId,
  });

  // --- Mutations ---
  const createMutation = useMutation({
    mutationFn: (data: ClientFormData) => b2bApi.createClient(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['b2b-clients'] });
      toast.success('Client created successfully');
      closeModal();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create client');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: ClientFormData }) => b2bApi.updateClient(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['b2b-clients'] });
      queryClient.invalidateQueries({ queryKey: ['b2b-client'] });
      toast.success('Client updated successfully');
      closeModal();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update client');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => b2bApi.deleteClient(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['b2b-clients'] });
      toast.success('Client deleted');
      setDeleteModal({ isOpen: false, id: '', name: '' });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete client');
    },
  });

  // --- Form ---
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ClientFormData>({
    defaultValues: {
      country: 'Saudi Arabia',
    },
  });

  const openAddModal = () => {
    setEditingClient(null);
    reset({ name: '', companyName: '', contactPerson: '', phone: '', email: '', address: '', city: '', country: 'Saudi Arabia', taxNumber: '', notes: '' });
    setModalOpen(true);
  };

  const openEditModal = (client: Client) => {
    setEditingClient(client);
    reset({
      name: client.name,
      companyName: client.companyName || '',
      contactPerson: client.contactPerson || '',
      phone: client.phone || '',
      email: client.email || '',
      address: client.address || '',
      city: client.city || '',
      country: client.country || 'Saudi Arabia',
      taxNumber: client.taxNumber || '',
      notes: client.notes || '',
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingClient(null);
    reset();
  };

  const onSubmit = (data: ClientFormData) => {
    if (editingClient) {
      updateMutation.mutate({ id: editingClient._id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const isSaving = createMutation.isPending || updateMutation.isPending;

  // --- Detail View ---
  if (selectedClientId) {
    const detail: Client | undefined = clientDetail;

    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => setSelectedClientId(null)}>
            <HiOutlineArrowLeft size={18} />
          </Button>
          <div>
            <h1 className="text-2xl font-semibold text-dark-900">
              {isDetailLoading ? 'Loading...' : detail?.name || 'Client Details'}
            </h1>
            {detail?.companyName && (
              <p className="text-dark-500 mt-1 flex items-center gap-1">
                <HiOutlineOfficeBuilding size={16} />
                {detail.companyName}
              </p>
            )}
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
            {/* Client Info */}
            <Card padding="md">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {detail.email && (
                  <div>
                    <p className="text-xs font-semibold text-dark-500 uppercase mb-1">Email</p>
                    <p className="text-dark-900 flex items-center gap-1"><HiOutlineMail size={16} />{detail.email}</p>
                  </div>
                )}
                {detail.phone && (
                  <div>
                    <p className="text-xs font-semibold text-dark-500 uppercase mb-1">Phone</p>
                    <p className="text-dark-900 flex items-center gap-1"><HiOutlinePhone size={16} />{detail.phone}</p>
                  </div>
                )}
                {detail.contactPerson && (
                  <div>
                    <p className="text-xs font-semibold text-dark-500 uppercase mb-1">Contact Person</p>
                    <p className="text-dark-900">{detail.contactPerson}</p>
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
                {detail.address && (
                  <div>
                    <p className="text-xs font-semibold text-dark-500 uppercase mb-1">Address</p>
                    <p className="text-dark-900">{detail.address}</p>
                  </div>
                )}
                {detail.taxNumber && (
                  <div>
                    <p className="text-xs font-semibold text-dark-500 uppercase mb-1">Tax Number</p>
                    <p className="text-dark-900">{detail.taxNumber}</p>
                  </div>
                )}
                <div>
                  <p className="text-xs font-semibold text-dark-500 uppercase mb-1">Total Orders</p>
                  <p className="text-dark-900 font-medium">{detail.totalOrders || 0}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-dark-500 uppercase mb-1">Total Spent</p>
                  <p className="text-dark-900 font-medium">SAR {(detail.totalSpent || 0).toLocaleString()}</p>
                </div>
              </div>
              {detail.notes && (
                <div className="mt-4 pt-4 border-t border-beige-200">
                  <p className="text-xs font-semibold text-dark-500 uppercase mb-1">Notes</p>
                  <p className="text-dark-700 text-sm whitespace-pre-wrap">{detail.notes}</p>
                </div>
              )}
            </Card>

            {/* Sales History */}
            <div>
              <h2 className="text-lg font-semibold text-dark-900 mb-4">Sales History</h2>
              <Card padding="none">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-beige-50 border-b border-beige-200">
                      <tr>
                        <th className="text-left px-6 py-4 text-xs font-semibold text-dark-500 uppercase">Invoice</th>
                        <th className="text-left px-6 py-4 text-xs font-semibold text-dark-500 uppercase">Date</th>
                        <th className="text-left px-6 py-4 text-xs font-semibold text-dark-500 uppercase">Items</th>
                        <th className="text-left px-6 py-4 text-xs font-semibold text-dark-500 uppercase">Total</th>
                        <th className="text-left px-6 py-4 text-xs font-semibold text-dark-500 uppercase">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-beige-200">
                      {!detail.sales || detail.sales.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="px-6 py-12 text-center text-dark-500">
                            No sales history
                          </td>
                        </tr>
                      ) : (
                        detail.sales.map((sale) => (
                          <motion.tr key={sale._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="hover:bg-beige-50">
                            <td className="px-6 py-4 font-medium text-dark-900">{sale.invoiceNumber}</td>
                            <td className="px-6 py-4 text-dark-600">{new Date(sale.date).toLocaleDateString()}</td>
                            <td className="px-6 py-4 text-dark-600">{sale.items?.length || 0} items</td>
                            <td className="px-6 py-4 font-medium text-dark-900">SAR {(sale.total || 0).toLocaleString()}</td>
                            <td className="px-6 py-4">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                sale.status === 'paid' ? 'bg-green-100 text-green-800' :
                                sale.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                sale.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {sale.status.charAt(0).toUpperCase() + sale.status.slice(1)}
                              </span>
                            </td>
                          </motion.tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>
          </>
        ) : null}
      </div>
    );
  }

  // --- List View ---
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-dark-900">B2B Clients</h1>
          <p className="text-dark-500 mt-1">Manage business-to-business client accounts</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => exportToCSV(clients, b2bClientColumns, 'b2b-clients')}
            className="flex items-center gap-2 px-4 py-2 bg-dark-800 text-white rounded-lg hover:bg-dark-700 transition-colors text-sm"
          >
            <HiOutlineDownload size={16} />
            Export
          </button>
          <Button leftIcon={<HiOutlinePlus size={18} />} onClick={openAddModal}>
            Add Client
          </Button>
        </div>
      </div>

      <Card padding="md">
        <Input
          placeholder="Search clients by name, company, or email..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          leftIcon={<HiOutlineSearch size={18} />}
        />
      </Card>

      <Card padding="none">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-beige-50 border-b border-beige-200">
              <tr>
                <th className="text-left px-6 py-4 text-xs font-semibold text-dark-500 uppercase">Name</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-dark-500 uppercase">Company</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-dark-500 uppercase">Phone</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-dark-500 uppercase">Email</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-dark-500 uppercase">City</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-dark-500 uppercase">Total Orders</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-dark-500 uppercase">Total Spent</th>
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
              ) : clients.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center text-dark-500">
                    No clients found
                  </td>
                </tr>
              ) : (
                clients.map((client) => (
                  <motion.tr key={client._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="hover:bg-beige-50">
                    <td className="px-6 py-4">
                      <button
                        type="button"
                        onClick={() => setSelectedClientId(client._id)}
                        className="font-medium text-primary-600 hover:text-primary-700 hover:underline text-left"
                      >
                        {client.name}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-dark-600">{client.companyName || '-'}</td>
                    <td className="px-6 py-4 text-dark-600">
                      {client.phone ? (
                        <span className="flex items-center gap-1"><HiOutlinePhone size={14} />{client.phone}</span>
                      ) : '-'}
                    </td>
                    <td className="px-6 py-4 text-dark-600">
                      {client.email ? (
                        <span className="flex items-center gap-1"><HiOutlineMail size={14} />{client.email}</span>
                      ) : '-'}
                    </td>
                    <td className="px-6 py-4 text-dark-600">{client.city || '-'}</td>
                    <td className="px-6 py-4 text-dark-600">{client.totalOrders || 0}</td>
                    <td className="px-6 py-4 font-medium text-dark-900">SAR {(client.totalSpent || 0).toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        client.status === 'active' ? 'bg-green-100 text-green-800' :
                        client.status === 'inactive' ? 'bg-gray-100 text-gray-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {client.status ? client.status.charAt(0).toUpperCase() + client.status.slice(1) : 'Active'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditModal(client)}
                          title="Edit"
                        >
                          <HiOutlinePencil size={18} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeleteModal({ isOpen: true, id: client._id, name: client.name })}
                          className="text-error-600 hover:bg-error-50"
                          title="Delete"
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

        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-beige-200">
            <p className="text-sm text-dark-500">
              Page {page} of {pagination.totalPages} ({pagination.total} clients)
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

      {/* Add/Edit Client Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={closeModal}
        title={editingClient ? 'Edit Client' : 'Add Client'}
        size="lg"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <Input
                label="Name"
                placeholder="Client name"
                error={errors.name?.message}
                {...register('name', { required: 'Name is required' })}
              />
            </div>
            <Input
              label="Company Name"
              placeholder="Company name"
              {...register('companyName')}
            />
            <Input
              label="Contact Person"
              placeholder="Contact person"
              {...register('contactPerson')}
            />
            <Input
              label="Phone"
              placeholder="+966 5XX XXX XXXX"
              {...register('phone')}
            />
            <Input
              label="Email"
              placeholder="email@example.com"
              type="email"
              {...register('email')}
            />
            <Input
              label="City"
              placeholder="City"
              {...register('city')}
            />
            <Input
              label="Country"
              placeholder="Country"
              {...register('country')}
            />
            <Input
              label="Tax Number"
              placeholder="Tax registration number"
              {...register('taxNumber')}
            />
            <div className="sm:col-span-2">
              <Input
                label="Address"
                placeholder="Full address"
                {...register('address')}
              />
            </div>
            <div className="sm:col-span-2">
              <Textarea
                label="Notes"
                placeholder="Additional notes about this client..."
                rows={3}
                {...register('notes')}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-beige-200">
            <Button type="button" variant="outline" onClick={closeModal} disabled={isSaving}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? 'Saving...' : editingClient ? 'Update Client' : 'Add Client'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, id: '', name: '' })}
        onConfirm={() => deleteMutation.mutate(deleteModal.id)}
        title="Delete Client"
        message={`Are you sure you want to delete "${deleteModal.name}"? This action cannot be undone.`}
        confirmText="Delete"
        variant="danger"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
