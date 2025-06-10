'use client';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import Image from 'next/image';
import { Trash2, PlusCircle, MinusCircle, Heart } from 'lucide-react';
import Link from 'next/link';
import CheckoutButton from "@/components/CheckoutButton";
import { useSession } from 'next-auth/react';
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { useCartStore } from '@/store/cartStore'; // Import the Zustand store
import type { CartItem } from '@/types/cart.types'; // Still needed for type hints if passing items around

export default function CartPage() {
  // Get state and actions from Zustand store
  const {
    items: cartItems,
    removeItem,
    updateItemQuantity,
    clearCart,
    getTotalPrice,
    getItemCount,
    isCartLoaded, // Use this to manage loading state
  } = useCartStore();

  const { data: session } = useSession();
  const { toast } = useToast();

  // Display loading message until the cart is rehydrated from localStorage
  if (!isCartLoaded) {
    return (
      <div className="container mx-auto p-4 md:p-8 text-center">
        <p>Loading cart...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-8 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground">Your Shopping Cart</h1>
        <p className="text-muted-foreground">
          You have {getItemCount()} item(s) in your cart.
        </p>
      </div>
      
      {cartItems.length === 0 ? (
        <div className="text-center py-20 border-2 border-dashed border-border rounded-lg">
          <p className="text-xl text-muted-foreground mb-4">Your cart is empty.</p>
          <Button asChild>
            <Link href="/app/listings">Continue Shopping</Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Cart Header */}
          <div className="hidden md:grid grid-cols-6 gap-4 font-semibold text-muted-foreground pb-2 border-b">
            <div className="col-span-3">Product</div>
            <div className="col-span-1 text-center">Quantity</div>
            <div className="col-span-1 text-right">Total</div>
            <div className="col-span-1"></div>
          </div>

          {cartItems.map((item) => (
            <Card key={item.id} className="grid grid-cols-1 md:grid-cols-6 gap-4 items-center p-4">
              {/* Product Details */}
              <div className="md:col-span-3 flex items-center gap-4">
                {item.imageUrl && (
                  <div className="relative w-24 h-24 rounded-md overflow-hidden bg-muted flex-shrink-0">
                    <Image src={item.imageUrl} alt={item.name} fill style={{ objectFit: 'cover' }} />
                  </div>
                )}
                <div>
                  <h3 className="font-semibold text-lg">{item.name}</h3>
                  <p className="text-sm text-muted-foreground">${item.price.toFixed(2)}</p>
                </div>
              </div>
              
              {/* Quantity Controls */}
              <div className="md:col-span-1 flex items-center justify-center gap-2">
                <Button variant="outline" size="icon" onClick={() => updateItemQuantity(item.id, item.quantity - 1)} disabled={item.quantity <= 1} aria-label="Decrease quantity">
                  <MinusCircle className="h-4 w-4" />
                </Button>
                <Input
                  type="number"
                  value={item.quantity}
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10);
                    if (!isNaN(val) && val > 0) updateItemQuantity(item.id, val);
                  }}
                  className="w-16 text-center"
                  min="1"
                  aria-label={`Quantity for ${item.name}`}
                />
                <Button variant="outline" size="icon" onClick={() => updateItemQuantity(item.id, item.quantity + 1)} aria-label="Increase quantity">
                  <PlusCircle className="h-4 w-4" />
                </Button>
              </div>

              {/* Total Price */}
              <div className="md:col-span-1 text-right font-semibold text-lg">
                ${(item.price * item.quantity).toFixed(2)}
              </div>
              
              {/* Action Buttons */}
              <div className="md:col-span-1 flex items-center justify-end gap-1">
                <Button variant="ghost" size="icon" onClick={() => removeItem(item.id)} className="text-muted-foreground hover:text-destructive" aria-label="Remove item">
                  <Trash2 className="h-5 w-5" />
                </Button>
              </div>
            </Card>
          ))}

          {/* Cart Summary & Actions */}
          <div className="pt-6 mt-6 border-t flex flex-col items-end gap-4">
            <div className="text-2xl font-bold">
              Total: ${getTotalPrice().toFixed(2)}
            </div>
            <div className="flex gap-2">
                <Button variant="outline" size="lg" onClick={clearCart}>
                  Clear Cart
                </Button>
                <CheckoutButton cartItems={cartItems} />
            </div>
          </div>
        </div>
      )}
      <Toaster />
    </div>
  );
} 