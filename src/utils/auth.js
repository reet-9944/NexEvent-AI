// ─── Authentication & User Management ───────────────────────────────────────

const USERS_KEY = "nexevent_users";
const CURRENT_USER_KEY = "nexevent_current_user";

/**
 * Get all registered users from localStorage
 */
export function getAllUsers() {
  try {
    const users = localStorage.getItem(USERS_KEY);
    return users ? JSON.parse(users) : [];
  } catch {
    return [];
  }
}

/**
 * Save users array to localStorage
 */
function saveUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

/**
 * Get currently logged in user
 */
export function getCurrentUser() {
  try {
    const user = localStorage.getItem(CURRENT_USER_KEY);
    return user ? JSON.parse(user) : null;
  } catch {
    return null;
  }
}

/**
 * Set current user in localStorage
 */
export function setCurrentUser(user) {
  if (user) {
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(CURRENT_USER_KEY);
  }
}

/**
 * Register a new user
 */
export function registerUser({ name, email, password, provider = "email" }) {
  const users = getAllUsers();
  
  // Check if email already exists
  if (users.find((u) => u.email === email)) {
    throw new Error("Email already registered");
  }

  const newUser = {
    id: Date.now().toString(),
    name,
    email,
    password: provider === "email" ? btoa(password) : null, // Simple encoding (not secure for production)
    provider,
    createdAt: new Date().toISOString(),
    preferences: {
      favoriteCategories: [],
      location: "",
      notifications: true,
    },
  };

  users.push(newUser);
  saveUsers(users);
  
  // Auto login after registration
  const userWithoutPassword = { ...newUser };
  delete userWithoutPassword.password;
  setCurrentUser(userWithoutPassword);
  
  return userWithoutPassword;
}

/**
 * Sign in existing user
 */
export function signInUser({ email, password }) {
  const users = getAllUsers();
  const user = users.find((u) => u.email === email);

  if (!user) {
    throw new Error("User not found");
  }

  if (user.provider === "email" && user.password !== btoa(password)) {
    throw new Error("Invalid password");
  }

  const userWithoutPassword = { ...user };
  delete userWithoutPassword.password;
  setCurrentUser(userWithoutPassword);
  
  return userWithoutPassword;
}

/**
 * OAuth sign in (Google, GitHub, Discord)
 */
export function oauthSignIn(provider, mockData) {
  const users = getAllUsers();
  let user = users.find((u) => u.email === mockData.email && u.provider === provider);

  if (!user) {
    // Register new OAuth user
    user = {
      id: Date.now().toString(),
      name: mockData.name,
      email: mockData.email,
      password: null,
      provider,
      createdAt: new Date().toISOString(),
      preferences: {
        favoriteCategories: [],
        location: "",
        notifications: true,
      },
    };
    users.push(user);
    saveUsers(users);
  }

  setCurrentUser(user);
  return user;
}

/**
 * Logout current user
 */
export function logoutUser() {
  setCurrentUser(null);
}

/**
 * Update user profile
 */
export function updateUserProfile(userId, updates) {
  const users = getAllUsers();
  const userIndex = users.findIndex((u) => u.id === userId);

  if (userIndex === -1) {
    throw new Error("User not found");
  }

  users[userIndex] = { ...users[userIndex], ...updates };
  saveUsers(users);

  // Update current user if it's the same
  const currentUser = getCurrentUser();
  if (currentUser && currentUser.id === userId) {
    const updatedUser = { ...users[userIndex] };
    delete updatedUser.password;
    setCurrentUser(updatedUser);
    return updatedUser;
  }

  const userWithoutPassword = { ...users[userIndex] };
  delete userWithoutPassword.password;
  return userWithoutPassword;
}
