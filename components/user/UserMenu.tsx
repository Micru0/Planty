"use client";
import React, { useState } from 'react';
import { LogOut, User } from 'lucide-react';
import { useSession, signOut } from 'next-auth/react';
import Image from 'next/image';

export default function UserMenu() {
	const [isMenuOpen, setIsMenuOpen] = useState(false);
	const { data: session } = useSession();
	const user = session?.user;

	const handleSignOut = () => {
		signOut();
	};

	if (!user) return null;

	return (
		<div className="relative">
			<button
				className="flex items-center focus:outline-none p-1 rounded-full hover:bg-muted"
				onClick={() => setIsMenuOpen(!isMenuOpen)}
			>
				<Image
					src={user.image || "https://www.gravatar.com/avatar/?d=mp"}
					alt={`${user.name || 'User'} avatar`}
					width={32}
					height={32}
					className="h-8 w-8 rounded-full object-cover border-2 border-primary"
				/>
			</button>

			{/* Dropdown Menu */}
			{isMenuOpen && (
				<div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-background ring-1 ring-border">
					<div
						className="py-1"
						role="menu"
						aria-orientation="vertical"
						aria-labelledby="user-menu"
					>
						<a
							href="/app/profile"
							className="flex items-center px-4 py-2 text-sm text-foreground hover:bg-muted"
							role="menuitem"
						>
							<User className="mr-3 h-4 w-4" />
							Profile & Billing
						</a>

						<button
							onClick={handleSignOut}
							className="flex items-center w-full px-4 py-2 text-sm text-destructive hover:bg-destructive/10"
							role="menuitem"
						>
							<LogOut className="mr-3 h-4 w-4" />
							Sign out
						</button>
					</div>
				</div>
			)}
		</div>
	);
}