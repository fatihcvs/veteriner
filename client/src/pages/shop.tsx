import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, Filter, ShoppingCart, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import LoadingSpinner from '@/components/common/loading-spinner';
import ProductCard from '@/components/shop/product-card';
import { PET_SPECIES } from '@/lib/constants';
import { FoodProduct } from '@shared/schema';
import CartButton from '@/components/shop/cart-button';

export default function Shop() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedSpecies, setSelectedSpecies] = useState<string>('');

  const { data: products, isLoading, error } = useQuery({
    queryKey: ['/api/products'],
    retry: false,
  });

  const filteredProducts = products?.filter((product: FoodProduct) => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (product.brand && product.brand.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesSpecies = !selectedSpecies || product.species === selectedSpecies;
    return matchesSearch && matchesSpecies;
  }) || [];

  const categories = [
    { id: 'food', label: 'Mama ve Beslenme' },
    { id: 'medicine', label: 'İlaç ve Tedavi' },
    { id: 'accessories', label: 'Aksesuar' },
    { id: 'toys', label: 'Oyuncak' },
    { id: 'hygiene', label: 'Temizlik ve Hijyen' },
  ];

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
          <h2 className="text-2xl font-bold text-slate-800">Mağaza</h2>
          <p className="text-professional-gray">Evcil hayvan ürünleri ve sağlık malzemeleri</p>
        </div>
        
        <CartButton />
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-professional-gray h-4 w-4" />
              <Input
                placeholder="Ürün ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            {/* Category and Species Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-slate-800 mb-2">
                  Kategori
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-medical-blue focus:border-medical-blue"
                >
                  <option value="">Tüm Kategoriler</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.label}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="flex-1">
                <label className="block text-sm font-medium text-slate-800 mb-2">
                  Hayvan Türü
                </label>
                <select
                  value={selectedSpecies}
                  onChange={(e) => setSelectedSpecies(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-medical-blue focus:border-medical-blue"
                >
                  <option value="">Tüm Türler</option>
                  {Object.entries(PET_SPECIES).map(([key, value]) => (
                    <option key={key} value={key}>{value}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Products Grid */}
      {filteredProducts.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="space-y-4">
              <div className="bg-slate-100 p-4 rounded-full w-16 h-16 mx-auto flex items-center justify-center">
                <Package className="text-professional-gray h-8 w-8" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-800 mb-2">
                  {searchTerm || selectedCategory || selectedSpecies ? 'Ürün bulunamadı' : 'Henüz ürün yok'}
                </h3>
                <p className="text-professional-gray">
                  {searchTerm || selectedCategory || selectedSpecies 
                    ? 'Arama kriterlerinize uygun ürün bulunamadı. Filtrelerinizi değiştirmeyi deneyin.' 
                    : 'Mağazaya henüz ürün eklenmemiş.'
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product: FoodProduct) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}

      {/* Featured Categories */}
      <Card>
        <CardHeader>
          <CardTitle>Öne Çıkan Kategoriler</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categories.map((category) => (
              <Button
                key={category.id}
                variant="outline"
                className="h-24 flex flex-col items-center justify-center text-center hover:border-medical-blue hover:bg-blue-50"
                onClick={() => setSelectedCategory(category.id)}
              >
                <Package className="h-6 w-6 mb-2 text-medical-blue" />
                <span className="text-xs font-medium">{category.label}</span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
