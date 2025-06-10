'use client';

import { useState, useEffect } from 'react';
import PortalButton from '@/components/stripe/PortalButton';
import Image from 'next/image';

// Helper function to get plan badge style
function getPlanBadgeStyle(planName: string): { bgColor: string; textColor: string; borderColor: string } {
	switch (planName.toLowerCase()) {
		case 'free':
			return {
				bgColor: 'bg-gray-100',
				textColor: 'text-gray-700',
				borderColor: 'border-gray-200'
			};
		case 'basic':
			return {
				bgColor: 'bg-blue-100',
				textColor: 'text-blue-700',
				borderColor: 'border-blue-200'
			};
		case 'pro':
			return {
				bgColor: 'bg-purple-100',
				textColor: 'text-purple-700',
				borderColor: 'border-purple-200'
			};
		default:
			return {
				bgColor: 'bg-gray-100',
				textColor: 'text-gray-700',
				borderColor: 'border-gray-200'
			};
	}
}

export default function ProfileAndBillingContent() {
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [profileData, setProfileData] = useState<any>(null);

	useEffect(() => {
		async function fetchProfileData() {
			try {
				const response = await fetch('/api/profile');
				if (!response.ok) {
					throw new Error('Failed to fetch profile data');
				}
				const data = await response.json();
				setProfileData(data);
			} catch (err) {
				console.error('Error fetching profile data:', err);
				setError('Failed to load profile data. Please try again later.');
			} finally {
				setLoading(false);
			}
		}

		fetchProfileData();
	}, []);

	if (loading) {
		return (
			<div className="flex justify-center items-center py-24">
				<div className="relative">
					<div className="h-16 w-16 rounded-full border-t-4 border-b-4 border-[#5059FE] animate-spin"></div>
					<div className="h-16 w-16 rounded-full border-r-4 border-l-4 border-[#5059FE]/30 animate-spin absolute top-0 left-0 animate-[spin_1.5s_linear_infinite]"></div>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="bg-red-50 border-l-4 border-red-500 p-5 rounded-lg shadow-md">
				<div className="flex items-center">
					<svg className="h-6 w-6 text-red-500 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
					</svg>
					<p className="font-medium text-red-800">Error</p>
				</div>
				<p className="mt-2 text-red-700">{error}</p>
			</div>
		);
	}

	if (!profileData) {
		return <div>No profile data available</div>;
	}

	const { userData, subscriptionData, planName, planInterval } = profileData;

	return (
		<div 
			className="space-y-10 pb-16 max-w-7xl mx-auto px-4 sm:px-6"
		>
			{/* User Information */}
			<div 
				className="bg-[var(--background)] shadow-lg rounded-xl p-8 border border-[var(--border)] hover:shadow-xl transition-shadow duration-300"
			>
				<div className="flex items-center mb-6">
					<div className="bg-gradient-to-r from-[#5059FE] to-[#7D65F6] p-2 rounded-lg mr-4">
						<svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
						</svg>
					</div>
					<h2 className="text-xl font-bold">User Information</h2>
				</div>
				
				<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
					<div className="bg-[var(--background-subtle)] p-4 rounded-lg">
						<label className="text-sm font-medium text-gray-500">Name</label>
						<p className="font-semibold text-lg mt-1">{userData.name || 'Not set'}</p>
					</div>

					<div className="bg-[var(--background-subtle)] p-4 rounded-lg">
						<label className="text-sm font-medium text-gray-500">Email</label>
						<p className="font-semibold text-lg mt-1 break-all">{userData.email}</p>
					</div>

					{userData.image && (
						<div className="col-span-1 md:col-span-2 flex items-center">
							<div className="mr-4">
								<Image
									src={userData.image}
									alt="User avatar"
									width={80}
									height={80}
									className="w-20 h-20 rounded-full border-4 border-[#5059FE]/20 shadow-md"
								/>
							</div>
							<div>
								<label className="text-sm font-medium text-gray-500">Profile Image</label>
								<p className="text-sm text-gray-600 mt-1">Your profile picture is visible to other users</p>
							</div>
						</div>
					)}
				</div>
			</div>

			{/* Subscription Information */}
			<div 
				className="bg-[var(--background)] shadow-lg rounded-xl p-8 border border-[var(--border)] hover:shadow-xl transition-shadow duration-300"
			>
				<div className="flex items-center mb-6">
					<div className="bg-gradient-to-r from-[#5059FE] to-[#7D65F6] p-2 rounded-lg mr-4">
						<svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H7a3 3 0 00-3 3v8a3 3 0 003 3z" />
						</svg>
					</div>
					<h2 className="text-xl font-bold">Subscription & Billing</h2>
				</div>
				
				<div className="bg-[var(--background-subtle)] p-6 rounded-lg space-y-4">
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div>
							<label className="text-sm font-medium text-gray-500">Current Plan</label>
							{(() => {
								const style = getPlanBadgeStyle(planName);
								return (
									<div className="flex items-center gap-3 mt-1">
										<span className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-semibold border ${style.bgColor} ${style.textColor} ${style.borderColor}`}>
											{planName}
										</span>
									</div>
								);
							})()}
						</div>
						<div>
							<label className="text-sm font-medium text-gray-500">Billing Interval</label>
							<div className="flex items-center gap-3 mt-1">
								<span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium border bg-gray-50 text-gray-600 border-gray-200`}>
									{planInterval === 'year' ? 'Yearly' : 'Monthly'}
								</span>
							</div>
						</div>
					</div>
					
					{subscriptionData ? (
						<>
							<div>
								<label className="text-sm font-medium text-gray-500">Status</label>
								<div className="mt-1 flex items-center gap-2">
									{subscriptionData.plan_active ? (
										<>
											<div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse"></div>
											<span className="font-medium text-green-700">Active</span>
										</>
									) : (
										<>
											<div className="w-2.5 h-2.5 rounded-full bg-red-500"></div>
											<span className="font-medium text-red-700">Inactive</span>
										</>
									)}
								</div>
							</div>
							{subscriptionData.plan_expires && (
								<div>
									<label className="text-sm font-medium text-gray-500">Plan Expires</label>
									<div className="mt-1 flex items-center gap-2 text-gray-800">
										<svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
										</svg>
										<time dateTime={new Date(subscriptionData.plan_expires).toISOString()} className="font-medium">
											{new Date(subscriptionData.plan_expires).toLocaleDateString('en-US', {
												year: 'numeric', month: 'long', day: 'numeric',
											})}
										</time>
									</div>
								</div>
							)}
							<div className="pt-4 border-t border-[var(--border)] mt-4">
								<PortalButton />
							</div>
						</>
					) : (
						<div className="text-center py-6">
							<p className="text-gray-600 mb-4">You are currently on the Free plan.</p>
						</div>
					)}
				</div>
			</div>
		</div>
	);
} 