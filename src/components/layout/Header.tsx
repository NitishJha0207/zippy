import { FileText, LogOut, User, TrendingUp, Package } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useProfile } from '../../hooks/useProfile';
import { Button } from '../ui/Button';

export function Header() {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const { profile } = useProfile();

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
            <FileText className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600 flex-shrink-0" />
            <div className="min-w-0">
              <h1 className="text-base sm:text-xl font-bold text-gray-900 truncate">Zippy Bill</h1>
              {profile && (
                <p className="text-xs text-gray-500 truncate hidden sm:block">{profile.company_name}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1 sm:gap-3 flex-shrink-0">
            <Button
              variant="outline"
              onClick={() => navigate('/products')}
              className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4"
            >
              <Package className="w-4 h-4" />
              <span className="hidden sm:inline">Products</span>
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate('/analytics')}
              className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4"
            >
              <TrendingUp className="w-4 h-4" />
              <span className="hidden sm:inline">Analytics</span>
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate('/profile')}
              className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4"
            >
              <User className="w-4 h-4" />
              <span className="hidden sm:inline">Settings</span>
            </Button>
            <Button
              variant="outline"
              onClick={signOut}
              className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Sign Out</span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
