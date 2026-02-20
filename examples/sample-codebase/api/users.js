/**
 * User API endpoints
 */

export async function getUsers(limit = 10) {
  // Fetch users from database
  const users = await fetchFromDatabase('users', { limit });
  
  // Transform for API response
  return users.map(user => ({
    id: user.id,
    username: user.username,
    email: user.email
  }));
}

export async function getUserById(userId) {
  // Fetch single user
  const user = await fetchFromDatabase('users', { id: userId });
  
  if (!user) {
    throw new Error('User not found');
  }
  
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    createdAt: user.createdAt
  };
}

async function fetchFromDatabase(table, query) {
  // Mock database fetch
  return {
    id: query.id || 1,
    username: 'testuser',
    email: 'test@example.com',
    createdAt: new Date()
  };
}
