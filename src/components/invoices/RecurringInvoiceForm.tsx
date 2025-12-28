import { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';
import { useCustomers } from '../../hooks/useCustomers';
import { Plus, Trash2, Repeat } from 'lucide-react';
import { format, addDays, addWeeks, addMonths, addYears } from 'date-fns';
import toast from 'react-hot-toast';

interface RecurringInvoiceItem {
  product_description: string;
  students_staff: string;
  hsn_code: string;
  quantity: number;
  rate: number;
  gst_rate: number;
}

interface RecurringInvoiceFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (invoice: any, items: any[]) => Promise<void>;
}

export function RecurringInvoiceForm({ isOpen, onClose, onSave }: RecurringInvoiceFormProps) {
  const { customers } = useCustomers();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    customer_id: '',
    template_name: '',
    frequency: 'monthly',
    start_date: format(new Date(), 'yyyy-MM-dd'),
    end_date: '',
    transport_mode: 'Road',
    vehicle_number: '',
    reverse_charge: false,
    place_of_supply: '',
    ship_to_same: true,
    terms_conditions: ''
  });

  const [items, setItems] = useState<RecurringInvoiceItem[]>([
    { product_description: '', students_staff: '', hsn_code: '', quantity: 1, rate: 0, gst_rate: 18 }
  ]);

  const calculateNextGenerationDate = (startDate: string, frequency: string) => {
    const date = new Date(startDate);
    switch (frequency) {
      case 'daily':
        return format(addDays(date, 1), 'yyyy-MM-dd');
      case 'weekly':
        return format(addWeeks(date, 1), 'yyyy-MM-dd');
      case 'monthly':
        return format(addMonths(date, 1), 'yyyy-MM-dd');
      case 'quarterly':
        return format(addMonths(date, 3), 'yyyy-MM-dd');
      case 'yearly':
        return format(addYears(date, 1), 'yyyy-MM-dd');
      default:
        return format(addMonths(date, 1), 'yyyy-MM-dd');
    }
  };

  const calculateTotals = () => {
    let subtotal = 0;
    let cgstTotal = 0;
    let sgstTotal = 0;

    const calculatedItems = items.map((item) => {
      const amount = item.rate * item.quantity;
      const taxableValue = amount;
      const gstAmount = (taxableValue * item.gst_rate) / 100;
      const cgst = gstAmount / 2;
      const sgst = gstAmount / 2;

      subtotal += taxableValue;
      cgstTotal += cgst;
      sgstTotal += sgst;

      return {
        ...item,
        amount: parseFloat(amount.toFixed(2)),
        taxable_value: parseFloat(taxableValue.toFixed(2)),
        cgst: parseFloat(cgst.toFixed(2)),
        sgst: parseFloat(sgst.toFixed(2))
      };
    });

    const totalTax = cgstTotal + sgstTotal;
    const grandTotal = subtotal + totalTax;

    return {
      items: calculatedItems,
      subtotal: parseFloat(subtotal.toFixed(2)),
      cgst_total: parseFloat(cgstTotal.toFixed(2)),
      sgst_total: parseFloat(sgstTotal.toFixed(2)),
      total_tax: parseFloat(totalTax.toFixed(2)),
      grand_total: parseFloat(grandTotal.toFixed(2))
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.customer_id || !formData.template_name) {
      toast.error('Please fill in all required fields');
      return;
    }

    const hasValidItems = items.some(item =>
      item.product_description.trim() && item.quantity > 0 && item.rate > 0
    );

    if (!hasValidItems) {
      toast.error('At least one valid item is required');
      return;
    }

    setLoading(true);

    const { items: calculatedItems, ...totals } = calculateTotals();
    const nextGenerationDate = calculateNextGenerationDate(formData.start_date, formData.frequency);

    const invoiceData = {
      ...formData,
      ...totals,
      next_generation_date: nextGenerationDate,
      is_active: true
    };

    await onSave(invoiceData, calculatedItems);
    setLoading(false);
    onClose();
  };

  const addItem = () => {
    setItems([...items, { product_description: '', students_staff: '', hsn_code: '', quantity: 1, rate: 0, gst_rate: 18 }]);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const updateItem = (index: number, field: string, value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const selectedCustomer = customers.find(c => c.id === formData.customer_id);

  useEffect(() => {
    if (selectedCustomer) {
      setFormData(prev => ({
        ...prev,
        place_of_supply: selectedCustomer.state || ''
      }));
    }
  }, [selectedCustomer]);

  const totals = calculateTotals();

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create Recurring Invoice">
      <form onSubmit={handleSubmit} className="space-y-4 max-h-[80vh] overflow-y-auto">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-start gap-2">
          <Repeat className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-blue-900">Recurring Invoice Template</p>
            <p className="text-xs text-blue-700">
              Create a template that automatically generates invoices on a schedule
            </p>
          </div>
        </div>

        <Input
          label="Template Name"
          value={formData.template_name}
          onChange={(e) => setFormData({ ...formData, template_name: e.target.value })}
          placeholder="Monthly Service Invoice"
          required
        />

        <Select
          label="Customer"
          value={formData.customer_id}
          onChange={(e) => setFormData({ ...formData, customer_id: e.target.value })}
          required
        >
          <option value="">Select Customer</option>
          {customers.map((customer) => (
            <option key={customer.id} value={customer.id}>
              {customer.name}
            </option>
          ))}
        </Select>

        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Frequency"
            value={formData.frequency}
            onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
            required
          >
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="quarterly">Quarterly</option>
            <option value="yearly">Yearly</option>
          </Select>

          <Input
            type="date"
            label="Start Date"
            value={formData.start_date}
            onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
            required
          />
        </div>

        <Input
          type="date"
          label="End Date (Optional)"
          value={formData.end_date}
          onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
        />

        <div className="border-t pt-4 mt-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium text-gray-900">Invoice Items</h3>
            <Button type="button" onClick={addItem} size="sm" variant="outline">
              <Plus className="w-4 h-4 mr-1" />
              Add Item
            </Button>
          </div>

          <div className="space-y-3">
            {items.map((item, index) => (
              <div key={index} className="border rounded-lg p-3 bg-gray-50">
                <div className="grid grid-cols-2 gap-2 mb-2">
                  <Input
                    label="Product Description"
                    value={item.product_description}
                    onChange={(e) => updateItem(index, 'product_description', e.target.value)}
                    placeholder="Product name"
                  />
                  <Input
                    label="HSN Code"
                    value={item.hsn_code}
                    onChange={(e) => updateItem(index, 'hsn_code', e.target.value)}
                    placeholder="HSN"
                  />
                </div>
                <div className="grid grid-cols-4 gap-2">
                  <Input
                    type="number"
                    label="Quantity"
                    value={item.quantity}
                    onChange={(e) => updateItem(index, 'quantity', parseFloat(e.target.value) || 0)}
                    min={0}
                  />
                  <Input
                    type="number"
                    label="Rate"
                    value={item.rate}
                    onChange={(e) => updateItem(index, 'rate', parseFloat(e.target.value) || 0)}
                    min={0}
                  />
                  <Input
                    type="number"
                    label="GST %"
                    value={item.gst_rate}
                    onChange={(e) => updateItem(index, 'gst_rate', parseFloat(e.target.value) || 0)}
                    min={0}
                    max={100}
                  />
                  <div className="flex items-end">
                    {items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeItem(index)}
                        className="w-full px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4 mx-auto" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-4 border">
          <h3 className="font-medium text-gray-900 mb-3">Invoice Totals</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Subtotal:</span>
              <span className="font-medium">₹{totals.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">CGST:</span>
              <span className="font-medium">₹{totals.cgst_total.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">SGST:</span>
              <span className="font-medium">₹{totals.sgst_total.toFixed(2)}</span>
            </div>
            <div className="flex justify-between pt-2 border-t">
              <span className="font-semibold text-gray-900">Grand Total:</span>
              <span className="font-bold text-lg">₹{totals.grand_total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <Button type="button" onClick={onClose} variant="outline" className="flex-1">
            Cancel
          </Button>
          <Button type="submit" loading={loading} className="flex-1">
            Create Recurring Invoice
          </Button>
        </div>
      </form>
    </Modal>
  );
}
