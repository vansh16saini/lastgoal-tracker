// app/page.js
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the login page on initial load
    router.push('/login');
  }, [router]); // Added router to dependency array for best practice

  return null; // This page doesn't render anything
}