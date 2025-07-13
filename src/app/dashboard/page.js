"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import { app } from "@/lib/firebase"; // adjust if needed

export default function Dashboard() {
  const router = useRouter();
  const auth = getAuth(app);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        router.push("/login");
      } else {
        setUser(currentUser);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/login");
  };

  if (!user) return <p className="text-center mt-10">Loading...</p>;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-8">
      <h1 className="text-3xl font-bold mb-4">Welcome, {user.displayName}</h1>
      <img
        src={user.photoURL}
        alt="Profile"
        className="w-24 h-24 rounded-full mb-4"
      />
      <p className="text-lg mb-6 text-gray-700">{user.email}</p>
      <button
        onClick={handleLogout}
        className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded shadow"
      >
        Logout
      </button>
    </div>
  );
}
