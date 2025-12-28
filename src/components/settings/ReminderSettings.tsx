import { useState, useEffect } from 'react';
import { useReminderSettings } from '../../hooks/useReminderSettings';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Bell, MessageSquare, Mail } from 'lucide-react';
import toast from 'react-hot-toast';

export function ReminderSettings() {
  const { settings, loading, saveSettings } = useReminderSettings();
  const [formData, setFormData] = useState({
    enabled: false,
    remind_before_days: 1,
    remind_on_due_date: true,
    remind_after_days: [3, 7],
    whatsapp_enabled: false,
    email_enabled: true,
    message_template: 'Hi {{CustomerName}}, your invoice {{InvoiceNumber}} of ₹{{Amount}} is due on {{DueDate}}. Please pay at your earliest convenience. Thank you!'
  });

  useEffect(() => {
    if (settings) {
      setFormData({
        enabled: settings.enabled,
        remind_before_days: settings.remind_before_days,
        remind_on_due_date: settings.remind_on_due_date,
        remind_after_days: settings.remind_after_days,
        whatsapp_enabled: settings.whatsapp_enabled,
        email_enabled: settings.email_enabled,
        message_template: settings.message_template
      });
    }
  }, [settings]);

  const handleSave = async () => {
    await saveSettings(formData);
  };

  if (loading) {
    return <div className="text-center py-8">Loading reminder settings...</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center gap-3 mb-6">
        <Bell className="w-6 h-6 text-blue-600" />
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Payment Reminders</h2>
          <p className="text-sm text-gray-600">Automatically remind customers about pending payments</p>
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div>
            <p className="font-medium text-gray-900">Enable Automatic Reminders</p>
            <p className="text-sm text-gray-600">Send reminders based on invoice due dates</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={formData.enabled}
              onChange={(e) => setFormData({ ...formData, enabled: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>

        {formData.enabled && (
          <>
            <div className="border-t pt-6">
              <h3 className="font-medium text-gray-900 mb-4">Reminder Schedule</h3>

              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <Input
                    type="number"
                    label="Days before due date"
                    value={formData.remind_before_days}
                    onChange={(e) => setFormData({ ...formData, remind_before_days: parseInt(e.target.value) })}
                    min={0}
                    className="w-32"
                  />
                  <p className="text-sm text-gray-600 mt-6">Send reminder this many days before due date</p>
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="remind_on_due"
                    checked={formData.remind_on_due_date}
                    onChange={(e) => setFormData({ ...formData, remind_on_due_date: e.target.checked })}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="remind_on_due" className="text-sm text-gray-700">
                    Send reminder on due date
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Days after due date (comma-separated)
                  </label>
                  <Input
                    type="text"
                    value={formData.remind_after_days.join(', ')}
                    onChange={(e) => {
                      const days = e.target.value.split(',').map(d => parseInt(d.trim())).filter(d => !isNaN(d));
                      setFormData({ ...formData, remind_after_days: days });
                    }}
                    placeholder="3, 7, 14"
                  />
                  <p className="text-xs text-gray-500 mt-1">Send follow-up reminders on these days after due date</p>
                </div>
              </div>
            </div>

            <div className="border-t pt-6">
              <h3 className="font-medium text-gray-900 mb-4">Reminder Channels</h3>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <MessageSquare className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="font-medium text-gray-900">WhatsApp</p>
                      <p className="text-xs text-gray-600">Send reminders via WhatsApp</p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={formData.whatsapp_enabled}
                    onChange={(e) => setFormData({ ...formData, whatsapp_enabled: e.target.checked })}
                    className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
                  />
                </div>

                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="font-medium text-gray-900">Email</p>
                      <p className="text-xs text-gray-600">Send reminders via email</p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={formData.email_enabled}
                    onChange={(e) => setFormData({ ...formData, email_enabled: e.target.checked })}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            <div className="border-t pt-6">
              <h3 className="font-medium text-gray-900 mb-2">Message Template</h3>
              <p className="text-sm text-gray-600 mb-4">
                Use placeholders: {'{{CustomerName}}'}, {'{{InvoiceNumber}}'}, {'{{Amount}}'}, {'{{DueDate}}'}
              </p>
              <textarea
                value={formData.message_template}
                onChange={(e) => setFormData({ ...formData, message_template: e.target.value })}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </>
        )}

        <div className="flex justify-end">
          <Button onClick={handleSave}>
            Save Reminder Settings
          </Button>
        </div>
      </div>
    </div>
  );
}
