'use client';

import { loadStripe } from '@stripe/stripe-js';
import toast from 'react-hot-toast';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { useState } from 'react';
import type { CartItem } from '@/types/cart.types';
import { Button } from "@/components/ui/button";

interface CheckoutButtonProps {
	cartItems: CartItem[];
}

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

export default function CheckoutButton({ cartItems }: CheckoutButtonProps) {
	const { data: session } = useSession();
	const user = session?.user;
	const email = user?.email;
	const [isLoading, setIsLoading] = useState(false);

	const handleCheckout = async () => {
		if (!user || !email) {
			toast.error("Please log in first");
			redirect('/api/auth/signin?callbackUrl=/app/cart');
			return;
		}

		if (!cartItems || cartItems.length === 0) {
			toast.error("Your cart is empty.");
			return;
		}

		setIsLoading(true);

		const stripe = await stripePromise;
		const response = await fetch('/api/checkout', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				cartItems: cartItems,
				userId: user?.id,
				email: email,
			}),
		});
		const responseData = await response.json();

		if (response.ok) {
			await stripe?.redirectToCheckout({ sessionId: responseData.id });
		} else {
			const message = responseData.message || 'Something went wrong';
			toast.error(message);
		}

		setIsLoading(false);
	}

	return (
		<Button
			size="lg"
			onClick={handleCheckout}
			disabled={isLoading || !cartItems || cartItems.length === 0}
		>
			{isLoading ? 'Processing...' : 'Checkout'}
		</Button>
	);
}