// lib/fireStore.js
import { db } from './firebase';
import {
  collection,
  query,
  orderBy, // Keep if needed for sorting when fetching all goals
  doc,
  updateDoc,
  deleteField,
  addDoc, // For addGoal if you keep it
  serverTimestamp // For addGoal if you keep it
} from 'firebase/firestore';


// Function to get a query for a user's entire goals collection
// This is used by DashboardPage to listen to all documents (daily, meta, etc.)
export function getGoalsCollectionQuery(userId) {
  if (!userId) {
    // Return null or throw an error if userId is not provided
    console.warn("getGoalsCollectionQuery called without userId.");
    return null;
  }
  // You can add orderBy here if you want the collection listener to be ordered
  return query(collection(db, 'users', userId, 'goals'));
}

// Function to get a document reference for a specific day's goals
export function getDailyGoalsDocRef(userId, dateKey) {
  if (!userId || !dateKey) {
    console.warn("getDailyGoalsDocRef called without userId or dateKey.");
    return null;
  }
  return doc(db, 'users', userId, 'goals', dateKey);
}


// --- Other functions (as they were) ---

// This function can remain as it uses addDoc to a subcollection (if you use it)
export async function addGoal(userId, goalText) {
  if (!userId || !goalText) return;

  try {
    await addDoc(collection(db, 'users', userId, 'goals_master'), {
      text: goalText,
      createdAt: serverTimestamp(),
      isDone: false
    });
    return { success: true };
  } catch (error) {
    console.error('Error adding goal:', error);
    return { success: false, error: error.message };
  }
}

// Function to update a specific goal's status for a given date
export async function updateGoalStatus(userId, dateKey, goalName, isDone) {
  if (!userId || !dateKey || !goalName) return;

  try {
    const goalDocRef = getDailyGoalsDocRef(userId, dateKey); // Use helper
    if (goalDocRef) {
        await updateDoc(goalDocRef, {
            [goalName]: isDone
        });
        return { success: true };
    }
    return { success: false, error: "Document reference not found." };
  } catch (error) {
    console.error('Error updating goal status:', error);
    return { success: false, error: error.message };
  }
}

// Function to delete a specific goal from a given date's document
export async function deleteGoal(userId, dateKey, goalName) {
    if (!userId || !dateKey || !goalName) return;

    try {
        const goalDocRef = getDailyGoalsDocRef(userId, dateKey); // Use helper
        if (goalDocRef) {
            await updateDoc(goalDocRef, {
                [goalName]: deleteField()
            });
            return { success: true };
        }
        return { success: false, error: "Document reference not found." };
    } catch (error) {
        console.error('Error deleting goal:', error);
        return { success: false, error: error.message };
    }
}