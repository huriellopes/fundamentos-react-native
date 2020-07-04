import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Omit<Product, 'quantity'>): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      const storedProductListString = await AsyncStorage.getItem(
        '@marketplace:productList',
      );

      if (!storedProductListString) return Promise.resolve();

      setProducts(JSON.parse(storedProductListString));
      return Promise.resolve();
    }

    loadProducts();
  }, []);

  const addToCart = useCallback(
    async product => {
      const newProductList = [
        ...products,
        {
          ...product,
          quantity: 1,
        },
      ];
      setProducts(newProductList);

      await AsyncStorage.setItem(
        '@marketplace:productList',
        JSON.stringify(newProductList),
      );
    },
    [products],
  );

  const increment = useCallback(
    async id => {
      const newProductList = products.map(product => {
        if (product.id === id) {
          return {
            ...product,
            quantity: product.quantity + 1,
          };
        }
        return product;
      });
      setProducts(newProductList);

      await AsyncStorage.setItem(
        '@marketplace:productList',
        JSON.stringify(newProductList),
      );
    },
    [products],
  );

  const decrement = useCallback(
    async id => {
      const newProductList = products.map(product => {
        if (product.id === id) {
          return {
            ...product,
            quantity: product.quantity - 1,
          };
        }
        return product;
      });
      setProducts(newProductList);

      await AsyncStorage.setItem(
        '@marketplace:productList',
        JSON.stringify(newProductList),
      );
    },
    [products],
  );

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
