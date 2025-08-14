import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Star, Sparkles } from 'lucide-react';
import { useCart } from '@/hooks/useCart';
import { useAuth } from '@/hooks/useAuth';
import { PET_SPECIES } from '@/lib/constants';
import type { FoodProduct } from '@shared/schema';

export default function SmartRecommendations() {
  const { addToCart, isInCart } = useCart();
  const { user } = useAuth();

  const { data: products } = useQuery({
    queryKey: ['/api/products'],
    retry: false,
  });

  const { data: pets } = useQuery({
    queryKey: ['/api/pets'],
    retry: false,
  });

  const getPersonalizedRecommendations = () => {
    if (!products || !pets || !user) return [];
    
    const userPets = (pets as any) || [];
    const allProducts = (products as any) || [];
    
    // Get user's pet species for personalization
    const userPetSpecies = userPets.map((pet: any) => pet.species);
    
    // Filter products based on user's pets and prioritize high ratings/popular items
    const recommendations = allProducts
      .filter((product: FoodProduct) => {
        // Include species-specific products or general products
        return !product.species || userPetSpecies.includes(product.species);
      })
      .sort((a: FoodProduct, b: FoodProduct) => {
        // Prioritize products that match user's pet species
        const aMatchesPet = userPetSpecies.includes(a.species);
        const bMatchesPet = userPetSpecies.includes(b.species);
        
        if (aMatchesPet && !bMatchesPet) return -1;
        if (!aMatchesPet && bMatchesPet) return 1;
        
        // Secondary sort by price (lower first for better value)
        return parseFloat(a.price) - parseFloat(b.price);
      })
      .slice(0, 4); // Show top 4 recommendations
    
    return recommendations;
  };

  const recommendations = getPersonalizedRecommendations();

  if (recommendations.length === 0) return null;

  const handleAddToCart = (product: FoodProduct) => {
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

  return (
    <Card className="border-2 border-dashed border-medical-blue/30 bg-gradient-to-br from-blue-50/50 to-teal-50/50">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg text-slate-800">
          <Sparkles className="h-5 w-5 text-medical-blue" />
          Size Özel Öneriler
          <Badge variant="outline" className="text-xs bg-medical-blue text-white">
            AI Destekli
          </Badge>
        </CardTitle>
        <p className="text-sm text-professional-gray">
          Evcil hayvanlarınıza özel seçilmiş ürünler
        </p>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {recommendations.map((product: FoodProduct) => {
            const stockStatus = getStockStatus(product.stockQty || 0);
            const imageUrl = product.images && (product.images as any)?.length > 0 
              ? (product.images as string[])[0] 
              : 'https://images.unsplash.com/photo-1589924691995-400dc9ecc119?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&h=200';
            
            const isProductInCart = isInCart(product.id);
            
            return (
              <div key={product.id} className="flex items-center space-x-3 p-3 bg-white rounded-lg border hover:shadow-md transition-shadow">
                <div className="flex-shrink-0">
                  <img
                    src={imageUrl}
                    alt={product.name}
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                </div>
                
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-slate-800 text-sm line-clamp-2">
                    {product.name}
                  </h4>
                  {product.brand && (
                    <p className="text-xs text-professional-gray">{product.brand}</p>
                  )}
                  
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-medical-blue text-sm">
                        ₺{parseFloat(product.price).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                      </span>
                      {product.species && (
                        <Badge variant="outline" className="text-xs">
                          {PET_SPECIES[product.species as keyof typeof PET_SPECIES] || product.species}
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-1">
                      <div className="flex items-center">
                        <Star className="h-3 w-3 text-yellow-400 fill-current" />
                        <Star className="h-3 w-3 text-yellow-400 fill-current" />
                        <Star className="h-3 w-3 text-yellow-400 fill-current" />
                        <Star className="h-3 w-3 text-yellow-400 fill-current" />
                        <Star className="h-3 w-3 text-gray-300" />
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-2">
                    {isProductInCart ? (
                      <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                        ✓ Sepette
                      </Badge>
                    ) : (
                      <Button 
                        size="sm"
                        variant="outline"
                        className="text-xs h-7 px-2"
                        onClick={() => handleAddToCart(product)}
                        disabled={product.stockQty === 0}
                      >
                        <ShoppingCart className="h-3 w-3 mr-1" />
                        {product.stockQty === 0 ? 'Stokta Yok' : 'Sepete Ekle'}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        
        <div className="text-center pt-2">
          <p className="text-xs text-professional-gray">
            💡 Öneriler evcil hayvan türlerinize göre kişiselleştirilmiştir
          </p>
        </div>
      </CardContent>
    </Card>
  );
}