// components/WeeklySummary.js
'use client';

import { useEffect, useState } from 'react';
import { format, startOfWeek, endOfWeek, eachDayOfInterval } from 'date-fns';

import '@/styles/WeeklySummary.css'; // Use alias for consistency

// FIX: Define DEFAULT_GOALS here or import it from a shared constants file
const DEFAULT_GOALS = ['Wake Early', 'Workout', 'Study', 'Meditate'];

export default function WeeklySummary({ userId, allGoals }) {
  const [weeklyData, setWeeklyData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!userId || !allGoals) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 }); // Monday
      const weekEnd = endOfWeek(new Date(), { weekStartsOn: 1 }); // Sunday

      const dayList = eachDayOfInterval({ start: weekStart, end: weekEnd });

      const calculatedWeeklyData = dayList.map((date) => {
        const dateKey = format(date, 'yyyy-MM-dd');
        const goalsForDay = allGoals[dateKey]; // Get goals for this specific date

        let completedGoalsCount = 0;
        if (goalsForDay) {
          completedGoalsCount = Object.entries(goalsForDay).filter(
            ([key, value]) => key !== 'meta' && key !== 'daily' && value === true
          ).length;
        }

        return {
          date, // Keep as Date object
          completed: completedGoalsCount,
          // Corrected: Use DEFAULT_GOALS.length if no specific goals for the day are found,
          // otherwise count the actual goals (excluding 'meta' and 'daily').
          totalPossible: Object.keys(goalsForDay || {}).filter(key => key !== 'meta' && key !== 'daily').length || DEFAULT_GOALS.length,
        };
      });
      setWeeklyData(calculatedWeeklyData);
    } catch (err) {
      console.error('Error calculating weekly summary:', err);
      setError('Failed to load weekly summary.');
    } finally {
      setLoading(false);
    }
  }, [userId, allGoals]); // Re-run when userId or allGoals changes

  return (
    <div className="weekly-summary-container">
      <h3 className="weekly-title">Weekly Summary (Mon–Sun)</h3>
      {loading ? (
        <p style={{ textAlign: 'center', color: 'var(--color-text-medium)' }}>Calculating summary...</p>
      ) : error ? (
        <p style={{ textAlign: 'center', color: 'var(--color-danger)' }}>{error}</p>
      ) : (
        <div className="weekly-grid">
          {weeklyData.map((dayData) => (
            <div
              key={format(dayData.date, 'yyyy-MM-dd')} // Use formatted date as key
              className={`day-box ${dayData.completed > 0 ? 'has-goals' : ''}`}
            >
              <p className="day-name">{format(dayData.date, 'EEE')}</p>
              <p className="goal-count">
                {dayData.completed} / {dayData.totalPossible}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}