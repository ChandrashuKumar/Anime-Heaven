"use client"; 
import { useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/firebase/config";
import { useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import Link from "next/link";

const Navbar = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [user] = useAuthState(auth);
  const router = useRouter();

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    console.log("Searching for:", searchQuery);
    // Insert your API call logic to MyAnimeList here.
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      sessionStorage.removeItem("user");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <nav
      style={{
        backgroundColor: "pink", // Pink background
        width: "90%",
        padding: "15px 30px",
        margin: "20px 20px 35px 70px",
        borderRadius: "30px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        boxSizing: "border-box",
        boxShadow: "0 2px 10px rgba(0,0,0,0.2)",
      }}
    >
      {/* Left Section: Logo & Website Name */}
      <div style={{ display: "flex", alignItems: "center" }}>
        <img
          src="/logo.jpg"
          alt="Heaven Logo"
          style={{
            width: "50px",
            height: "50px",
            marginRight: "15px",
            borderRadius: "50%",
            objectFit: "cover",
          }}
        />
        <h1
          style={{
            margin: 0,
            fontSize: "28px",
            color: "#fff",
            fontFamily: "Arial, sans-serif",
          }}
        >
          Heaven
        </h1>
      </div>

      {/* Right Section: Search Bar & Buttons */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "20px",
        }}
      >
        <form
          onSubmit={handleSearchSubmit}
          style={{
            display: "flex",
            alignItems: "center",
          }}
        >
          <input
            type="text"
            placeholder="Search anime..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              padding: "8px 12px",
              borderRadius: "5px",
              border: "1px solid rgba(255,255,255,0.8)",
              outline: "none",
              fontSize: "16px",
              backgroundColor: "transparent",
              color: "#fff",
            }}
          />
          <button
            type="submit"
            style={{
              marginLeft: "10px",
              padding: "8px 12px",
              borderRadius: "5px",
              border: "none",
              cursor: "pointer",
              backgroundColor: "transparent",
              color: "#fff",
              fontSize: "16px",
            }}
          >
            Search
          </button>
        </form>
        {user ? (
          <button
            onClick={handleLogout}
            style={{
              padding: "8px 12px",
              backgroundColor: "transparent",
              color: "#fff",
              cursor: "pointer",
              fontSize: "16px",
            }}
          >
            Logout
          </button>
        ) : (
          <>
            <Link href="/sign-up">
              <button
                style={{
                  padding: "8px 12px",
                  backgroundColor: "transparent",
                  color: "#fff",
                  cursor: "pointer",
                  fontSize: "16px",
                }}
              >
                Sign Up
              </button>
            </Link>
            <Link href="/sign-in">
              <button
                style={{
                  padding: "8px 12px",
                  backgroundColor: "transparent",
                  color: "#fff",
                  cursor: "pointer",
                  fontSize: "16px",
                }}
              >
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
