'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm, Controller } from 'react-hook-form';
import { motion } from 'framer-motion';
import {
  HiOutlinePlus,
  HiOutlinePencil,
  HiOutlineTrash,
  HiOutlineCurrencyDollar,
  HiOutlineCalendar,
  HiOutlineRefresh,
  HiOutlineChartBar,
} from 'react-icons/hi';
import { Card, Button, Modal, ConfirmModal } from '@/components/ui';
import { b2bApi } from '@/lib/api';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

// --- Types ---

interface Expense {
  _id: string;
  title: string;
  amount: number;
  category: string;
  date: string;
  description?: string;
  isRecurring: boolean;
  recurringFrequency?: string;
}

interface ExpenseFormData {
  title: string;
  amount: number;
  category: string;
  date: string;
  description?: string;
  isRecurring: boolean;
  recurringFrequency?: string;
}

// --- Constants ---

const CATEGORIES = [
  'salaries',
  'rent',
  'utilities',
  'marketing',
  'shipping',
  'packaging',
  'software',
  'equipment',
  'transportation',
  'food',
  'maintenance',
  'other',
] as const;

const categoryFilterOptions = [
  { value: '', label: 'All Categories' },
  ...CATEGORIES.map((c) => ({ value: c, label: c.charAt(0).toUpperCase() + c.slice(1) })),
];

const frequencyOptions = [
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly' },
  { value: 'yearly', label: 'Yearly' },
];

const categoryColors: Record<string, string> = {
  salaries: 'bg-green-100 text-green-700',
  rent: 'bg-yellow-100 text-yellow-700',
  utilities: 'bg-cyan-100 text-cyan-700',
  marketing: 'bg-primary-100 text-primary-700',
  shipping: 'bg-purple-100 text-purple-700',
  packaging: 'bg-amber-100 text-amber-700',
  software: 'bg-indigo-100 text-indigo-700',
  equipment: 'bg-pink-100 text-pink-700',
  transportation: 'bg-blue-100 text-blue-700',
  food: 'bg-orange-100 text-orange-700',
  maintenance: 'bg-teal-100 text-teal-700',
  other: 'bg-gray-100 text-gray-700',
};

