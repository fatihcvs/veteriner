import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { Package, Truck, CheckCircle, XCircle, Clock, Eye, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import LoadingSpinner from '@/components/common/loading-spinner';
import { ORDER_STATUS } from '@/lib/constants';
import { Order } from '@shared/schema';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

export default function Orders() {
  const [activeTab, setActiveTab] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const { data: orders, isLoading, error } = useQuery({
    queryKey: ['/api/orders'],
    retry: false,
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

  const updateOrderStatusMutation = useMutation({
    mutationFn: async ({ orderId, status }: { orderId: string; status: string }) => {
      const response = await apiRequest('PATCH', `/api/orders/${orderId}`, { status });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/orders'] });
      toast({
        title: 'Sipariş Güncellendi',
        description: 'Sipariş durumu başarıyla güncellendi.',
      });
      setIsDetailOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: 'Güncelleme Hatası',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const cancelOrderMutation = useMutation({
    mutationFn: async (orderId: string) => {
      const response = await apiRequest('PATCH', `/api/orders/${orderId}`, { status: 'CANCELLED' });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/orders'] });
      toast({
        title: 'Sipariş İptal Edildi',
        description: 'Siparişiniz başarıyla iptal edildi.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'İptal Hatası',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const handleViewDetails = (order: Order) => {
    setSelectedOrder(order);
    setIsDetailOpen(true);
  };

  const handleCancelOrder = (orderId: string) => {
    cancelOrderMutation.mutate(orderId);
  };

  const isAdmin = user?.role === 'SUPER_ADMIN' || user?.role === 'CLINIC_ADMIN';

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <div className="space-y-4">
            <div className="bg-red-100 p-4 rounded-full w-16 h-16 mx-auto flex items-center justify-center">
              <XCircle className="text-red-600 h-8 w-8" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-800 mb-2">
                Siparişler yüklenemedi
              </h3>
              <p className="text-professional-gray">
                Lütfen sayfayı yenileyip tekrar deneyin.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
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
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleViewDetails(order)}
                          data-testid={`button-view-order-${order.id}`}
                        >
                          <Eye className="h-3 w-3 mr-1" />
                          Detay
                        </Button>
                        
                        {order.status === 'PENDING' && (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="text-red-600 hover:text-red-700"
                            onClick={() => handleCancelOrder(order.id)}
                            disabled={cancelOrderMutation.isPending}
                            data-testid={`button-cancel-order-${order.id}`}
                          >
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

      {/* Order Detail Modal */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Sipariş Detayı #{selectedOrder?.id.slice(-8)}
            </DialogTitle>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-6">
              {/* Order Header */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Sipariş Bilgileri</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-professional-gray">Sipariş No:</span>
                      <span className="font-medium">#{selectedOrder.id.slice(-8)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-professional-gray">Tarih:</span>
                      <span className="font-medium">
                        {format(new Date(selectedOrder.createdAt), 'dd MMMM yyyy HH:mm', { locale: tr })}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-professional-gray">Durum:</span>
                      <Badge className={getStatusColor(selectedOrder.status)}>
                        {ORDER_STATUS[selectedOrder.status as keyof typeof ORDER_STATUS] || selectedOrder.status}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-professional-gray">Toplam:</span>
                      <span className="text-lg font-bold text-slate-800">
                        ₺{parseFloat(selectedOrder.totalAmount).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Teslimat Bilgileri</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <p className="text-sm text-professional-gray">Teslimat Adresi:</p>
                      <p className="font-medium">
                        {typeof selectedOrder.shippingAddress === 'string' 
                          ? selectedOrder.shippingAddress 
                          : JSON.stringify(selectedOrder.shippingAddress || {}).replace(/[{}"]/g, '').replace(/,/g, ', ')}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Order Items would go here if we had order items data */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Sipariş İçeriği</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-professional-gray text-sm">
                    Sipariş detayları yükleniyor... (Bu özellik geliştirilme aşamasında)
                  </p>
                </CardContent>
              </Card>

              {/* Admin Order Management */}
              {isAdmin && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Sipariş Yönetimi</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4">
                      <div className="flex-1">
                        <label className="text-sm text-professional-gray">Sipariş Durumu:</label>
                        <Select
                          value={selectedOrder.status}
                          onValueChange={(status) => updateOrderStatusMutation.mutate({ 
                            orderId: selectedOrder.id, 
                            status 
                          })}
                          disabled={updateOrderStatusMutation.isPending}
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="PENDING">Beklemede</SelectItem>
                            <SelectItem value="PAID">Ödendi</SelectItem>
                            <SelectItem value="SHIPPED">Kargoya Verildi</SelectItem>
                            <SelectItem value="DELIVERED">Teslim Edildi</SelectItem>
                            <SelectItem value="CANCELLED">İptal Edildi</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <Button
                        variant="outline"
                        disabled={updateOrderStatusMutation.isPending}
                        className="mt-6"
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        {updateOrderStatusMutation.isPending ? 'Güncelleniyor...' : 'Güncelle'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Notes */}
              {selectedOrder.notes && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Notlar</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">{selectedOrder.notes}</p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
