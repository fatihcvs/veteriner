import { useState } from 'react';
import { ShoppingCart, Minus, Plus, Trash2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { useCart } from '@/hooks/useCart';
import { useAuth } from '@/hooks/useAuth';
import { useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

export default function CartButton() {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const { items, getTotalItems, getTotalPrice, updateQuantity, removeFromCart, clearCart } = useCart();
  const { user } = useAuth();
  const { toast } = useToast();

  const createOrderMutation = useMutation({
    mutationFn: async (orderData: any) => {
      const response = await apiRequest('POST', '/api/orders', orderData);
      return response.json();
    },
    onSuccess: () => {
      clearCart();
      setIsCheckoutOpen(false);
      setIsCartOpen(false);
      queryClient.invalidateQueries({ queryKey: ['/api/orders'] });
      toast({
        title: 'Sipariş Oluşturuldu',
        description: 'Siparişiniz başarıyla oluşturuldu. E-posta ile bilgilendirileceksiniz.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Sipariş Hatası',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const handleCheckout = () => {
    if (items.length === 0) return;

    const orderData = {
      items: items.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
      })),
      shippingAddress: user?.email ? `${user.firstName} ${user.lastName}` : 'Default Address',
    };

    createOrderMutation.mutate(orderData);
  };

  const totalItems = getTotalItems();
  const totalPrice = getTotalPrice();

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="relative flex items-center" data-testid="button-cart">
          <ShoppingCart className="h-4 w-4 mr-2" />
          Sepet
          {totalItems > 0 && (
            <Badge className="ml-2 bg-medical-blue text-white" data-testid="text-cart-count">
              {totalItems}
            </Badge>
          )}
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto" data-testid="dialog-cart">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Sepetim ({totalItems} ürün)
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {items.length === 0 ? (
            <div className="text-center py-8">
              <ShoppingCart className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500">Sepetiniz boş</p>
              <p className="text-sm text-gray-400">Ürün eklemek için mağazaya göz atın</p>
            </div>
          ) : (
            <>
              {/* Cart Items */}
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {items.map((item) => (
                  <Card key={item.id} data-testid={`card-cart-item-${item.productId}`}>
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-4">
                        {item.image && (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-16 h-16 object-cover rounded-lg"
                          />
                        )}
                        
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-slate-800 truncate">{item.name}</h4>
                          {item.brand && (
                            <p className="text-sm text-gray-500">{item.brand}</p>
                          )}
                          <p className="text-lg font-bold text-slate-800">
                            ₺{parseFloat(item.price).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                          </p>
                        </div>

                        {/* Quantity Controls */}
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                            data-testid={`button-decrease-${item.productId}`}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          
                          <span className="w-8 text-center font-medium" data-testid={`text-quantity-${item.productId}`}>
                            {item.quantity}
                          </span>
                          
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                            disabled={item.stockQty !== undefined && item.quantity >= item.stockQty}
                            data-testid={`button-increase-${item.productId}`}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>

                        {/* Remove Button */}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFromCart(item.productId)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          data-testid={`button-remove-${item.productId}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Cart Summary */}
              <div className="border-t pt-4">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-lg font-medium">Toplam:</span>
                  <span className="text-xl font-bold text-slate-800" data-testid="text-total-price">
                    ₺{totalPrice.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                  </span>
                </div>

                {/* Enhanced Payment Options */}
                <div className="space-y-4 mb-4">
                  <div className="text-sm font-medium text-slate-800">Ödeme Seçenekleri:</div>
                  <div className="grid grid-cols-1 gap-2">
                    <div className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-slate-50 bg-blue-50 border-medical-blue">
                      <div className="w-4 h-4 rounded-full bg-medical-blue"></div>
                      <div className="flex items-center justify-between flex-1">
                        <div>
                          <span className="text-sm font-medium">Kredi/Banka Kartı</span>
                          <div className="text-xs text-professional-gray">💳 Güvenli ödeme</div>
                        </div>
                        <div className="text-xs text-medical-blue font-medium">Seçili</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-slate-50 opacity-70">
                      <div className="w-4 h-4 rounded-full border-2 border-gray-300"></div>
                      <div>
                        <span className="text-sm">Kapıda Ödeme</span>
                        <div className="text-xs text-professional-gray">🚚 Teslimatta öde (yakında)</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-3">
                  <Button
                    variant="outline"
                    onClick={clearCart}
                    className="flex-1"
                    data-testid="button-clear-cart"
                  >
                    Sepeti Temizle
                  </Button>
                  
                  <Button
                    onClick={handleCheckout}
                    disabled={createOrderMutation.isPending}
                    className="flex-1 bg-medical-blue hover:bg-medical-blue/90 text-white"
                    data-testid="button-checkout"
                  >
                    {createOrderMutation.isPending ? (
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Sipariş Oluşturuluyor...</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center space-x-2">
                        <span>🔒 Güvenli Sipariş Ver</span>
                      </div>
                    )}
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}