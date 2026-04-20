import { describe, it, expect, beforeEach, vi } from "vitest";
import { registerUser, signInUser, oauthSignIn, logoutUser, getCurrentUser, updateUserProfile, getAllUsers } from "../utils/auth";

beforeEach(() => {
  localStorage.clear();
  vi.clearAllMocks();
});

describe("Authentication - registerUser", () => {
  it("registers a new user successfully", () => {
    const user = registerUser({ name: "Reet", email: "reet@test.com", password: "pass123" });
    expect(user).toHaveProperty("id");
    expect(user.name).toBe("Reet");
    expect(user.email).toBe("reet@test.com");
    expect(user.provider).toBe("email");
    expect(user).not.toHaveProperty("password");
  });

  it("throws error for duplicate email", () => {
    registerUser({ name: "Reet", email: "reet@test.com", password: "pass123" });
    expect(() => registerUser({ name: "Other", email: "reet@test.com", password: "other" })).toThrow("Email already registered");
  });

  it("auto-logs in after registration", () => {
    registerUser({ name: "Reet", email: "reet@test.com", password: "pass123" });
    const current = getCurrentUser();
    expect(current).not.toBeNull();
    expect(current.email).toBe("reet@test.com");
  });

  it("creates user with default preferences", () => {
    const user = registerUser({ name: "Test", email: "test@test.com", password: "pass" });
    expect(user.preferences).toHaveProperty("favoriteCategories");
    expect(user.preferences).toHaveProperty("location");
    expect(user.preferences.favoriteCategories).toEqual([]);
  });

  it("stores user in localStorage", () => {
    registerUser({ name: "Test", email: "test@test.com", password: "pass" });
    const users = getAllUsers();
    expect(users.length).toBe(1);
    expect(users[0].email).toBe("test@test.com");
  });
});

describe("Authentication - signInUser", () => {
  beforeEach(() => {
    registerUser({ name: "Reet", email: "reet@test.com", password: "pass123" });
    logoutUser();
  });

  it("signs in with correct credentials", () => {
    const user = signInUser({ email: "reet@test.com", password: "pass123" });
    expect(user.email).toBe("reet@test.com");
    expect(user).not.toHaveProperty("password");
  });

  it("throws error for wrong password", () => {
    expect(() => signInUser({ email: "reet@test.com", password: "wrong" })).toThrow("Invalid password");
  });

  it("throws error for non-existent email", () => {
    expect(() => signInUser({ email: "nobody@test.com", password: "pass" })).toThrow("User not found");
  });

  it("sets current user after sign in", () => {
    signInUser({ email: "reet@test.com", password: "pass123" });
    expect(getCurrentUser()).not.toBeNull();
    expect(getCurrentUser().email).toBe("reet@test.com");
  });
});

describe("Authentication - oauthSignIn", () => {
  it("creates new OAuth user on first sign in", () => {
    const user = oauthSignIn("google", { name: "Google User", email: "google@gmail.com" });
    expect(user.provider).toBe("google");
    expect(user.email).toBe("google@gmail.com");
  });

  it("returns existing OAuth user on subsequent sign in", () => {
    oauthSignIn("google", { name: "Google User", email: "google@gmail.com" });
    const user2 = oauthSignIn("google", { name: "Google User", email: "google@gmail.com" });
    expect(getAllUsers().filter(u => u.email === "google@gmail.com").length).toBe(1);
    expect(user2.email).toBe("google@gmail.com");
  });

  it("supports multiple OAuth providers", () => {
    oauthSignIn("google", { name: "G User", email: "g@gmail.com" });
    oauthSignIn("github", { name: "GH User", email: "gh@github.com" });
    expect(getAllUsers().length).toBe(2);
  });
});

describe("Authentication - logoutUser", () => {
  it("clears current user on logout", () => {
    registerUser({ name: "Test", email: "test@test.com", password: "pass" });
    expect(getCurrentUser()).not.toBeNull();
    logoutUser();
    expect(getCurrentUser()).toBeNull();
  });
});

describe("Authentication - updateUserProfile", () => {
  it("updates user name", () => {
    const user = registerUser({ name: "Old Name", email: "update@test.com", password: "pass" });
    const updated = updateUserProfile(user.id, { name: "New Name" });
    expect(updated.name).toBe("New Name");
  });

  it("updates user preferences", () => {
    const user = registerUser({ name: "Test", email: "pref@test.com", password: "pass" });
    const updated = updateUserProfile(user.id, {
      preferences: { favoriteCategories: ["Movies", "Tech"], location: "Delhi", notifications: true }
    });
    expect(updated.preferences.favoriteCategories).toContain("Movies");
    expect(updated.preferences.location).toBe("Delhi");
  });

  it("throws error for non-existent user", () => {
    expect(() => updateUserProfile("nonexistent", { name: "Test" })).toThrow("User not found");
  });

  it("updates current user in localStorage", () => {
    const user = registerUser({ name: "Test", email: "curr@test.com", password: "pass" });
    updateUserProfile(user.id, { name: "Updated" });
    expect(getCurrentUser().name).toBe("Updated");
  });
});
