import { useState, useEffect } from 'react';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { getRazorpayConfig, setRazorpayConfig, clearRazorpayConfig } from '../../lib/razorpay';
import toast from 'react-hot-toast';
import { CreditCard } from 'lucide-react';

export function RazorpaySettings() {
  const [keyId, setKeyId] = useState('');
  const [keySecret, setKeySecret] = useState('');
  const [isConfigured, setIsConfigured] = useState(false);

  useEffect(() => {
    const config = getRazorpayConfig();
    if (config) {
      setKeyId(config.keyId);
      setKeySecret('••••••••••••••••');
      setIsConfigured(true);
    }
  }, []);

  const handleSave = () => {
    if (!keyId || !keySecret || keySecret === '••••••••••••••••') {
      toast.error('Please enter both Key ID and Key Secret');
      return;
    }

    setRazorpayConfig(keyId, keySecret);
    setIsConfigured(true);
    toast.success('Razorpay configuration saved');
    setKeySecret('••••••••••••••••');
  };

  const handleClear = () => {
    clearRazorpayConfig();
    setKeyId('');
    setKeySecret('');
    setIsConfigured(false);
    toast.success('Razorpay configuration cleared');
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center gap-2 mb-4">
        <CreditCard className="w-5 h-5 text-blue-600" />
        <h2 className="text-lg font-semibold">Razorpay Payment Integration</h2>
      </div>

      <div className="space-y-4">
        <p className="text-sm text-gray-600">
          Configure Razorpay to generate payment links for your invoices.
          Get your API keys from the Razorpay Dashboard.
        </p>

        <Input
          label="Razorpay Key ID"
          value={keyId}
          onChange={(e) => setKeyId(e.target.value)}
          placeholder="rzp_test_xxxxxxxxxxxxx"
        />

        <Input
          label="Razorpay Key Secret"
          type="password"
          value={keySecret}
          onChange={(e) => setKeySecret(e.target.value)}
          placeholder="Enter your secret key"
        />

        <div className="flex gap-2">
          <Button onClick={handleSave}>
            {isConfigured ? 'Update' : 'Save'} Configuration
          </Button>
          {isConfigured && (
            <Button onClick={handleClear} variant="outline">
              Clear Configuration
            </Button>
          )}
        </div>

        {isConfigured && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-800">
              Razorpay is configured and ready to use
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
