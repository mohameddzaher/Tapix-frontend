'use client';

import { useState, useEffect, useRef, useCallback, useMemo, forwardRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HiOutlineSearch,
  HiOutlinePlus,
  HiOutlineEye,
  HiOutlineTrash,
  HiOutlinePrinter,
  HiOutlinePhotograph,
  HiOutlineArrowLeft,
  HiOutlineX,
  HiOutlineDocumentText,
  HiOutlineDownload,
  HiOutlineFilter,
  HiOutlineCalendar,
  HiOutlineChevronDown,
} from 'react-icons/hi';
import { Card, Button, Spinner, Skeleton } from '@/components/ui';
import { b2bApi } from '@/lib/api';
import { exportToCSV, b2bSaleColumns } from '@/lib/export';
import toast from 'react-hot-toast';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Client {
  _id: string;
  name: string;
  companyName?: string;
  phone?: string;
}

interface Product {
  _id: string;
  name: string;
  sku?: string;
  quantity: number;
  costPerUnit: number;
  onlinePrice?: number;
  offlinePrice?: number;
}

interface SaleItem {
  productId: string;
  productName: string;
  quantity: number;
  pricePerUnit: number;
  availableQty: number;
  costPerUnit: number;
}

interface Sale {
  _id: string;
  invoiceNumber: string;
  client: Client | null;
  clientId?: Client | string | null;
  items: {
    product?: Product | string;
    productId?: string;
    productName?: string;
    name?: string;
    quantity: number;
    pricePerUnit: number;
    total?: number;
    totalPrice?: number;
    costPerUnit?: number;
  }[];
  subtotal: number;
  tax: number;
  taxRate: number;
  discount: number;
  total: number;
  profit: number;
  paymentStatus: string;
  paymentMethod?: string;
  amountPaid?: number;
  notes?: string;
  saleDate: string;
  createdAt: string;
}

type PageView = 'list' | 'create' | 'detail' | 'success';

