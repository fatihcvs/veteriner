import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import Sidebar from './sidebar';
import { Bell, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { APP_NAME } from '@/lib/constants';

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Mobile Header */}
      <div className="lg:hidden bg-white shadow-sm border-b px-4 py-3 flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setSidebarOpen(true)}
          className="text-professional-gray hover:text-medical-blue"
        >
          <Menu className="h-6 w-6" />
        </Button>
        
        <div className="flex items-center space-x-2">
          <div className="bg-medical-blue p-2 rounded-lg">
            <i className="fas fa-stethoscope text-white text-lg"></i>
          </div>
          <span className="font-bold text-lg text-slate-800">{APP_NAME}</span>
        </div>
        
        <div className="flex items-center space-x-3">
          <Button variant="ghost" size="sm" className="relative text-professional-gray hover:text-medical-blue">
            <Bell className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 bg-alert-red text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">3</span>
          </Button>
          
          <Avatar className="h-8 w-8">
            <AvatarImage src={user?.profileImageUrl || ''} alt={user?.firstName || ''} />
            <AvatarFallback className="bg-medical-blue text-white">
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </AvatarFallback>
          </Avatar>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        {/* Main Content */}
        <div className="flex-1 lg:ml-64">
          {/* Desktop Header */}
          <header className="hidden lg:flex bg-white shadow-sm border-b px-6 py-4 items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-800">Pano</h2>
              <p className="text-professional-gray">Günlük aktiviteleriniz ve klinik durumu</p>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" className="relative text-professional-gray hover:text-medical-blue">
                <Bell className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 bg-alert-red text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">3</span>
              </Button>
              
              <div className="flex items-center space-x-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={user?.profileImageUrl || ''} alt={user?.firstName || ''} />
                  <AvatarFallback className="bg-medical-blue text-white">
                    {user?.firstName?.[0]}{user?.lastName?.[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-slate-800">
                    {user?.firstName} {user?.lastName}
                  </p>
                  <p className="text-sm text-professional-gray">Merkez Veteriner Kliniği</p>
                </div>
              </div>
            </div>
          </header>

          {/* Page Content */}
          <main className="p-4 lg:p-6">
            {children}
          </main>
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}
