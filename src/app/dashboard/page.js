// dashboard/page.js
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import Calendar from '@/components/Calendar';
import ChallengeTracker from '@/components/ChallengeTracker';
import GoalForm from '@/components/GoalForm';
import WeeklySummary from '@/components/WeeklySummary';
// Import onSnapshot from firebase/firestore directly
import { onSnapshot } from 'firebase/firestore'; // <--- ADD THIS
// Import the new query helper
import { getGoalsCollectionQuery } from '@/lib/fireStore'; // <--- UPDATE THIS
import '@/styles/dashboard.css';
import { format } from 'date-fns';

export default function DashboardPage() {
  const [user, setUser] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [allGoals, setAllGoals] = useState({});
  const router = useRouter();
  const [loadingGoals, setLoadingGoals] = useState(true);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (authUser) => {
      if (!authUser) {
        router.push('/login');
      } else {
        setUser(authUser);
      }
    });

    return () => unsubscribeAuth();
  }, [router]);

  useEffect(() => {
    let unsubscribeGoals;
    if (user) {
      setLoadingGoals(true);
      const goalsQuery = getGoalsCollectionQuery(user.uid); // Get the query object

      if (goalsQuery) { // Ensure query is valid
          unsubscribeGoals = onSnapshot(goalsQuery, (snapshot) => { // Use onSnapshot directly with the query
            const fetchedGoals = {};
            snapshot.docs.forEach((doc) => {
              fetchedGoals[doc.id] = doc.data();
            });
            setAllGoals(fetchedGoals);
            setLoadingGoals(false);
          }, (error) => { // Add error handling for snapshot listener
              console.error("Error listening to goals collection:", error);
              // Handle error, maybe set an error state or show a message
              setLoadingGoals(false);
          });
      } else {
        setLoadingGoals(false); // No user, so not loading goals
      }
    }

    return () => {
      if (unsubscribeGoals) {
        unsubscribeGoals();
      }
    };
  }, [user]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push('/login');
    } catch (error) {
      console.error('Error logging out:', error);
      alert('Failed to log out. Please try again.');
    }
  };

  return (
    <div className="dashboard-container">
      {user ? (
        <>
          <header className="dashboard-header">
            <h1 className="user-info">Welcome, {user.displayName || 'User'}!</h1>
            <button
              onClick={handleLogout}
              className="logout-button btn btn-danger"
            >
              Logout
            </button>
          </header>

          <section className="card">
            <h2 className="section-title">Your Goal Calendar</h2>
            <Calendar
              selectedDate={selectedDate}
              setSelectedDate={setSelectedDate}
              allGoals={allGoals}
            />
          </section>

          <section className="card">
            <h2 className="section-title">Manage Goals for {format(selectedDate, 'PPP')}</h2>
            {loadingGoals ? (
              <p style={{ textAlign: 'center', color: 'var(--color-text-medium)' }}>Loading goals...</p>
            ) : (
              <GoalForm
                selectedDate={selectedDate}
                userId={user.uid}
              />
            )}
          </section>

          <section className="card">
            <h2 className="section-title">Current Challenge</h2>
            <ChallengeTracker userId={user.uid} />
          </section>

          <section className="card">
            <h2 className="section-title">Weekly Progress</h2>
            {loadingGoals ? (
              <p style={{ textAlign: 'center', color: 'var(--color-text-medium)' }}>Calculating weekly summary...</p>
            ) : (
              <WeeklySummary userId={user.uid} allGoals={allGoals} />
            )}
          </section>
        </>
      ) : (
        <p style={{ textAlign: 'center', marginTop: '50px' }}>Loading user data...</p>
      )}
    </div>
  );
}