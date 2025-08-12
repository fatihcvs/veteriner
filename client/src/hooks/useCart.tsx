import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useToast } from '@/hooks/use-toast';

interface CartItem {
  id: string;
  productId: string;
  name: string;
  price: string;
  quantity: number;
  image?: string;
  brand?: string;
  stockQty?: number;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (product: any, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
  isInCart: (productId: string) => boolean;
  getItemQuantity: (productId: string) => number;
}

const CartContext = createContext<CartContextType | null>(null);

const CART_STORAGE_KEY = 'vettrack_cart';

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const { toast } = useToast();

  // Load cart from localStorage on mount
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem(CART_STORAGE_KEY);
      if (savedCart) {
        setItems(JSON.parse(savedCart));
      }
    } catch (error) {
      console.error('Error loading cart from localStorage:', error);
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch (error) {
      console.error('Error saving cart to localStorage:', error);
    }
  }, [items]);

  const addToCart = (product: any, quantity: number = 1) => {
    // Check stock availability
    if (product.stockQty !== undefined && product.stockQty < quantity) {
      toast({
        title: 'Stok Yetersiz',
        description: `Bu üründen sadece ${product.stockQty} adet mevcut.`,
        variant: 'destructive',
      });
      return;
    }

    setItems(prevItems => {
      const existingItem = prevItems.find(item => item.productId === product.id);
      
      if (existingItem) {
        const newQuantity = existingItem.quantity + quantity;
        
        // Check if new quantity exceeds stock
        if (product.stockQty !== undefined && product.stockQty < newQuantity) {
          toast({
            title: 'Stok Yetersiz',
            description: `Bu üründen maksimum ${product.stockQty} adet ekleyebilirsiniz.`,
            variant: 'destructive',
          });
          return prevItems;
        }

        toast({
          title: 'Sepete Eklendi',
          description: `${product.name} sepetinize eklendi.`,
        });

        return prevItems.map(item =>
          item.productId === product.id
            ? { ...item, quantity: newQuantity }
            : item
        );
      } else {
        const imageUrl = product.images && product.images.length > 0 
          ? (product.images as string[])[0] 
          : null;

        toast({
          title: 'Sepete Eklendi',
          description: `${product.name} sepetinize eklendi.`,
        });

        return [...prevItems, {
          id: `${product.id}-${Date.now()}`,
          productId: product.id,
          name: product.name,
          price: product.price,
          quantity,
          image: imageUrl,
          brand: product.brand,
          stockQty: product.stockQty,
        }];
      }
    });
  };

  const removeFromCart = (productId: string) => {
    setItems(prevItems => {
      const updatedItems = prevItems.filter(item => item.productId !== productId);
      
      if (updatedItems.length < prevItems.length) {
        toast({
          title: 'Ürun Sepetten Kaldırıldı',
          description: 'Ürün sepetinizden kaldırıldı.',
        });
      }
      
      return updatedItems;
    });
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setItems(prevItems =>
      prevItems.map(item => {
        if (item.productId === productId) {
          // Check stock limit
          if (item.stockQty !== undefined && quantity > item.stockQty) {
            toast({
              title: 'Stok Yetersiz',
              description: `Bu üründen maksimum ${item.stockQty} adet ekleyebilirsiniz.`,
              variant: 'destructive',
            });
            return item;
          }
          return { ...item, quantity };
        }
        return item;
      })
    );
  };

  const clearCart = () => {
    setItems([]);
    toast({
      title: 'Sepet Temizlendi',
      description: 'Sepetinizdeki tüm ürünler kaldırıldı.',
    });
  };

  const getTotalItems = () => {
    return items.reduce((total, item) => total + item.quantity, 0);
  };

  const getTotalPrice = () => {
    return items.reduce((total, item) => total + (parseFloat(item.price) * item.quantity), 0);
  };

  const isInCart = (productId: string) => {
    return items.some(item => item.productId === productId);
  };

  const getItemQuantity = (productId: string) => {
    const item = items.find(item => item.productId === productId);
    return item ? item.quantity : 0;
  };

  return (
    <CartContext.Provider value={{
      items,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      getTotalItems,
      getTotalPrice,
      isInCart,
      getItemQuantity,
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}