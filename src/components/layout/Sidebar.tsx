import { NavLink } from 'react-router-dom';
import { useAppStore, useAuthStore } from '../../stores';
import { 
  LayoutDashboard, 
  Car, 
  MapPin, 
  AlertTriangle, 
  History, 
  Command,
  Users,
  Leaf,
  Menu
} from 'lucide-react';
import { cn } from '../../utils/cn';

export default function Sidebar() {
  const { sidebarCollapsed, toggleSidebar } = useAppStore();
  const { isAdmin } = useAuthStore();

  const navItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/dashboard/devices', icon: Car, label: 'Devices' },
    { path: '/dashboard/map', icon: MapPin, label: 'Live Map' },
    { path: '/dashboard/alarms', icon: AlertTriangle, label: 'Alarms' },
    ...(isAdmin() ? [{ path: '/dashboard/users', icon: Users, label: 'Users' }] : []),
    { path: '/dashboard/history', icon: History, label: 'History' },
    { path: '/dashboard/commands', icon: Command, label: 'Commands' },
  ];

  return (
    <div
      className={cn(
        'bg-card border-r flex flex-col transition-all duration-300',
        sidebarCollapsed ? 'w-16' : 'w-64'
      )}
    >
      <div className="p-4 border-b flex items-center justify-between">
        {!sidebarCollapsed && (
          <div className="flex items-center gap-2">
            <Leaf className="h-6 w-6 text-primary" />
            <h2 className="text-xl font-bold text-primary">greenAlytics</h2>
          </div>
        )}
        <button
          onClick={toggleSidebar}
          className="p-2 hover:bg-accent rounded-md"
          aria-label="Toggle sidebar"
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>

      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {navItems.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 px-3 py-2 rounded-md transition-colors',
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                  )
                }
                title={item.label}
              >
                <item.icon className="h-5 w-5 flex-shrink-0" />
                {!sidebarCollapsed && <span>{item.label}</span>}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
