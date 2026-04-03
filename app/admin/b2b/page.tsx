'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  HiOutlineCurrencyDollar,
  HiOutlineTrendingUp,
  HiOutlineTrendingDown,
  HiOutlineShoppingCart,
  HiOutlineUsers,
  HiOutlineCube,
  HiOutlineTruck,
  HiOutlineExclamation,
  HiOutlineCalendar,
  HiOutlineChartBar,
  HiOutlineClipboardList,
  HiOutlineCash,
} from 'react-icons/hi';
import { Spinner } from '@/components/ui';
import { b2bApi } from '@/lib/api';

// --- Helpers ---

function formatSAR(value: number): string {
  return `SAR ${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatNumber(value: number): string {
  return value.toLocaleString('en-US');
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

const PERIOD_OPTIONS = [
  { value: 7, label: 'Last 7 days' },
  { value: 30, label: 'Last 30 days' },
  { value: 90, label: 'Last 90 days' },
  { value: 365, label: 'Last year' },
];

const CATEGORY_COLORS = [
  'bg-primary-500',
  'bg-emerald-500',
  'bg-amber-500',
  'bg-rose-500',
  'bg-violet-500',
  'bg-cyan-500',
  'bg-orange-500',
  'bg-indigo-500',
];

const MONTH_NAMES = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

// --- Components ---

function ChangeIndicator({ value }: { value: number }) {
  if (value === 0) return null;
  const isPositive = value >= 0;
  return (
    <span
      className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${
        isPositive ? 'text-emerald-400 bg-emerald-500/15' : 'text-red-400 bg-red-500/15'
      }`}
    >
      {isPositive ? <HiOutlineTrendingUp size={14} /> : <HiOutlineTrendingDown size={14} />}
      {Math.abs(value).toFixed(1)}%
    </span>
  );
}

function PaymentStatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    paid: 'text-emerald-400 bg-emerald-500/15',
    partial: 'text-amber-400 bg-amber-500/15',
    unpaid: 'text-red-400 bg-red-500/15',
    overdue: 'text-red-400 bg-red-500/15',
    pending: 'text-amber-400 bg-amber-500/15',
  };
  return (
    <span
      className={`inline-block px-2.5 py-1 text-xs font-medium rounded-full capitalize ${
        styles[status?.toLowerCase()] || 'text-dark-300 bg-dark-800'
      }`}
    >
      {status}
    </span>
  );
}

// --- Main Page ---

