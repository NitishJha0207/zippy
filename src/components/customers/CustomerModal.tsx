import { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Customer } from '../../types/database.types';
import { validateGSTIN, validateMobile } from '../../lib/utils';

interface CustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (customer: Omit<Customer, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<void>;
  customer?: Customer;
}

export function CustomerModal({ isOpen, onClose, onSave, customer }: CustomerModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: customer?.name || '',
    email: customer?.email || '',
    phone: customer?.phone || '',
    address: customer?.address || '',
    gstin: customer?.gstin || '',
    state: customer?.state || '',
    state_code: customer?.state_code || ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone is required';
    } else if (!validateMobile(formData.phone)) {
      newErrors.phone = 'Invalid phone number';
    }
    if (!formData.address.trim()) newErrors.address = 'Address is required';
    if (!formData.state.trim()) newErrors.state = 'State is required';
    if (formData.gstin.trim() && !validateGSTIN(formData.gstin)) {
      newErrors.gstin = 'Invalid GSTIN format';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    setLoading(true);
    try {
      await onSave({
        ...formData,
        gstin: formData.gstin.trim() || null,
        state_code: formData.state_code.trim() || null
      });
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={customer ? 'Edit Customer' : 'Add Customer'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Customer Name"
          value={formData.name}
          onChange={(e) => handleChange('name', e.target.value)}
          error={errors.name}
          required
        />
        <Input
          label="Email"
          type="email"
          value={formData.email}
          onChange={(e) => handleChange('email', e.target.value)}
          error={errors.email}
          required
        />
        <Input
          label="Phone"
          value={formData.phone}
          onChange={(e) => handleChange('phone', e.target.value)}
          error={errors.phone}
          placeholder="10-digit phone number"
          required
        />
        <Input
          label="Address"
          value={formData.address}
          onChange={(e) => handleChange('address', e.target.value)}
          error={errors.address}
          required
        />
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="State"
            value={formData.state}
            onChange={(e) => handleChange('state', e.target.value.toUpperCase())}
            error={errors.state}
            placeholder="e.g., KARNATAKA"
            required
          />
          <Input
            label="State Code (Optional)"
            value={formData.state_code}
            onChange={(e) => handleChange('state_code', e.target.value)}
            error={errors.state_code}
            placeholder="e.g., 29"
            maxLength={2}
          />
        </div>
        <Input
          label="GSTIN (Optional)"
          value={formData.gstin}
          onChange={(e) => handleChange('gstin', e.target.value.toUpperCase())}
          error={errors.gstin}
          placeholder="15-character GSTIN"
          maxLength={15}
        />
        <div className="flex justify-end gap-3 mt-6">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={loading}>
            {customer ? 'Update' : 'Add'} Customer
          </Button>
        </div>
      </form>
    </Modal>
  );
}
