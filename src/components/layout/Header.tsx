import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores';
import { useLogout } from '../../hooks/useAuth';
import { Button } from '../ui/Button';
import { LogOut, User } from 'lucide-react';

export default function Header() {
  const { user } = useAuthStore();
  const logoutMutation = useLogout();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <header className="h-16 border-b bg-card px-6 flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-semibold">GPS Tracking Dashboard</h1>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-sm">
          <User className="h-4 w-4" />
          <span className="font-medium">
            {user?.loginType === 'ENTERPRISE' ? 'Enterprise User' : 'Device User'}
          </span>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={handleLogout}
          disabled={logoutMutation.isPending}
        >
          <LogOut className="h-4 w-4 mr-2" />
          {logoutMutation.isPending ? 'Logging out...' : 'Logout'}
        </Button>
      </div>
    </header>
  );
}
