import { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';
import { useCustomers } from '../../hooks/useCustomers';
import { useProfile } from '../../hooks/useProfile';
import { Plus, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

interface InvoiceItem {
  product_description: string;
  hsn_code: string;
  barcode: string;
  quantity: number;
  rate: number;
  gst_rate: number;
}

interface InvoiceFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (invoice: {
    customer_id: string;
    invoice_date: string;
    transport_mode: string;
    vehicle_number: string;
    reverse_charge: boolean;
    place_of_supply: string;
    ship_to_same: boolean;
    ship_to_name?: string;
    ship_to_address?: string;
    ship_to_gstin?: string;
    ship_to_state?: string;
    ship_to_state_code?: string;
    terms_conditions: string;
    items: InvoiceItem[];
  }) => Promise<void>;
}

export function InvoiceForm({ isOpen, onClose, onSave }: InvoiceFormProps) {
  const { customers, loading: customersLoading, refetch } = useCustomers();
  const { profile } = useProfile();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      refetch();
    }
  }, [isOpen]);

  const [formData, setFormData] = useState({
    customer_id: '',
    invoice_date: format(new Date(), 'yyyy-MM-dd'),
    transport_mode: 'Road',
    vehicle_number: '',
    reverse_charge: false,
    place_of_supply: '',
    ship_to_same: true,
    ship_to_name: '',
    ship_to_address: '',
    ship_to_gstin: '',
    ship_to_state: '',
    ship_to_state_code: '',
    terms_conditions: profile?.default_terms || ''
  });

  const [items, setItems] = useState<InvoiceItem[]>([
    { product_description: '', hsn_code: '', barcode: '', quantity: 1, rate: 0, gst_rate: 18 }
  ]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const selectedCustomer = customers.find(c => c.id === formData.customer_id);

  useEffect(() => {
    if (selectedCustomer) {
      setFormData(prev => ({
        ...prev,
        place_of_supply: selectedCustomer.state || ''
      }));
    }
  }, [selectedCustomer]);

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.customer_id) newErrors.customer_id = 'Customer is required';
    if (!formData.invoice_date) newErrors.invoice_date = 'Invoice date is required';
    if (!formData.place_of_supply) newErrors.place_of_supply = 'Place of supply is required';

    const hasValidItems = items.some(item =>
      item.product_description.trim() && item.quantity > 0 && item.rate > 0
    );

    if (!hasValidItems) {
      newErrors.items = 'At least one valid item is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    const validItems = items.filter(item =>
      item.product_description.trim() && item.quantity > 0 && item.rate > 0
    );

    setLoading(true);
    try {
      await onSave({
        ...formData,
        items: validItems
      });
      onClose();
      resetForm();
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      customer_id: '',
      invoice_date: format(new Date(), 'yyyy-MM-dd'),
      transport_mode: 'Road',
      vehicle_number: '',
      reverse_charge: false,
      place_of_supply: '',
      ship_to_same: true,
      ship_to_name: '',
      ship_to_address: '',
      ship_to_gstin: '',
      ship_to_state: '',
      ship_to_state_code: '',
      terms_conditions: profile?.default_terms || ''
    });
    setItems([{ product_description: '', hsn_code: '', barcode: '', quantity: 1, rate: 0, gst_rate: 18 }]);
    setErrors({});
  };

  const addItem = () => {
    setItems([...items, { product_description: '', hsn_code: '', barcode: '', quantity: 1, rate: 0, gst_rate: 18 }]);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const updateItem = (index: number, field: keyof InvoiceItem, value: string | number) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const calculateItemAmount = (item: InvoiceItem) => {
    return item.quantity * item.rate;
  };

  const calculateItemTaxableValue = (item: InvoiceItem) => {
    return item.quantity * item.rate;
  };

  const calculateItemCGST = (item: InvoiceItem) => {
    const taxableValue = calculateItemTaxableValue(item);
    return (taxableValue * item.gst_rate) / 200;
  };

  const calculateItemSGST = (item: InvoiceItem) => {
    const taxableValue = calculateItemTaxableValue(item);
    return (taxableValue * item.gst_rate) / 200;
  };

  const calculateItemTotal = (item: InvoiceItem) => {
    const taxableValue = calculateItemTaxableValue(item);
    const cgst = calculateItemCGST(item);
    const sgst = calculateItemSGST(item);
    return taxableValue + cgst + sgst;
  };

  const calculateTotals = () => {
    const subtotal = items.reduce((sum, item) => sum + calculateItemAmount(item), 0);
    const cgstTotal = items.reduce((sum, item) => sum + calculateItemCGST(item), 0);
    const sgstTotal = items.reduce((sum, item) => sum + calculateItemSGST(item), 0);
    const totalTax = cgstTotal + sgstTotal;
    const grandTotal = subtotal + totalTax;

    return { subtotal, cgstTotal, sgstTotal, totalTax, grandTotal };
  };

  const totals = calculateTotals();

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create GST Invoice" size="large">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select
            label="Customer (Bill To Party)"
            value={formData.customer_id}
            onChange={(e) => setFormData({ ...formData, customer_id: e.target.value })}
            error={errors.customer_id}
            required
          >
            <option value="">Select a customer</option>
            {customers.map((customer) => (
              <option key={customer.id} value={customer.id}>
                {customer.name}
              </option>
            ))}
          </Select>

          <Input
            label="Invoice Date"
            type="date"
            value={formData.invoice_date}
            onChange={(e) => setFormData({ ...formData, invoice_date: e.target.value })}
            error={errors.invoice_date}
            required
          />

          <Select
            label="Transport Mode"
            value={formData.transport_mode}
            onChange={(e) => setFormData({ ...formData, transport_mode: e.target.value })}
          >
            <option value="Road">Road</option>
            <option value="Rail">Rail</option>
            <option value="Air">Air</option>
            <option value="Ship">Ship</option>
          </Select>

          <Input
            label="Vehicle Number"
            value={formData.vehicle_number}
            onChange={(e) => setFormData({ ...formData, vehicle_number: e.target.value })}
            placeholder="e.g., KA01AB1234"
          />

          <Input
            label="Place of Supply"
            value={formData.place_of_supply}
            onChange={(e) => setFormData({ ...formData, place_of_supply: e.target.value })}
            error={errors.place_of_supply}
            required
            placeholder="e.g., KARNATAKA"
          />

          <div className="flex items-center pt-6">
            <input
              type="checkbox"
              id="reverse_charge"
              checked={formData.reverse_charge}
              onChange={(e) => setFormData({ ...formData, reverse_charge: e.target.checked })}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="reverse_charge" className="ml-2 text-sm text-gray-700">
              Reverse Charge
            </label>
          </div>
        </div>

        <div className="border-t pt-4">
          <div className="flex items-center mb-2">
            <input
              type="checkbox"
              id="ship_to_same"
              checked={formData.ship_to_same}
              onChange={(e) => setFormData({ ...formData, ship_to_same: e.target.checked })}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="ship_to_same" className="ml-2 text-sm font-medium text-gray-700">
              Ship To Party same as Bill To Party
            </label>
          </div>

          {!formData.ship_to_same && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <Input
                label="Ship To Name"
                value={formData.ship_to_name}
                onChange={(e) => setFormData({ ...formData, ship_to_name: e.target.value })}
              />
              <Input
                label="Ship To Address"
                value={formData.ship_to_address}
                onChange={(e) => setFormData({ ...formData, ship_to_address: e.target.value })}
              />
              <Input
                label="Ship To GSTIN"
                value={formData.ship_to_gstin}
                onChange={(e) => setFormData({ ...formData, ship_to_gstin: e.target.value })}
              />
              <Input
                label="Ship To State"
                value={formData.ship_to_state}
                onChange={(e) => setFormData({ ...formData, ship_to_state: e.target.value })}
              />
              <Input
                label="Ship To State Code"
                value={formData.ship_to_state_code}
                onChange={(e) => setFormData({ ...formData, ship_to_state_code: e.target.value })}
              />
            </div>
          )}
        </div>

        <div className="border-t pt-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold">Invoice Items</h3>
            <Button type="button" variant="outline" size="sm" onClick={addItem}>
              <Plus className="w-4 h-4 mr-1" />
              Add Item
            </Button>
          </div>
          {errors.items && <p className="text-sm text-red-600 mb-2">{errors.items}</p>}

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-2 py-2 text-left text-xs font-medium text-gray-700">S.No</th>
                  <th className="px-2 py-2 text-left text-xs font-medium text-gray-700">Product/Service</th>
                  <th className="px-2 py-2 text-left text-xs font-medium text-gray-700">HSN</th>
                  <th className="px-2 py-2 text-left text-xs font-medium text-gray-700">Barcode</th>
                  <th className="px-2 py-2 text-right text-xs font-medium text-gray-700">Qty</th>
                  <th className="px-2 py-2 text-right text-xs font-medium text-gray-700">Rate</th>
                  <th className="px-2 py-2 text-right text-xs font-medium text-gray-700">Amount</th>
                  <th className="px-2 py-2 text-right text-xs font-medium text-gray-700">GST %</th>
                  <th className="px-2 py-2 text-right text-xs font-medium text-gray-700">CGST</th>
                  <th className="px-2 py-2 text-right text-xs font-medium text-gray-700">SGST</th>
                  <th className="px-2 py-2 text-right text-xs font-medium text-gray-700">Total</th>
                  <th className="px-2 py-2"></th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, index) => (
                  <tr key={index} className="border-t">
                    <td className="px-2 py-2">{index + 1}</td>
                    <td className="px-2 py-2">
                      <Input
                        placeholder="Product/Service"
                        value={item.product_description}
                        onChange={(e) => updateItem(index, 'product_description', e.target.value)}
                      />
                    </td>
                    <td className="px-2 py-2">
                      <Input
                        placeholder="HSN Code"
                        value={item.hsn_code}
                        onChange={(e) => updateItem(index, 'hsn_code', e.target.value)}
                      />
                    </td>
                    <td className="px-2 py-2">
                      <Input
                        placeholder="Barcode (optional)"
                        value={item.barcode}
                        onChange={(e) => updateItem(index, 'barcode', e.target.value)}
                      />
                    </td>
                    <td className="px-2 py-2">
                      <Input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => updateItem(index, 'quantity', parseFloat(e.target.value) || 0)}
                        min="0"
                        step="0.01"
                      />
                    </td>
                    <td className="px-2 py-2">
                      <Input
                        type="number"
                        value={item.rate}
                        onChange={(e) => updateItem(index, 'rate', parseFloat(e.target.value) || 0)}
                        min="0"
                        step="0.01"
                      />
                    </td>
                    <td className="px-2 py-2 text-right">
                      ₹{calculateItemAmount(item).toFixed(2)}
                    </td>
                    <td className="px-2 py-2">
                      <Input
                        type="number"
                        value={item.gst_rate}
                        onChange={(e) => updateItem(index, 'gst_rate', parseFloat(e.target.value) || 0)}
                        min="0"
                        max="100"
                        step="0.01"
                      />
                    </td>
                    <td className="px-2 py-2 text-right">
                      ₹{calculateItemCGST(item).toFixed(2)}
                    </td>
                    <td className="px-2 py-2 text-right">
                      ₹{calculateItemSGST(item).toFixed(2)}
                    </td>
                    <td className="px-2 py-2 text-right font-medium">
                      ₹{calculateItemTotal(item).toFixed(2)}
                    </td>
                    <td className="px-2 py-2">
                      {items.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeItem(index)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 pt-4 border-t flex justify-end">
            <div className="text-right space-y-1">
              <p className="text-sm">Subtotal: <span className="font-medium">₹{totals.subtotal.toFixed(2)}</span></p>
              <p className="text-sm">CGST: <span className="font-medium">₹{totals.cgstTotal.toFixed(2)}</span></p>
              <p className="text-sm">SGST: <span className="font-medium">₹{totals.sgstTotal.toFixed(2)}</span></p>
              <p className="text-sm">Total Tax: <span className="font-medium">₹{totals.totalTax.toFixed(2)}</span></p>
              <p className="text-lg font-bold border-t pt-1">
                Grand Total: ₹{totals.grandTotal.toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Terms & Conditions
          </label>
          <textarea
            value={formData.terms_conditions}
            onChange={(e) => setFormData({ ...formData, terms_conditions: e.target.value })}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter terms and conditions..."
          />
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={loading}>
            Create Invoice
          </Button>
        </div>
      </form>
    </Modal>
  );
}
