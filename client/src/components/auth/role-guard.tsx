import { useAuth } from '@/hooks/useAuth';
import { ReactNode } from 'react';

interface RoleGuardProps {
  allowedRoles: string[];
  children: ReactNode;
  fallback?: ReactNode;
}

export function RoleGuard({ allowedRoles, children, fallback = null }: RoleGuardProps) {
  const { user } = useAuth();

  if (!user || !allowedRoles.includes(user.role)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

// Higher-order component for page-level role protection
export function withRoleGuard(allowedRoles: string[]) {
  return function <T extends object>(Component: React.ComponentType<T>) {
    return function GuardedComponent(props: T) {
      const { user } = useAuth();

      if (!user || !allowedRoles.includes(user.role)) {
        return (
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-slate-800 mb-4">Erişim Reddedildi</h1>
              <p className="text-slate-600">Bu sayfayı görüntüleme yetkiniz bulunmuyor.</p>
            </div>
          </div>
        );
      }

      return <Component {...props} />;
    };
  };
}