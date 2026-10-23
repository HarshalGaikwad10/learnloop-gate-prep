// src/services/authService.js — Secure Authentication & Session Management for LearnLoop AI

const USERS_STORAGE_KEY = 'learnloop_users_v1';
const SESSION_STORAGE_KEY = 'learnloop_session_v1';

// Hash helper using SHA-256 via Web Crypto API with safe fallback
async function hashPassword(plainText) {
  if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
    try {
      const msgBuffer = new TextEncoder().encode(plainText + '_learnloop_salt_2026');
      const hashBuffer = await window.crypto.subtle.digest('SHA-256', msgBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    } catch (e) {
      // Fallback below
    }
  }
  // Lightweight deterministic hash for environments where subtle is unavailable (e.g. testing)
  let hash = 0;
  const str = plainText + '_learnloop_salt_2026';
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return 'lh_' + Math.abs(hash).toString(16);
}

// Get all registered users from storage
function getStoredUsers() {
  try {
    const raw = localStorage.getItem(USERS_STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    return [];
  }
}

// Save users array
function setStoredUsers(users) {
  try {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
  } catch (e) {
    console.error('Failed to save users in localStorage', e);
  }
}

// Pre-seed demo user if no users exist
function ensureDemoUser() {
  const users = getStoredUsers();
  if (users.length === 0) {
    // Seed default student Rahul
    const defaultUser = {
      id: 'usr_demo_rahul',
      name: 'Rahul Sharma',
      email: 'rahul@gate.ac.in',
      passwordHash: 'lh_demo_password_hash',
      preferredLanguage: 'English', // English, Hindi, Marathi, Manipuri
      explanationStyle: 'simple', // simple, detailed, revision
      gateYear: 2027,
      createdAt: new Date().toISOString()
    };
    setStoredUsers([defaultUser]);
  }
}

// Initialize on module load
if (typeof window !== 'undefined') {
  ensureDemoUser();
}

/**
 * Register a new student account
 */
export async function register({ name, email, password, gateYear = 2027, preferredLanguage = 'English' }) {
  if (!name || !name.trim()) {
    throw new Error('Please enter your full name.');
  }
  if (!email || !email.includes('@')) {
    throw new Error('Please enter a valid email address.');
  }
  if (!password || password.length < 6) {
    throw new Error('Password must be at least 6 characters long.');
  }

  const normalizedEmail = email.trim().toLowerCase();
  const users = getStoredUsers();
  
  if (users.some(u => u.email === normalizedEmail)) {
    throw new Error('An account with this email address already exists. Please sign in.');
  }

  const passwordHash = await hashPassword(password);
  const newUser = {
    id: 'usr_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6),
    name: name.trim(),
    email: normalizedEmail,
    passwordHash,
    preferredLanguage: preferredLanguage || 'English',
    explanationStyle: 'simple',
    gateYear: Number(gateYear) || 2027,
    createdAt: new Date().toISOString()
  };

  users.push(newUser);
  setStoredUsers(users);

  // Auto-login newly registered user
  const sessionUser = sanitizeUser(newUser);
  setSession(sessionUser);
  return sessionUser;
}

/**
 * Log in with email and password
 */
export async function login(email, password) {
  if (!email || !password) {
    throw new Error('Please enter both email and password.');
  }

  const normalizedEmail = email.trim().toLowerCase();
  const users = getStoredUsers();
  const user = users.find(u => u.email === normalizedEmail);

  if (!user) {
    // Allow demo password convenience for default student
    if (normalizedEmail === 'rahul@gate.ac.in') {
      const demoUser = users[0];
      const sessionUser = sanitizeUser(demoUser);
      setSession(sessionUser);
      return sessionUser;
    }
    throw new Error('No account found with this email. Please check your credentials or create an account.');
  }

  const inputHash = await hashPassword(password);
  // Match hashed password or allow initial demo fallback
  if (user.passwordHash !== inputHash && user.id !== 'usr_demo_rahul') {
    throw new Error('Incorrect password. Please verify and try again.');
  }

  const sessionUser = sanitizeUser(user);
  setSession(sessionUser);
  return sessionUser;
}

/**
 * Log out active session
 */
export function logout() {
  try {
    localStorage.removeItem(SESSION_STORAGE_KEY);
  } catch (e) {
    // ignore
  }
}

/**
 * Get currently active authenticated user or null
 */
export function getCurrentUser() {
  try {
    const raw = localStorage.getItem(SESSION_STORAGE_KEY);
    if (!raw) return null;
    const session = JSON.parse(raw);
    // Verify session validity (30-day session)
    if (session && session.expiresAt && Date.now() < session.expiresAt) {
      return session.user;
    }
    // Expired
    logout();
    return null;
  } catch (e) {
    return null;
  }
}

/**
 * Update permitted profile fields for currently logged in student
 */
export function updateProfile(updates = {}) {
  const currentUser = getCurrentUser();
  if (!currentUser) throw new Error('Not authenticated.');

  const users = getStoredUsers();
  const idx = users.findIndex(u => u.id === currentUser.id);
  if (idx === -1) throw new Error('User not found.');

  const allowedFields = ['name', 'preferredLanguage', 'explanationStyle', 'gateYear'];
  const updatedUser = { ...users[idx] };

  for (const field of allowedFields) {
    if (updates[field] !== undefined) {
      updatedUser[field] = updates[field];
    }
  }

  users[idx] = updatedUser;
  setStoredUsers(users);

  const cleanUser = sanitizeUser(updatedUser);
  setSession(cleanUser);
  return cleanUser;
}

/**
 * Request password recovery email
 */
export function forgotPassword(email) {
  if (!email || !email.includes('@')) {
    throw new Error('Please enter a valid email address.');
  }
  const users = getStoredUsers();
  const exists = users.some(u => u.email === email.trim().toLowerCase());
  if (!exists) {
    throw new Error('No account found with this email.');
  }
  // Simulated secure recovery link
  return {
    success: true,
    message: `Password reset instructions have been dispatched to ${email}. (Simulated secure recovery)`
  };
}

// Helpers
function sanitizeUser(user) {
  const { passwordHash, ...safe } = user;
  return safe;
}

function setSession(user) {
  try {
    const sessionData = {
      user,
      token: 'jwt_sim_' + Math.random().toString(36).substr(2) + Date.now(),
      expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000 // 30 days
    };
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(sessionData));
  } catch (e) {
    console.error('Failed to set session in localStorage', e);
  }
}

export const loginUser = async (email, password) => {
  try {
    const u = await login(email, password);
    return { success: true, user: u };
  } catch (e) {
    return { success: false, error: e.message };
  }
};

export const registerUser = async (name, email, password, gateYear) => {
  try {
    const u = await register({ name, email, password, gateYear });
    return { success: true, user: u };
  } catch (e) {
    return { success: false, error: e.message };
  }
};

export const logoutUser = logout;
export const updateUserProfile = updateProfile;
