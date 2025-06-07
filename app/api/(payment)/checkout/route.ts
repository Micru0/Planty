import { NextResponse } from 'next/server';
import { stripe } from '@/utils/stripe';
import { getSupabaseClient } from '@/utils/supabase/server';
import { auth } from '@/lib/auth';
import { CartItem } from '@/types/cart.types';

export async function POST(request: Request) {
	try {
		const userSession = await auth()
		const userId = userSession?.user?.id
		// 检查 userId 是否存在
		if (!userId) {
			return new Response('User ID is required', { status: 400 });
		}
		// Expect an array of cart items and the user's email
		const { cartItems, email } = await request.json() as { cartItems: CartItem[], email: string };

		if (!cartItems || cartItems.length === 0) {
			return new Response('Cart items are required', { status: 400 });
		}

		if (!email) {
			return new Response('Email is required', { status: 400 });
		}

		const supabase = await getSupabaseClient();

		const { data: subscriptionData, error: subscriptionError } = await supabase
			.from('stripe_customers')
			.select('*')
			.eq('user_id', userId)
			.eq('plan_active', true)
			.single();

		if (subscriptionData) {
			return NextResponse.json({ message: 'User already subscribed' }, { status: 400 });
		}

		// Construct line_items for Stripe Checkout session
		const line_items = cartItems.map(item => {
			// Ensure price is in cents
			const unit_amount = Math.round(item.price * 100);
			if (isNaN(unit_amount) || unit_amount <= 0) {
				console.error('Invalid price for item:', item);
				const itemName = item.name || 'unknown item'; 
				throw new Error(`Invalid price for item: ${itemName}. Price must be a positive number.`);
			}
      
			// Log the image URL being used for Stripe
			const stripeImageUrl = item.imageUrl ? [item.imageUrl] : [];
			console.log(`Stripe Checkout: Item: ${item.name}, Image URL for Stripe: ${stripeImageUrl.length > 0 ? stripeImageUrl[0] : 'None'}`);

			return {
				price_data: {
					currency: 'usd', 
					product_data: {
						name: item.name,
						images: stripeImageUrl, 
						metadata: {
							listing_id: item.productId, 
						}
					},
					unit_amount,
				},
				quantity: item.quantity,
			};
		});

		console.log("Constructed line_items for Stripe:", JSON.stringify(line_items, null, 2));

		const session = await stripe.checkout.sessions.create({
			metadata: {
				user_id: userId,
			},
			customer_email: email,
			payment_method_types: ['card'],
			line_items,
			mode: 'payment', // Changed from 'subscription' to 'payment'
			success_url: `${request.headers.get('origin')}/success`,
			cancel_url: `${request.headers.get('origin')}/app/cart`, // Redirect to cart page on cancel
		});

		return NextResponse.json({ id: session.id, client_secret: session.client_secret });
	} catch (error: any) {
		console.error(error);
		return NextResponse.json({ message: error.message }, { status: 500 });
	}
}