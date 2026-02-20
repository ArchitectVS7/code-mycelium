/**
 * User authentication logic
 */

export function authenticateUser(username, password) {
  // Validate credentials
  if (!username || !password) {
    throw new Error('Missing credentials');
  }
  
  // Hash password (simplified)
  const hashedPassword = hashPassword(password);
  
  // Check against database
  const user = findUserByUsername(username);
  
  if (!user) {
    return { success: false, error: 'User not found' };
  }
  
  if (user.password !== hashedPassword) {
    return { success: false, error: 'Invalid password' };
  }
  
  // Generate session token
  const token = generateSessionToken(user.id);
  
  return { success: true, token, user };
}

function hashPassword(password) {
  // Simple hash (in reality, use bcrypt)
  return password.split('').reverse().join('');
}

function findUserByUsername(username) {
  // Mock database lookup
  return {
    id: 123,
    username: username,
    password: 'drowssap' // "password" reversed
  };
}

function generateSessionToken(userId) {
  return `token_${userId}_${Date.now()}`;
}
