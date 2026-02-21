"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/useAuthStore";
import { useUserStore } from "@/store/useUserStore";
import ProfileDropdown from "./ProfileDropdown";

const Navbar = () => {
  const [showNav, setShowNav] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const { isAuthenticated, initAuth } = useAuthStore();
  const { fetchUser } = useUserStore();
  const pathname = usePathname();

  const navLinks = [
    { name: "Arena", href: "/" },
    { name: "About us", href: "#" },
    { name: "Talent", href: "/talent" },
  ];

  useEffect(() => {
    // Initialize auth state from localStorage
    initAuth();
  }, [initAuth]);

  useEffect(() => {
    // Fetch user data when authenticated
    if (isAuthenticated) {
      fetchUser();
    }
  }, [isAuthenticated, fetchUser]);

  useEffect(() => {
    const controlNavbar = () => {
      const currentScrollY = window.scrollY;

      // Show navbar when at top of page or scrolling up
      if (currentScrollY < 10) {
        setIsVisible(true);
      } else if (currentScrollY > lastScrollY) {
        setIsVisible(false); // Hide on scroll down
      } else {
        setIsVisible(true); // Show on scroll up
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", controlNavbar);
    return () => window.removeEventListener("scroll", controlNavbar);
  }, [lastScrollY]);

  if (pathname?.startsWith("/admin")) return null;

  return (
    <nav
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-transform duration-300 ease-in-out bg-white shadow-sm",
        isVisible ? "translate-y-0" : "-translate-y-full",
      )}
    >
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}

          <Link href="/">
            <div className="relative lg:w-36">
              <Image
                width={150}
                height={180}
                src="/icons/logo.svg"
                alt="brand logo"
                className="object-cover"
              />
            </div>
          </Link>

          {/* Desktop Links */}
          <div className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="text-base font-medium text-gray-600 hover:text-primary transition-colors"
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Right Buttons (Desktop) */}
          <div className="hidden lg:flex items-center gap-4">
            {isAuthenticated ? (
              <ProfileDropdown />
            ) : (
              <>
                <Link href="/login">
                  <Button
                    variant="outline"
                    className="px-5 h-12 rounded-lg border-primary text-primary hover:bg-primary/5 font-semibold text-base"
                  >
                    Login
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button className="px-5 h-12 rounded-lg bg-primary text-white hover:bg-primary/90 font-semibold text-base">
                    Sign Up
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <div className="lg:hidden text-primary">
            <button
              onClick={() => setShowNav(!showNav)}
              className="p-2 focus:outline-none"
            >
              {showNav ? (
                <X className="w-8 h-8" />
              ) : (
                <Menu className="w-8 h-8" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {showNav && (
        <div
          onClick={() => setShowNav(false)}
          className="fixed inset-0 top-[80px] z-40 w-full h-screen bg-black/70 backdrop-blur-sm"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="flex flex-col gap-4 p-6 w-full bg-white shadow-xl rounded-b-3xl animate-in slide-in-from-top duration-300"
          >
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="text-lg font-semibold text-gray-800 hover:text-primary py-2 border-b border-gray-100"
                onClick={() => setShowNav(false)}
              >
                {link.name}
              </Link>
            ))}
            <div className="flex flex-col gap-3 mt-4">
              {isAuthenticated ? (
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm text-gray-600">Logged in</span>
                  <ProfileDropdown />
                </div>
              ) : (
                <>
                  <Link href="/login" onClick={() => setShowNav(false)}>
                    <Button
                      variant="outline"
                      className="w-full h-12 rounded-lg border-primary text-primary font-bold text-lg"
                    >
                      Login
                    </Button>
                  </Link>
                  <Link href="/signup" onClick={() => setShowNav(false)}>
                    <Button className="w-full h-12 rounded-lg bg-primary text-white font-bold text-lg">
                      Sign Up
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
