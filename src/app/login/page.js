// login/page.js
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithPopup, onAuthStateChanged } from 'firebase/auth';
import { auth, provider } from '@/lib/firebase';
import '@/styles/login.css';

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      await signInWithPopup(auth, provider);
    } catch (err) {
      console.error('Login failed:', err);
      setError('Failed to sign in. Please check your connection or try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        router.push('/dashboard');
      }
    });
    return () => unsubscribe();
  }, [router]);

  return (
    <div className="login-container">
      <div className="login-card">
        <h1 className="login-title">Last Goal</h1>
        <p className="login-subtitle">
          Track your goals daily for 21 or 45 days.
        </p>
        <button
          onClick={handleLogin}
          className="google-login-button"
          disabled={loading}
        >
          {loading ? (
            <div className="spinner"></div>
          ) : (
            <>
              {/* Google SVG Logo */}
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="google-icon"> {/* Added class */}
                <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/>
                <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,4.286,1.383,8.256,3.652,11.411l.034-.064l.055-.067L16.516,29.6H6.437C6.398,29.394,6.345,29.179,6.306,28.969L6.306,14.691z"/>
                <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.362-7.974l-6.486,4.71L7.4,36.953C10.669,40.457,17.01,44,24,44z"/>
                <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.117-4.088,5.592c-.001-.001-.002-.002-.003-.003l-1.048,1.048l5.657,5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c3.483,0,6.793-0.908,9.602-2.382l-5.657-5.657C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.362-7.974l-6.486,4.71L7.4,36.953C10.669,40.457,17.01,44,24,44z"/>
              </svg>
              Sign in with Google
            </>
          )}
        </button>
        {error && (
          <p className="login-error-message">{error}</p>
        )}
      </div>
    </div>
  );
}