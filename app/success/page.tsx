'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useCartStore } from '@/store/cartStore';
import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export default function SuccessPage() {
	const { clearCart } = useCartStore();

	// Clear the cart when the component mounts
	useEffect(() => {
		clearCart();
	}, [clearCart]);

	return (
		<div className="container mx-auto mt-10 flex flex-col items-center justify-center text-center">
			<Card className="max-w-lg">
				<CardHeader className="items-center">
					<CheckCircle className="h-16 w-16 text-green-500" />
					<CardTitle className="text-3xl font-bold mt-4">Payment Successful!</CardTitle>
					<CardDescription className="text-md text-muted-foreground mt-2">
						Thank you for your purchase. Your order is being processed.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<p>
						You can view your order details in your profile. A care plan for your new plant(s) will be available in the Care Calendar.
					</p>
				</CardContent>
				<CardFooter className="flex flex-col gap-4">
					<Button asChild size="lg" className="w-full">
						<Link href="/app/care-calendar">View Care Calendar</Link>
					</Button>
					<Button asChild variant="outline" size="lg" className="w-full">
						<Link href="/app/profile/my-listings">Return to Dashboard</Link>
					</Button>
				</CardFooter>
			</Card>
		</div>
	);
}

