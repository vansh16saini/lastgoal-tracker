// components/Calendar.js
'use client';
import { useState } from 'react';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import '@/styles/Calendar.css'; // Use alias for consistency
import { format } from 'date-fns';

// Receive props from DashboardPage
export default function Calendar({ selectedDate, setSelectedDate, allGoals }) {
  const [hoveredDate, setHoveredDate] = useState(null);
  // `allGoals` now contains goal data for all dates

  const getGoalDates = () => {
    // Filter dates from allGoals that have at least one completed goal
    return Object.entries(allGoals)
      .filter(([dateKey, goalsForDate]) => {
        // Ensure it's a valid date object and not 'daily' or 'meta'
        if (dateKey === 'daily' || dateKey === 'meta' || !goalsForDate) {
          return false;
        }
        // Check if any goal for this date is true (completed)
        return Object.values(goalsForDate).some((status) => status === true);
      })
      .map(([dateKey]) => new Date(dateKey)); // Convert date string back to Date object
  };

  const renderTooltipContent = (date) => {
    const key = format(date, 'yyyy-MM-dd');
    const goalsForDate = allGoals[key]; // Get goals for the hovered date
    if (!goalsForDate) return null; // No goals for this date

    const completedGoals = Object.entries(goalsForDate)
      .filter(([, status]) => status === true)
      .map(([goalName]) => goalName);

    if (completedGoals.length === 0) return null;

    return (
      <>
        <p className="font-semibold mb-1">Goals for {format(date, 'MMM dd, yyyy')}:</p>
        <ul className="list-disc list-inside text-gray-700">
          {completedGoals.map((g) => (
            <li key={g}>{g}</li>
          ))}
        </ul>
      </>
    );
  };

  // Modifier to highlight days with completed goals
  const modifiers = {
    goal_day: getGoalDates(),
  };

  const modifiersClassNames = {
    goal_day: 'rdp-day_goal',
  };

  return (
    <div className="calendar-container">
      <DayPicker
        mode="single"
        selected={selectedDate} // Use the prop
        onSelect={setSelectedDate} // Use the prop to update
        onDayMouseEnter={(day) => setHoveredDate(day)}
        onDayMouseLeave={() => setHoveredDate(null)}
        modifiers={modifiers}
        modifiersClassNames={modifiersClassNames}
        showOutsideDays // Show days from previous/next months for context
      />

      {hoveredDate && (
        <div className="tooltip" style={{
            // Dynamic positioning for the tooltip (example, might need fine-tuning)
            // This is a basic example; for complex tooltips, consider a dedicated library
            // or more robust positioning logic based on mouse coordinates.
            position: 'absolute',
            left: '50%',
            transform: 'translateX(-50%)',
            marginTop: '10px', // Adjust as needed
        }}>
          {renderTooltipContent(hoveredDate)}
        </div>
      )}
      {/* GoalForm is now rendered directly in DashboardPage */}
    </div>
  );
}

