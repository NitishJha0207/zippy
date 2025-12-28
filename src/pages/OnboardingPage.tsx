import { OnboardingForm } from '../components/onboarding/OnboardingForm';
import { FileText } from 'lucide-react';

export function OnboardingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-blue-600 p-3 rounded-full">
              <FileText className="w-10 h-10 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold mb-2">Welcome to Zippy Bill</h1>
          <p className="text-gray-600">Let's set up your business profile to get started</p>
        </div>
        <OnboardingForm />
      </div>
    </div>
  );
}
