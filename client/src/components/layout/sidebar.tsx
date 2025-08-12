import { Link, useLocation } from 'wouter';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';
import { APP_NAME, APP_DESCRIPTION, NAVIGATION_ITEMS, ECOMMERCE_ITEMS, MANAGEMENT_ITEMS } from '@/lib/constants';

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export default function Sidebar({ open, onClose }: SidebarProps) {
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();

  return (
    <div className={cn(
      "fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0",
      open ? "translate-x-0" : "-translate-x-full"
    )}>
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center space-x-3">
            <div className="bg-medical-blue p-2 rounded-lg">
              <i className="fas fa-stethoscope text-white text-xl"></i>
            </div>
            <div>
              <h1 className="font-bold text-xl text-slate-800">{APP_NAME}</h1>
              <p className="text-sm text-professional-gray">{APP_DESCRIPTION}</p>
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {/* Main Navigation */}
          {NAVIGATION_ITEMS.map((item) => {
            const isActive = location === item.href;
            return (
              <Link key={item.key} href={item.href}>
                <button
                  onClick={onClose}
                  className={cn(
                    "w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors text-left",
                    isActive
                      ? "bg-medical-blue text-white"
                      : "text-professional-gray hover:bg-slate-100 hover:text-medical-blue"
                  )}
                >
                  <i className={`${item.icon} w-5`}></i>
                  <span className="font-medium">{item.label}</span>
                  {item.badge && (
                    <span className="ml-auto bg-healthcare-green text-white text-xs px-2 py-1 rounded-full">
                      4
                    </span>
                  )}
                </button>
              </Link>
            );
          })}

          {/* E-commerce Section */}
          <div className="pt-4 border-t border-slate-200 mt-4">
            <p className="text-xs font-semibold text-professional-gray uppercase tracking-wider mb-2">
              E-TİCARET
            </p>
            {ECOMMERCE_ITEMS.map((item) => {
              const isActive = location === item.href;
              return (
                <Link key={item.key} href={item.href}>
                  <button
                    onClick={onClose}
                    className={cn(
                      "w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors text-left",
                      isActive
                        ? "bg-medical-blue text-white"
                        : "text-professional-gray hover:bg-slate-100 hover:text-medical-blue"
                    )}
                  >
                    <i className={`${item.icon} w-5`}></i>
                    <span className="font-medium">{item.label}</span>
                    {item.badge && (
                      <span className="ml-auto bg-action-teal text-white text-xs px-2 py-1 rounded-full">
                        2
                      </span>
                    )}
                  </button>
                </Link>
              );
            })}
          </div>

          {/* Management Section */}
          <div className="pt-4 border-t border-slate-200 mt-4">
            <p className="text-xs font-semibold text-professional-gray uppercase tracking-wider mb-2">
              YÖNETİM
            </p>
            {MANAGEMENT_ITEMS.filter((item) => {
              // Show admin panel only for SUPER_ADMIN and CLINIC_ADMIN
              if (item.adminOnly) {
                return user?.role === 'SUPER_ADMIN' || user?.role === 'CLINIC_ADMIN';
              }
              return true;
            }).map((item) => {
              const isActive = location === item.href;
              return (
                <Link key={item.key} href={item.href}>
                  <button
                    onClick={onClose}
                    className={cn(
                      "w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors text-left",
                      isActive
                        ? "bg-medical-blue text-white"
                        : "text-professional-gray hover:bg-slate-100 hover:text-medical-blue"
                    )}
                  >
                    <i className={`${item.icon} w-5`}></i>
                    <span className="font-medium">{item.label}</span>
                  </button>
                </Link>
              );
            })}
          </div>
        </nav>

        {/* User Profile */}
        <div className="p-4 border-t border-slate-200">
          <div className="flex items-center space-x-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={user?.profileImageUrl || ''} alt={user?.firstName || ''} />
              <AvatarFallback className="bg-medical-blue text-white">
                {user?.firstName?.[0]}{user?.lastName?.[0]}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <p className="font-medium text-slate-800">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-sm text-professional-gray">
                {user?.role === 'VET' ? 'Veteriner' : 'Başhekim'}
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => logoutMutation.mutate()}
              className="text-professional-gray hover:text-medical-blue"
              disabled={logoutMutation.isPending}
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
