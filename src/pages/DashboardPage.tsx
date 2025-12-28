import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../components/layout/Layout';
import { useProfile } from '../hooks/useProfile';
import { useCustomers } from '../hooks/useCustomers';
import { useInvoices } from '../hooks/useInvoices';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { Button } from '../components/ui/Button';
import { CustomerModal } from '../components/customers/CustomerModal';
import { InvoiceForm } from '../components/invoices/InvoiceForm';
import { InvoiceList } from '../components/invoices/InvoiceList';
import { Users, FileText, Plus } from 'lucide-react';
import toast from 'react-hot-toast';

type TabType = 'invoices' | 'customers';

export function DashboardPage() {
  const navigate = useNavigate();
  const { profile, loading: profileLoading } = useProfile();
  const { customers, loading: customersLoading, createCustomer, updateCustomer, deleteCustomer } = useCustomers();
  const { invoices, loading: invoicesLoading, createInvoice } = useInvoices();
  const [activeTab, setActiveTab] = useState<TabType>('invoices');
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [isInvoiceFormOpen, setIsInvoiceFormOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<any>(null);

  useEffect(() => {
    if (!profileLoading && !profile) {
      navigate('/onboarding');
    }
  }, [profile, profileLoading, navigate]);

  const handleCreateCustomer = async (customerData: any) => {
    if (editingCustomer) {
      const { error } = await updateCustomer(editingCustomer.id, customerData);
      if (!error) {
        setIsCustomerModalOpen(false);
        setEditingCustomer(null);
      }
    } else {
      const { error } = await createCustomer(customerData);
      if (!error) {
        setIsCustomerModalOpen(false);
      }
    }
  };

  const handleCreateInvoice = async (invoiceData: any) => {
    const { error } = await createInvoice(invoiceData);
    if (!error) {
      setIsInvoiceFormOpen(false);
      toast.success('Invoice created successfully');
    }
  };

  if (profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!profile) {
    return null;
  }

  const stats = [
    {
      label: 'Total Invoices',
      value: invoices.length,
      icon: FileText,
      color: 'blue'
    },
    {
      label: 'Total Customers',
      value: customers.length,
      icon: Users,
      color: 'green'
    },
    {
      label: 'Total Revenue',
      value: `₹${invoices.reduce((sum, inv) => sum + inv.grand_total, 0).toFixed(2)}`,
      icon: FileText,
      color: 'purple'
    }
  ];

  return (
    <Layout>
      <div>
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 break-words">
            Welcome back, {profile.user_name}!
          </h1>
          <p className="text-sm sm:text-base text-gray-600 break-words">{profile.company_name}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {stats.map((stat) => (
            <div key={stat.label} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <div className={`bg-${stat.color}-100 p-3 rounded-full`}>
                  <stat.icon className={`w-6 h-6 text-${stat.color}-600`} />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="border-b border-gray-200">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center px-4 sm:px-6 py-4 gap-4">
              <nav className="flex space-x-4 sm:space-x-8 w-full sm:w-auto overflow-x-auto">
                <button
                  onClick={() => setActiveTab('invoices')}
                  className={`pb-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
                    activeTab === 'invoices'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <FileText className="w-4 h-4 sm:w-5 sm:h-5 inline mr-1 sm:mr-2" />
                  Invoices
                </button>
                <button
                  onClick={() => setActiveTab('customers')}
                  className={`pb-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
                    activeTab === 'customers'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Users className="w-4 h-4 sm:w-5 sm:h-5 inline mr-1 sm:mr-2" />
                  Customers
                </button>
              </nav>
              <Button
                onClick={() => {
                  if (activeTab === 'invoices') {
                    if (customers.length === 0) {
                      toast.error('Please add a customer first');
                      setActiveTab('customers');
                      setIsCustomerModalOpen(true);
                    } else {
                      setIsInvoiceFormOpen(true);
                    }
                  } else {
                    setIsCustomerModalOpen(true);
                  }
                }}
                className="w-full sm:w-auto"
              >
                <Plus className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                <span className="text-sm sm:text-base">{activeTab === 'invoices' ? 'New Invoice' : 'New Customer'}</span>
              </Button>
            </div>
          </div>

          <div className="p-4 sm:p-6">
            {activeTab === 'invoices' && <InvoiceList />}
            {activeTab === 'customers' && (
              <div className="space-y-4">
                {customersLoading ? (
                  <div className="text-center py-8">Loading customers...</div>
                ) : customers.length === 0 ? (
                  <div className="text-center py-12 bg-gray-50 rounded-lg">
                    <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-4">No customers yet. Add your first customer!</p>
                    <Button onClick={() => setIsCustomerModalOpen(true)}>
                      <Plus className="w-5 h-5 mr-2" />
                      Add Customer
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {customers.map((customer) => (
                      <div key={customer.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-semibold text-gray-900">{customer.name}</h3>
                          <button
                            onClick={() => {
                              setEditingCustomer(customer);
                              setIsCustomerModalOpen(true);
                            }}
                            className="text-blue-600 hover:text-blue-800 text-sm"
                          >
                            Edit
                          </button>
                        </div>
                        <p className="text-sm text-gray-600">{customer.email}</p>
                        <p className="text-sm text-gray-600">{customer.phone}</p>
                        <p className="text-sm text-gray-600 mt-2">{customer.address}</p>
                        {customer.gstin && (
                          <p className="text-sm text-gray-500 mt-2">GSTIN: {customer.gstin}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <CustomerModal
        isOpen={isCustomerModalOpen}
        onClose={() => {
          setIsCustomerModalOpen(false);
          setEditingCustomer(null);
        }}
        onSave={handleCreateCustomer}
        customer={editingCustomer}
      />

      <InvoiceForm
        isOpen={isInvoiceFormOpen}
        onClose={() => setIsInvoiceFormOpen(false)}
        onSave={handleCreateInvoice}
      />
    </Layout>
  );
}
