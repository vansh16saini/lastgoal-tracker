// login/page.js
'use client';

import { useEffect, useState } from 'react'; // Import useState
import { useRouter } from 'next/navigation';
import { signInWithPopup, onAuthStateChanged } from 'firebase/auth';
import { auth, provider } from '@/lib/firebase';
import '@/styles/login.css'; // Import the new login CSS

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false); // State for loading
  const [error, setError] = useState(null); // State for errors

  const handleLogin = async () => {
    setLoading(true); // Set loading true on button click
    setError(null); // Clear any previous errors
    try {
      await signInWithPopup(auth, provider);
      // No need to push here, onAuthStateChanged will handle the redirect
    } catch (err) {
      console.error('Login failed:', err);
      // Display a user-friendly error message
      setError('Failed to sign in. Please check your connection or try again.');
    } finally {
      setLoading(false); // Always set loading to false
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        router.push('/dashboard'); // Redirect to dashboard if user is logged in
      }
    });
    return () => unsubscribe(); // Clean up the listener
  }, [router]);

  return (
    <div className="login-container">
      <div className="login-card">
        <h1 className="login-title">Last Goal</h1> {/* Use new class */}
        <p className="login-subtitle">
          Track your goals daily for 21 or 45 days.
        </p>{' '}
        {/* Use new class */}
        <button
          onClick={handleLogin}
          className="google-login-button" // Use new class
          disabled={loading} // Disable button when loading
        >
          {loading ? (
            <div className="spinner"></div> // Spinner when loading
          ) : (
            <>
              {/* Placeholder for Google icon - you'd add an actual SVG/image here */}
              <img
                src="/google-icon.svg" // Make sure this path is correct or replace with a real icon
                alt="Google Icon"
                className="google-icon"
              />
              Sign in with Google
            </>
          )}
        </button>
        {error && (
          <p className="login-error-message">{error}</p>
        )}{' '}
        {/* Display error message */}
      </div>
    </div>
  );
}