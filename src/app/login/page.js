"use client";
import { signInWithPopup } from "firebase/auth";
import { auth, provider } from "@/lib/firebase";

export default function LoginPage() {
  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, provider);
      // Redirect after login (to dashboard for now)
      window.location.href = "/dashboard";
    } catch (err) {
      console.error("Login failed:", err);
    }
  };
  
  return (
    <main className="h-screen flex flex-col items-center justify-center bg-gray-100">
      <h1 className="text-4xl font-bold mb-6 text-gray-800">Welcome to LastGoal</h1>
      <p className="text-gray-600 mb-8">Your journey of non-negotiables starts here.</p>
      <button
        onClick={handleLogin}
        className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 shadow-lg transition"
      >
        Sign in with Google
      </button>
    </main>
  );
}
