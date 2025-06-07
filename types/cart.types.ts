export interface CartItem {
  id: string; // Unique ID for the cart item itself (e.g., a UUID)
  productId: string; // ID of the product (listing)
  name: string; // Name of the product (e.g., plant species)
  price: number; // Price per unit
  quantity: number;
  imageUrl?: string; // Optional image URL for display in cart
}

export interface CartState {
  items: CartItem[];
  // eslint-disable-next-line no-unused-vars
  addItem: (item: Omit<CartItem, 'id'>) => void; // id will be generated internally
  // eslint-disable-next-line no-unused-vars
  removeItem: (itemId: string) => void;
  // eslint-disable-next-line no-unused-vars
  updateItemQuantity: (itemId: string, newQuantity: number) => void;
  clearCart: () => void;
  getTotalPrice: () => number;
  getItemCount: () => number;
} 