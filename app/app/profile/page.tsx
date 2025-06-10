import { Suspense } from 'react';
import Loading from '@/components/app/profile/loading';
import ProfileAndBillingContent from '@/components/app/profile/ProfileAndBillingContent';
import { Toaster } from "@/components/ui/toaster";
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function ProfilePage() {
	return (
		<div className="max-w-4xl mx-auto p-4 space-y-8">
			<div className='flex justify-between items-center'>
				<h1 className="text-2xl font-bold">Profile & Billing</h1>
				<Button asChild>
					<Link href="/app/profile/my-listings">My Listings</Link>
				</Button>
			</div>
			<div>
				<Suspense fallback={<Loading />}>
					<ProfileAndBillingContent />
				</Suspense>
			</div>

			<Toaster />
		</div>
	);
}
