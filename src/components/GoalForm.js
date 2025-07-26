// components/GoalForm.js
'use client';

import { useEffect, useState, useRef } from 'react';
import { db } from '@/lib/firebase';
// Import onSnapshot directly from firebase/firestore
import { doc, setDoc, updateDoc, deleteField, onSnapshot } from 'firebase/firestore'; // Make sure onSnapshot is imported
import { format } from 'date-fns';
import '@/styles/GoalForm.css';
import { updateGoalStatus, deleteGoal as deleteGoalFromFirestore, getDailyGoalsDocRef } from '@/lib/fireStore'; // Import getDailyGoalsDocRef


const DEFAULT_GOALS = ['Wake Early', 'Workout', 'Study', 'Meditate']; // These are now just suggestions

export default function GoalForm({ selectedDate, userId }) { // Removed currentGoals prop
  const [goals, setGoals] = useState({});
  const [newCustomGoalText, setNewCustomGoalText] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const validDate = selectedDate instanceof Date ? selectedDate : new Date();
  const dateKey = format(validDate, 'yyyy-MM-dd');

  const unsubscribeRef = useRef(null);

  useEffect(() => {
    if (!userId || !validDate || !(validDate instanceof Date)) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const goalDocRef = getDailyGoalsDocRef(userId, dateKey); // Use helper to get doc ref

    if (goalDocRef) { // Ensure docRef is valid
        const unsubscribe = onSnapshot(goalDocRef, (docSnap) => { // Use onSnapshot with docRef
          if (docSnap.exists()) {
            const fetched = docSnap.data();
            const filteredGoals = Object.fromEntries(
              Object.entries(fetched).filter(([key]) => key !== 'meta' && key !== 'daily')
            );
            setGoals(filteredGoals);
          } else {
            const initialGoals = Object.fromEntries(DEFAULT_GOALS.map((g) => [g, false]));
            setDoc(goalDocRef, initialGoals, { merge: true })
              .then(() => setGoals(initialGoals))
              .catch((err) => {
                console.error('Error initializing goals:', err);
                setError('Failed to initialize goals.');
              });
          }
          setLoading(false);
        }, (err) => { // Add error handling for snapshot listener
          console.error('Error fetching real-time goals for date:', err);
          setError('Failed to load goals in real-time.');
          setLoading(false);
        });

        unsubscribeRef.current = unsubscribe;
    } else {
        setLoading(false); // Invalid docRef, no loading needed
    }


    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
    };
  }, [userId, dateKey, validDate]); // Keep validDate here as it's used to derive dateKey

  const handleToggleGoal = async (goalName) => {
    if (!userId) return;
    try {
      setGoals((prev) => ({ ...prev, [goalName]: !prev[goalName] }));
      await updateGoalStatus(userId, dateKey, goalName, !goals[goalName]);
    } catch (err) {
      console.error('Error toggling goal status:', err);
      setError('Failed to update goal status.');
      setGoals((prev) => ({ ...prev, [goalName]: !prev[goalName] }));
    }
  };

  const handleAddCustomGoal = async (e) => {
    e.preventDefault();
    if (!userId || newCustomGoalText.trim() === '') return;

    const goalToAdd = newCustomGoalText.trim();
    if (goals.hasOwnProperty(goalToAdd)) {
        alert("This goal already exists!");
        return;
    }

    try {
      setLoading(true);
      setError(null);
      const goalDocRef = getDailyGoalsDocRef(userId, dateKey); // Use helper
      if (goalDocRef) {
          await updateDoc(goalDocRef, { [goalToAdd]: false });

          setGoals((prev) => ({ ...prev, [goalToAdd]: false }));
          setNewCustomGoalText('');
      }
    } catch (err) {
      console.error('Error adding custom goal:', err);
      setError('Failed to add new goal.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteGoal = async (goalName) => {
    if (!userId) return;
    if (!confirm(`Are you sure you want to delete "${goalName}"?`)) {
        return;
    }
    try {
      setLoading(true);
      setError(null);
      setGoals((prev) => {
        const newGoals = { ...prev };
        delete newGoals[goalName];
        return newGoals;
      });

      await deleteGoalFromFirestore(userId, dateKey, goalName); // Use the imported function
    } catch (err) {
      console.error('Error deleting goal:', err);
      setError('Failed to delete goal.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="goal-form">
      <h3 className="section-title">
        Track Goals for {format(validDate, 'PPP')}
      </h3>
      {loading ? (
        <p style={{ textAlign: 'center', color: 'var(--color-text-medium)' }}>Loading goals...</p>
      ) : error ? (
        <p style={{ textAlign: 'center', color: 'var(--color-danger)' }}>{error}</p>
      ) : (
        <>
          <form onSubmit={handleAddCustomGoal} className="goal-input-group">
            <input
              type="text"
              className="goal-input input-field"
              placeholder="Add a new custom goal..."
              value={newCustomGoalText}
              onChange={(e) => setNewCustomGoalText(e.target.value)}
              disabled={loading}
            />
            <button
              type="submit"
              className="add-goal-button btn btn-primary"
              disabled={loading}
            >
              Add
            </button>
          </form>

          {Object.keys(goals).length > 0 ? (
            <ul className="goal-list">
              {Object.entries(goals).map(([goalName, status]) => (
                <li key={goalName} className="goal-item">
                  <span className={`goal-text ${status ? 'done' : ''}`}>
                    {goalName}
                  </span>
                  <div className="goal-actions">
                    <button
                      onClick={() => handleToggleGoal(goalName)}
                      className={`goal-button ${status ? 'done' : 'mark'}`}
                      disabled={loading}
                    >
                      {status ? 'Done' : 'Mark'}
                    </button>
                    <button
                        onClick={() => handleDeleteGoal(goalName)}
                        className="goal-button delete"
                        disabled={loading}
                    >
                        Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="goal-empty-state">
              No goals set for this day yet! Add some above or they&apos;ll be initialized.
            </p>
          )}
        </>
      )}
    </div>
  );
}