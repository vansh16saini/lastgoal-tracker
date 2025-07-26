// src/components/AuthProvider.js
'use client'; // This component will use client-side hooks

import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth } from '@/lib/firebase'; // Assuming your firebase.js exports 'auth'
import { onAuthStateChanged } from 'firebase/auth';
import { useRouter, usePathname } from 'next/navigation'; // For redirection

// Create a context to hold the user object and loading state
const AuthContext = createContext({
  user: null,
  loading: true,
});

// Custom hook to easily access auth context
export const useAuth = () => useContext(AuthContext);

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // True initially while checking auth
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (authUser) => {
      setUser(authUser);
      setLoading(false);

      // Example: Redirect logic
      const protectedRoutes = ['/dashboard', '/settings', '/profile']; // Add your protected routes here
      const publicRoutes = ['/login', '/signup', '/']; // Routes accessible to everyone (or unauthenticated users)

      if (authUser) {
        // User is logged in
        if (publicRoutes.includes(pathname)) {
          // If user is logged in and tries to access a public route (like login page),
          // redirect to dashboard or a more appropriate page.
          router.push('/dashboard');
        }
      } else {
        // User is NOT logged in
        if (protectedRoutes.includes(pathname)) {
          // If user is not logged in and tries to access a protected route,
          // redirect to login page.
          router.push('/login');
        }
      }
    });

    // Cleanup the listener when the component unmounts
    return () => unsubscribe();
  }, [router, pathname]); // Depend on router and pathname for redirects

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
}