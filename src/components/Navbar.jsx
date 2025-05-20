import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/firebase/config";
import { useRouter } from "next/navigation";
import { useAuth } from "@/store/AuthContext";
import Link from "next/link";
import SearchBar from "./SearchBar";

const Navbar = () => {
  const [user] = useAuthState(auth);
  const { logout } = useAuth();
  const router = useRouter();

  // Handler for logging out
  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <nav className="bg-[#0a0a0a] h-20 w-full px-4 py-3 flex items-center justify-between border-b border-zinc-800">
      {/* Left Section: Logo & Website Name */}
      <div className="flex items-center">
        <img
          src="/logo.jpg"
          alt="Heaven Logo"
          className="w-12 h-12 mr-3 rounded-full object-cover"
        />
        <h1 className="text-2xl font-bold text-white">
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
          <div className="flex items-center gap-2">
            <button 
            onClick={handleLogout} 
            className="px-3 py-1 bg-[#1a1a1a] hover:bg-[#222] text-white text-sm rounded-md">
            Sign Out
          </button>
          <Link href="/my-animes">
              <button className="px-3 py-1 bg-[#1a1a1a] hover:bg-[#222] text-white text-sm rounded-md">
                My Animes
              </button>
            </Link>
          </div>
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
