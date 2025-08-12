import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Package, Plus, Search, Filter, AlertTriangle, TrendingUp, TrendingDown, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import LoadingSpinner from '@/components/common/loading-spinner';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface InventoryItem {
  id: string;
  name: string;
  brand?: string;
  category: 'FOOD' | 'MEDICINE' | 'EQUIPMENT' | 'VACCINE' | 'SUPPLEMENT';
  sku: string;
  currentStock: number;
  minimumStock: number;
  maximumStock: number;
  unit: string;
  price: string;
  costPrice?: string;
  supplier?: string;
  location?: string;
  expiryDate?: string;
  lastRestocked?: string;
  status: 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK' | 'EXPIRED';
}

export default function Inventory() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [activeTab, setActiveTab] = useState('all');
  const { toast } = useToast();

  const { data: inventoryItems, isLoading } = useQuery({
    queryKey: ['/api/inventory'],
  });

  const categories = {
    'FOOD': { label: 'Mama & Gıda', color: 'bg-green-100 text-green-800', icon: '🥘' },
    'MEDICINE': { label: 'İlaç', color: 'bg-blue-100 text-blue-800', icon: '💊' },
    'EQUIPMENT': { label: 'Ekipman', color: 'bg-purple-100 text-purple-800', icon: '🔧' },
    'VACCINE': { label: 'Aşı', color: 'bg-red-100 text-red-800', icon: '💉' },
    'SUPPLEMENT': { label: 'Destek Ürünü', color: 'bg-yellow-100 text-yellow-800', icon: '🌿' },
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'IN_STOCK': return 'bg-green-100 text-green-800';
      case 'LOW_STOCK': return 'bg-yellow-100 text-yellow-800';
      case 'OUT_OF_STOCK': return 'bg-red-100 text-red-800';
      case 'EXPIRED': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'IN_STOCK': return 'Stokta';
      case 'LOW_STOCK': return 'Düşük Stok';
      case 'OUT_OF_STOCK': return 'Tükendi';
      case 'EXPIRED': return 'Süresi Doldu';
      default: return status;
    }
  };

  const getStockLevel = (item: InventoryItem) => {
    if (item.currentStock <= 0) return 0;
    return Math.min(100, (item.currentStock / item.maximumStock) * 100);
  };

  const filteredItems = (inventoryItems || []).filter((item: InventoryItem) => {
    const matchesSearch = 
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = !selectedCategory || item.category === selectedCategory;
    const matchesStatus = !selectedStatus || item.status === selectedStatus;
    
    let matchesTab = true;
    if (activeTab === 'low') matchesTab = item.status === 'LOW_STOCK' || item.status === 'OUT_OF_STOCK';
    else if (activeTab === 'expired') matchesTab = item.status === 'EXPIRED';
    
    return matchesSearch && matchesCategory && matchesStatus && matchesTab;
  });

  // Statistics
  const totalItems = (inventoryItems || []).length;
  const lowStockItems = (inventoryItems || []).filter((item: InventoryItem) => 
    item.status === 'LOW_STOCK' || item.status === 'OUT_OF_STOCK'
  ).length;
  const expiredItems = (inventoryItems || []).filter((item: InventoryItem) => 
    item.status === 'EXPIRED'
  ).length;
  const totalValue = (inventoryItems || []).reduce((sum: number, item: InventoryItem) => 
    sum + (item.currentStock * parseFloat(item.price || '0')), 0
  );

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
          <h1 className="text-2xl font-bold text-slate-800">Envanter Yönetimi</h1>
          <p className="text-professional-gray">Stok takibi ve envanter kontrolü</p>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline">
            <BarChart3 className="h-4 w-4 mr-2" />
            Raporlar
          </Button>
          
          <Button
            className="bg-medical-blue hover:bg-medical-blue/90"
            data-testid="button-add-item"
          >
            <Plus className="h-4 w-4 mr-2" />
            Ürün Ekle
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-professional-gray">Toplam Ürün</p>
                <p className="text-2xl font-bold text-slate-800">{totalItems}</p>
              </div>
              <Package className="h-8 w-8 text-medical-blue" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-professional-gray">Düşük Stok</p>
                <p className="text-2xl font-bold text-amber-600">{lowStockItems}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-amber-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-professional-gray">Süresi Dolan</p>
                <p className="text-2xl font-bold text-red-600">{expiredItems}</p>
              </div>
              <TrendingDown className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-professional-gray">Toplam Değer</p>
                <p className="text-2xl font-bold text-healthcare-green">₺{totalValue.toLocaleString()}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-healthcare-green" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="all">Tüm Ürünler</TabsTrigger>
          <TabsTrigger value="low">Düşük Stok</TabsTrigger>
          <TabsTrigger value="expired">Süresi Dolan</TabsTrigger>
        </TabsList>

        {/* Search and Filters */}
        <Card className="mt-4">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-professional-gray" />
                <Input
                  placeholder="Ürün adı, marka veya SKU ile ara..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                  data-testid="input-search-inventory"
                />
              </div>
              
              <div className="flex gap-2">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:ring-medical-blue focus:border-medical-blue"
                >
                  <option value="">Tüm Kategoriler</option>
                  {Object.entries(categories).map(([key, category]) => (
                    <option key={key} value={key}>{category.label}</option>
                  ))}
                </select>
                
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  Filtrele
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <TabsContent value={activeTab} className="space-y-4">
          {/* Inventory Items */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item: InventoryItem) => (
              <Card key={item.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-lg">{item.name}</CardTitle>
                      {item.brand && (
                        <p className="text-sm text-professional-gray">{item.brand}</p>
                      )}
                      <div className="flex gap-2">
                        <Badge className={categories[item.category].color}>
                          {categories[item.category].icon} {categories[item.category].label}
                        </Badge>
                        <Badge className={getStatusColor(item.status)}>
                          {getStatusLabel(item.status)}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {/* Stock Level */}
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-professional-gray">Stok Seviyesi</span>
                      <span className="font-medium">
                        {item.currentStock} / {item.maximumStock} {item.unit}
                      </span>
                    </div>
                    <Progress value={getStockLevel(item)} className="h-2" />
                    {item.currentStock <= item.minimumStock && (
                      <p className="text-xs text-amber-600 mt-1">
                        ⚠️ Minimum stok seviyesinin altında
                      </p>
                    )}
                  </div>

                  {/* Details */}
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-professional-gray">SKU:</span>
                      <span className="font-medium">{item.sku}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-professional-gray">Fiyat:</span>
                      <span className="font-medium">₺{parseFloat(item.price).toLocaleString()}</span>
                    </div>
                    
                    {item.location && (
                      <div className="flex justify-between">
                        <span className="text-professional-gray">Konum:</span>
                        <span className="font-medium">{item.location}</span>
                      </div>
                    )}
                    
                    {item.expiryDate && (
                      <div className="flex justify-between">
                        <span className="text-professional-gray">Son Kullanma:</span>
                        <span className={`font-medium ${
                          new Date(item.expiryDate) < new Date() 
                            ? 'text-red-600' 
                            : new Date(item.expiryDate) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
                            ? 'text-amber-600'
                            : 'text-slate-800'
                        }`}>
                          {new Date(item.expiryDate).toLocaleDateString('tr-TR')}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      Düzenle
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1">
                      Stok Ekle
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Empty State */}
          {filteredItems.length === 0 && (
            <Card>
              <CardContent className="p-12 text-center">
                <div className="text-professional-gray mb-4">
                  <Package className="h-16 w-16 mx-auto" />
                </div>
                <h3 className="text-lg font-medium text-slate-800 mb-2">
                  {activeTab === 'all' ? 'Henüz envanter ürünü yok' : 
                   activeTab === 'low' ? 'Düşük stoklu ürün yok' : 
                   'Süresi dolan ürün yok'}
                </h3>
                <p className="text-professional-gray mb-4">
                  İlk envanter ürününüzü eklemek için yukarıdaki butonu kullanın.
                </p>
                <Button className="bg-medical-blue hover:bg-medical-blue/90">
                  <Plus className="h-4 w-4 mr-2" />
                  İlk Ürünü Ekle
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}