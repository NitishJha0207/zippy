import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProfile } from '../../hooks/useProfile';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { LogoUpload } from './LogoUpload';
import { validateGSTIN, validateMobile } from '../../lib/utils';
import toast from 'react-hot-toast';

export function OnboardingForm() {
  const navigate = useNavigate();
  const { createProfile } = useProfile();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    user_name: '',
    mobile_number: '',
    email: '',
    company_name: '',
    company_address: '',
    pincode: '',
    gstin: '',
    company_logo_url: '',
    bank_name: '',
    account_number: '',
    ifsc_code: '',
    default_terms: 'Payment due within 30 days.\nGoods once sold cannot be returned.\nSubject to local jurisdiction.'
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.user_name.trim()) newErrors.user_name = 'Name is required';
    if (!formData.mobile_number.trim()) {
      newErrors.mobile_number = 'Mobile number is required';
    } else if (!validateMobile(formData.mobile_number)) {
      newErrors.mobile_number = 'Invalid mobile number';
    }
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!formData.company_name.trim()) newErrors.company_name = 'Company name is required';
    if (!formData.company_address.trim()) newErrors.company_address = 'Address is required';
    if (formData.gstin.trim() && !validateGSTIN(formData.gstin)) {
      newErrors.gstin = 'Invalid GSTIN format';
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

    setLoading(true);
    const profileData = {
      ...formData,
      pincode: formData.pincode.trim() || null,
      gstin: formData.gstin.trim() || null,
      bank_name: formData.bank_name.trim() || null,
      account_number: formData.account_number.trim() || null,
      ifsc_code: formData.ifsc_code.trim() || null,
      company_logo_url: formData.company_logo_url || null,
      default_terms: formData.default_terms.trim() || null
    };
    const { error } = await createProfile(profileData);
    setLoading(false);

    if (!error) {
      navigate('/dashboard');
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Personal Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Full Name"
            value={formData.user_name}
            onChange={(e) => handleChange('user_name', e.target.value)}
            error={errors.user_name}
            required
          />
          <Input
            label="Mobile Number"
            value={formData.mobile_number}
            onChange={(e) => handleChange('mobile_number', e.target.value)}
            error={errors.mobile_number}
            placeholder="10-digit mobile number"
            required
          />
          <Input
            label="Email Address"
            type="email"
            value={formData.email}
            onChange={(e) => handleChange('email', e.target.value)}
            error={errors.email}
            required
            className="md:col-span-2"
          />
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Company Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Company Name"
            value={formData.company_name}
            onChange={(e) => handleChange('company_name', e.target.value)}
            error={errors.company_name}
            required
            className="md:col-span-2"
          />
          <Input
            label="Company Address"
            value={formData.company_address}
            onChange={(e) => handleChange('company_address', e.target.value)}
            error={errors.company_address}
            required
            className="md:col-span-2"
          />
          <Input
            label="Pincode"
            value={formData.pincode}
            onChange={(e) => handleChange('pincode', e.target.value)}
            placeholder="Postal/ZIP code"
          />
          <Input
            label="GSTIN (Optional)"
            value={formData.gstin}
            onChange={(e) => handleChange('gstin', e.target.value.toUpperCase())}
            error={errors.gstin}
            placeholder="15-character GSTIN (optional for early-stage businesses)"
            maxLength={15}
          />
          <div className="md:col-span-2">
            <LogoUpload
              onUpload={(url) => handleChange('company_logo_url', url)}
              currentUrl={formData.company_logo_url}
            />
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Bank Details (Optional)</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Bank Name"
            value={formData.bank_name}
            onChange={(e) => handleChange('bank_name', e.target.value)}
          />
          <Input
            label="Account Number"
            value={formData.account_number}
            onChange={(e) => handleChange('account_number', e.target.value)}
          />
          <Input
            label="IFSC Code"
            value={formData.ifsc_code}
            onChange={(e) => handleChange('ifsc_code', e.target.value.toUpperCase())}
            maxLength={11}
          />
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Default Terms & Conditions (Optional)</h3>
        <textarea
          value={formData.default_terms}
          onChange={(e) => handleChange('default_terms', e.target.value)}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? 'Setting Up...' : 'Complete Setup'}
      </Button>
    </form>
  );
}
