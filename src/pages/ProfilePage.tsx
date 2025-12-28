import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProfile } from '../hooks/useProfile';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { LogoUpload } from '../components/onboarding/LogoUpload';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { validateGSTIN, validateMobile } from '../lib/utils';
import { User, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

export function ProfilePage() {
  const navigate = useNavigate();
  const { profile, loading: profileLoading, updateProfile } = useProfile();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    user_name: '',
    mobile_number: '',
    email: '',
    company_name: '',
    company_address: '',
    gstin: '',
    company_logo_url: '',
    bank_name: '',
    account_number: '',
    ifsc_code: '',
    upi_id: '',
    default_terms: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (profile) {
      setFormData({
        user_name: profile.user_name || '',
        mobile_number: profile.mobile_number || '',
        email: profile.email || '',
        company_name: profile.company_name || '',
        company_address: profile.company_address || '',
        gstin: profile.gstin || '',
        company_logo_url: profile.company_logo_url || '',
        bank_name: profile.bank_name || '',
        account_number: profile.account_number || '',
        ifsc_code: profile.ifsc_code || '',
        upi_id: profile.upi_id || '',
        default_terms: profile.default_terms || ''
      });
    }
  }, [profile]);

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
      gstin: formData.gstin.trim() || null,
      bank_name: formData.bank_name.trim() || null,
      account_number: formData.account_number.trim() || null,
      ifsc_code: formData.ifsc_code.trim() || null,
      upi_id: formData.upi_id.trim() || null,
      company_logo_url: formData.company_logo_url || null,
      default_terms: formData.default_terms.trim() || null
    };
    await updateProfile(profileData);
    setLoading(false);
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  if (profileLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </button>
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-blue-600 p-2 rounded-lg">
              <User className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold">My Profile</h1>
          </div>
          <p className="text-gray-600">Manage your business information and settings</p>
        </div>

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
                label="GSTIN (Optional)"
                value={formData.gstin}
                onChange={(e) => handleChange('gstin', e.target.value.toUpperCase())}
                error={errors.gstin}
                placeholder="15-character GSTIN"
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
            <h3 className="text-lg font-semibold mb-4">Payment Details (Optional)</h3>
            <div className="mb-4 p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">UPI Payment (Recommended for Small Business)</h4>
              <p className="text-sm text-blue-700 mb-3">
                Simply add your UPI ID to accept payments directly. Customers can pay you via any UPI app.
              </p>
              <Input
                label="UPI ID"
                value={formData.upi_id}
                onChange={(e) => handleChange('upi_id', e.target.value)}
                placeholder="yourname@paytm or 9876543210@ybl"
              />
            </div>
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
              placeholder="Enter default terms and conditions for your invoices"
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Updating...' : 'Update Profile'}
          </Button>
        </form>
      </div>
    </div>
  );
}