const LIMIT = 15;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatSAR(value: number): string {
  return `SAR ${value.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function getTodayString(): string {
  const d = new Date();
  return d.toISOString().split('T')[0];
}

function PaymentStatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    paid: 'bg-emerald-100 text-emerald-800',
    partial: 'bg-amber-100 text-amber-800',
    unpaid: 'bg-red-100 text-red-800',
  };
  return (
    <span
      className={`inline-block px-2.5 py-1 text-xs font-semibold rounded-full capitalize ${
        styles[status?.toLowerCase()] || 'bg-gray-100 text-gray-800'
      }`}
    >
      {status}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Searchable Product Select
// ---------------------------------------------------------------------------

function ProductSearchSelect({ products, value, onChange }: {
  products: Product[];
  value: string;
  onChange: (productId: string) => void;
}) {
  const [search, setSearch] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const selected = products.find(p => p._id === value);

  const filtered = search
    ? products.filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        (p.sku || '').toLowerCase().includes(search.toLowerCase())
      )
    : products;

  // Close on click outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={wrapperRef} className="relative">
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="w-full border border-beige-300 rounded-lg px-3 py-2 text-sm bg-white cursor-pointer flex items-center justify-between min-h-[38px]"
      >
        <span className={selected ? 'text-dark-900' : 'text-dark-400'}>
          {selected ? `${selected.sku || ''} ${selected.name}`.trim() : 'Select product...'}
        </span>
        <HiOutlineChevronDown size={14} className="text-dark-400 flex-shrink-0" />
      </div>

      {isOpen && (
        <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-white border border-beige-300 rounded-lg shadow-lg max-h-60 overflow-hidden">
          {/* Search input */}
          <div className="p-2 border-b border-beige-200">
            <div className="relative">
              <HiOutlineSearch size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-dark-400" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search by name or code..."
                className="w-full pl-8 pr-3 py-1.5 border border-beige-200 rounded text-sm focus:ring-1 focus:ring-primary-500 focus:border-primary-500 outline-none"
                autoFocus
              />
            </div>
          </div>

          {/* Options */}
          <div className="overflow-y-auto max-h-48">
            {filtered.length === 0 ? (
              <div className="p-3 text-sm text-dark-400 text-center">No products found</div>
            ) : (
              filtered.map(p => (
                <button
                  key={p._id}
                  type="button"
                  onClick={() => {
                    onChange(p._id);
                    setIsOpen(false);
                    setSearch('');
                  }}
                  className={`w-full text-left px-3 py-2 text-sm hover:bg-beige-50 transition-colors flex items-center justify-between ${
                    p._id === value ? 'bg-primary-50 text-primary-700' : 'text-dark-900'
                  }`}
                >
                  <div className="min-w-0">
                    <span className="font-mono text-xs text-dark-400 mr-2">{p.sku || '-'}</span>
                    <span className="truncate">{p.name}</span>
                  </div>
                  <span className="text-xs text-dark-400 flex-shrink-0 ml-2">
                    {p.quantity} in stock
                  </span>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Page
// ---------------------------------------------------------------------------

export default function B2BSalesPage() {
  const queryClient = useQueryClient();
  const [view, setView] = useState<PageView>('list');
  const [selectedSaleId, setSelectedSaleId] = useState<string | null>(null);
  const [createdSale, setCreatedSale] = useState<Sale | null>(null);

  // List state
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [filterClient, setFilterClient] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Sale | null>(null);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 400);
    return () => clearTimeout(t);
  }, [search]);

  // --- Queries ---

  const { data: salesData, isLoading: salesLoading } = useQuery({
    queryKey: [
      'b2b-sales',
      page,
      debouncedSearch,
      filterClient,
      filterStatus,
      filterStartDate,
      filterEndDate,
    ],
    queryFn: () =>
      b2bApi.getSales({
        page,
        limit: LIMIT,
        search: debouncedSearch || undefined,
        client: filterClient || undefined,
        paymentStatus: filterStatus || undefined,
        startDate: filterStartDate || undefined,
        endDate: filterEndDate || undefined,
      }),
    enabled: view === 'list',
  });

  // Normalize: API returns clientId (populated), map to client for convenience
  const normalizeSale = (s: any): Sale => ({
    ...s,
    client: s.client || s.clientId || null,
  });

  const sales: Sale[] = (salesData?.sales || []).map(normalizeSale);
  const pagination = salesData?.pagination;

  const { data: rawSaleDetail, isLoading: detailLoading } = useQuery({
    queryKey: ['b2b-sale', selectedSaleId],
    queryFn: () => b2bApi.getSale(selectedSaleId!),
    enabled: !!selectedSaleId && view === 'detail',
  });
  const saleDetail = rawSaleDetail ? normalizeSale(rawSaleDetail) : undefined;

  const { data: clientsList = [] } = useQuery<Client[]>({
    queryKey: ['b2b-all-clients'],
    queryFn: () => b2bApi.getAllClients(),
  });

  // --- Delete mutation ---

  const deleteMutation = useMutation({
    mutationFn: (id: string) => b2bApi.deleteSale(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['b2b-sales'] });
      toast.success('Sale deleted');
      setDeleteTarget(null);
    },
    onError: () => toast.error('Failed to delete sale'),
  });

  // --- Navigation ---

  const openCreate = () => {
    setView('create');
    setSelectedSaleId(null);
    setCreatedSale(null);
  };

  const openDetail = (id: string) => {
    setSelectedSaleId(id);
    setView('detail');
  };

  const goToList = () => {
    setView('list');
    setSelectedSaleId(null);
    setCreatedSale(null);
    queryClient.invalidateQueries({ queryKey: ['b2b-sales'] });
  };

  const onSaleCreated = (sale: Sale) => {
    setCreatedSale(sale);
    setView('success');
    queryClient.invalidateQueries({ queryKey: ['b2b-sales'] });
  };

  const clearFilters = () => {
    setFilterClient('');
    setFilterStatus('');
    setFilterStartDate('');
    setFilterEndDate('');
    setPage(1);
  };

  const hasActiveFilters = filterClient || filterStatus || filterStartDate || filterEndDate;

  // --- Render by view ---

  if (view === 'create') {
    return (
      <CreateSaleForm
        clients={clientsList}
        onSuccess={onSaleCreated}
        onBack={goToList}
      />
    );
  }

  if (view === 'success' && createdSale) {
    return (
      <SaleSuccessView
        sale={createdSale}
        clients={clientsList}
        onCreateAnother={openCreate}
        onBackToList={goToList}
      />
    );
  }

  if (view === 'detail' && selectedSaleId) {
    return (
      <SaleDetailView
        sale={saleDetail}
        isLoading={detailLoading}
        clients={clientsList}
        onBack={goToList}
      />
    );
  }

  // --- List View ---
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-dark-900">B2B Sales</h1>
          <p className="text-dark-500 mt-1">
            Create and manage B2B invoices and sales
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => exportToCSV(sales, b2bSaleColumns, 'b2b-sales')}
            className="flex items-center gap-2 px-4 py-2 bg-dark-800 text-white rounded-lg hover:bg-dark-700 transition-colors text-sm"
          >
            <HiOutlineDownload size={16} />
            Export
          </button>
          <Button leftIcon={<HiOutlinePlus size={18} />} onClick={openCreate}>
            New Sale
          </Button>
        </div>
      </div>

      {/* Search + Filters */}
      <Card padding="md">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <HiOutlineSearch
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400"
              />
              <input
                type="text"
                placeholder="Search by invoice number or client..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-beige-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2 border rounded-lg text-sm font-medium transition-colors ${
                hasActiveFilters
                  ? 'border-primary-500 text-primary-600 bg-primary-50'
                  : 'border-beige-300 text-dark-600 hover:bg-beige-50'
              }`}
            >
              <HiOutlineFilter size={16} />
              Filters
              {hasActiveFilters && (
                <span className="bg-primary-600 text-white text-[10px] px-1.5 py-0.5 rounded-full">
                  !
                </span>
              )}
            </button>
          </div>

          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-3 border-t border-beige-200">
                  <div>
                    <label className="block text-xs font-medium text-dark-500 mb-1">
                      Client
                    </label>
                    <select
                      value={filterClient}
                      onChange={(e) => {
                        setFilterClient(e.target.value);
                        setPage(1);
                      }}
                      className="w-full border border-beige-300 rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                    >
                      <option value="">All Clients</option>
                      {clientsList.map((c) => (
                        <option key={c._id} value={c._id}>
                          {c.name}
                          {c.companyName ? ` (${c.companyName})` : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-dark-500 mb-1">
                      Payment Status
                    </label>
                    <select
                      value={filterStatus}
                      onChange={(e) => {
                        setFilterStatus(e.target.value);
                        setPage(1);
                      }}
                      className="w-full border border-beige-300 rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                    >
                      <option value="">All Statuses</option>
                      <option value="paid">Paid</option>
                      <option value="partial">Partial</option>
                      <option value="unpaid">Unpaid</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-dark-500 mb-1">
                      Start Date
                    </label>
                    <input
                      type="date"
                      value={filterStartDate}
                      onChange={(e) => {
                        setFilterStartDate(e.target.value);
                        setPage(1);
                      }}
                      className="w-full border border-beige-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-dark-500 mb-1">
                      End Date
                    </label>
                    <input
                      type="date"
                      value={filterEndDate}
                      onChange={(e) => {
                        setFilterEndDate(e.target.value);
                        setPage(1);
                      }}
                      className="w-full border border-beige-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                    />
                  </div>
                </div>
                {hasActiveFilters && (
                  <div className="pt-3 flex justify-end">
                    <button
                      onClick={clearFilters}
                      className="text-xs text-primary-600 hover:text-primary-700 font-medium"
                    >
                      Clear all filters
                    </button>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </Card>

      {/* Sales Table */}
      <Card padding="none">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-beige-50 border-b border-beige-200">
              <tr>
                {[
                  'Invoice',
                  'Client',
                  'Items',
                  'Subtotal',
                  'Tax',
                  'Discount',
                  'Total',
                  'Profit',
                  'Status',
                  'Date',
                  'Actions',
                ].map((h) => (
                  <th
                    key={h}
                    className={`px-4 py-3 text-xs font-semibold text-dark-500 uppercase tracking-wider whitespace-nowrap ${
                      h === 'Actions' ? 'text-right' : 'text-left'
                    }`}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-beige-200">
              {salesLoading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i}>
                    <td colSpan={11} className="px-4 py-4">
                      <Skeleton className="h-10 w-full" />
                    </td>
                  </tr>
                ))
              ) : sales.length === 0 ? (
                <tr>
                  <td
                    colSpan={11}
                    className="px-4 py-16 text-center text-dark-500"
                  >
                    <HiOutlineDocumentText
                      size={40}
                      className="mx-auto mb-3 text-dark-300"
                    />
                    <p className="text-base font-medium">No sales found</p>
                    <p className="text-sm mt-1">
                      Create your first sale to get started
                    </p>
                  </td>
                </tr>
              ) : (
                sales.map((sale) => (
                  <motion.tr
                    key={sale._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-beige-50 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <button
                        onClick={() => openDetail(sale._id)}
                        className="text-sm font-medium text-primary-600 hover:text-primary-700 hover:underline font-mono"
                      >
                        {sale.invoiceNumber}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="text-sm text-dark-900 font-medium">
                          {sale.client?.name || '-'}
                        </p>
                        {sale.client?.companyName && (
                          <p className="text-xs text-dark-400">
                            {sale.client.companyName}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-dark-600">
                      {sale.items?.length || 0}
                    </td>
                    <td className="px-4 py-3 text-sm text-dark-600 whitespace-nowrap">
                      {formatSAR(sale.subtotal || 0)}
                    </td>
                    <td className="px-4 py-3 text-sm text-dark-600 whitespace-nowrap">
                      {formatSAR(sale.tax || 0)}
                    </td>
                    <td className="px-4 py-3 text-sm text-dark-600 whitespace-nowrap">
                      {formatSAR(sale.discount || 0)}
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold text-dark-900 whitespace-nowrap">
                      {formatSAR(sale.total || 0)}
                    </td>
                    <td className="px-4 py-3 text-sm whitespace-nowrap">
                      <span
                        className={
                          (sale.profit || 0) >= 0
                            ? 'text-emerald-600 font-medium'
                            : 'text-red-600 font-medium'
                        }
                      >
                        {formatSAR(sale.profit || 0)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <PaymentStatusBadge status={sale.paymentStatus} />
                    </td>
                    <td className="px-4 py-3 text-sm text-dark-500 whitespace-nowrap">
                      {formatDate(sale.saleDate || sale.createdAt)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openDetail(sale._id)}
                          className="p-2 rounded-lg hover:bg-beige-100 text-dark-500 hover:text-primary-600 transition-colors"
                          title="View"
                        >
                          <HiOutlineEye size={16} />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(sale)}
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
              Page {page} of {pagination.totalPages} ({pagination.total} sales)
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
              >
                Previous
              </Button>
              {Array.from(
                { length: Math.min(pagination.totalPages, 5) },
                (_, i) => {
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
                }
              )}
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

      {/* Delete Confirmation */}
      <AnimatePresence>
        {deleteTarget && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            onClick={() => setDeleteTarget(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-semibold text-dark-900 mb-2">
                Delete Sale
              </h3>
              <p className="text-sm text-dark-600 mb-6">
                Are you sure you want to delete invoice{' '}
                <span className="font-semibold text-dark-900 font-mono">
                  {deleteTarget.invoiceNumber}
                </span>
                ? This action cannot be undone.
              </p>
              <div className="flex items-center justify-end gap-3">
                <button
                  onClick={() => setDeleteTarget(null)}
                  className="px-4 py-2 text-sm font-medium text-dark-600 hover:text-dark-900 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => deleteMutation.mutate(deleteTarget._id)}
                  disabled={deleteMutation.isPending}
                  className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Create Sale Form
// ---------------------------------------------------------------------------

interface CreateSaleFormProps {
  clients: Client[];
  onSuccess: (sale: Sale) => void;
  onBack: () => void;
}

function CreateSaleForm({ clients, onSuccess, onBack }: CreateSaleFormProps) {
  // Load products
  const { data: productsData } = useQuery({
    queryKey: ['b2b-products-all'],
    queryFn: () => b2bApi.getProducts({ limit: 100 }),
  });
  const products: Product[] = productsData?.products || [];

  // Form state
  const [clientId, setClientId] = useState('');
  const [saleDate, setSaleDate] = useState(getTodayString());
  const [items, setItems] = useState<SaleItem[]>([
    {
      productId: '',
      productName: '',
      quantity: 1,
      pricePerUnit: 0,
      availableQty: 0,
      costPerUnit: 0,
    },
  ]);
  const [discount, setDiscount] = useState(0);
  const [taxRate, setTaxRate] = useState(15);
  const [paymentStatus, setPaymentStatus] = useState('unpaid');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [amountPaid, setAmountPaid] = useState<number | ''>('');
  const [notes, setNotes] = useState('');

  // Create sale mutation
  const createMutation = useMutation({
    mutationFn: (data: any) => b2bApi.createSale(data),
    onSuccess: (data: any) => {
      toast.success('Sale created successfully!');
      onSuccess(data.sale || data);
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.error || error.response?.data?.message || 'Failed to create sale'
      );
    },
  });

  // --- Item management ---

  const updateItem = (index: number, field: keyof SaleItem, value: any) => {
    setItems((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleProductSelect = (index: number, productId: string) => {
    const product = products.find((p) => p._id === productId);
    if (!product) return;

    const price =
      product.offlinePrice || product.onlinePrice || product.costPerUnit || 0;

    setItems((prev) => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        productId: product._id,
        productName: product.name,
        pricePerUnit: price,
        availableQty: product.quantity,
        costPerUnit: product.costPerUnit,
      };
      return updated;
    });
  };

  const addItem = () => {
    setItems((prev) => [
      ...prev,
      {
        productId: '',
        productName: '',
        quantity: 1,
        pricePerUnit: 0,
        availableQty: 0,
        costPerUnit: 0,
      },
    ]);
  };

  const removeItem = (index: number) => {
    if (items.length <= 1) return;
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  // --- Calculations ---

  const subtotal = useMemo(
    () =>
      items.reduce(
        (sum, item) => sum + item.quantity * item.pricePerUnit,
        0
      ),
    [items]
  );

  const taxAmount = useMemo(
    () => ((subtotal - discount) * taxRate) / 100,
    [subtotal, discount, taxRate]
  );

  const total = useMemo(
    () => subtotal - discount + taxAmount,
    [subtotal, discount, taxAmount]
  );

  // --- Submit ---

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!clientId) {
      toast.error('Please select a client');
      return;
    }

    const validItems = items.filter((item) => item.productId && item.quantity > 0);
    if (validItems.length === 0) {
      toast.error('Please add at least one product');
      return;
    }

    for (const item of validItems) {
      if (item.pricePerUnit <= 0) {
        toast.error(`Price per unit must be greater than 0 for ${item.productName}`);
        return;
      }
    }

    const payload = {
      clientId,
      saleDate,
      items: validItems.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        pricePerUnit: item.pricePerUnit,
      })),
      discount: discount || 0,
      taxRate,
      paymentStatus,
      paymentMethod: paymentMethod || undefined,
      amountPaid: amountPaid !== '' ? Number(amountPaid) : undefined,
      notes: notes || undefined,
    };

    createMutation.mutate(payload);
  };

  const inputCls =
    'w-full border border-beige-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none';
  const selectCls =
    'w-full border border-beige-300 rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none';
  const labelCls = 'block text-sm font-medium text-dark-700 mb-1';

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={onBack}
          className="p-2 rounded-lg hover:bg-beige-100 text-dark-500 transition-colors"
        >
          <HiOutlineArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-semibold text-dark-900">
            Create New Sale
          </h1>
          <p className="text-dark-500 mt-0.5">
            Fill in the details to create a B2B invoice
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Client + Date */}
        <Card padding="md">
          <h2 className="text-lg font-semibold text-dark-900 mb-4">
            Sale Information
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>
                Client <span className="text-red-500">*</span>
              </label>
              <select
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                className={selectCls}
              >
                <option value="">Select a client...</option>
                {clients.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                    {c.companyName ? ` - ${c.companyName}` : ''}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelCls}>Sale Date</label>
              <input
                type="date"
                value={saleDate}
                onChange={(e) => setSaleDate(e.target.value)}
                className={inputCls}
              />
            </div>
          </div>
        </Card>

        {/* Items */}
        <Card padding="md">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-dark-900">Products</h2>
            <button
              type="button"
              onClick={addItem}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-primary-600 hover:text-primary-700 hover:bg-primary-50 rounded-lg transition-colors"
            >
              <HiOutlinePlus size={16} />
              Add Product
            </button>
          </div>

          <div className="space-y-4">
            {items.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 border border-beige-200 rounded-lg bg-beige-50/50"
              >
                <div className="flex items-start justify-between mb-3">
                  <span className="text-xs font-semibold text-dark-400 uppercase">
                    Item #{index + 1}
                  </span>
                  {items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeItem(index)}
                      className="p-1 rounded-lg hover:bg-red-50 text-dark-400 hover:text-red-600 transition-colors"
                    >
                      <HiOutlineX size={16} />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                  {/* Product Select with Search */}
                  <div className="sm:col-span-4">
                    <label className="block text-xs font-medium text-dark-500 mb-1">
                      Product
                    </label>
                    <ProductSearchSelect
                      products={products}
                      value={item.productId}
                      onChange={(productId) => handleProductSelect(index, productId)}
                    />
                  </div>

                  {/* Available Qty Info */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium text-dark-500 mb-1">
                      Available
                    </label>
                    <div className="px-3 py-2 bg-beige-100 border border-beige-200 rounded-lg text-sm text-dark-600">
                      {item.productId ? item.availableQty : '-'}
                    </div>
                  </div>

                  {/* Quantity */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium text-dark-500 mb-1">
                      Quantity
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={item.quantity}
                      onChange={(e) =>
                        updateItem(
                          index,
                          'quantity',
                          Math.max(1, parseInt(e.target.value) || 1)
                        )
                      }
                      className={inputCls}
                    />
                  </div>

                  {/* Price per Unit */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium text-dark-500 mb-1">
                      Price/Unit (SAR)
                    </label>
                    <input
                      type="number"
                      min={0}
                      step="0.01"
                      value={item.pricePerUnit}
                      onChange={(e) =>
                        updateItem(
                          index,
                          'pricePerUnit',
                          parseFloat(e.target.value) || 0
                        )
                      }
                      className={inputCls}
                    />
                  </div>

                  {/* Item Total */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium text-dark-500 mb-1">
                      Total
                    </label>
                    <div className="px-3 py-2 bg-beige-100 border border-beige-200 rounded-lg text-sm font-semibold text-dark-900">
                      {formatSAR(item.quantity * item.pricePerUnit)}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </Card>

        {/* Pricing + Payment */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pricing Summary */}
          <Card padding="md">
            <h2 className="text-lg font-semibold text-dark-900 mb-4">
              Pricing
            </h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Discount (SAR)</label>
                  <input
                    type="number"
                    min={0}
                    step="0.01"
                    value={discount}
                    onChange={(e) =>
                      setDiscount(parseFloat(e.target.value) || 0)
                    }
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className={labelCls}>Tax Rate (%)</label>
                  <input
                    type="number"
                    min={0}
                    step="0.01"
                    value={taxRate}
                    onChange={(e) =>
                      setTaxRate(parseFloat(e.target.value) || 0)
                    }
                    className={inputCls}
                  />
                </div>
              </div>

              {/* Summary */}
              <div className="border-t border-beige-200 pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-dark-500">Subtotal</span>
                  <span className="text-dark-700 font-medium">
                    {formatSAR(subtotal)}
                  </span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-dark-500">Discount</span>
                    <span className="text-red-600 font-medium">
                      -{formatSAR(discount)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-dark-500">
                    Tax ({taxRate}%)
                  </span>
                  <span className="text-dark-700 font-medium">
                    {formatSAR(taxAmount)}
                  </span>
                </div>
                <div className="flex justify-between text-base pt-2 border-t border-beige-200">
                  <span className="font-semibold text-dark-900">Total</span>
                  <span className="font-bold text-dark-900 text-lg">
                    {formatSAR(total)}
                  </span>
                </div>
              </div>
            </div>
          </Card>

          {/* Payment Details */}
          <Card padding="md">
            <h2 className="text-lg font-semibold text-dark-900 mb-4">
              Payment
            </h2>
            <div className="space-y-4">
              <div>
                <label className={labelCls}>Payment Status</label>
                <select
                  value={paymentStatus}
                  onChange={(e) => setPaymentStatus(e.target.value)}
                  className={selectCls}
                >
                  <option value="paid">Paid</option>
                  <option value="partial">Partial</option>
                  <option value="unpaid">Unpaid</option>
                </select>
              </div>
              <div>
                <label className={labelCls}>Payment Method</label>
                <input
                  type="text"
                  placeholder="e.g. Bank Transfer, Cash, etc."
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>Amount Paid (SAR)</label>
                <input
                  type="number"
                  min={0}
                  step="0.01"
                  value={amountPaid}
                  onChange={(e) =>
                    setAmountPaid(
                      e.target.value === '' ? '' : parseFloat(e.target.value)
                    )
                  }
                  placeholder="0.00"
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>Notes</label>
                <textarea
                  rows={3}
                  placeholder="Optional notes about this sale..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className={`${inputCls} resize-none`}
                />
              </div>
            </div>
          </Card>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onBack}
            className="px-6 py-2.5 text-sm font-medium text-dark-600 hover:text-dark-900 border border-beige-300 rounded-lg hover:bg-beige-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={createMutation.isPending}
            className="px-8 py-2.5 bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {createMutation.isPending ? (
              <>
                <Spinner size="sm" />
                Creating...
              </>
            ) : (
              'Create Sale'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sale Success View
// ---------------------------------------------------------------------------

interface SaleSuccessViewProps {
  sale: Sale;
  clients: Client[];
  onCreateAnother: () => void;
  onBackToList: () => void;
}

function SaleSuccessView({
  sale,
  clients,
  onCreateAnother,
  onBackToList,
}: SaleSuccessViewProps) {
  const invoiceRef = useRef<HTMLDivElement>(null);
  const client = clients.find((c) => c._id === (typeof sale.client === 'string' ? sale.client : sale.client?._id));
  const clientPhone = client?.phone || sale.client?.phone || '';
  const [whatsappPhone, setWhatsappPhone] = useState(clientPhone);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadImage = async () => {
    const el = invoiceRef.current;
    if (!el) return;

    try {
      // Get computed styles and clone element for clean capture
      const clone = el.cloneNode(true) as HTMLElement;

      // Inline all computed styles
      const allElements = el.querySelectorAll('*');
      const cloneElements = clone.querySelectorAll('*');

      const computedStyle = window.getComputedStyle(el);
      for (let i = 0; i < computedStyle.length; i++) {
        const prop = computedStyle[i];
        clone.style.setProperty(prop, computedStyle.getPropertyValue(prop));
      }

      allElements.forEach((origEl, idx) => {
        const cs = window.getComputedStyle(origEl);
        const cloneEl = cloneElements[idx] as HTMLElement;
        if (cloneEl && cloneEl.style) {
          for (let i = 0; i < cs.length; i++) {
            const prop = cs[i];
            cloneEl.style.setProperty(prop, cs.getPropertyValue(prop));
          }
        }
      });

      // Remove images that may cause CORS issues
      clone.querySelectorAll('img').forEach(img => {
        const text = document.createElement('div');
        text.textContent = img.alt || 'Tapix';
        text.style.cssText = 'font-size:24px;font-weight:bold;color:#1a1a2e;';
        img.replaceWith(text);
      });

      clone.style.width = el.offsetWidth + 'px';
      clone.style.position = 'static';
      clone.style.background = 'white';

      const scale = 2;
      const width = el.offsetWidth;
      const height = el.offsetHeight;

      const svgString = `
        <svg xmlns="http://www.w3.org/2000/svg" width="${width * scale}" height="${height * scale}">
          <foreignObject width="${width}" height="${height}" style="transform:scale(${scale});transform-origin:top left;">
            ${new XMLSerializer().serializeToString(clone)}
          </foreignObject>
        </svg>`;

      const canvas = document.createElement('canvas');
      canvas.width = width * scale;
      canvas.height = height * scale;
      const ctx = canvas.getContext('2d')!;
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const img = new Image();
      const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(svgBlob);

      img.onload = () => {
        ctx.drawImage(img, 0, 0);
        URL.revokeObjectURL(url);
        const link = document.createElement('a');
        link.download = `invoice-${sale.invoiceNumber || 'draft'}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
        toast.success('Invoice image downloaded');
      };

      img.onerror = () => {
        URL.revokeObjectURL(url);
        // Fallback: open print dialog
        toast.error('Image generation failed — opening print dialog instead');
        window.print();
      };

      img.src = url;
    } catch {
      toast.error('Image generation failed — opening print dialog instead');
      window.print();
    }
  };

  const handleWhatsApp = async () => {
    const phone = whatsappPhone.replace(/[^\d+]/g, '');
    if (!phone) {
      toast.error('Please enter a phone number');
      return;
    }

    const clientName = client?.name || (sale.client as any)?.name || '';
    const items = sale.items?.map((i) => `• ${i.productName || i.name || '-'} x${i.quantity} = ${formatSAR(i.totalPrice || i.total || i.quantity * i.pricePerUnit)}`).join('\n') || '';

    const message = [
      `📄 *INVOICE ${sale.invoiceNumber}*`,
      `📅 Date: ${formatDate(sale.saleDate || sale.createdAt)}`,
      '',
      `👤 Client: *${clientName}*`,
      '',
      `📦 *Items:*`,
      items,
      '',
      `💰 Subtotal: ${formatSAR(sale.subtotal)}`,
      ...(sale.discount > 0 ? [`🏷️ Discount: -${formatSAR(sale.discount)}`] : []),
      `📊 VAT (${sale.taxRate || 15}%): ${formatSAR(sale.tax)}`,
      `━━━━━━━━━━━━━`,
      `💵 *Total: ${formatSAR(sale.total)}*`,
      '',
      `✅ Payment: ${sale.paymentStatus === 'paid' ? 'Paid' : sale.paymentStatus === 'partial' ? 'Partially Paid' : 'Unpaid'}`,
      ...(sale.paymentMethod ? [`💳 Method: ${sale.paymentMethod}`] : []),
      '',
      `Thank you for your business! 🙏`,
      `— *Tapix*`,
    ].join('\n');

    // Try Web Share API first (works on mobile with files)
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        // Generate image blob for sharing
        const el = invoiceRef.current;
        if (el) {
          const clone = el.cloneNode(true) as HTMLElement;
          clone.querySelectorAll('img').forEach(img => {
            const text = document.createElement('div');
            text.textContent = img.alt || 'Tapix';
            text.style.cssText = 'font-size:24px;font-weight:bold;';
            img.replaceWith(text);
          });

          const canvas = document.createElement('canvas');
          const scale = 2;
          canvas.width = el.offsetWidth * scale;
          canvas.height = el.offsetHeight * scale;
          const ctx = canvas.getContext('2d')!;
          ctx.fillStyle = '#fff';
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          const svgString = `<svg xmlns="http://www.w3.org/2000/svg" width="${el.offsetWidth * scale}" height="${el.offsetHeight * scale}"><foreignObject width="${el.offsetWidth}" height="${el.offsetHeight}" style="transform:scale(${scale});transform-origin:top left;">${new XMLSerializer().serializeToString(clone)}</foreignObject></svg>`;
          const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
          const url = URL.createObjectURL(blob);
          const img = new Image();

          await new Promise<void>((resolve, reject) => {
            img.onload = () => {
              ctx.drawImage(img, 0, 0);
              URL.revokeObjectURL(url);
              resolve();
            };
            img.onerror = () => { URL.revokeObjectURL(url); reject(); };
            img.src = url;
          });

          const imageBlob = await new Promise<Blob>((resolve) =>
            canvas.toBlob((b) => resolve(b!), 'image/png')
          );

          const file = new File([imageBlob], `invoice-${sale.invoiceNumber}.png`, { type: 'image/png' });

          await navigator.share({
            title: `Invoice ${sale.invoiceNumber}`,
            text: message,
            files: [file],
          });
          return;
        }
      } catch {
        // Fall through to wa.me
      }
    }

    // Fallback: open WhatsApp with text
    window.open(
      `https://wa.me/${phone}?text=${encodeURIComponent(message)}`,
      '_blank'
    );
  };

  return (
    <div className="space-y-6 pb-10">
      {/* Success Banner */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-emerald-50 border border-emerald-200 rounded-xl p-6 text-center"
      >
        <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3">
          <svg
            className="w-8 h-8 text-emerald-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-emerald-900">
          Sale Created Successfully!
        </h2>
        <p className="text-emerald-700 mt-1">
          Invoice{' '}
          <span className="font-mono font-semibold">
            {sale.invoiceNumber}
          </span>{' '}
          has been created.
        </p>
      </motion.div>

      {/* Action Buttons */}
      <Card padding="md">
        <h3 className="text-lg font-semibold text-dark-900 mb-4">
          Invoice Actions
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            onClick={handlePrint}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-primary-50 hover:bg-primary-100 text-primary-700 font-medium rounded-lg border border-primary-200 transition-colors"
          >
            <HiOutlinePrinter size={20} />
            Print / Download PDF
          </button>
          <button
            onClick={handleDownloadImage}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-violet-50 hover:bg-violet-100 text-violet-700 font-medium rounded-lg border border-violet-200 transition-colors"
          >
            <HiOutlinePhotograph size={20} />
            Download as Image
          </button>
        </div>

        {/* WhatsApp Section */}
        <div className="mt-6 pt-4 border-t border-beige-200">
          <h4 className="text-sm font-semibold text-dark-700 mb-3">
            Send via WhatsApp
          </h4>
          <div className="flex gap-3">
            <input
              type="text"
              placeholder="Phone number (e.g. +966501234567)"
              value={whatsappPhone}
              onChange={(e) => setWhatsappPhone(e.target.value)}
              className="flex-1 border border-beige-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
            />
            <button
              onClick={handleWhatsApp}
              className="flex items-center gap-2 px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-colors whitespace-nowrap"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                <path d="M12 0C5.373 0 0 5.373 0 12c0 2.625.846 5.059 2.284 7.034L.789 23.492a.5.5 0 00.611.611l4.458-1.495A11.943 11.943 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-2.348 0-4.518-.816-6.222-2.18l-.435-.346-2.638.884.884-2.638-.346-.435A9.956 9.956 0 012 12C2 6.486 6.486 2 12 2s10 4.486 10 10-4.486 10-10 10z" />
              </svg>
              Send via WhatsApp
            </button>
          </div>
        </div>

        {/* Navigation */}
        <div className="mt-6 pt-4 border-t border-beige-200 flex flex-col sm:flex-row gap-3">
          <button
            onClick={onCreateAnother}
            className="flex-1 px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors text-center"
          >
            Create Another Sale
          </button>
          <button
            onClick={onBackToList}
            className="flex-1 px-4 py-2.5 border border-beige-300 hover:bg-beige-50 text-dark-700 font-medium rounded-lg transition-colors text-center"
          >
            Back to Sales
          </button>
        </div>
      </Card>

      {/* Invoice Preview */}
      <div>
        <h3 className="text-lg font-semibold text-dark-900 mb-3">
          Invoice Preview
        </h3>
        <InvoiceTemplate ref={invoiceRef} sale={sale} client={client || sale.client} />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sale Detail View
// ---------------------------------------------------------------------------

interface SaleDetailViewProps {
  sale: Sale | undefined;
  isLoading: boolean;
  clients: Client[];
  onBack: () => void;
}

function SaleDetailView({ sale, isLoading, clients, onBack }: SaleDetailViewProps) {
  const invoiceRef = useRef<HTMLDivElement>(null);
  const client = sale
    ? clients.find(
        (c) =>
          c._id ===
          (typeof sale.client === 'string' ? sale.client : sale.client?._id)
      ) || sale.client
    : null;
  const clientPhone =
    (client as Client)?.phone || '';
  const [whatsappPhone, setWhatsappPhone] = useState(clientPhone);

  useEffect(() => {
    if (clientPhone) setWhatsappPhone(clientPhone);
  }, [clientPhone]);

  const handlePrint = () => {
    window.print();
  };

  const handleWhatsApp = () => {
    const phone = whatsappPhone.replace(/[^\d+]/g, '');
    if (!phone || !sale) return;

    const clientName = (client as Client)?.name || '';
    const items = sale.items?.map((i: any) => `• ${i.productName || i.name || '-'} x${i.quantity} = ${formatSAR(i.totalPrice || i.total || i.quantity * i.pricePerUnit)}`).join('\n') || '';

    const message = [
      `📄 *INVOICE ${sale.invoiceNumber}*`,
      `📅 Date: ${formatDate(sale.saleDate || sale.createdAt)}`,
      '',
      `👤 Client: *${clientName}*`,
      '',
      `📦 *Items:*`,
      items,
      '',
      `💰 Subtotal: ${formatSAR(sale.subtotal)}`,
      ...(sale.discount > 0 ? [`🏷️ Discount: -${formatSAR(sale.discount)}`] : []),
      `📊 VAT (${sale.taxRate || 15}%): ${formatSAR(sale.tax)}`,
      `━━━━━━━━━━━━━`,
      `💵 *Total: ${formatSAR(sale.total)}*`,
      '',
      `✅ Payment: ${sale.paymentStatus === 'paid' ? 'Paid' : sale.paymentStatus === 'partial' ? 'Partially Paid' : 'Unpaid'}`,
      ...(sale.paymentMethod ? [`💳 Method: ${sale.paymentMethod}`] : []),
      '',
      `Thank you for your business! 🙏`,
      `— *Tapix*`,
    ].join('\n');

    window.open(
      `https://wa.me/${phone}?text=${encodeURIComponent(message)}`,
      '_blank'
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!sale) {
    return (
      <div className="text-center py-20">
        <p className="text-dark-500">Sale not found</p>
        <button
          onClick={onBack}
          className="mt-4 text-primary-600 hover:text-primary-700 font-medium"
        >
          Back to Sales
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-2 rounded-lg hover:bg-beige-100 text-dark-500 transition-colors"
          >
            <HiOutlineArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-semibold text-dark-900">
              Invoice{' '}
              <span className="font-mono text-primary-600">
                {sale.invoiceNumber}
              </span>
            </h1>
            <p className="text-dark-500 mt-0.5 flex items-center gap-3">
              {formatDate(sale.saleDate || sale.createdAt)}
              <PaymentStatusBadge status={sale.paymentStatus} />
            </p>
          </div>
        </div>
      </div>

      {/* Quick Info */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          {
            label: 'Client',
            value: (client as Client)?.name || '-',
            sub: (client as Client)?.companyName,
          },
          { label: 'Total', value: formatSAR(sale.total) },
          {
            label: 'Profit',
            value: formatSAR(sale.profit || 0),
            color:
              (sale.profit || 0) >= 0 ? 'text-emerald-600' : 'text-red-600',
          },
          { label: 'Items', value: `${sale.items?.length || 0} products` },
        ].map((stat) => (
          <Card key={stat.label} padding="md">
            <p className="text-xs font-semibold text-dark-500 uppercase mb-1">
              {stat.label}
            </p>
            <p
              className={`text-lg font-semibold ${
                (stat as any).color || 'text-dark-900'
              }`}
            >
              {stat.value}
            </p>
            {(stat as any).sub && (
              <p className="text-xs text-dark-400">{(stat as any).sub}</p>
            )}
          </Card>
        ))}
      </div>

      {/* Items Table */}
      <Card padding="none">
        <div className="px-6 py-4 border-b border-beige-200">
          <h3 className="font-semibold text-dark-900">Sale Items</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-beige-50 border-b border-beige-200">
              <tr>
                {['Product', 'Quantity', 'Price/Unit', 'Total'].map((h) => (
                  <th
                    key={h}
                    className="text-left px-6 py-3 text-xs font-semibold text-dark-500 uppercase"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-beige-200">
              {sale.items?.map((item, i) => (
                <tr key={i} className="hover:bg-beige-50">
                  <td className="px-6 py-3 text-sm text-dark-900 font-medium">
                    {item.productName ||
                      item.name ||
                      (typeof item.product === 'object'
                        ? (item.product as Product)?.name
                        : '-')}
                  </td>
                  <td className="px-6 py-3 text-sm text-dark-600">
                    {item.quantity}
                  </td>
                  <td className="px-6 py-3 text-sm text-dark-600">
                    {formatSAR(item.pricePerUnit)}
                  </td>
                  <td className="px-6 py-3 text-sm font-medium text-dark-900">
                    {formatSAR(item.total || item.quantity * item.pricePerUnit)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="px-6 py-4 border-t border-beige-200 bg-beige-50">
          <div className="max-w-xs ml-auto space-y-1.5">
            <div className="flex justify-between text-sm">
              <span className="text-dark-500">Subtotal</span>
              <span className="text-dark-700">{formatSAR(sale.subtotal)}</span>
            </div>
            {(sale.discount || 0) > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-dark-500">Discount</span>
                <span className="text-red-600">
                  -{formatSAR(sale.discount)}
                </span>
              </div>
            )}
            <div className="flex justify-between text-sm">
              <span className="text-dark-500">
                Tax ({sale.taxRate || 15}%)
              </span>
              <span className="text-dark-700">{formatSAR(sale.tax)}</span>
            </div>
            <div className="flex justify-between text-base font-bold pt-1.5 border-t border-beige-300">
              <span className="text-dark-900">Total</span>
              <span className="text-dark-900">{formatSAR(sale.total)}</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Payment & Notes */}
      {(sale.paymentMethod || sale.amountPaid || sale.notes) && (
        <Card padding="md">
          <h3 className="font-semibold text-dark-900 mb-3">
            Payment Details
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {sale.paymentMethod && (
              <div>
                <p className="text-xs font-semibold text-dark-500 uppercase mb-1">
                  Payment Method
                </p>
                <p className="text-dark-900">{sale.paymentMethod}</p>
              </div>
            )}
            {sale.amountPaid != null && (
              <div>
                <p className="text-xs font-semibold text-dark-500 uppercase mb-1">
                  Amount Paid
                </p>
                <p className="text-dark-900">
                  {formatSAR(sale.amountPaid)}
                </p>
              </div>
            )}
            {sale.notes && (
              <div className="sm:col-span-3">
                <p className="text-xs font-semibold text-dark-500 uppercase mb-1">
                  Notes
                </p>
                <p className="text-dark-700 text-sm whitespace-pre-wrap">
                  {sale.notes}
                </p>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Actions */}
      <Card padding="md">
        <h3 className="font-semibold text-dark-900 mb-4">Actions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <button
            onClick={handlePrint}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-primary-50 hover:bg-primary-100 text-primary-700 font-medium rounded-lg border border-primary-200 transition-colors"
          >
            <HiOutlinePrinter size={20} />
            Print / Download PDF
          </button>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Phone number"
              value={whatsappPhone}
              onChange={(e) => setWhatsappPhone(e.target.value)}
              className="flex-1 border border-beige-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
            />
            <button
              onClick={handleWhatsApp}
              className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-colors whitespace-nowrap text-sm"
            >
              WhatsApp
            </button>
          </div>
        </div>
      </Card>

      {/* Printable Invoice */}
      <div>
        <h3 className="text-lg font-semibold text-dark-900 mb-3">
          Invoice Preview
        </h3>
        <InvoiceTemplate ref={invoiceRef} sale={sale} client={client} />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Invoice Template (printable)
// ---------------------------------------------------------------------------

interface InvoiceTemplateProps {
  sale: Sale;
  client: Client | null | undefined;
}

const InvoiceTemplate = forwardRef<HTMLDivElement, InvoiceTemplateProps>(function InvoiceTemplate({ sale, client }, ref) {
  // Resolve client name from multiple sources
  const clientData = (client || sale.clientId || sale.client || {}) as any;
  const clientName = clientData.name || '-';
  const clientCompany = clientData.companyName || '';
  const clientPhone = clientData.phone || '';
  const clientEmail = clientData.email || '';
  const clientAddress = clientData.address || '';
  const clientCity = clientData.city || '';
  const clientTaxNumber = clientData.taxNumber || '';

  return (
    <>
      {/* Print-only styles */}
      <style>{`
        @media print {
          body * { visibility: hidden; }
          .invoice-print, .invoice-print * { visibility: visible; }
          .invoice-print {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            padding: 24px 32px;
            background: white !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
            font-size: 14px;
          }
          .no-print { display: none !important; }
          @page { margin: 10mm; size: A4; }
        }
      `}</style>

      <div
        ref={ref}
        className="invoice-print bg-white rounded-xl border border-beige-200"
        style={{ width: '100%', maxWidth: '800px', padding: '32px 40px', margin: '0 auto' }}
      >
        {/* Header with Logo */}
        <div className="flex items-center justify-between mb-2 pb-4 border-b-2 border-dark-900">
          <div>
            <h2 className="text-3xl font-bold text-dark-900 tracking-tight">INVOICE</h2>
            <p className="text-dark-500 mt-1 font-mono text-base">
              #{sale.invoiceNumber}
            </p>
          </div>
          {/* Logo centered */}
          <div className="flex flex-col items-center">
            <img src="/images/logo.png" alt="Tapix" style={{ height: '48px', objectFit: 'contain' }} crossOrigin="anonymous" />
          </div>
          <div className="text-right">
            <p className="text-sm text-dark-600">
              {formatDate(sale.saleDate || sale.createdAt)}
            </p>
          </div>
        </div>

        {/* Company + Client Info */}
        <div className="grid grid-cols-2 gap-8 my-6">
          <div>
            <p className="text-xs font-bold text-dark-400 uppercase tracking-wider mb-2">From</p>
            <p className="text-dark-900 font-bold text-base">Tapix</p>
            <p className="text-sm text-dark-600">Jeddah, Saudi Arabia</p>
            <p className="text-sm text-dark-600">contact@tapix.com</p>
            <p className="text-sm text-dark-500 mt-1">CR: 4030580025</p>
          </div>
          <div>
            <p className="text-xs font-bold text-dark-400 uppercase tracking-wider mb-2">Bill To</p>
            <p className="text-dark-900 font-bold text-base">{clientName}</p>
            {clientCompany && <p className="text-sm text-dark-700">{clientCompany}</p>}
            {clientPhone && <p className="text-sm text-dark-600">{clientPhone}</p>}
            {clientEmail && <p className="text-sm text-dark-600">{clientEmail}</p>}
            {clientAddress && <p className="text-sm text-dark-500">{clientAddress}{clientCity ? `, ${clientCity}` : ''}</p>}
            {clientTaxNumber && <p className="text-sm text-dark-500 mt-1">Tax #: {clientTaxNumber}</p>}
          </div>
        </div>

        {/* Items Table */}
        <table className="w-full mb-6" style={{ borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#1a1a2e', color: 'white' }}>
              <th className="text-left py-3 px-4 text-xs font-bold uppercase" style={{ borderRadius: '8px 0 0 0' }}>#</th>
              <th className="text-left py-3 px-4 text-xs font-bold uppercase">Product</th>
              <th className="text-center py-3 px-4 text-xs font-bold uppercase">Qty</th>
              <th className="text-right py-3 px-4 text-xs font-bold uppercase">Unit Price</th>
              <th className="text-right py-3 px-4 text-xs font-bold uppercase" style={{ borderRadius: '0 8px 0 0' }}>Amount</th>
            </tr>
          </thead>
          <tbody>
            {sale.items?.map((item, i) => (
              <tr key={i} style={{ borderBottom: '1px solid #e5e5e5', backgroundColor: i % 2 === 0 ? '#fafafa' : 'white' }}>
                <td className="py-3 px-4 text-sm text-dark-500">{i + 1}</td>
                <td className="py-3 px-4 text-sm text-dark-900 font-medium">
                  {item.productName || item.name || '-'}
                </td>
                <td className="py-3 px-4 text-sm text-dark-700 text-center">{item.quantity}</td>
                <td className="py-3 px-4 text-sm text-dark-700 text-right">{formatSAR(item.pricePerUnit)}</td>
                <td className="py-3 px-4 text-sm text-dark-900 text-right font-semibold">
                  {formatSAR(item.totalPrice || item.total || item.quantity * item.pricePerUnit)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals */}
        <div className="flex justify-end mb-6">
          <div style={{ width: '280px' }} className="space-y-2">
            <div className="flex justify-between text-sm py-1">
              <span className="text-dark-500">Subtotal</span>
              <span className="text-dark-800 font-medium">{formatSAR(sale.subtotal)}</span>
            </div>
            {(sale.discount || 0) > 0 && (
              <div className="flex justify-between text-sm py-1">
                <span className="text-dark-500">Discount</span>
                <span className="text-red-600 font-medium">-{formatSAR(sale.discount)}</span>
              </div>
            )}
            <div className="flex justify-between text-sm py-1">
              <span className="text-dark-500">VAT ({sale.taxRate || 15}%)</span>
              <span className="text-dark-800 font-medium">{formatSAR(sale.tax)}</span>
            </div>
            <div className="flex justify-between text-xl font-bold pt-3 mt-2" style={{ borderTop: '2px solid #1a1a2e' }}>
              <span className="text-dark-900">Total Due</span>
              <span className="text-dark-900">{formatSAR(sale.total)}</span>
            </div>
          </div>
        </div>

        {/* Payment Status */}
        <div className="flex items-center gap-3 p-3 rounded-lg mb-4" style={{ backgroundColor: sale.paymentStatus === 'paid' ? '#ecfdf5' : sale.paymentStatus === 'partial' ? '#fffbeb' : '#fef2f2' }}>
          <span className="text-sm font-medium" style={{ color: sale.paymentStatus === 'paid' ? '#059669' : sale.paymentStatus === 'partial' ? '#d97706' : '#dc2626' }}>
            Payment Status: {sale.paymentStatus === 'paid' ? 'Paid' : sale.paymentStatus === 'partial' ? 'Partially Paid' : 'Unpaid'}
            {sale.paymentMethod && ` | Method: ${sale.paymentMethod}`}
            {(sale.amountPaid || 0) > 0 && sale.paymentStatus !== 'paid' && ` | Paid: ${formatSAR(sale.amountPaid || 0)}`}
            {sale.paymentStatus !== 'paid' && ` | Remaining: ${formatSAR(sale.total - (sale.amountPaid || 0))}`}
          </span>
        </div>

        {/* Notes */}
        {sale.notes && (
          <div className="p-3 rounded-lg mb-4" style={{ backgroundColor: '#f9fafb', border: '1px solid #e5e7eb' }}>
            <p className="text-xs font-bold text-dark-400 uppercase mb-1">Notes</p>
            <p className="text-sm text-dark-600 whitespace-pre-wrap">{sale.notes}</p>
          </div>
        )}

        {/* Footer */}
        <div className="pt-4 border-t border-beige-200 text-center space-y-1">
          <p className="text-sm text-dark-600 font-medium">Thank you for your business!</p>
          <p className="text-xs text-dark-400">Tapix | Jeddah, Saudi Arabia | contact@tapix.com</p>
          <p className="text-xs text-dark-400">Commercial Registration: 4030580025</p>
        </div>
      </div>
    </>
  );
});
