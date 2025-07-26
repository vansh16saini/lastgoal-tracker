// components/ChallengeTracker.js
'use client';

import '@/styles/ChallengeTracker.css'; // Use alias for consistency
import { useEffect, useState } from 'react';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore'; // Import updateDoc
import { db } from '@/lib/firebase'; // Removed auth as userId is passed
import { differenceInDays, format } from 'date-fns';

export default function ChallengeTracker({ userId }) { // Receive userId as prop
  const [challenge, setChallenge] = useState(null);
  const [completedDays, setCompletedDays] = useState([]);
  const [loading, setLoading] = useState(true); // Loading state
  const [error, setError] = useState(null); // Error state

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const docRef = doc(db, 'users', userId, 'goals', 'meta');
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          setChallenge(snap.data().challenge);
        } else {
          setChallenge(null); // No challenge set yet
        }

        const dailyDocRef = doc(db, 'users', userId, 'goals', 'daily');
        const dailySnap = await getDoc(dailyDocRef);
        if (dailySnap.exists()) {
          const data = dailySnap.data();
          // Ensure completedDays are actual Date objects for comparison
          const days = data.completedDays?.map((d) => new Date(d)) || [];
          setCompletedDays(days);
        } else {
          setCompletedDays([]);
        }
      } catch (err) {
        console.error('Error fetching challenge data:', err);
        setError('Failed to load challenge data.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userId]); // Depend on userId

  const handleSelectChallenge = async (days) => {
    if (!userId) return;
    setLoading(true);
    setError(null);
    try {
      const docRef = doc(db, 'users', userId, 'goals', 'meta');
      const newChallenge = {
        type: days,
        startDate: new Date().toISOString(), // Store as ISO string
      };
      await setDoc(docRef, { challenge: newChallenge }, { merge: true }); // Use merge to not overwrite other fields
      setChallenge(newChallenge);
      setCompletedDays([]); // Reset completed days for new challenge
    } catch (err) {
      console.error('Error setting challenge:', err);
      setError('Failed to start challenge.');
    } finally {
      setLoading(false);
    }
  };

  const handleTrackDay = async () => {
    if (!userId || !challenge) return;
    setLoading(true);
    setError(null);
    try {
      const dailyDocRef = doc(db, 'users', userId, 'goals', 'daily');
      const today = format(new Date(), 'yyyy-MM-dd'); // Get today's date key

      // Check if today is already tracked
      const isTodayTracked = completedDays.some(d => format(d, 'yyyy-MM-dd') === today);

      if (!isTodayTracked) {
          const updatedCompletedDays = [...completedDays, new Date()]; // Add current date
          await updateDoc(dailyDocRef, {
            completedDays: updatedCompletedDays.map(d => d.toISOString()) // Store as ISO strings
          }, { merge: true }); // Merge with existing data
          setCompletedDays(updatedCompletedDays);
      } else {
          alert("You've already tracked for today!"); // Provide user feedback
      }
    } catch (err) {
      console.error('Error tracking daily goal:', err);
      setError('Failed to track daily goal.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetChallenge = async () => {
      if (!userId) return;
      if (!confirm('Are you sure you want to reset your current challenge? This cannot be undone.')) {
          return;
      }
      setLoading(true);
      setError(null);
      try {
          const metaDocRef = doc(db, 'users', userId, 'goals', 'meta');
          await updateDoc(metaDocRef, { challenge: null }); // Remove the challenge
          setChallenge(null);

          const dailyDocRef = doc(db, 'users', userId, 'goals', 'daily');
          await updateDoc(dailyDocRef, { completedDays: [] }); // Clear completed days
          setCompletedDays([]);

      } catch (err) {
          console.error('Error resetting challenge:', err);
          setError('Failed to reset challenge.');
      } finally {
          setLoading(false);
      }
  };


  const getProgress = () => {
    if (!challenge || completedDays.length === 0) return 0;
    const filtered = completedDays.filter((d) => {
      const start = new Date(challenge.startDate);
      // Ensure 'd' is a Date object before comparison
      return (
        differenceInDays(d, start) >= 0 &&
        differenceInDays(d, start) < challenge.type
      );
    });
    const progress = Math.round((filtered.length / challenge.type) * 100);
    return isNaN(progress) ? 0 : progress; // Handle NaN if challenge.type is 0 or invalid
  };

  const progress = getProgress();
  const isProgressTooSmall = progress < 20;

  return (
    <div className="challenge-container">
      {loading ? (
        <p style={{ textAlign: 'center', color: 'var(--color-text-medium)' }}>Loading challenge...</p>
      ) : error ? (
        <p style={{ textAlign: 'center', color: 'var(--color-danger)' }}>{error}</p>
      ) : challenge ? (
        <div>
          <h3 className="challenge-title">
            Challenge: <strong>{challenge.type}-Day Habit</strong>
          </h3>
          <p className="challenge-description">
            Started on {format(new Date(challenge.startDate), 'MMM dd, yyyy')}.
            Complete daily tasks to reach your goal!
          </p>
          <div className="progress-bar-wrapper">
            <div className="progress-bar">
              <div
                className="progress-bar-fill"
                style={{ width: `${progress}%` }}
                data-progress-small={isProgressTooSmall ? 'true' : undefined}
              >
                {!isProgressTooSmall && (
                  <span className="progress-percent">{progress}%</span>
                )}
              </div>
              {isProgressTooSmall && (
                <span className="progress-percent" style={{ left: `${progress + 2}%` }}>
                  {progress}%
                </span>
              )}
            </div>
          </div>
          <p className="progress-text" style={{ textAlign: 'right', fontSize: '0.9rem', color: 'var(--color-text-light)' }}>
            {completedDays.length} days completed out of {challenge.type}
          </p>

          <div className="button-group">
            <button
              onClick={handleTrackDay}
              className="btn btn-primary btn-track-challenge"
            >
              Track Today
            </button>
            <button
                onClick={handleResetChallenge}
                className="btn btn-danger btn-reset-challenge"
            >
                Reset Challenge
            </button>
          </div>
        </div>
      ) : (
        <div className="button-group">
          <p className="challenge-description" style={{ width: '100%', textAlign: 'center', marginBottom: '20px' }}>
            No active challenge. Choose one to get started!
          </p>
          <button
            onClick={() => handleSelectChallenge(21)}
            className="btn btn-primary btn-track-challenge" // Used primary for general action
          >
            Start 21-Day Habit
          </button>
          <button
            onClick={() => handleSelectChallenge(45)}
            className="btn btn-primary btn-track-challenge"
          >
            Start 45-Day Routine
          </button>
        </div>
      )}
    </div>
  );
}