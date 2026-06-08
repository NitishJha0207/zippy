import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useInvoices } from '../hooks/useInvoices';
import { useCustomers } from '../hooks/useCustomers';
import { useCurrency } from '../hooks/useCurrency';
import { SubscriptionGuard } from '../components/subscription/SubscriptionGuard';
import { Layout } from '../components/layout/Layout';
import { ArrowLeft, TrendingUp, DollarSign, Users, FileText, Calendar, Download } from 'lucide-react';
import { format, startOfMonth, endOfMonth, startOfYear, endOfYear, subMonths, parseISO } from 'date-fns';

export function AnalyticsPage() {
  const navigate = useNavigate();
  const { invoices } = useInvoices();
  const { format: fmtCurrency } = useCurrency();
  const { customers } = useCustomers();
  const [dateRange, setDateRange] = useState<'month' | 'year' | 'all'>('month');

  const filterInvoicesByDate = (invoices: any[], range: string) => {
    const now = new Date();
    switch (range) {
      case 'month':
        return invoices.filter(inv => {
          const invDate = parseISO(inv.invoice_date);
          return invDate >= startOfMonth(now) && invDate <= endOfMonth(now);
        });
      case 'year':
        return invoices.filter(inv => {
          const invDate = parseISO(inv.invoice_date);
          return invDate >= startOfYear(now) && invDate <= endOfYear(now);
        });
      default:
        return invoices;
    }
  };

  const filteredInvoices = filterInvoicesByDate(invoices, dateRange);

  const totalRevenue = filteredInvoices.reduce((sum, inv) => sum + inv.grand_total, 0);
  const paidRevenue = filteredInvoices.filter(inv => inv.status === 'paid').reduce((sum, inv) => sum + inv.grand_total, 0);
  const pendingRevenue = filteredInvoices.filter(inv => inv.status !== 'paid').reduce((sum, inv) => sum + inv.grand_total, 0);
  const overdueRevenue = filteredInvoices.filter(inv => inv.status === 'overdue').reduce((sum, inv) => sum + inv.grand_total, 0);

  const avgInvoiceValue = filteredInvoices.length > 0 ? totalRevenue / filteredInvoices.length : 0;

  const topCustomers = customers
    .map(customer => {
      const customerInvoices = filteredInvoices.filter(inv => inv.customer_id === customer.id);
      const totalSpent = customerInvoices.reduce((sum, inv) => sum + inv.grand_total, 0);
      return {
        ...customer,
        invoiceCount: customerInvoices.length,
        totalSpent
      };
    })
    .filter(c => c.invoiceCount > 0)
    .sort((a, b) => b.totalSpent - a.totalSpent)
    .slice(0, 5);

  const monthlyData = Array.from({ length: 12 }, (_, i) => {
    const date = subMonths(new Date(), 11 - i);
    const monthInvoices = invoices.filter(inv => {
      const invDate = parseISO(inv.invoice_date);
      return invDate.getMonth() === date.getMonth() && invDate.getFullYear() === date.getFullYear();
    });
    return {
      month: format(date, 'MMM'),
      revenue: monthInvoices.reduce((sum, inv) => sum + inv.grand_total, 0),
      count: monthInvoices.length
    };
  });

  const maxRevenue = Math.max(...monthlyData.map(d => d.revenue), 1);

  return (
    <Layout>
      <SubscriptionGuard feature="analytics" overlay>
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
            >
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </button>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 p-2 rounded-lg">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
                <p className="text-gray-600">Insights into your business performance</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setDateRange('month')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  dateRange === 'month'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                This Month
              </button>
              <button
                onClick={() => setDateRange('year')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  dateRange === 'year'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                This Year
              </button>
              <button
                onClick={() => setDateRange('all')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  dateRange === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                All Time
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 text-white">
            <div className="flex items-center justify-between mb-2">
              <DollarSign className="w-8 h-8 opacity-80" />
              <span className="text-sm opacity-80">Total Revenue</span>
            </div>
            <p className="text-3xl font-bold">{fmtCurrency(totalRevenue)}</p>
            <p className="text-sm opacity-80 mt-1">{filteredInvoices.length} invoices</p>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-lg p-6 text-white">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="w-8 h-8 opacity-80" />
              <span className="text-sm opacity-80">Paid</span>
            </div>
            <p className="text-3xl font-bold">{fmtCurrency(paidRevenue)}</p>
            <p className="text-sm opacity-80 mt-1">{((paidRevenue / totalRevenue) * 100 || 0).toFixed(1)}% collected</p>
          </div>

          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg shadow-lg p-6 text-white">
            <div className="flex items-center justify-between mb-2">
              <Calendar className="w-8 h-8 opacity-80" />
              <span className="text-sm opacity-80">Pending</span>
            </div>
            <p className="text-3xl font-bold">{fmtCurrency(pendingRevenue)}</p>
            <p className="text-sm opacity-80 mt-1">Awaiting payment</p>
          </div>

          <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-lg shadow-lg p-6 text-white">
            <div className="flex items-center justify-between mb-2">
              <FileText className="w-8 h-8 opacity-80" />
              <span className="text-sm opacity-80">Overdue</span>
            </div>
            <p className="text-3xl font-bold">{fmtCurrency(overdueRevenue)}</p>
            <p className="text-sm opacity-80 mt-1">Needs attention</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2 bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-6">Revenue Trend (Last 12 Months)</h2>
            <div className="space-y-3">
              {monthlyData.map((data, index) => (
                <div key={index}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-600">{data.month}</span>
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-gray-500">{data.count} invoices</span>
                      <span className="text-sm font-medium">{fmtCurrency(data.revenue)}</span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all"
                      style={{ width: `${(data.revenue / maxRevenue) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-6">Top Customers</h2>
            <div className="space-y-4">
              {topCustomers.length > 0 ? (
                topCustomers.map((customer, index) => (
                  <div key={customer.id} className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 font-semibold">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{customer.name}</p>
                      <p className="text-xs text-gray-500">{customer.invoiceCount} invoices</p>
                    </div>
                    <p className="font-semibold text-gray-900">{fmtCurrency(customer.totalSpent)}</p>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-sm text-center py-8">No customer data yet</p>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <FileText className="w-6 h-6 text-blue-600" />
              <h3 className="font-semibold text-gray-900">Invoice Stats</h3>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Total Invoices:</span>
                <span className="font-semibold">{filteredInvoices.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Avg Value:</span>
                <span className="font-semibold">{fmtCurrency(avgInvoiceValue)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Draft:</span>
                <span className="font-semibold">{filteredInvoices.filter(inv => inv.status === 'draft').length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Sent:</span>
                <span className="font-semibold">{filteredInvoices.filter(inv => inv.status === 'sent').length}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <Users className="w-6 h-6 text-green-600" />
              <h3 className="font-semibold text-gray-900">Customer Stats</h3>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Total Customers:</span>
                <span className="font-semibold">{customers.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Active:</span>
                <span className="font-semibold">{topCustomers.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Avg Revenue:</span>
                <span className="font-semibold">
                  {fmtCurrency(totalRevenue / (topCustomers.length || 1))}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <TrendingUp className="w-6 h-6 text-purple-600" />
              <h3 className="font-semibold text-gray-900">Performance</h3>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Collection Rate:</span>
                <span className="font-semibold">{((paidRevenue / totalRevenue) * 100 || 0).toFixed(1)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Pending Rate:</span>
                <span className="font-semibold">{((pendingRevenue / totalRevenue) * 100 || 0).toFixed(1)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Overdue Rate:</span>
                <span className="font-semibold text-red-600">{((overdueRevenue / totalRevenue) * 100 || 0).toFixed(1)}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      </SubscriptionGuard>
    </Layout>
  );
}
