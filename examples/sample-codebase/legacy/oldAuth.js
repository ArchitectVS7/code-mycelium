/**
 * DEPRECATED: Old authentication system
 * This code is no longer used but hasn't been removed yet
 */

function legacyLogin(username, password) {
  // Old login logic that's been replaced
  if (username === 'admin' && password === 'admin') {
    return true;
  }
  return false;
}

function legacyLogout() {
  // Old logout logic
  console.log('User logged out');
}

// This file should appear as orphaned in the mycelium analysis
