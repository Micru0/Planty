import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import type { CartItem } from '@/types/cart.types';
import { saveProductToFavorites } from '@/utils/supabase/favorites';
import type { Session } from 'next-auth';

interface CartState {
  items: CartItem[];
  // eslint-disable-next-line no-unused-vars
  addItem: (product: Omit<CartItem, 'id' | 'quantity'>, quantity?: number) => void;
  // eslint-disable-next-line no-unused-vars
  removeItem: (itemId: string) => void;
  // eslint-disable-next-line no-unused-vars
  updateItemQuantity: (itemId: string, newQuantity: number) => void;
  clearCart: () => void;
  // eslint-disable-next-line no-unused-vars
  saveItemForLater: (itemToSave: CartItem, session: Session | null) => Promise<void>; 
  getTotalPrice: () => number;
  getItemCount: () => number;
  isCartLoaded: boolean; // To track if cart has been loaded from localStorage
  setIsCartLoaded: (loaded: boolean) => void;
}

const CART_STORAGE_KEY = 'plantyCartStore';

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isCartLoaded: false,
      setIsCartLoaded: (loaded) => set({ isCartLoaded: loaded }),
      addItem: (product, quantity = 1) => {
        set((state) => {
          const existingItem = state.items.find(item => item.productId === product.productId);
          if (existingItem) {
            return {
              items: state.items.map(item =>
                item.productId === product.productId
                  ? { ...item, quantity: item.quantity + quantity }
                  : item
              ),
            };
          } else {
            return {
              items: [...state.items, { ...product, id: uuidv4(), quantity }],
            };
          }
        });
      },
      removeItem: (itemId) => {
        set((state) => ({ items: state.items.filter(item => item.id !== itemId) }));
      },
      updateItemQuantity: (itemId, newQuantity) => {
        if (newQuantity <= 0) {
          get().removeItem(itemId);
        } else {
          set((state) => ({
            items: state.items.map(item =>
              item.id === itemId ? { ...item, quantity: newQuantity } : item
            ),
          }));
        }
      },
      clearCart: () => {
        set({ items: [] });
      },
      saveItemForLater: async (itemToSave, session) => {
        if (!session || !session.user?.id) {
          throw new Error('User session is invalid. Please log in to save items.');
        }
        await saveProductToFavorites(itemToSave.productId, session);
        get().removeItem(itemToSave.id);
      },
      getTotalPrice: () => {
        return get().items.reduce((total, item) => total + item.price * item.quantity, 0);
      },
      getItemCount: () => {
        return get().items.reduce((count, item) => count + item.quantity, 0);
      },
    }),
    {
      name: CART_STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => {
        return (state) => {
          if (state) {
            state.setIsCartLoaded(true);
            console.log('[cartStore] Cart rehydrated from localStorage, isCartLoaded set to true.');
          }
        };
      }
    }
  )
);

// The explicit rehydration call below is removed as onRehydrateStorage handles this.
// if (typeof window !== 'undefined') {
//     useCartStore.persist.rehydrate().then(() => {
//         useCartStore.getState().setIsCartLoaded(true);
//     });
// } 