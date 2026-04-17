// Point values per frequency.
// Daily is least valuable, Weekly is most valuable (as per product spec).
export const POINTS = {
  daily:   10,
  monthly: 30,
  weekly:  50,
};

export const getPoints = (frequency) => POINTS[frequency] ?? 0;

// Rank label based on total points
export const getRank = (totalPoints) => {
  if (totalPoints >= 1000) return { label: 'Legend', color: '#f59e0b' };
  if (totalPoints >= 500)  return { label: 'Pro',    color: '#8b5cf6' };
  if (totalPoints >= 200)  return { label: 'Solid',  color: '#3b82f6' };
  if (totalPoints >= 50)   return { label: 'Rookie', color: '#10b981' };
  return                          { label: 'New',    color: '#94a3b8' };
};
