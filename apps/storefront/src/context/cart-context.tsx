'use client';

import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  ReactNode,
} from 'react';
import type { CartItem, Cart } from '@static-wears/shared';

type CartAction =
  | { type: 'ADD_ITEM'; payload: CartItem }
  | { type: 'REMOVE_ITEM'; payload: { variant_id: string } }
  | { type: 'UPDATE_QTY'; payload: { variant_id: string; quantity: number } }
  | { type: 'CLEAR' }
  | { type: 'HYDRATE'; payload: CartItem[] };

function cartReducer(state: Cart, action: CartAction): Cart {
  let items: CartItem[];

  switch (action.type) {
    case 'ADD_ITEM': {
      const existing = state.items.find(
        (i) => i.variant_id === action.payload.variant_id
      );
      if (existing) {
        items = state.items.map((i) =>
          i.variant_id === action.payload.variant_id
            ? { ...i, quantity: i.quantity + action.payload.quantity }
            : i
        );
      } else {
        items = [...state.items, action.payload];
      }
      break;
    }
    case 'REMOVE_ITEM':
      items = state.items.filter(
        (i) => i.variant_id !== action.payload.variant_id
      );
      break;
    case 'UPDATE_QTY':
      items =
        action.payload.quantity === 0
          ? state.items.filter(
              (i) => i.variant_id !== action.payload.variant_id
            )
          : state.items.map((i) =>
              i.variant_id === action.payload.variant_id
                ? { ...i, quantity: action.payload.quantity }
                : i
            );
      break;
    case 'CLEAR':
      items = [];
      break;
    case 'HYDRATE':
      items = action.payload;
      break;
    default:
      return state;
  }

  const total = items.reduce(
    (sum, i) => sum + i.unit_price * i.quantity,
    0
  );
  return { items, total };
}

const CartContext = createContext<{
  cart: Cart;
  dispatch: React.Dispatch<CartAction>;
} | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, dispatch] = useReducer(cartReducer, { items: [], total: 0 });

  useEffect(() => {
    const saved = sessionStorage.getItem('sw-cart');
    if (saved) {
      try {
        dispatch({ type: 'HYDRATE', payload: JSON.parse(saved) });
      } catch {}
    }
  }, []);

  useEffect(() => {
    sessionStorage.setItem('sw-cart', JSON.stringify(cart.items));
  }, [cart]);

  return (
    <CartContext.Provider value={{ cart, dispatch }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
