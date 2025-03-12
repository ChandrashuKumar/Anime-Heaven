"use client"
import { createContext, useContext, useState, useEffect } from "react";
import { auth } from "@/firebase/config";
import { signOut, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import {
  useCreateUserWithEmailAndPassword,
  useSignInWithEmailAndPassword,
} from "react-firebase-hooks/auth";
import { usePathname, useRouter } from "next/navigation";

// Create the context
const AuthContext = createContext();

// AuthProvider component that wraps your app
export const AuthProvider = ({ children }) => {
  // Global user state – updated via onAuthStateChanged
  const [user, setUser] = useState(null);
  const router = useRouter();
  const pathname = usePathname();

  // Listen to Firebase's auth state changes and update the context
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((firebaseUser) => {
      setUser(firebaseUser);
      // Optionally, also store in session storage if needed:
      if (firebaseUser) {
        sessionStorage.setItem("user", JSON.stringify(firebaseUser));
        if (pathname === "/sign-in" || pathname === "/sign-up") {
            router.push("/dashboard");
          }
      } else {
        sessionStorage.removeItem("user");
      }
    });
    return () => unsubscribe();
  }, [pathname, router]);


  // Hooks for email/password authentication
  const [
    createUserWithEmailAndPasswordHook,
    createUserUser,
    createUserLoading,
    createUserError,
  ] = useCreateUserWithEmailAndPassword(auth);

  const [
    signInWithEmailAndPasswordHook,
    signInUser,
    signInLoading,
    signInError,
  ] = useSignInWithEmailAndPassword(auth);

  // Function to sign up with email/password
  const signUpWithEmail = async (email, password) => {
    try {
      const result = await createUserWithEmailAndPasswordHook(email, password);
      // onAuthStateChanged will update the global user if successful.
      return result;
    } catch (error) {
      console.error("Error during email sign-up:", error);
      throw error;
    }
  };

  // Function to sign in with email/password
  const signInWithEmail = async (email, password) => {
    try {
      const result = await signInWithEmailAndPasswordHook(email, password);
      // onAuthStateChanged will update the global user if successful.
      return result;
    } catch (error) {
      console.error("Error during email sign-in:", error);
      throw error;
    }
  };

  // Function to sign in (or sign up) with Google using popup
  const googleSignIn = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      // onAuthStateChanged will update the global user if successful.
      return result;
    } catch (error) {
      console.error("Error during Google sign-in:", error);
      throw error;
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      sessionStorage.removeItem("user");
    } catch (error) {
      console.error("Error signing out:", error);
      throw error;
    }
  };

  // Provide functions and the current user via context
  return (
    <AuthContext.Provider
      value={{
        user,
        signUpWithEmail,
        signInWithEmail,
        googleSignIn,
        logout,
        createUserLoading,
        createUserError,
        signInLoading,
        signInError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook for accessing the AuthContext easily
export const useAuth = () => useContext(AuthContext);
