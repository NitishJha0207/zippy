import { FileCheck, AlertCircle, ExternalLink, CheckCircle } from 'lucide-react';

export function EInvoiceInfo() {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center gap-3 mb-6">
        <FileCheck className="w-6 h-6 text-green-600" />
        <div>
          <h2 className="text-xl font-semibold text-gray-900">GST e-Invoice Compliance</h2>
          <p className="text-sm text-gray-600">Understanding e-invoicing requirements in India</p>
        </div>
      </div>

      <div className="space-y-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <p className="font-medium text-blue-900 mb-2">What is GST e-Invoicing?</p>
              <p className="text-sm text-blue-800">
                GST e-Invoicing is a system where B2B invoices are electronically authenticated by
                the Invoice Registration Portal (IRP) and assigned a unique Invoice Reference Number (IRN).
              </p>
            </div>
          </div>
        </div>

        <div>
          <h3 className="font-semibold text-gray-900 mb-3">Who Must Comply?</h3>
          <div className="space-y-3">
            <div className="flex items-start gap-3 bg-gray-50 rounded-lg p-3">
              <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-gray-900">Current Requirement (2024)</p>
                <p className="text-gray-600">
                  Businesses with annual turnover exceeding <strong>₹5 crore</strong> must issue e-invoices
                  for B2B, B2G, and export transactions.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 bg-orange-50 rounded-lg p-3 border border-orange-200">
              <AlertCircle className="w-5 h-5 text-orange-600 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-gray-900">Upcoming Change (April 2025)</p>
                <p className="text-gray-700">
                  The threshold will be lowered to <strong>₹10 crore</strong> for submitting invoices
                  to IRP within 30 days.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div>
          <h3 className="font-semibold text-gray-900 mb-3">Key Requirements</h3>
          <div className="grid md:grid-cols-2 gap-3">
            <div className="border rounded-lg p-3">
              <p className="font-medium text-gray-900 mb-1">Format</p>
              <p className="text-sm text-gray-600">Invoices must be in JSON format following GST INV-1 schema</p>
            </div>
            <div className="border rounded-lg p-3">
              <p className="font-medium text-gray-900 mb-1">Registration</p>
              <p className="text-sm text-gray-600">Must be registered on GST portal and IRP platform</p>
            </div>
            <div className="border rounded-lg p-3">
              <p className="font-medium text-gray-900 mb-1">Time Limit</p>
              <p className="text-sm text-gray-600">Upload invoices within 30 days of creation (from April 2025)</p>
            </div>
            <div className="border rounded-lg p-3">
              <p className="font-medium text-gray-900 mb-1">Authentication</p>
              <p className="text-sm text-gray-600">Two-Factor Authentication (2FA) mandatory from April 2025</p>
            </div>
          </div>
        </div>

        <div>
          <h3 className="font-semibold text-gray-900 mb-3">Mandatory Invoice Fields</h3>
          <div className="bg-gray-50 rounded-lg p-4">
            <ul className="grid md:grid-cols-2 gap-2 text-sm text-gray-700">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-blue-600 rounded-full"></span>
                Invoice Number & Date
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-blue-600 rounded-full"></span>
                Supplier GSTIN & Details
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-blue-600 rounded-full"></span>
                Buyer GSTIN & Details
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-blue-600 rounded-full"></span>
                Item Details with HSN Codes
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-blue-600 rounded-full"></span>
                Taxable Value & Tax Amounts
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-blue-600 rounded-full"></span>
                Place of Supply
              </li>
            </ul>
          </div>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="font-medium text-green-900 mb-2">Benefits of e-Invoicing</p>
          <ul className="space-y-1 text-sm text-green-800">
            <li>• Reduced data entry errors and reconciliation issues</li>
            <li>• Faster input tax credit (ITC) claims</li>
            <li>• Real-time tracking of invoices</li>
            <li>• Reduced tax evasion and fraud</li>
            <li>• Automated GST return filing data</li>
          </ul>
        </div>

        <div className="border-t pt-4">
          <h3 className="font-semibold text-gray-900 mb-3">Resources</h3>
          <div className="space-y-2">
            <a
              href="https://einvoice.gst.gov.in/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm"
            >
              <ExternalLink className="w-4 h-4" />
              GST e-Invoice Portal
            </a>
            <a
              href="https://www.gst.gov.in/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm"
            >
              <ExternalLink className="w-4 h-4" />
              Official GST Portal
            </a>
            <a
              href="https://cleartax.in/s/e-invoicing-gst"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm"
            >
              <ExternalLink className="w-4 h-4" />
              Complete Guide to e-Invoicing
            </a>
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
            <div className="text-sm text-yellow-800">
              <p className="font-medium mb-1">Important Note</p>
              <p>
                This application currently generates standard GST-compliant invoices. For full e-invoice
                compliance with IRP integration, businesses exceeding the turnover threshold should consult
                with a certified GST solution provider or use government-approved e-invoicing software.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
