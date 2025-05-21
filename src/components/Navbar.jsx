"use client";
import { useState, useEffect } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/firebase/config";
import { useRouter } from "next/navigation";
import { useAuth } from "@/store/AuthContext";
import Link from "next/link";
import SearchBar from "./SearchBar";
import { Menu, X } from 'lucide-react';

const Navbar = () => {
  const [user] = useAuthState(auth);
  const { logout } = useAuth();
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Check if we're on mobile
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    // Initial check
    checkIfMobile();
    
    // Add event listener for window resize
    window.addEventListener("resize", checkIfMobile);
    
    // Cleanup
    return () => window.removeEventListener("resize", checkIfMobile);
  }, []);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isMenuOpen && !event.target.closest("#navbar-menu") && !event.target.closest("#menu-button")) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [isMenuOpen]);

  // Handler for logging out
  const handleLogout = async () => {
    try {
      await logout();
      setIsMenuOpen(false);
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <nav className="bg-[#0a0a0a] w-full px-4 py-3 flex flex-col md:flex-row md:h-20 items-center justify-between border-b border-zinc-800 relative">
      <div className="w-full md:w-auto flex items-center justify-between">
        {/* Left Section: Logo & Website Name */}
        <div className="flex items-center">
          <Link href="/">
            <img
            src="/logo.jpg"
            alt="Heaven Logo"
            className="w-10 h-10 md:w-12 md:h-12 mr-2 md:mr-3 rounded-full object-cover"
          />
          </Link>
          <h1 className="text-xl md:text-2xl font-bold text-white">
            Heaven<span className="text-purple-500">.</span>
          </h1>
        </div>

        {/* Mobile Menu Button */}
        <button 
          id="menu-button"
          className="md:hidden text-white p-2"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Middle Section: Search Bar - Hidden on mobile unless menu is open */}
      <div className={`${isMobile && !isMenuOpen ? 'hidden' : 'flex'} w-full md:w-auto md:flex-1 md:max-w-md mx-0 md:mx-4 mt-4 md:mt-0`}>
        <SearchBar />
      </div>

      {/* Right Section: User Actions - Hidden on mobile unless menu is open */}
      <div 
        id="navbar-menu"
        className={`${isMobile && !isMenuOpen ? 'hidden' : 'flex'} flex-col md:flex-row items-center w-full md:w-auto gap-2 mt-4 md:mt-0`}
      >
        {user ? (
          <>
            <Link href="/my-animes" className="w-full md:w-auto" onClick={() => setIsMenuOpen(false)}>
              <button className="w-full md:w-auto px-3 py-2 md:py-1 bg-[#1a1a1a] hover:bg-[#222] text-white text-sm rounded-md">
                My Animes
              </button>
            </Link>
            <Link href="/gallery" className="w-full md:w-auto" onClick={() => setIsMenuOpen(false)}>
              <button className="w-full md:w-auto px-3 py-2 md:py-1 bg-[#1a1a1a] hover:bg-[#222] text-white text-sm rounded-md">
                My Gallery
              </button>
            </Link>
            <button
              onClick={handleLogout}
              className="w-full md:w-auto px-3 py-2 md:py-1 bg-[#1a1a1a] hover:bg-[#222] text-white text-sm rounded-md">
              Sign Out
            </button>
          </>
        ) : (
          <>
            <Link href="/sign-up" className="w-full md:w-auto" onClick={() => setIsMenuOpen(false)}>
              <button className="w-full md:w-auto px-3 py-2 md:py-1 bg-[#1a1a1a] hover:bg-[#222] text-white text-sm rounded-md">
                Sign Up
              </button>
            </Link>
            <Link href="/sign-in" className="w-full md:w-auto" onClick={() => setIsMenuOpen(false)}>
              <button className="w-full md:w-auto px-3 py-2 md:py-1 bg-[#1a1a1a] hover:bg-[#222] text-white text-sm rounded-md">
                Login
              </button>
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;