// utils/dateUtils.js
export const getTodayDate = () => {
  const today = new Date();
  return today.toISOString().split("T")[0]; // e.g. "2025-07-23"
};
