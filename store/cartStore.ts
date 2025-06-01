import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { IProduct } from '@/types'

export interface CartItem extends IProduct {
  quantity: number
}

interface CartStore {
  items: CartItem[]
  isOpen: boolean
  addItem: (product: IProduct) => void
  removeItem: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  getTotalItems: () => number
  getTotalPrice: () => number
  toggleCart: () => void
  closeCart: () => void
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      
      addItem: (product: IProduct) => {
        if (!product._id) {
          console.error('Product being added to cart is missing an _id', product)
          return
        }
        const items = get().items
        const existingItem = items.find(item => item._id === product._id)
        
        if (existingItem) {
          set({
            items: items.map(item =>
              item._id === product._id
                ? { ...item, quantity: item.quantity + 1 }
                : item
            )
          })
        } else {
          set({
            items: [...items, { ...product, quantity: 1 }]
          })
        }
      },
      
      removeItem: (productId: string) => {
        set({
          items: get().items.filter(item => item._id !== productId)
        })
      },
      
      updateQuantity: (productId: string, quantity: number) => {
        if (quantity <= 0) {
          get().removeItem(productId)
          return
        }
        
        set({
          items: get().items.map(item =>
            item._id === productId
              ? { ...item, quantity }
              : item
          )
        })
      },
      
      clearCart: () => {
        set({ items: [] })
      },
      
      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0)
      },
      
      getTotalPrice: () => {
        return get().items.reduce((total, item) => {
          const price = typeof item.price === 'number' ? item.price : 0;
          const quantity = typeof item.quantity === 'number' ? item.quantity : 0;
          return total + (price * quantity);
        }, 0)
      },
      
      toggleCart: () => {
        set({ isOpen: !get().isOpen })
      },
      
      closeCart: () => {
        set({ isOpen: false })
      }
    }),
    {
      name: 'zereklab-cart',
      partialize: (state) => (
        {
          items: state.items.map(item => ({
            _id: item._id,
            name: item.name,
            price: item.price,
            images: item.images.slice(0,1),
            quantity: item.quantity,
            category: item.category,
            inStock: item.inStock,
          })) as CartItem[],
        }
      ),
    }
  )
) 