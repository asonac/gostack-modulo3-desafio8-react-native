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

type ProductPreview = Omit<Product, 'quantity'>;

interface CartContext {
  products: Product[];
  addToCart(item: ProductPreview): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      // TODO LOAD ITEMS FROM ASYNC STORAGE[]
      const shoppingCartList = await AsyncStorage.getItem(
        '@GoMarketplace:shoppingCartList',
      );

      if (shoppingCartList) {
        setProducts(JSON.parse(shoppingCartList));
      }
    }

    loadProducts();
  }, []);

  const addToCart = useCallback(
    async (product: ProductPreview) => {
      // TODO ADD A NEW ITEM TO THE CART
      const findItem = products.find(item => item.id === product.id);

      if (!findItem) {
        const { id, image_url, title, price } = product;
        const productInfo = { id, image_url, title, price, quantity: 1 };
        setProducts([...products, productInfo]);
      } else {
        const updatedList = products.map(item => {
          const { id, title, image_url, quantity, price } = item;
          if (item.id === product.id) {
            const newInfo = {
              id,
              title,
              price,
              image_url,
              quantity: quantity + 1,
            };
            return newInfo;
          }
          return item;
        });
        setProducts(updatedList);
      }

      await AsyncStorage.setItem(
        '@GoMarketplace:shoppingCartList',
        JSON.stringify(products),
      );
    },
    [products],
  );

  const increment = useCallback(
    async id => {
      // TODO INCREMENTS A PRODUCT QUANTITY IN THE CART
      const updatedList = products.map(product => {
        const { title, image_url, quantity, price } = product;
        if (product.id === id) {
          const newInfo = {
            id,
            title,
            price,
            image_url,
            quantity: quantity + 1,
          };
          return newInfo;
        }
        return product;
      });

      setProducts(updatedList);
      await AsyncStorage.setItem(
        '@GoMarketplace:shoppingCartList',
        JSON.stringify(products),
      );
    },
    [products],
  );

  const decrement = useCallback(
    async id => {
      // TODO DECREMENTS A PRODUCT QUANTITY IN THE CART
      const checkItem: Product | undefined = products.find(
        item => item.id === id,
      );

      if (checkItem !== undefined) {
        if (checkItem.quantity === 1) {
          const newList = products.filter(item => item.id !== id);

          setProducts(newList);
        } else {
          const newList: Product[] = products.map(item => {
            if (item.id === id) {
              const newQuantity: Product = {
                id: item.id,
                title: item.title,
                image_url: item.image_url,
                price: item.price,
                quantity: item.quantity - 1,
              };
              return newQuantity;
            }
            return item;
          });

          setProducts(newList);
        }
      }
      await AsyncStorage.setItem(
        '@GoMarketplace:shoppingCartList',
        JSON.stringify(products),
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
