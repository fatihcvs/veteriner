import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Package, Plus, Search, Filter, AlertTriangle, TrendingUp, TrendingDown, BarChart3, Edit, Save, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import LoadingSpinner from '@/components/common/loading-spinner';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

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
  description?: string;
  images?: string[];
}

const inventoryFormSchema = z.object({
  name: z.string().min(1, 'Ürün adı zorunludur'),
  brand: z.string().optional(),
  category: z.enum(['FOOD', 'MEDICINE', 'EQUIPMENT', 'VACCINE', 'SUPPLEMENT']),
  sku: z.string().min(1, 'SKU zorunludur'),
  currentStock: z.number().min(0, 'Stok miktarı 0 veya daha büyük olmalı'),
  minimumStock: z.number().min(0, 'Minimum stok 0 veya daha büyük olmalı'),
  maximumStock: z.number().min(1, 'Maksimum stok 1 veya daha büyük olmalı'),
  unit: z.string().min(1, 'Birim zorunludur'),
  price: z.string().min(1, 'Fiyat zorunludur'),
  supplier: z.string().optional(),
  location: z.string().optional(),
  description: z.string().optional(),
});

type InventoryFormData = z.infer<typeof inventoryFormSchema>;

export default function Inventory() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [activeTab, setActiveTab] = useState('all');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const { toast } = useToast();

  const form = useForm<InventoryFormData>({
    resolver: zodResolver(inventoryFormSchema),
    defaultValues: {
      name: '',
      brand: '',
      category: 'FOOD',
      sku: '',
      currentStock: 0,
      minimumStock: 10,
      maximumStock: 100,
      unit: 'adet',
      price: '',
      supplier: '',
      location: 'Depo A',
      description: '',
    },
  });

  const { data: inventoryItems = [], isLoading } = useQuery<InventoryItem[]>({
    queryKey: ['/api/inventory'],
  });

  const createItemMutation = useMutation({
    mutationFn: async (data: InventoryFormData) => {
      return await apiRequest('POST', '/api/inventory', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/inventory'] });
      setIsFormOpen(false);
      form.reset();
      toast({
        title: 'Başarılı',
        description: 'Envanter ürünü başarıyla eklendi.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Hata',
        description: 'Envanter ürünü eklenirken hata oluştu.',
        variant: 'destructive',
      });
    },
  });

  const updateItemMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<InventoryFormData> }) => {
      return await apiRequest('PUT', `/api/inventory/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/inventory'] });
      setEditingItem(null);
      toast({
        title: 'Başarılı',
        description: 'Envanter ürünü başarıyla güncellendi.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Hata',
        description: 'Envanter ürünü güncellenirken hata oluştu.',
        variant: 'destructive',
      });
    },
  });

  const onSubmit = (data: InventoryFormData) => {
    if (editingItem) {
      updateItemMutation.mutate({ id: editingItem.id, data });
    } else {
      createItemMutation.mutate(data);
    }
  };

  const startEdit = (item: InventoryItem) => {
    setEditingItem(item);
    form.reset({
      name: item.name,
      brand: item.brand || '',
      category: item.category,
      sku: item.sku,
      currentStock: item.currentStock,
      minimumStock: item.minimumStock,
      maximumStock: item.maximumStock,
      unit: item.unit,
      price: item.price,
      supplier: item.supplier || '',
      location: item.location || '',
      description: item.description || '',
    });
    setIsFormOpen(true);
  };

  const cancelEdit = () => {
    setEditingItem(null);
    setIsFormOpen(false);
    form.reset();
  };

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
          
          <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
            <DialogTrigger asChild>
              <Button
                className="bg-medical-blue hover:bg-medical-blue/90"
                data-testid="button-add-item"
                onClick={() => {
                  setEditingItem(null);
                  form.reset();
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                Ürün Ekle
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingItem ? 'Envanter Ürünü Düzenle' : 'Yeni Envanter Ürünü Ekle'}
                </DialogTitle>
              </DialogHeader>

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Ürün Adı *</FormLabel>
                          <FormControl>
                            <Input {...field} data-testid="input-product-name" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="brand"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Marka</FormLabel>
                          <FormControl>
                            <Input {...field} data-testid="input-brand" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Kategori *</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-category">
                                <SelectValue placeholder="Kategori seçin" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {Object.entries(categories).map(([key, category]) => (
                                <SelectItem key={key} value={key}>
                                  {category.icon} {category.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="sku"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>SKU *</FormLabel>
                          <FormControl>
                            <Input {...field} data-testid="input-sku" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="currentStock"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Mevcut Stok *</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              {...field} 
                              onChange={e => field.onChange(Number(e.target.value))}
                              data-testid="input-current-stock"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="minimumStock"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Minimum Stok *</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              {...field} 
                              onChange={e => field.onChange(Number(e.target.value))}
                              data-testid="input-minimum-stock"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="maximumStock"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Maksimum Stok *</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              {...field} 
                              onChange={e => field.onChange(Number(e.target.value))}
                              data-testid="input-maximum-stock"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="unit"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Birim *</FormLabel>
                          <FormControl>
                            <Input {...field} data-testid="input-unit" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="price"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Fiyat *</FormLabel>
                          <FormControl>
                            <Input {...field} data-testid="input-price" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="supplier"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tedarikçi</FormLabel>
                          <FormControl>
                            <Input {...field} data-testid="input-supplier" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Depo Konumu</FormLabel>
                        <FormControl>
                          <Input {...field} data-testid="input-location" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Açıklama</FormLabel>
                        <FormControl>
                          <Textarea {...field} data-testid="textarea-description" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex justify-end gap-2 pt-4">
                    <Button type="button" variant="outline" onClick={cancelEdit}>
                      <X className="h-4 w-4 mr-2" />
                      İptal
                    </Button>
                    <Button 
                      type="submit" 
                      className="bg-medical-blue hover:bg-medical-blue/90"
                      disabled={createItemMutation.isPending || updateItemMutation.isPending}
                      data-testid="button-save-item"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      {editingItem ? 'Güncelle' : 'Kaydet'}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
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
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => startEdit(item)}
                      data-testid={`button-edit-${item.id}`}
                    >
                      <Edit className="h-3 w-3 mr-1" />
                      Düzenle
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => {
                        // Quick stock add functionality
                        const newStock = prompt('Eklenecek stok miktarı:', '10');
                        if (newStock) {
                          updateItemMutation.mutate({
                            id: item.id,
                            data: { currentStock: item.currentStock + parseInt(newStock) }
                          });
                        }
                      }}
                      data-testid={`button-add-stock-${item.id}`}
                    >
                      <Plus className="h-3 w-3 mr-1" />
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
                <Button 
                  className="bg-medical-blue hover:bg-medical-blue/90"
                  onClick={() => {
                    setEditingItem(null);
                    form.reset();
                    setIsFormOpen(true);
                  }}
                >
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