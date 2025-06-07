"use client";

import { Menu, X, ShoppingCart, LucideIcon, Heart, Upload } from "lucide-react";
import UserMenu from "@/components/user/UserMenu";
import Link from "next/link";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/store/cartStore";

// Define a type for navigation items
interface NavItem {
  href: string;
  label: string;
  icon?: LucideIcon; // Make icon optional
  count?: number;    // Make count optional
}

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const itemCountFromStore = useCartStore((state) => state.getItemCount());
  const isCartLoaded = useCartStore((state) => state.isCartLoaded);
  const [displayItemCount, setDisplayItemCount] = useState(0);

  useEffect(() => {
    if (isCartLoaded) {
      setDisplayItemCount(itemCountFromStore);
    }
  }, [itemCountFromStore, isCartLoaded]);

  const navItems: NavItem[] = [
    { href: "/app/chat", label: "Chat" },
    { href: "/app/listings", label: "Browse" },
    { href: "/app/care-calendar", label: "Plant Care" },
    { href: "/app/seller/upload", label: "Upload", icon: Upload },
  ];

  const handleNavClick = (label: string) => {
    console.log(`Navigating to ${label}`);
    setMobileMenuOpen(false);
  };

  return (
    <header className="bg-background text-foreground shadow-sm py-4 px-4 border-b border-border">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center">
          <Link href="/app/" onClick={() => handleNavClick("App Home")}>
            <h1 className="text-xl font-semibold text-foreground">Planty</h1>
          </Link>
        </div>

        <nav className="hidden md:flex items-center space-x-1">
          {navItems.map((item) => {
            const IconComponent = item.icon; // Get the icon component
            return (
              <Button
                key={item.label}
                variant="ghost"
                asChild
                className="text-foreground/80 hover:text-foreground hover:bg-muted/50 px-3 py-2 flex items-center space-x-2"
                onClick={() => handleNavClick(item.label)}
              >
                <Link href={item.href}>
                  {IconComponent && <IconComponent size={18} />} {/* Render icon if it exists */}
                  <span>{item.label}</span>
                </Link>
              </Button>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            asChild
            className="text-foreground/80 hover:text-foreground hover:bg-muted/50"
          >
            <Link href="/app/profile/favorites">
              <Heart size={20} />
            </Link>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            asChild
            className="text-foreground/80 hover:text-foreground hover:bg-muted/50 relative"
          >
            <Link href="/app/cart">
              <ShoppingCart size={20} />
              {isCartLoaded && typeof displayItemCount === 'number' && displayItemCount > 0 && (
                <span className="absolute top-0 right-0 transform translate-x-1/2 -translate-y-1/2 bg-destructive text-destructive-foreground text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {displayItemCount}
                </span>
              )}
            </Link>
          </Button>
          <UserMenu />
          <button
            className="md:hidden p-2 rounded-lg hover:bg-muted/50 transition-all duration-200"
            aria-label="Open menu"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden mt-4 py-2 border-t border-border bg-background">
          <nav className="flex flex-col space-y-1 px-2">
            {navItems.map((item) => {
              const IconComponent = item.icon;
              return (
                <Button
                  key={item.label}
                  variant="ghost"
                  asChild
                  className="text-foreground/80 hover:text-foreground hover:bg-muted/50 justify-start px-3 py-2 flex items-center space-x-2"
                  onClick={() => handleNavClick(item.label)}
                >
                  <Link href={item.href}>
                    {IconComponent && <IconComponent size={18} />}
                    <span>{item.label}</span>
                  </Link>
                </Button>
              );
            })}
            <div className="pt-2 border-t border-border/50 mt-2">
              {/* Mobile UserMenu placeholder or integration here */}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}

