import { useState } from 'react';
import { ShoppingCart, Package, Star, Plus, Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { PET_SPECIES } from '@/lib/constants';
import { FoodProduct } from '@shared/schema';
import { useCart } from '@/hooks/useCart';

interface ProductCardProps {
  product: FoodProduct;
}

export default function ProductCard({ product }: ProductCardProps) {
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const { addToCart, isInCart, getItemQuantity, updateQuantity } = useCart();

  const itemQuantity = getItemQuantity(product.id);
  const isProductInCart = isInCart(product.id);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(product, 1);
  };

  const getStockStatus = (quantity: number) => {
    if (quantity === 0) {
      return { label: 'Stokta Yok', color: 'bg-red-100 text-red-800' };
    } else if (quantity <= 5) {
      return { label: 'Son Adetler', color: 'bg-orange-100 text-orange-800' };
    } else {
      return { label: 'Stokta Var', color: 'bg-green-100 text-green-800' };
    }
  };

  const stockStatus = getStockStatus(product.stockQty || 0);
  const imageUrl = product.images && product.images.length > 0 
    ? (product.images as string[])[0] 
    : 'https://images.unsplash.com/photo-1589924691995-400dc9ecc119?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400';

  return (
    <>
      <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setIsDetailOpen(true)}>
        <div className="relative">
          <div className="aspect-square overflow-hidden rounded-t-lg">
            <img
              src={imageUrl}
              alt={product.name}
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
            />
          </div>
          <div className="absolute top-3 left-3">
            <Badge className={stockStatus.color}>
              {stockStatus.label}
            </Badge>
          </div>
          {product.species && (
            <div className="absolute top-3 right-3">
              <Badge variant="outline" className="bg-white">
                {PET_SPECIES[product.species as keyof typeof PET_SPECIES]}
              </Badge>
            </div>
          )}
        </div>

        <CardContent className="p-4">
          <div className="space-y-2">
            <h3 className="font-semibold text-slate-800 line-clamp-2">
              {product.name}
            </h3>
            {product.brand && (
              <p className="text-sm text-professional-gray">{product.brand}</p>
            )}
            {product.packageSizeGrams && (
              <p className="text-xs text-professional-gray">
                {product.packageSizeGrams}g paket
              </p>
            )}
            <div className="flex items-center justify-between">
              <div className="text-lg font-bold text-slate-800">
                ₺{parseFloat(product.price).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
              </div>
              <div className="flex items-center space-x-1">
                <Star className="h-3 w-3 text-yellow-400 fill-current" />
                <Star className="h-3 w-3 text-yellow-400 fill-current" />
                <Star className="h-3 w-3 text-yellow-400 fill-current" />
                <Star className="h-3 w-3 text-yellow-400 fill-current" />
                <Star className="h-3 w-3 text-gray-300" />
                <span className="text-xs text-professional-gray">(4.2)</span>
              </div>
            </div>
          </div>
        </CardContent>

        <CardFooter className="p-4 pt-0">
          {isProductInCart ? (
            <div className="flex items-center justify-between w-full" data-testid={`cart-controls-${product.id}`}>
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  updateQuantity(product.id, itemQuantity - 1);
                }}
                disabled={itemQuantity <= 1}
                data-testid={`button-decrease-${product.id}`}
              >
                <Minus className="h-4 w-4" />
              </Button>
              
              <span className="text-lg font-medium px-4" data-testid={`text-quantity-${product.id}`}>
                {itemQuantity}
              </span>
              
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  updateQuantity(product.id, itemQuantity + 1);
                }}
                disabled={product.stockQty !== undefined && itemQuantity >= product.stockQty}
                data-testid={`button-increase-${product.id}`}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <Button 
              className="w-full bg-medical-blue hover:bg-medical-blue/90 text-white"
              disabled={product.stockQty === 0}
              onClick={handleAddToCart}
              data-testid={`button-add-to-cart-${product.id}`}
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              {product.stockQty === 0 ? 'Stokta Yok' : 'Sepete Ekle'}
            </Button>
          )}
        </CardFooter>
      </Card>

      {/* Product Detail Modal */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{product.name}</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="aspect-square overflow-hidden rounded-lg">
                <img
                  src={imageUrl}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>
              
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-semibold text-slate-800">{product.name}</h3>
                  {product.brand && (
                    <p className="text-professional-gray">{product.brand}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-professional-gray">Fiyat:</span>
                    <span className="text-2xl font-bold text-slate-800">
                      ₺{parseFloat(product.price).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  
                  {product.packageSizeGrams && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-professional-gray">Paket Boyutu:</span>
                      <span className="font-medium">{product.packageSizeGrams}g</span>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-professional-gray">Stok Durumu:</span>
                    <Badge className={stockStatus.color}>
                      {stockStatus.label} ({product.stockQty} adet)
                    </Badge>
                  </div>
                  
                  {product.species && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-professional-gray">Uygun Hayvan:</span>
                      <Badge variant="outline">
                        {PET_SPECIES[product.species as keyof typeof PET_SPECIES]}
                      </Badge>
                    </div>
                  )}
                  
                  {product.sku && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-professional-gray">Ürün Kodu:</span>
                      <span className="font-mono text-sm">{product.sku}</span>
                    </div>
                  )}
                </div>

                {product.description && (
                  <div>
                    <h4 className="font-medium text-slate-800 mb-2">Ürün Açıklaması</h4>
                    <p className="text-sm text-professional-gray">{product.description}</p>
                  </div>
                )}

                <div className="space-y-2">
                  {isProductInCart ? (
                    <div className="flex items-center justify-between p-2 border rounded-lg">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateQuantity(product.id, itemQuantity - 1)}
                        disabled={itemQuantity <= 1}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      
                      <span className="text-lg font-medium px-4">
                        {itemQuantity} adet sepette
                      </span>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateQuantity(product.id, itemQuantity + 1)}
                        disabled={product.stockQty !== undefined && itemQuantity >= product.stockQty}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <Button 
                      className="w-full bg-medical-blue hover:bg-medical-blue/90 text-white"
                      disabled={product.stockQty === 0}
                      onClick={() => addToCart(product, 1)}
                    >
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      {product.stockQty === 0 ? 'Stokta Yok' : 'Sepete Ekle'}
                    </Button>
                  )}
                  
                  <Button variant="outline" className="w-full">
                    <Package className="h-4 w-4 mr-2" />
                    Favorilere Ekle
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
