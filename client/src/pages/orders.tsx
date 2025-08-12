import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { Package, Truck, CheckCircle, XCircle, Clock, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import LoadingSpinner from '@/components/common/loading-spinner';
import { ORDER_STATUS } from '@/lib/constants';
import { Order } from '@shared/schema';

export default function Orders() {
  const [activeTab, setActiveTab] = useState('all');

  const { data: orders, isLoading } = useQuery({
    queryKey: ['/api/orders'],
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'PAID':
        return 'bg-blue-100 text-blue-800';
      case 'SHIPPED':
        return 'bg-purple-100 text-purple-800';
      case 'DELIVERED':
        return 'bg-green-100 text-green-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Clock className="h-4 w-4" />;
      case 'PAID':
        return <CheckCircle className="h-4 w-4" />;
      case 'SHIPPED':
        return <Truck className="h-4 w-4" />;
      case 'DELIVERED':
        return <Package className="h-4 w-4" />;
      case 'CANCELLED':
        return <XCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const filterOrdersByStatus = (status: string) => {
    if (status === 'all') return orders || [];
    return orders?.filter((order: Order) => order.status === status) || [];
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Siparişler</h2>
          <p className="text-professional-gray">Sipariş takibi ve yönetimi</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="text-sm text-professional-gray">
            Toplam {orders?.length || 0} sipariş
          </div>
        </div>
      </div>

      {/* Order Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="bg-yellow-100 p-2 rounded-lg w-fit mx-auto mb-2">
              <Clock className="h-5 w-5 text-yellow-600" />
            </div>
            <p className="text-2xl font-bold text-slate-800">
              {filterOrdersByStatus('PENDING').length}
            </p>
            <p className="text-xs text-professional-gray">Beklemede</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="bg-blue-100 p-2 rounded-lg w-fit mx-auto mb-2">
              <CheckCircle className="h-5 w-5 text-blue-600" />
            </div>
            <p className="text-2xl font-bold text-slate-800">
              {filterOrdersByStatus('PAID').length}
            </p>
            <p className="text-xs text-professional-gray">Ödendi</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="bg-purple-100 p-2 rounded-lg w-fit mx-auto mb-2">
              <Truck className="h-5 w-5 text-purple-600" />
            </div>
            <p className="text-2xl font-bold text-slate-800">
              {filterOrdersByStatus('SHIPPED').length}
            </p>
            <p className="text-xs text-professional-gray">Kargoya Verildi</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="bg-green-100 p-2 rounded-lg w-fit mx-auto mb-2">
              <Package className="h-5 w-5 text-green-600" />
            </div>
            <p className="text-2xl font-bold text-slate-800">
              {filterOrdersByStatus('DELIVERED').length}
            </p>
            <p className="text-xs text-professional-gray">Teslim Edildi</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="bg-red-100 p-2 rounded-lg w-fit mx-auto mb-2">
              <XCircle className="h-5 w-5 text-red-600" />
            </div>
            <p className="text-2xl font-bold text-slate-800">
              {filterOrdersByStatus('CANCELLED').length}
            </p>
            <p className="text-xs text-professional-gray">İptal Edildi</p>
          </CardContent>
        </Card>
      </div>

      {/* Orders Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">Tümü ({orders?.length || 0})</TabsTrigger>
          <TabsTrigger value="PENDING">Beklemede</TabsTrigger>
          <TabsTrigger value="SHIPPED">Kargoda</TabsTrigger>
          <TabsTrigger value="DELIVERED">Teslim Edildi</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4">
          {filterOrdersByStatus(activeTab).length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <div className="space-y-4">
                  <div className="bg-slate-100 p-4 rounded-full w-16 h-16 mx-auto flex items-center justify-center">
                    <Package className="text-professional-gray h-8 w-8" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-800 mb-2">
                      {activeTab === 'all' ? 'Henüz sipariş yok' : `${activeTab} durumunda sipariş yok`}
                    </h3>
                    <p className="text-professional-gray">
                      {activeTab === 'all' 
                        ? 'İlk siparişiniz mağazadan verilebilir.'
                        : `Bu durumda herhangi bir sipariş bulunmuyor.`
                      }
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filterOrdersByStatus(activeTab).map((order: Order) => (
                <Card key={order.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4">
                        <div className={`p-2 rounded-lg ${getStatusColor(order.status)}`}>
                          {getStatusIcon(order.status)}
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <h3 className="font-semibold text-slate-800">
                              Sipariş #{order.id.slice(-8)}
                            </h3>
                            <Badge className={getStatusColor(order.status)}>
                              {ORDER_STATUS[order.status as keyof typeof ORDER_STATUS] || order.status}
                            </Badge>
                          </div>
                          
                          <p className="text-sm text-professional-gray mb-2">
                            {format(new Date(order.createdAt), 'dd MMMM yyyy HH:mm', { locale: tr })}
                          </p>
                          
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-lg font-bold text-slate-800">
                                ₺{parseFloat(order.totalAmount).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                              </p>
                              {order.notes && (
                                <p className="text-sm text-professional-gray mt-1">
                                  {order.notes}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm">
                          <Eye className="h-3 w-3 mr-1" />
                          Detay
                        </Button>
                        
                        {order.status === 'PENDING' && (
                          <Button variant="outline" size="sm" className="text-alert-red">
                            <XCircle className="h-3 w-3 mr-1" />
                            İptal Et
                          </Button>
                        )}
                        
                        {(order.status === 'DELIVERED' || order.status === 'SHIPPED') && (
                          <Button variant="outline" size="sm">
                            <Truck className="h-3 w-3 mr-1" />
                            Takip Et
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Shipping Address */}
                    {order.shippingAddress && (
                      <div className="mt-4 p-3 bg-slate-50 rounded-lg">
                        <p className="text-sm font-medium text-slate-800 mb-1">Teslimat Adresi:</p>
                        <p className="text-sm text-professional-gray">
                          {JSON.stringify(order.shippingAddress).replace(/[{}"]/g, '').replace(/,/g, ', ')}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
