import { Suspense } from 'react';
import Loading from '@/components/app/profile/loading';
import ProfileAndBillingContent from '@/components/app/profile/ProfileAndBillingContent';
import SavedItemsList from '@/components/app/profile/SavedItemsList';
import { Toaster } from "@/components/ui/toaster";

export default function ProfilePage() {
	return (
		<div className="max-w-4xl mx-auto p-4 space-y-8">
			<div>
				<h1 className="text-2xl font-bold mb-6">Profile & Billing</h1>
				<Suspense fallback={<Loading />}>
					<ProfileAndBillingContent />
				</Suspense>
			</div>

			<div>
				<SavedItemsList />
			</div>
			<Toaster />
		</div>
	);
}
