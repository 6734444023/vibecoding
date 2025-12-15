"use client";

import Link from "next/link";
import { useAuth } from "../context/AuthContext";
import Image from "next/image";
import { useState } from "react";

export default function Navbar() {
  const { user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="p-6 flex justify-between items-center max-w-7xl mx-auto w-full border-b border-gray-100 dark:border-gray-800">
      <Link href="/" className="text-2xl font-bold">
        VibeCode
      </Link>
      
      <nav className="hidden md:flex gap-6 items-center">
        <Link href="/#features" className="hover:underline">Features</Link>
        <Link href="/#pricing" className="hover:underline">Pricing</Link>
        <Link href="/#about" className="hover:underline">About</Link>
        
        {user ? (
          <div className="flex items-center gap-4 ml-4">
            <div className="flex items-center gap-2">
              {user.photoURL ? (
                <Image 
                  src={user.photoURL} 
                  alt={user.displayName || "User"} 
                  width={32} 
                  height={32} 
                  className="rounded-full border border-gray-200"
                />
              ) : (
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                  {user.displayName ? user.displayName[0].toUpperCase() : "U"}
                </div>
              )}
              <span className="font-medium text-sm hidden lg:block">
                {user.displayName}
              </span>
            </div>
            <button 
              onClick={() => logout()}
              className="text-sm text-red-500 hover:text-red-600 font-medium"
            >
              Logout
            </button>
          </div>
        ) : (
          <Link 
            href="/login" 
            className="bg-foreground text-background px-4 py-2 rounded-full font-medium hover:opacity-90 transition-opacity"
          >
            Login
          </Link>
        )}
      </nav>

      {/* Mobile Menu Button */}
      <button 
        className="md:hidden p-2"
        onClick={() => setIsMenuOpen(!isMenuOpen)}
      >
        <span className="sr-only">Open menu</span>
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="absolute top-20 left-0 right-0 bg-background border-b border-gray-200 dark:border-gray-800 p-4 md:hidden flex flex-col gap-4 shadow-lg z-50">
          <Link href="/#features" onClick={() => setIsMenuOpen(false)}>Features</Link>
          <Link href="/#pricing" onClick={() => setIsMenuOpen(false)}>Pricing</Link>
          <Link href="/#about" onClick={() => setIsMenuOpen(false)}>About</Link>
          
          {user ? (
            <div className="flex flex-col gap-4 border-t pt-4 mt-2">
              <div className="flex items-center gap-2">
                {user.photoURL && (
                  <Image 
                    src={user.photoURL} 
                    alt={user.displayName || "User"} 
                    width={32} 
                    height={32} 
                    className="rounded-full"
                  />
                )}
                <span className="font-medium">{user.displayName}</span>
              </div>
              <button 
                onClick={() => {
                  logout();
                  setIsMenuOpen(false);
                }}
                className="text-left text-red-500 font-medium"
              >
                Logout
              </button>
            </div>
          ) : (
            <Link 
              href="/login" 
              onClick={() => setIsMenuOpen(false)}
              className="bg-foreground text-background px-4 py-2 rounded-full font-medium text-center"
            >
              Login
            </Link>
          )}
        </div>
      )}
    </header>
  );
}
