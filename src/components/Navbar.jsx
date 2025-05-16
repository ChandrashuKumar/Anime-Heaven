"use client"; 
import { useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/firebase/config";
import { useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import Link from "next/link";
import SearchBar from "./SearchBar";

const Navbar = () => {
  const [user] = useAuthState(auth);
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      sessionStorage.removeItem("user");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <nav className="bg-[#0a0a0a] w-full px-4 py-3 flex items-center justify-between border-b border-zinc-800">
      {/* Left Section: Logo & Website Name */}
      <div className="flex items-center">
        <img
          src="/logo.jpg"
          alt="Heaven Logo"
          className="w-8 h-8 mr-3 rounded-full object-cover"
        />
        <h1 className="text-xl font-bold text-white">
          Heaven<span className="text-purple-500">.</span>
        </h1>
      </div>

      {/* Middle Section: Search Bar */}
      <div className="flex-1 max-w-md mx-4">
        <SearchBar />
      </div>

      {/* Right Section: User Actions */}
      <div className="flex items-center">
        {user ? (
          <button
            onClick={handleLogout}
            className="text-gray-400 hover:text-white flex items-center"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <Link href="/sign-up">
              <button className="px-3 py-1 bg-[#1a1a1a] hover:bg-[#222] text-white text-sm rounded-md">
                Sign Up
              </button>
            </Link>
            <Link href="/sign-in">
              <button className="px-3 py-1 bg-[#1a1a1a] hover:bg-[#222] text-white text-sm rounded-md">
                Login
              </button>
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;