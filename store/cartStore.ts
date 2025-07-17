import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CartItem {
  id: string;
  name: string | { ru: string; kk: string; en: string };
  price: number;
  image: string;
  quantity: number;
  sku: string;
}

interface CartStore {
  items: CartItem[];
  isOpen: boolean;
  addItem: (item: Omit<CartItem, 'quantity'>) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  toggleCart: () => void;
  closeCart: () => void;
  openCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      addItem: newItem =>
        set(state => {
          const existingItem = state.items.find(item => item.id === newItem.id);
          if (existingItem) {
            return {
              items: state.items.map(item =>
                item.id === newItem.id
                  ? { ...item, quantity: item.quantity + 1 }
                  : item
              ),
            };
          } else {
            return {
              items: [...state.items, { ...newItem, quantity: 1 }],
            };
          }
        }),

      removeItem: id =>
        set(state => ({
          items: state.items.filter(item => item.id !== id),
        })),

      updateQuantity: (id, quantity) =>
        set(state => {
          if (quantity <= 0) {
            return {
              items: state.items.filter(item => item.id !== id),
            };
          }
          return {
            items: state.items.map(item =>
              item.id === id ? { ...item, quantity } : item
            ),
          };
        }),

      clearCart: () =>
        set(() => ({
          items: [],
        })),

      toggleCart: () =>
        set(state => ({
          isOpen: !state.isOpen,
        })),

      closeCart: () =>
        set(() => ({
          isOpen: false,
        })),

      openCart: () =>
        set(() => ({
          isOpen: true,
        })),

      getTotalItems: () => {
        const state = get();
        return state.items.reduce((total, item) => total + item.quantity, 0);
      },

      getTotalPrice: () => {
        const state = get();
        return state.items.reduce(
          (total, item) => total + item.price * item.quantity,
          0
        );
      },
    }),
    {
      name: 'zereklab-cart-storage',
      partialize: state => ({ items: state.items }),
    }
  )
);

// Экспорт типов для использования в компонентах
export type { CartItem, CartStore };