function formatSAR(amount: number): string {
  return `SAR ${amount.toLocaleString('en-SA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function getTodayString(): string {
  return new Date().toISOString().split('T')[0];
}

// --- Component ---

export default function B2BExpensesPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [category, setCategory] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; id: string; title: string }>({
    isOpen: false,
    id: '',
    title: '',
  });

  const limit = 20;

  // --- Query ---
  const { data, isLoading } = useQuery({
    queryKey: ['b2b-expenses', page, category, startDate, endDate],
    queryFn: () =>
      b2bApi.getExpenses({
        page,
        limit,
        category: category || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      }),
  });

  const expenses: Expense[] = data?.expenses || [];
  const totalAmount: number = data?.totalAmount || 0;
  const pagination = data?.pagination;

  // --- Form ---
  const {
    register,
    handleSubmit,
    reset,
    watch,
    control,
    formState: { errors },
  } = useForm<ExpenseFormData>({
    defaultValues: {
      title: '',
      amount: 0,
      category: '',
      date: getTodayString(),
      description: '',
      isRecurring: false,
      recurringFrequency: '',
    },
  });

  const watchIsRecurring = watch('isRecurring');

  const openAddModal = () => {
    setEditingExpense(null);
    reset({
      title: '',
      amount: 0,
      category: '',
      date: getTodayString(),
      description: '',
      isRecurring: false,
      recurringFrequency: '',
    });
    setModalOpen(true);
  };

  const openEditModal = (expense: Expense) => {
    setEditingExpense(expense);
    reset({
      title: expense.title,
      amount: expense.amount,
      category: expense.category,
      date: expense.date ? expense.date.split('T')[0] : getTodayString(),
      description: expense.description || '',
      isRecurring: expense.isRecurring || false,
      recurringFrequency: expense.recurringFrequency || '',
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingExpense(null);
  };

  // --- Mutations ---
  const createMutation = useMutation({
    mutationFn: (data: ExpenseFormData) => b2bApi.createExpense(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['b2b-expenses'] });
      toast.success('Expense created successfully');
      closeModal();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create expense');
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: ExpenseFormData) => b2bApi.updateExpense(editingExpense!._id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['b2b-expenses'] });
      toast.success('Expense updated successfully');
      closeModal();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update expense');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => b2bApi.deleteExpense(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['b2b-expenses'] });
      toast.success('Expense deleted successfully');
      setDeleteModal({ isOpen: false, id: '', title: '' });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete expense');
    },
  });

  const onSubmit = (data: ExpenseFormData) => {
    const payload = {
      ...data,
      amount: Number(data.amount),
      recurringFrequency: data.isRecurring ? data.recurringFrequency : undefined,
    };
    if (editingExpense) {
      updateMutation.mutate(payload);
    } else {
      createMutation.mutate(payload);
    }
  };

  const isSaving = createMutation.isPending || updateMutation.isPending;

  // --- Derive summary cards from expenses ---
  const categorySummary = expenses.reduce<Record<string, number>>((acc, exp) => {
    acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
    return acc;
  }, {});

  const topCategories = Object.entries(categorySummary)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  // --- Render ---
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-dark-900">B2B Expenses</h1>
          <p className="text-dark-500 mt-1">Track and manage business-to-business expenses</p>
        </div>
        <Button leftIcon={<HiOutlinePlus size={18} />} onClick={openAddModal}>
          Add Expense
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Expenses */}
        <Card padding="md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center">
              <HiOutlineCurrencyDollar className="text-primary-600" size={22} />
            </div>
            <div>
              <p className="text-xs font-semibold text-dark-500 uppercase">Total Expenses</p>
              <p className="text-lg font-bold text-dark-900">{formatSAR(totalAmount)}</p>
            </div>
          </div>
        </Card>

        {/* Top Categories */}
        {topCategories.map(([cat, amount]) => (
          <Card padding="md" key={cat}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-beige-100 flex items-center justify-center">
                <HiOutlineChartBar className="text-dark-500" size={22} />
              </div>
              <div>
                <p className="text-xs font-semibold text-dark-500 uppercase capitalize">{cat}</p>
                <p className="text-lg font-bold text-dark-900">{formatSAR(amount)}</p>
              </div>
            </div>
          </Card>
        ))}

        {/* Fill empty slots when fewer than 3 top categories */}
        {topCategories.length < 3 &&
          [...Array(3 - topCategories.length)].map((_, i) => (
            <Card padding="md" key={`empty-${i}`}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-beige-100 flex items-center justify-center">
                  <HiOutlineChartBar className="text-dark-400" size={22} />
                </div>
                <div>
                  <p className="text-xs font-semibold text-dark-400 uppercase">No data</p>
                  <p className="text-lg font-bold text-dark-300">--</p>
                </div>
              </div>
            </Card>
          ))}
      </div>

      {/* Filters */}
      <Card padding="md">
        <div className="flex flex-col sm:flex-row gap-4">
          <select
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2.5 border border-beige-300 rounded-lg text-sm text-dark-900 focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white w-full sm:w-52"
          >
            {categoryFilterOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <div className="flex gap-2 flex-1">
            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2.5 border border-beige-300 rounded-lg text-sm text-dark-900 focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white flex-1 sm:flex-none sm:w-44"
              placeholder="Start date"
            />
            <input
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2.5 border border-beige-300 rounded-lg text-sm text-dark-900 focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white flex-1 sm:flex-none sm:w-44"
              placeholder="End date"
            />
          </div>
          {(category || startDate || endDate) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setCategory('');
                setStartDate('');
                setEndDate('');
                setPage(1);
              }}
              className="text-dark-500"
            >
              Clear Filters
            </Button>
          )}
        </div>
      </Card>

      {/* Expenses Table */}
      <Card padding="none">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-beige-50 border-b border-beige-200">
              <tr>
                <th className="text-left px-6 py-4 text-xs font-semibold text-dark-500 uppercase tracking-wider">
                  Title
                </th>
                <th className="text-right px-6 py-4 text-xs font-semibold text-dark-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-dark-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-dark-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="text-center px-6 py-4 text-xs font-semibold text-dark-500 uppercase tracking-wider">
                  Recurring
                </th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-dark-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="text-right px-6 py-4 text-xs font-semibold text-dark-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-beige-200">
              {isLoading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i}>
                    <td colSpan={7} className="px-6 py-4">
                      <div className="h-4 bg-beige-200 rounded animate-pulse" />
                    </td>
                  </tr>
                ))
              ) : expenses.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-dark-500">
                    No expenses found
                  </td>
                </tr>
              ) : (
                expenses.map((expense) => (
                  <motion.tr
                    key={expense._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-beige-50"
                  >
                    <td className="px-6 py-4 font-medium text-dark-900">{expense.title}</td>
                    <td className="px-6 py-4 text-right font-semibold text-dark-900">
                      {formatSAR(expense.amount)}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={cn(
                          'inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium capitalize',
                          categoryColors[expense.category] || 'bg-gray-100 text-gray-700'
                        )}
                      >
                        {expense.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-dark-600">
                      {new Date(expense.date).toLocaleDateString('en-SA', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {expense.isRecurring ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                          <HiOutlineRefresh size={12} />
                          Yes{expense.recurringFrequency ? ` - ${expense.recurringFrequency}` : ''}
                        </span>
                      ) : (
                        <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                          No
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-dark-500 max-w-xs truncate">
                      {expense.description || '-'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="sm" onClick={() => openEditModal(expense)}>
                          <HiOutlinePencil size={16} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            setDeleteModal({ isOpen: true, id: expense._id, title: expense.title })
                          }
                          className="text-error-600 hover:bg-error-50"
                        >
                          <HiOutlineTrash size={16} />
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
              Showing {(page - 1) * limit + 1} to {Math.min(page * limit, pagination.total)} of{' '}
              {pagination.total} expenses
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

      {/* Add/Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={closeModal}
        title={editingExpense ? 'Edit Expense' : 'Add Expense'}
        size="lg"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-dark-700 mb-1">
              Title <span className="text-error-500">*</span>
            </label>
            <input
              {...register('title', { required: 'Title is required' })}
              className="w-full px-3 py-2 border border-beige-300 rounded-lg text-dark-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Expense title"
            />
            {errors.title && (
              <p className="text-error-500 text-xs mt-1">{errors.title.message}</p>
            )}
          </div>

          {/* Amount + Category */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-dark-700 mb-1">
                Amount (SAR) <span className="text-error-500">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                {...register('amount', {
                  required: 'Amount is required',
                  min: { value: 0.01, message: 'Amount must be greater than 0' },
                  valueAsNumber: true,
                })}
                className="w-full px-3 py-2 border border-beige-300 rounded-lg text-dark-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="0.00"
              />
              {errors.amount && (
                <p className="text-error-500 text-xs mt-1">{errors.amount.message}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-dark-700 mb-1">
                Category <span className="text-error-500">*</span>
              </label>
              <select
                {...register('category', { required: 'Category is required' })}
                className="w-full px-3 py-2 border border-beige-300 rounded-lg text-dark-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white"
              >
                <option value="">Select category</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </option>
                ))}
              </select>
              {errors.category && (
                <p className="text-error-500 text-xs mt-1">{errors.category.message}</p>
              )}
            </div>
          </div>

          {/* Date */}
          <div>
            <label className="block text-sm font-medium text-dark-700 mb-1">
              Date <span className="text-error-500">*</span>
            </label>
            <input
              type="date"
              {...register('date', { required: 'Date is required' })}
              className="w-full px-3 py-2 border border-beige-300 rounded-lg text-dark-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white"
            />
            {errors.date && (
              <p className="text-error-500 text-xs mt-1">{errors.date.message}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-dark-700 mb-1">Description</label>
            <textarea
              {...register('description')}
              rows={3}
              className="w-full px-3 py-2 border border-beige-300 rounded-lg text-dark-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
              placeholder="Optional description..."
            />
          </div>

          {/* Recurring */}
          <div className="space-y-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                {...register('isRecurring')}
                className="w-4 h-4 text-primary-600 border-beige-300 rounded focus:ring-primary-500"
              />
              <span className="text-sm font-medium text-dark-700">Is Recurring</span>
            </label>

            {watchIsRecurring && (
              <div>
                <label className="block text-sm font-medium text-dark-700 mb-1">
                  Recurring Frequency
                </label>
                <select
                  {...register('recurringFrequency')}
                  className="w-full px-3 py-2 border border-beige-300 rounded-lg text-dark-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white"
                >
                  <option value="">Select frequency</option>
                  {frequencyOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" type="button" onClick={closeModal}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? 'Saving...' : editingExpense ? 'Update Expense' : 'Create Expense'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, id: '', title: '' })}
        onConfirm={() => deleteMutation.mutate(deleteModal.id)}
        title="Delete Expense"
        message={`Are you sure you want to delete "${deleteModal.title}"? This action cannot be undone.`}
        confirmText="Delete"
        variant="danger"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
