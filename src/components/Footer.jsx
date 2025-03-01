"use client";
import React from "react";

const Footer = () => {
  return (
    <footer className="flex bg-white/10 backdrop-blur-sm border-t border-white/15 py-4 px-6 h-24">
      <div className="max-w-7xl mx-auto text-center flex items-center justify-center">
        <p className="text-white">
          &copy; {new Date().getFullYear()} {'\u00A0'} Heaven/Chandrashu.{'\u00A0'} All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
