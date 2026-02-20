/**
 * Utility functions
 */

export function formatDate(date) {
  return new Date(date).toISOString();
}

export function validateEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

export function generateId() {
  return Math.random().toString(36).substring(2, 15);
}

export function hashString(str) {
  // Simple hash function (similar to hashPassword in login.js)
  return str.split('').reverse().join('');
}
