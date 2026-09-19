import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  id: string; // Unique ID for the cart item (e.g. timestamp or random string)
  gameId: string;
  packageId: string;
  playerId: string; // The player ID the user enters
  price: number;
  quantity: number;
  name: string; // Name of the package (e.g. "660 Diamonds")
  gameName: string; // Name of the game (e.g. "Mobile Legends")
  image: string; // URL for the game/package image
}

interface CartStore {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'id'>) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  getTotalPrice: () => number;
  getItemCount: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item) => {
        set((state) => {
          // Check if identical item (same package AND same player ID) already exists
          const existingItemIndex = state.items.findIndex(
            (i) => i.packageId === item.packageId && i.playerId === item.playerId
          );

          if (existingItemIndex > -1) {
            // Increment quantity if identical item exists
            const newItems = [...state.items];
            newItems[existingItemIndex].quantity += item.quantity;
            return { items: newItems };
          } else {
            // Add as new item
            const newItem = { ...item, id: crypto.randomUUID() };
            return { items: [...state.items, newItem] };
          }
        });
      },
      removeItem: (id) => {
        set((state) => ({
          items: state.items.filter((item) => item.id !== id),
        }));
      },
      updateQuantity: (id, quantity) => {
        set((state) => ({
          items: state.items.map((item) =>
            item.id === id ? { ...item, quantity: Math.max(1, quantity) } : item
          ),
        }));
      },
      clearCart: () => set({ items: [] }),
      getTotalPrice: () => {
        return get().items.reduce((total, item) => total + item.price * item.quantity, 0);
      },
      getItemCount: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },
    }),
    {
      name: 'cart-storage', // name of the item in local storage
    }
  )
);