export default function B2BDashboardPage() {
  const [period, setPeriod] = useState(30);

  const { data, isLoading } = useQuery({
    queryKey: ['b2b-dashboard', period],
    queryFn: () => b2bApi.getDashboard({ period }),
  });

  const stats = data?.stats;
  const topProducts = data?.topProducts || [];
  const topClients = data?.topClients || [];
  const recentSales = data?.recentSales || [];
  const expensesByCategory = data?.expensesByCategory || [];
  const salesByMonth = data?.salesByMonth || [];
  const lowStockProducts = data?.lowStockProducts || [];

  const totalExpenseAmount = expensesByCategory.reduce(
    (sum: number, cat: any) => sum + (cat.total || 0),
    0
  );
  const maxMonthlyRevenue = Math.max(
    ...salesByMonth.map((m: any) => m.revenue || 0),
    1
  );

  // Stat cards definition
  const statCards = [
    {
      label: 'Total Revenue',
      value: formatSAR(stats?.totalRevenue || 0),
      change: stats?.revenueChange,
      icon: HiOutlineCurrencyDollar,
      iconBg: 'bg-primary-600/15',
      iconColor: 'text-primary-400',
    },
    {
      label: 'Total Profit',
      value: formatSAR(stats?.totalProfit || 0),
      change: stats?.profitChange,
      icon: HiOutlineTrendingUp,
      iconBg: 'bg-emerald-500/15',
      iconColor: 'text-emerald-400',
    },
    {
      label: 'Net Profit',
      value: formatSAR(stats?.netProfit || 0),
      icon: HiOutlineCash,
      iconBg: (stats?.netProfit || 0) >= 0 ? 'bg-emerald-500/15' : 'bg-red-500/15',
      iconColor: (stats?.netProfit || 0) >= 0 ? 'text-emerald-400' : 'text-red-400',
    },
    {
      label: 'Total Expenses',
      value: formatSAR(stats?.totalExpenses || 0),
      change: stats?.expenseChange,
      icon: HiOutlineClipboardList,
      iconBg: 'bg-red-500/15',
      iconColor: 'text-red-400',
    },
    {
      label: 'Total Sales',
      value: formatNumber(stats?.totalSales || 0),
      icon: HiOutlineShoppingCart,
      iconBg: 'bg-primary-600/15',
      iconColor: 'text-primary-400',
    },
    {
      label: 'Total Products',
      value: formatNumber(stats?.totalProducts || 0),
      icon: HiOutlineCube,
      iconBg: 'bg-violet-500/15',
      iconColor: 'text-violet-400',
    },
    {
      label: 'Total Clients',
      value: formatNumber(stats?.totalClients || 0),
      icon: HiOutlineUsers,
      iconBg: 'bg-cyan-500/15',
      iconColor: 'text-cyan-400',
    },
    {
      label: 'Total Suppliers',
      value: formatNumber(stats?.totalSuppliers || 0),
      icon: HiOutlineTruck,
      iconBg: 'bg-amber-500/15',
      iconColor: 'text-amber-400',
    },
    {
      label: 'Inventory Value',
      value: formatSAR(stats?.inventoryValue || 0),
      subtitle: `${formatNumber(stats?.inventoryItems || 0)} items`,
      icon: HiOutlineChartBar,
      iconBg: 'bg-indigo-500/15',
      iconColor: 'text-indigo-400',
    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">B2B Dashboard</h1>
          <p className="text-dark-400 mt-1">Wholesale business overview and analytics</p>
        </div>
        <div className="flex items-center gap-2">
          <HiOutlineCalendar className="text-dark-400" size={20} />
          <select
            value={period}
            onChange={(e) => setPeriod(Number(e.target.value))}
            className="px-4 py-2 bg-dark-800 border border-dark-700 text-white rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
          >
            {PERIOD_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4">
        {statCards.map((card, index) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.04 }}
            className="bg-dark-800 rounded-xl p-5 border border-dark-700/50 hover:border-dark-600 transition-colors"
          >
            <div className="flex items-start justify-between">
              <div className={`p-2.5 rounded-lg ${card.iconBg}`}>
                <card.icon size={20} className={card.iconColor} />
              </div>
              {card.change !== undefined && <ChangeIndicator value={card.change} />}
            </div>
            <div className="mt-3">
              <p className="text-2xl font-semibold text-white">{card.value}</p>
              <p className="text-dark-400 text-sm mt-0.5">{card.label}</p>
              {card.subtitle && (
                <p className="text-dark-400 text-xs mt-0.5">{card.subtitle}</p>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Sales by Month Chart */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-dark-800 rounded-xl border border-dark-700/50"
      >
        <div className="px-6 py-4 border-b border-dark-700/50">
          <h3 className="text-lg font-semibold text-white">Sales by Month</h3>
          <p className="text-sm text-dark-400 mt-0.5">Revenue, cost, and profit trends</p>
        </div>
        <div className="p-6">
          {salesByMonth.length === 0 ? (
            <p className="text-dark-400 text-center py-8">No monthly data available</p>
          ) : (
            <div className="space-y-3">
              {/* Legend */}
              <div className="flex items-center gap-6 text-xs text-dark-300 mb-4">
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-sm bg-primary-500" /> Revenue
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-sm bg-amber-500" /> Cost
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-sm bg-emerald-500" /> Profit
                </span>
              </div>
              {salesByMonth.map((month: any) => {
                const monthLabel =
                  typeof month.month === 'number'
                    ? MONTH_NAMES[month.month - 1] || month.month
                    : month.month;
                const revenueWidth = ((month.revenue || 0) / maxMonthlyRevenue) * 100;
                const costWidth = ((month.cost || 0) / maxMonthlyRevenue) * 100;
                const profitWidth = ((month.profit || 0) / maxMonthlyRevenue) * 100;
                return (
                  <div key={month.month} className="group">
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-dark-400 w-10 shrink-0 font-medium">
                        {monthLabel}
                      </span>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <div
                            className="h-4 bg-primary-500/80 rounded-sm transition-all group-hover:bg-primary-400"
                            style={{ width: `${Math.max(revenueWidth, 1)}%` }}
                          />
                          <span className="text-xs text-dark-300 whitespace-nowrap">
                            {formatSAR(month.revenue || 0)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div
                            className="h-4 bg-amber-500/80 rounded-sm transition-all group-hover:bg-amber-400"
                            style={{ width: `${Math.max(costWidth, 1)}%` }}
                          />
                          <span className="text-xs text-dark-300 whitespace-nowrap">
                            {formatSAR(month.cost || 0)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div
                            className="h-4 bg-emerald-500/80 rounded-sm transition-all group-hover:bg-emerald-400"
                            style={{ width: `${Math.max(profitWidth, 1)}%` }}
                          />
                          <span className="text-xs text-dark-300 whitespace-nowrap">
                            {formatSAR(month.profit || 0)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 mt-0.5 mb-2">
                      <span className="w-10" />
                      <span className="text-[10px] text-dark-400">
                        {formatNumber(month.count || 0)} sales
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </motion.div>

      {/* Middle row: Top Products + Top Clients */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top 5 Selling Products */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="bg-dark-800 rounded-xl border border-dark-700/50"
        >
          <div className="px-6 py-4 border-b border-dark-700/50">
            <h3 className="text-lg font-semibold text-white">Top Selling Products</h3>
            <p className="text-sm text-dark-400 mt-0.5">Best performers by revenue</p>
          </div>
          <div className="overflow-x-auto">
            {topProducts.length === 0 ? (
              <p className="text-dark-400 text-center py-8">No product data</p>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-dark-700/50">
                    <th className="text-left px-6 py-3 text-xs font-semibold text-dark-400 uppercase tracking-wider">
                      Product
                    </th>
                    <th className="text-right px-6 py-3 text-xs font-semibold text-dark-400 uppercase tracking-wider">
                      Sold
                    </th>
                    <th className="text-right px-6 py-3 text-xs font-semibold text-dark-400 uppercase tracking-wider">
                      Revenue
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {topProducts.slice(0, 5).map((product: any, i: number) => (
                    <tr
                      key={product._id}
                      className="border-b border-dark-700/30 last:border-0 hover:bg-dark-700/30 transition-colors"
                    >
                      <td className="px-6 py-3">
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-dark-400 font-mono w-5">
                            #{i + 1}
                          </span>
                          <span className="text-sm text-white font-medium truncate max-w-[200px]">
                            {product.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-3 text-right text-sm text-dark-300">
                        {formatNumber(product.totalSold)}
                      </td>
                      <td className="px-6 py-3 text-right text-sm text-emerald-400 font-medium">
                        {formatSAR(product.totalRevenue)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </motion.div>

        {/* Top 5 Clients */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-dark-800 rounded-xl border border-dark-700/50"
        >
          <div className="px-6 py-4 border-b border-dark-700/50">
            <h3 className="text-lg font-semibold text-white">Top Clients</h3>
            <p className="text-sm text-dark-400 mt-0.5">Highest spending customers</p>
          </div>
          <div className="overflow-x-auto">
            {topClients.length === 0 ? (
              <p className="text-dark-400 text-center py-8">No client data</p>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-dark-700/50">
                    <th className="text-left px-6 py-3 text-xs font-semibold text-dark-400 uppercase tracking-wider">
                      Client
                    </th>
                    <th className="text-right px-6 py-3 text-xs font-semibold text-dark-400 uppercase tracking-wider">
                      Spent
                    </th>
                    <th className="text-right px-6 py-3 text-xs font-semibold text-dark-400 uppercase tracking-wider">
                      Orders
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {topClients.slice(0, 5).map((client: any) => (
                    <tr
                      key={client._id}
                      className="border-b border-dark-700/30 last:border-0 hover:bg-dark-700/30 transition-colors"
                    >
                      <td className="px-6 py-3">
                        <div>
                          <p className="text-sm text-white font-medium">{client.name}</p>
                          {client.companyName && (
                            <p className="text-xs text-dark-400">{client.companyName}</p>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-3 text-right text-sm text-primary-400 font-medium">
                        {formatSAR(client.totalSpent)}
                      </td>
                      <td className="px-6 py-3 text-right text-sm text-dark-300">
                        {formatNumber(client.orderCount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </motion.div>
      </div>

      {/* Expenses by Category */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45 }}
        className="bg-dark-800 rounded-xl border border-dark-700/50"
      >
        <div className="px-6 py-4 border-b border-dark-700/50">
          <h3 className="text-lg font-semibold text-white">Expenses by Category</h3>
          <p className="text-sm text-dark-400 mt-0.5">
            Total: {formatSAR(totalExpenseAmount)}
          </p>
        </div>
        <div className="p-6">
          {expensesByCategory.length === 0 ? (
            <p className="text-dark-400 text-center py-8">No expense data</p>
          ) : (
            <div className="space-y-4">
              {/* Stacked bar */}
              <div className="flex h-8 rounded-lg overflow-hidden bg-dark-900">
                {expensesByCategory.map((cat: any, i: number) => {
                  const pct = totalExpenseAmount > 0 ? (cat.total / totalExpenseAmount) * 100 : 0;
                  return (
                    <div
                      key={cat._id}
                      className={`${CATEGORY_COLORS[i % CATEGORY_COLORS.length]} transition-all hover:opacity-80`}
                      style={{ width: `${pct}%` }}
                      title={`${cat._id}: ${formatSAR(cat.total)} (${pct.toFixed(1)}%)`}
                    />
                  );
                })}
              </div>
              {/* Legend */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {expensesByCategory.map((cat: any, i: number) => {
                  const pct = totalExpenseAmount > 0 ? (cat.total / totalExpenseAmount) * 100 : 0;
                  return (
                    <div key={cat._id} className="flex items-center gap-2">
                      <span
                        className={`w-3 h-3 rounded-sm shrink-0 ${CATEGORY_COLORS[i % CATEGORY_COLORS.length]}`}
                      />
                      <div className="min-w-0">
                        <p className="text-sm text-white truncate capitalize">{cat._id}</p>
                        <p className="text-xs text-dark-400">
                          {formatSAR(cat.total)} ({pct.toFixed(1)}%)
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* Recent Sales */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-dark-800 rounded-xl border border-dark-700/50"
      >
        <div className="px-6 py-4 border-b border-dark-700/50 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-white">Recent Sales</h3>
            <p className="text-sm text-dark-400 mt-0.5">Last 10 transactions</p>
          </div>
          <Link
            href="/admin/b2b/sales"
            className="text-sm text-primary-400 hover:text-primary-300 transition-colors"
          >
            View all
          </Link>
        </div>
        <div className="overflow-x-auto">
          {recentSales.length === 0 ? (
            <p className="text-dark-400 text-center py-8">No recent sales</p>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-dark-700/50">
                  <th className="text-left px-6 py-3 text-xs font-semibold text-dark-400 uppercase tracking-wider">
                    Invoice
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-dark-400 uppercase tracking-wider">
                    Client
                  </th>
                  <th className="text-right px-6 py-3 text-xs font-semibold text-dark-400 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="text-right px-6 py-3 text-xs font-semibold text-dark-400 uppercase tracking-wider">
                    Profit
                  </th>
                  <th className="text-center px-6 py-3 text-xs font-semibold text-dark-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="text-right px-6 py-3 text-xs font-semibold text-dark-400 uppercase tracking-wider">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody>
                {recentSales.slice(0, 10).map((sale: any) => (
                  <tr
                    key={sale._id}
                    className="border-b border-dark-700/30 last:border-0 hover:bg-dark-700/30 transition-colors"
                  >
                    <td className="px-6 py-3">
                      <span className="text-sm text-primary-400 font-mono font-medium">
                        {sale.invoiceNumber}
                      </span>
                    </td>
                    <td className="px-6 py-3">
                      <div>
                        <p className="text-sm text-white">{sale.client?.name || '-'}</p>
                        {sale.client?.companyName && (
                          <p className="text-xs text-dark-400">{sale.client.companyName}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-3 text-right text-sm text-white font-medium">
                      {formatSAR(sale.total)}
                    </td>
                    <td className="px-6 py-3 text-right text-sm">
                      <span className={sale.profit >= 0 ? 'text-emerald-400' : 'text-red-400'}>
                        {formatSAR(sale.profit)}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-center">
                      <PaymentStatusBadge status={sale.paymentStatus} />
                    </td>
                    <td className="px-6 py-3 text-right text-sm text-dark-300">
                      {formatDate(sale.saleDate)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </motion.div>

      {/* Low Stock Alert */}
      {lowStockProducts.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55 }}
          className="bg-dark-800 rounded-xl border border-red-500/30"
        >
          <div className="px-6 py-4 border-b border-dark-700/50 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-red-500/15">
              <HiOutlineExclamation size={20} className="text-red-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Low Stock Alert</h3>
              <p className="text-sm text-dark-400 mt-0.5">
                {lowStockProducts.length} product{lowStockProducts.length !== 1 ? 's' : ''} running low
              </p>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-dark-700/50">
                  <th className="text-left px-6 py-3 text-xs font-semibold text-dark-400 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="text-right px-6 py-3 text-xs font-semibold text-dark-400 uppercase tracking-wider">
                    Remaining
                  </th>
                  <th className="text-right px-6 py-3 text-xs font-semibold text-dark-400 uppercase tracking-wider">
                    Unit Cost
                  </th>
                  <th className="text-right px-6 py-3 text-xs font-semibold text-dark-400 uppercase tracking-wider">
                    Stock Value
                  </th>
                </tr>
              </thead>
              <tbody>
                {lowStockProducts.map((product: any) => (
                  <tr
                    key={product._id}
                    className="border-b border-dark-700/30 last:border-0 hover:bg-dark-700/30 transition-colors"
                  >
                    <td className="px-6 py-3 text-sm text-white font-medium">
                      {product.name}
                    </td>
                    <td className="px-6 py-3 text-right">
                      <span
                        className={`text-sm font-medium ${
                          product.quantity <= 5 ? 'text-red-400' : 'text-amber-400'
                        }`}
                      >
                        {formatNumber(product.quantity)}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-right text-sm text-dark-300">
                      {formatSAR(product.costPerUnit)}
                    </td>
                    <td className="px-6 py-3 text-right text-sm text-dark-300">
                      {formatSAR(product.quantity * product.costPerUnit)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}
    </div>
  );
}
